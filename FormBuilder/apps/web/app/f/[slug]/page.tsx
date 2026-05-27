"use client";

import { useState, use, useMemo } from "react";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import {
  McButton,
  McCard,
  McInput,
  McXPBar,
  McWorldBackground,
  McFloatingParticles,
} from "~/components/mc";
import { LucideCheck } from "lucide-react";

type Params = { slug: string };
type ConditionalLogic = { showIf?: { fieldId: string; operator: string; value: string } } | null;

interface ThemeData {
  id: string;
  name: string;
  primaryColor: string | null;
  backgroundColor: string | null;
  textColor: string | null;
}

function hex(h: string, amt: number): string {
  const n = parseInt(h.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, ((n >> 16) & 0xff) + amt));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + amt));
  const b = Math.min(255, Math.max(0, (n & 0xff) + amt));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function fieldIsVisible(fieldConfig: unknown, answers: Record<string, unknown>): boolean {
  const logic = (fieldConfig as { conditionalLogic?: ConditionalLogic })?.conditionalLogic;
  if (!logic?.showIf) return true;
  const { fieldId, operator, value } = logic.showIf;
  const answer = answers[fieldId];
  if (operator === "equals") return String(answer ?? "") === value;
  if (operator === "not_equals") return String(answer ?? "") !== value;
  if (operator === "contains") return String(answer ?? "").includes(value);
  return true;
}

function splitIntoPages(fields: Array<{ fieldType: string; id: string; [k: string]: unknown }>) {
  const pages: (typeof fields)[] = [];
  let current: typeof fields = [];
  for (const field of fields) {
    if (field.fieldType === "page_break") {
      pages.push(current);
      current = [];
    } else {
      current.push(field);
    }
  }
  pages.push(current);
  return pages;
}

function buildInputStyle(theme: ThemeData | null): React.CSSProperties {
  const bg = theme?.backgroundColor ?? "#0e0e0e";
  const text = theme?.textColor ?? "#e8e8e8";
  return {
    width: "100%",
    padding: "11px 14px",
    background: hex(bg, 6),
    color: text,
    fontFamily: "var(--font-mc)",
    fontSize: "15px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderTopColor: hex(bg, 12),
    borderLeftColor: hex(bg, 18),
    borderRightColor: hex(bg, 18),
    borderBottomColor: hex(bg, 18),
    boxShadow: "inset 0 3px 5px rgba(0,0,0,0.8)",
    outline: "none",
    marginTop: "8px",
  };
}

function McFieldRenderer({
  field,
  answers,
  onChange,
  theme,
}: {
  field: {
    id: string;
    fieldType: string;
    label: string;
    description: string | null;
    placeholder: string | null;
    required: boolean | null;
    config: unknown;
    validationRules: unknown;
  };
  answers: Record<string, unknown>;
  onChange: (id: string, val: unknown) => void;
  theme: ThemeData | null;
}) {
  const cfg = field.config as { options?: string[]; max?: number } | null;
  const primary = theme?.primaryColor ?? "#3a9828";
  const textCol = theme?.textColor ?? "#d8d8d8";
  const inputStyle = buildInputStyle(theme);
  const bg = theme?.backgroundColor ?? "#0e0e0e";

  const focusHandler = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    e.currentTarget.style.borderColor = primary;
    e.currentTarget.style.boxShadow = `inset 0 3px 5px rgba(0,0,0,0.8), 0 0 0 2px ${primary}50`;
  };
  const blurHandler = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    e.currentTarget.style.borderColor = hex(bg, 18);
    e.currentTarget.style.boxShadow = "inset 0 3px 5px rgba(0,0,0,0.8)";
  };

  return (
    <div style={{ marginBottom: "28px" }}>
      <label
        style={{
          fontFamily: "var(--font-mc)",
          fontSize: "15px",
          fontWeight: 700,
          color: textCol,
          textShadow: "1px 1px 0 rgba(0,0,0,0.7)",
          display: "block",
        }}
      >
        {field.label}
        {field.required && (
          <span
            style={{ color: "#ff6666", marginLeft: "6px", textShadow: "1px 1px 0 rgba(0,0,0,0.8)" }}
          >
            *
          </span>
        )}
      </label>
      {field.description && (
        <p
          style={{
            fontFamily: "var(--font-mc)",
            fontSize: "13px",
            color: hex(textCol, -40),
            marginTop: "4px",
          }}
        >
          {field.description}
        </p>
      )}

      {(field.fieldType === "short_text" ||
        field.fieldType === "email" ||
        field.fieldType === "number") && (
        <input
          style={inputStyle}
          type={
            field.fieldType === "email" ? "email" : field.fieldType === "number" ? "number" : "text"
          }
          placeholder={field.placeholder ?? ""}
          required={!!field.required}
          onChange={(e) =>
            onChange(
              field.id,
              field.fieldType === "number" ? parseFloat(e.target.value) : e.target.value,
            )
          }
          onFocus={focusHandler}
          onBlur={blurHandler}
        />
      )}

      {field.fieldType === "long_text" && (
        <textarea
          style={{ ...inputStyle, minHeight: "110px", resize: "vertical" }}
          placeholder={field.placeholder ?? ""}
          required={!!field.required}
          onChange={(e) => onChange(field.id, e.target.value)}
          onFocus={focusHandler}
          onBlur={blurHandler}
        />
      )}

      {field.fieldType === "date" && (
        <input
          style={inputStyle}
          type="date"
          required={!!field.required}
          onChange={(e) => onChange(field.id, e.target.value)}
          onFocus={focusHandler}
          onBlur={blurHandler}
        />
      )}

      {(field.fieldType === "single_select" || field.fieldType === "dropdown") && (
        <select
          style={{ ...inputStyle, cursor: "pointer" }}
          required={!!field.required}
          onChange={(e) => onChange(field.id, e.target.value)}
          onFocus={focusHandler}
          onBlur={blurHandler}
        >
          <option value="" style={{ background: hex(bg, 6) }}>
            — Select an option —
          </option>
          {(cfg?.options ?? []).map((o) => (
            <option key={o} value={o} style={{ background: hex(bg, 6) }}>
              {o}
            </option>
          ))}
        </select>
      )}

      {field.fieldType === "multi_select" &&
        (() => {
          const selected = (answers[field.id] as string[] | undefined) ?? [];
          return (
            <div
              style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {(cfg?.options ?? []).map((o) => {
                const isSelected = selected.includes(o);
                return (
                  <label
                    key={o}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 14px",
                      background: isSelected ? `${primary}20` : hex(bg, 6),
                      borderWidth: "2px",
                      borderStyle: "solid",
                      borderColor: isSelected ? primary : hex(bg, 18),
                      cursor: "pointer",
                      fontFamily: "var(--font-mc)",
                      fontSize: "14px",
                      color: isSelected ? primary : hex(textCol, -20),
                      transition: "all 0.1s",
                    }}
                  >
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        background: isSelected ? hex(primary, -20) : hex(bg, 6),
                        borderWidth: "2px",
                        borderStyle: "solid",
                        borderTopColor: isSelected ? primary : hex(bg, 25),
                        borderLeftColor: isSelected ? primary : hex(bg, 25),
                        borderRightColor: isSelected ? hex(primary, -30) : hex(bg, 15),
                        borderBottomColor: isSelected ? hex(primary, -30) : hex(bg, 15),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: "inset 0 2px 3px rgba(0,0,0,0.7)",
                      }}
                    >
                      {isSelected && (
                        <span
                          style={{
                            color: "#fff",
                            fontSize: "11px",
                            lineHeight: 1,
                            textShadow: "1px 1px 0 rgba(0,0,0,0.8)",
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...selected, o]
                          : selected.filter((s) => s !== o);
                        onChange(field.id, next);
                      }}
                    />
                    {o}
                  </label>
                );
              })}
            </div>
          );
        })()}

      {field.fieldType === "checkbox" &&
        (() => {
          const checked = (answers[field.id] as boolean | undefined) ?? false;
          return (
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginTop: "10px",
                cursor: "pointer",
                padding: "12px 14px",
                background: checked ? `${primary}20` : hex(bg, 6),
                borderWidth: "2px",
                borderStyle: "solid",
                borderColor: checked ? primary : hex(bg, 18),
                fontFamily: "var(--font-mc)",
                fontSize: "14px",
                color: checked ? primary : hex(textCol, -20),
                transition: "all 0.1s",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  background: checked ? hex(primary, -20) : hex(bg, 6),
                  borderWidth: "2px",
                  borderStyle: "solid",
                  borderTopColor: checked ? primary : hex(bg, 25),
                  borderLeftColor: checked ? primary : hex(bg, 25),
                  borderRightColor: checked ? hex(primary, -30) : hex(bg, 15),
                  borderBottomColor: checked ? hex(primary, -30) : hex(bg, 15),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "inset 0 2px 3px rgba(0,0,0,0.7)",
                }}
              >
                {checked && (
                  <span style={{ color: "#fff", fontSize: "13px", lineHeight: 1 }}>✓</span>
                )}
              </div>
              <input
                type="checkbox"
                style={{ display: "none" }}
                onChange={(e) => onChange(field.id, e.target.checked)}
              />
              {field.placeholder || "Yes"}
            </label>
          );
        })()}

      {field.fieldType === "rating" &&
        (() => {
          const max = cfg?.max ?? 5;
          const current = (answers[field.id] as number | undefined) ?? 0;
          return (
            <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
              {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onChange(field.id, n)}
                  style={{
                    width: "44px",
                    height: "44px",
                    fontFamily: "var(--font-mc)",
                    fontSize: "16px",
                    fontWeight: 700,
                    background: current >= n ? hex(primary, -20) : hex(bg, 6),
                    color: current >= n ? "#fff" : hex(textCol, -40),
                    borderWidth: "2px",
                    borderStyle: "solid",
                    borderTopColor: current >= n ? primary : hex(bg, 25),
                    borderLeftColor: current >= n ? primary : hex(bg, 25),
                    borderRightColor: current >= n ? hex(primary, -30) : hex(bg, 15),
                    borderBottomColor: current >= n ? hex(primary, -30) : hex(bg, 15),
                    cursor: "pointer",
                    transition: "all 0.08s",
                    boxShadow:
                      current >= n ? `0 3px 0 ${hex(primary, -40)}` : `0 3px 0 ${hex(bg, -10)}`,
                    textShadow: current >= n ? "1px 1px 0 rgba(0,0,0,0.8)" : "none",
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          );
        })()}
    </div>
  );
}

export default function PublicFormPage({ params }: { params: Promise<Params> }) {
  const { slug } = use(params);
  const { data: form, isLoading, error } = trpc.public.getForm.useQuery({ slug });
  const { data: allThemes } = trpc.forms.listThemes.useQuery();

  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [respondentEmail, setRespondentEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [unlockToken, setUnlockToken] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  const theme = useMemo<ThemeData | null>(() => {
    if (!form?.themeId || !allThemes) return null;
    return allThemes.find((t) => t.id === form.themeId) ?? null;
  }, [form?.themeId, allThemes]);

  const primary = theme?.primaryColor ?? "#5aaa38";
  const bg = theme?.backgroundColor ?? "#0e0e0e";
  const textCol = theme?.textColor ?? "#e8e8e8";
  const cardBg = hex(bg, 6);
  const cardBorder = hex(bg, 20);
  const cardBorderDark = hex(bg, -4);

  const unlockMutation = trpc.public.unlockForm.useMutation({
    onSuccess(data) {
      setUnlockToken(data.unlockToken);
    },
    onError(err) {
      toast.error(err.message);
    },
  });

  const submit = trpc.public.submitForm.useMutation({
    onSuccess(data) {
      setSubmitted(true);
      setSuccessMsg(data.message);
    },
    onError(err) {
      toast.error(err.message);
    },
  });

  function handleFieldChange(fieldId: string, value: unknown) {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submit.mutate({
      slug,
      answers,
      respondentEmail: respondentEmail || undefined,
      unlockToken: unlockToken ?? undefined,
    });
  }

  const themedCardStyle: React.CSSProperties = {
    backgroundColor: cardBg,
    backgroundImage: "none",
    borderWidth: "2px",
    borderStyle: "solid",
    borderTopColor: cardBorder,
    borderLeftColor: cardBorder,
    borderRightColor: hex(bg, 8),
    borderBottomColor: hex(bg, 8),
    boxShadow: `0 6px 0 ${cardBorderDark}, inset 0 1px 0 rgba(255,255,255,0.05)`,
  };

  if (isLoading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "transparent",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <McWorldBackground themeName={theme?.name} />
        <McCard
          variant="stone"
          style={{
            padding: "48px 40px",
            textAlign: "center",
            position: "relative",
            zIndex: 1,
            ...themedCardStyle,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mc)",
              fontSize: "18px",
              color: hex(textCol, -20),
              textShadow: "1px 1px 0 rgba(0,0,0,0.7)",
            }}
          >
            ⏳ Loading form...
          </div>
          <McFloatingParticles count={8} />
        </McCard>
      </div>
    );

  if (error || !form)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "transparent",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <McWorldBackground themeName={theme?.name} />
        <McCard
          variant="stone"
          style={{
            padding: "48px 40px",
            textAlign: "center",
            position: "relative",
            zIndex: 1,
            maxWidth: "440px",
            ...themedCardStyle,
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🗺</div>
          <h2
            style={{
              fontFamily: "var(--font-mc)",
              fontSize: "20px",
              color: textCol,
              marginBottom: "10px",
              textShadow: "1px 2px 0 rgba(0,0,0,0.8)",
            }}
          >
            Form Not Found
          </h2>
          <p style={{ fontFamily: "var(--font-mc)", fontSize: "14px", color: hex(textCol, -60) }}>
            This form may be unpublished or the link may be incorrect.
          </p>
        </McCard>
      </div>
    );

  if (submitted)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "transparent",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <McWorldBackground themeName={theme?.name} />
        <McFloatingParticles count={32} />
        <div
          style={{
            padding: "56px 48px",
            textAlign: "center",
            position: "relative",
            zIndex: 1,
            maxWidth: "500px",
            ...themedCardStyle,
          }}
        >
          <div
            style={{
              marginBottom: "20px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <LucideCheck width={80} height={80} color={primary} />
          </div>
          <h2
            style={{
              fontFamily: "var(--font-mc)",
              fontSize: "24px",
              color: primary,
              marginBottom: "14px",
              textShadow: "1px 2px 0 rgba(0,0,0,0.9)",
            }}
          >
            Response Submitted!
          </h2>
          <div
            style={{
              fontFamily: "var(--font-mc)",
              fontSize: "12px",
              color: hex(primary, -20),
              marginBottom: "12px",
              letterSpacing: "0.08em",
            }}
          >
            ACHIEVEMENT UNLOCKED
          </div>
          <p
            style={{
              fontFamily: "var(--font-mc)",
              fontSize: "15px",
              color: hex(textCol, -30),
              lineHeight: 1.6,
            }}
          >
            {successMsg}
          </p>
        </div>
      </div>
    );

  if (form.isClosed)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "transparent",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <McWorldBackground themeName={theme?.name} />
        <div
          style={{
            padding: "48px 40px",
            textAlign: "center",
            position: "relative",
            zIndex: 1,
            maxWidth: "440px",
            ...themedCardStyle,
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
          <h2
            style={{
              fontFamily: "var(--font-mc)",
              fontSize: "20px",
              color: textCol,
              marginBottom: "10px",
              textShadow: "1px 2px 0 rgba(0,0,0,0.8)",
            }}
          >
            Form Closed
          </h2>
          <p
            style={{
              fontFamily: "var(--font-mc)",
              fontSize: "14px",
              color: hex(textCol, -60),
              lineHeight: 1.6,
            }}
          >
            {form.closedMessage ?? "This form is no longer accepting responses."}
          </p>
        </div>
      </div>
    );

  if (form.isPasswordProtected && !unlockToken)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "transparent",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <McWorldBackground themeName={theme?.name} />
        <div
          style={{
            padding: "40px 36px",
            position: "relative",
            zIndex: 1,
            width: "100%",
            maxWidth: "420px",
            ...themedCardStyle,
          }}
        >
          <div style={{ fontSize: "36px", textAlign: "center", marginBottom: "16px" }}>🔐</div>
          <h2
            style={{
              fontFamily: "var(--font-mc)",
              fontSize: "20px",
              fontWeight: 700,
              color: textCol,
              textAlign: "center",
              marginBottom: "6px",
              textShadow: "1px 2px 0 rgba(0,0,0,0.8)",
            }}
          >
            {form.title}
          </h2>
          <p
            style={{
              fontFamily: "var(--font-mc)",
              fontSize: "14px",
              color: hex(textCol, -60),
              textAlign: "center",
              marginBottom: "28px",
            }}
          >
            This form is password protected.
          </p>
          <McInput
            label="Password"
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Enter password"
            onKeyDown={(e) => {
              if (e.key === "Enter") unlockMutation.mutate({ slug, password: passwordInput });
            }}
          />
          <div style={{ marginTop: "18px" }}>
            <McButton
              variant="grass"
              size="md"
              style={
                {
                  width: "100%",
                  background: primary,
                  borderTopColor: hex(primary, 20),
                  borderLeftColor: hex(primary, 20),
                  borderRightColor: hex(primary, -20),
                  borderBottomColor: hex(primary, -20),
                } as React.CSSProperties
              }
              onClick={() => unlockMutation.mutate({ slug, password: passwordInput })}
              disabled={unlockMutation.isPending || !passwordInput}
            >
              {unlockMutation.isPending ? "Checking..." : "🔑 Unlock Form"}
            </McButton>
          </div>
        </div>
      </div>
    );

  const visibleFields = form.fields.filter((f) => fieldIsVisible(f.config, answers));
  const pages = splitIntoPages(visibleFields);
  const totalPages = pages.length;
  const pageFields = pages[currentPage] ?? [];
  const isLastPage = currentPage === totalPages - 1;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "transparent",
        position: "relative",
        padding: "48px 16px",
      }}
    >
      <McWorldBackground themeName={theme?.name} />
      <McFloatingParticles count={20} />

      <div style={{ maxWidth: "640px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ padding: "40px 36px", ...themedCardStyle }}>
          <h1
            style={{
              fontFamily: "var(--font-mc)",
              fontSize: "26px",
              fontWeight: 700,
              color: primary,
              textShadow: "1px 2px 0 rgba(0,0,0,0.9)",
              marginBottom: "8px",
            }}
          >
            {form.title}
          </h1>
          {form.description && (
            <p
              style={{
                fontFamily: "var(--font-mc)",
                fontSize: "14px",
                color: hex(textCol, -40),
                marginBottom: "28px",
                lineHeight: 1.6,
              }}
            >
              {form.description}
            </p>
          )}

          {totalPages > 1 && (
            <div style={{ marginBottom: "28px" }}>
              <McXPBar
                value={currentPage + 1}
                max={totalPages}
                label={`Page ${currentPage + 1} of ${totalPages}`}
                color={primary}
              />
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {pageFields.map((field) => (
              <McFieldRenderer
                key={field.id}
                field={field as Parameters<typeof McFieldRenderer>[0]["field"]}
                answers={answers}
                onChange={handleFieldChange}
                theme={theme}
              />
            ))}

            {isLastPage && form.collectEmail && (
              <McInput
                label="Your Email"
                type="email"
                value={respondentEmail}
                onChange={(e) => setRespondentEmail(e.target.value)}
                placeholder="your@email.com"
                style={{ marginBottom: "28px" }}
              />
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "10px",
                marginTop: "10px",
              }}
            >
              {currentPage > 0 && (
                <McButton
                  variant="stone"
                  size="md"
                  type="button"
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  ← Back
                </McButton>
              )}
              {!isLastPage ? (
                <McButton
                  variant="wood"
                  size="md"
                  type="button"
                  style={{ marginLeft: "auto" }}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next →
                </McButton>
              ) : (
                <McButton
                  variant="grass"
                  size="md"
                  type="submit"
                  disabled={submit.isPending}
                  style={{ marginLeft: currentPage > 0 ? "0" : "auto" }}
                >
                  {submit.isPending ? "Submitting..." : "⚡ Submit"}
                </McButton>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
