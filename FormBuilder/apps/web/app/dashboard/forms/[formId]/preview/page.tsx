"use client";

import { useState, use, useMemo } from "react";
import { useForm, useFormThemes } from "~/hooks/api/forms";
import {
  McCard,
  McButton,
  McLinkButton,
  McBadge,
  McFloatingParticles,
  McWorldBackground,
  McSectionTitle,
  McDivider,
} from "~/components/mc";

type Params = { formId: string };
type ConditionalLogic = { showIf?: { fieldId: string; operator: string; value: string } } | null;

interface ThemeData {
  id: string;
  name: string;
  primaryColor: string | null;
  backgroundColor: string | null;
  textColor: string | null;
}

interface FormField {
  id: string;
  label: string;
  description: string | null;
  fieldType: string;
  placeholder: string | null;
  required: boolean | null;
  config: { options?: string[]; max?: number; conditionalLogic?: ConditionalLogic } | null;
}

interface FormData {
  title: string;
  description: string | null;
  status: string;
  themeId: string | null;
  collectEmail: boolean | null;
  fields: FormField[];
}

function hex(h: string, amt: number): string {
  const n = parseInt(h.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, ((n >> 16) & 0xff) + amt));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + amt));
  const b = Math.min(255, Math.max(0, (n & 0xff) + amt));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function fieldIsVisible(config: FormField["config"], answers: Record<string, unknown>): boolean {
  const logic = config?.conditionalLogic;
  if (!logic?.showIf) return true;
  const { fieldId, operator, value } = logic.showIf;
  const answer = answers[fieldId];
  if (operator === "equals") return String(answer ?? "") === value;
  if (operator === "not_equals") return String(answer ?? "") !== value;
  if (operator === "contains") return String(answer ?? "").includes(value);
  return true;
}

function buildInputStyle(theme: ThemeData | null): React.CSSProperties {
  const bg = theme?.backgroundColor ?? "#0e0e0e";
  const text = theme?.textColor ?? "#e8e8e8";
  return {
    width: "100%",
    padding: "12px 16px",
    fontFamily: "var(--font-mc)",
    fontSize: "15px",
    background: hex(bg, 6),
    color: text,
    borderWidth: "2px",
    borderStyle: "solid",
    borderTopColor: hex(bg, 12),
    borderLeftColor: hex(bg, 18),
    borderRightColor: hex(bg, 18),
    borderBottomColor: hex(bg, 18),
    boxShadow: "inset 0 3px 5px rgba(0,0,0,0.8)",
    outline: "none",
    letterSpacing: "0.02em",
    transition: "border-color 0.1s, box-shadow 0.1s",
    marginTop: "8px",
  };
}

function McFieldInput({
  fieldId,
  field,
  answers,
  onChange,
  theme,
}: {
  fieldId: string;
  field: FormField;
  answers: Record<string, unknown>;
  onChange: (id: string, val: unknown) => void;
  theme: ThemeData | null;
}) {
  const [focused, setFocused] = useState(false);
  const primary = theme?.primaryColor ?? "#3a9828";
  const bg = theme?.backgroundColor ?? "#0e0e0e";
  const textCol = theme?.textColor ?? "#e8e8e8";
  const inputStyle = buildInputStyle(theme);
  const cfg = field.config;

  const focusStyle: React.CSSProperties = focused
    ? {
        borderColor: primary,
        borderTopColor: hex(primary, -20),
        borderLeftColor: primary,
        borderRightColor: primary,
        borderBottomColor: primary,
        boxShadow: `inset 0 3px 5px rgba(0,0,0,0.8), 0 0 0 2px ${primary}50`,
      }
    : {};

  const focusHandlers = {
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
  };

  if (
    field.fieldType === "short_text" ||
    field.fieldType === "email" ||
    field.fieldType === "number"
  ) {
    return (
      <input
        style={{ ...inputStyle, ...focusStyle }}
        type={
          field.fieldType === "email" ? "email" : field.fieldType === "number" ? "number" : "text"
        }
        placeholder={field.placeholder ?? ""}
        onChange={(e) =>
          onChange(
            fieldId,
            field.fieldType === "number" ? parseFloat(e.target.value) : e.target.value,
          )
        }
        {...focusHandlers}
      />
    );
  }

  if (field.fieldType === "long_text") {
    return (
      <textarea
        style={{ ...inputStyle, ...focusStyle, minHeight: "100px", resize: "vertical" }}
        placeholder={field.placeholder ?? ""}
        onChange={(e) => onChange(fieldId, e.target.value)}
        {...focusHandlers}
      />
    );
  }

  if (field.fieldType === "date") {
    return (
      <input
        style={{ ...inputStyle, ...focusStyle, colorScheme: "dark" }}
        type="date"
        onChange={(e) => onChange(fieldId, e.target.value)}
        {...focusHandlers}
      />
    );
  }

  if (field.fieldType === "single_select" || field.fieldType === "dropdown") {
    return (
      <select
        style={{ ...inputStyle, ...focusStyle, cursor: "pointer" }}
        onChange={(e) => onChange(fieldId, e.target.value)}
        {...focusHandlers}
      >
        <option value="">— Select an option —</option>
        {(cfg?.options ?? []).map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  }

  if (field.fieldType === "multi_select") {
    const selected = (answers[fieldId] as string[] | undefined) ?? [];
    return (
      <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
        {(cfg?.options ?? []).map((o) => {
          const checked = selected.includes(o);
          return (
            <label
              key={o}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                cursor: "pointer",
                background: checked ? `${primary}20` : hex(bg, 6),
                border: "2px solid",
                borderTopColor: checked ? primary : hex(bg, 18),
                borderLeftColor: checked ? hex(primary, -10) : hex(bg, 15),
                borderRightColor: checked ? hex(primary, -10) : hex(bg, 15),
                borderBottomColor: checked ? hex(primary, -20) : hex(bg, 12),
                transition: "all 0.08s",
                fontFamily: "var(--font-mc)",
                fontSize: "15px",
                color: checked ? primary : hex(textCol, -20),
              }}
            >
              <span
                style={{
                  width: "18px",
                  height: "18px",
                  border: "2px solid",
                  borderColor: checked ? primary : hex(bg, 30),
                  background: checked ? hex(primary, -20) : hex(bg, 4),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  flexShrink: 0,
                  boxShadow: checked ? `0 0 6px ${primary}60` : "inset 0 2px 3px rgba(0,0,0,0.7)",
                }}
              >
                {checked && "✓"}
              </span>
              <input
                type="checkbox"
                checked={checked}
                style={{ display: "none" }}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...selected, o]
                    : selected.filter((s) => s !== o);
                  onChange(fieldId, next);
                }}
              />
              {o}
            </label>
          );
        })}
      </div>
    );
  }

  if (field.fieldType === "checkbox") {
    const checked = (answers[fieldId] as boolean | undefined) ?? false;
    return (
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginTop: "10px",
          cursor: "pointer",
          padding: "10px 14px",
          background: checked ? `${primary}20` : hex(bg, 6),
          border: "2px solid",
          borderTopColor: checked ? primary : hex(bg, 18),
          borderLeftColor: checked ? hex(primary, -10) : hex(bg, 15),
          borderRightColor: checked ? hex(primary, -10) : hex(bg, 15),
          borderBottomColor: checked ? hex(primary, -20) : hex(bg, 12),
          fontFamily: "var(--font-mc)",
          fontSize: "15px",
          color: checked ? primary : hex(textCol, -20),
          transition: "all 0.08s",
        }}
        onClick={() => onChange(fieldId, !checked)}
      >
        <span
          style={{
            width: "18px",
            height: "18px",
            border: "2px solid",
            borderColor: checked ? primary : hex(bg, 30),
            background: checked ? hex(primary, -20) : hex(bg, 4),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            flexShrink: 0,
            boxShadow: checked ? `0 0 6px ${primary}60` : "inset 0 2px 3px rgba(0,0,0,0.7)",
          }}
        >
          {checked && "✓"}
        </span>
        {field.placeholder || "Yes"}
      </label>
    );
  }

  if (field.fieldType === "rating") {
    const max = cfg?.max ?? 5;
    const current = (answers[fieldId] as number | undefined) ?? 0;
    return (
      <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
          const active = current >= n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(fieldId, n)}
              style={{
                width: "44px",
                height: "44px",
                fontFamily: "var(--font-mc)",
                fontWeight: 700,
                fontSize: "16px",
                background: active ? hex(primary, -20) : hex(bg, 6),
                color: active ? "#fff" : hex(textCol, -40),
                border: "2px solid",
                borderTopColor: active ? primary : hex(bg, 25),
                borderLeftColor: active ? primary : hex(bg, 25),
                borderRightColor: active ? hex(primary, -30) : hex(bg, 15),
                borderBottomColor: active ? hex(primary, -30) : hex(bg, 15),
                boxShadow: active
                  ? `0 3px 0 ${hex(primary, -40)}, 0 0 12px ${primary}40`
                  : `0 3px 0 ${hex(bg, -10)}`,
                cursor: "pointer",
                transition: "all 0.08s",
                textShadow: active ? "1px 1px 0 rgba(0,0,0,0.7)" : "none",
              }}
            >
              {n}
            </button>
          );
        })}
      </div>
    );
  }

  return null;
}

export default function FormPreviewPage({ params }: { params: Promise<Params> }) {
  const { formId } = use(params);
  const { form: formRaw, isLoading } = useForm({ formId });
  const form = formRaw as FormData | undefined;
  const { themes: themesRaw } = useFormThemes();
  const allThemes = themesRaw as ThemeData[] | undefined;
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [respondentEmail, setRespondentEmail] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);

  const theme = useMemo<ThemeData | null>(() => {
    if (!form?.themeId || !allThemes) return null;
    return allThemes.find((t) => t.id === form.themeId) ?? null;
  }, [form?.themeId, allThemes]);

  const primary = theme?.primaryColor ?? "#5aaa38";
  const bg = theme?.backgroundColor ?? "#0e0e0e";
  const textCol = theme?.textColor ?? "#e8e8e8";
  const cardBg = hex(bg, 6);
  const cardBorder = hex(bg, 20);

  const themedCardStyle: React.CSSProperties = {
    backgroundColor: cardBg,
    borderWidth: "2px",
    borderStyle: "solid",
    borderTopColor: cardBorder,
    borderLeftColor: cardBorder,
    borderRightColor: hex(bg, 8),
    borderBottomColor: hex(bg, 8),
    boxShadow: `0 6px 0 ${hex(bg, -4)}, inset 0 1px 0 rgba(255,255,255,0.05)`,
  };

  const inputStyle = buildInputStyle(theme);

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "transparent",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <McWorldBackground themeName={theme?.name} />
        <McFloatingParticles count={10} />
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mc)",
              fontSize: "18px",
              color: hex(textCol, -20),
              letterSpacing: "0.05em",
              animation: "mc-pulse-glow 2s ease-in-out infinite",
            }}
          >
            ⛏ Loading preview...
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: "12px",
                  height: "12px",
                  background: primary,
                  animation: `mc-pulse-glow 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "transparent",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <McWorldBackground themeName={theme?.name} />
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
          }}
        >
          <McCard
            variant="stone"
            style={{ padding: "48px", textAlign: "center", maxWidth: "400px", ...themedCardStyle }}
          >
            <div style={{ fontFamily: "var(--font-mc)", fontSize: "40px", marginBottom: "16px" }}>
              ⚠
            </div>
            <McSectionTitle accent>Form Not Found</McSectionTitle>
            <p
              style={{
                fontFamily: "var(--font-mc)",
                fontSize: "14px",
                color: hex(textCol, -60),
                marginBottom: "24px",
              }}
            >
              This form does not exist or was removed.
            </p>
            <McLinkButton href="/dashboard/forms" variant="stone" size="sm">
              ← Back to Forms
            </McLinkButton>
          </McCard>
        </div>
      </div>
    );
  }

  function handleFieldChange(id: string, val: unknown) {
    setAnswers((prev) => ({ ...prev, [id]: val }));
  }

  const visibleFields = form.fields.filter((f) => fieldIsVisible(f.config, answers));

  const completedCount = visibleFields.filter((f) => {
    const ans = answers[f.id];
    if (ans === undefined || ans === null || ans === "") return false;
    if (Array.isArray(ans) && ans.length === 0) return false;
    return true;
  }).length;

  const requiredTotal = visibleFields.filter((f) => f.required).length;
  const completedRequired = visibleFields.filter((f) => {
    if (!f.required) return false;
    const ans = answers[f.id];
    if (ans === undefined || ans === null || ans === "") return false;
    if (Array.isArray(ans) && ans.length === 0) return false;
    return true;
  }).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "transparent",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <McWorldBackground themeName={theme?.name} />
      <McFloatingParticles count={32} />

      <div style={{ position: "relative", zIndex: 10 }}>
        <div
          style={{
            borderBottom: `2px solid ${hex(bg, 20)}`,
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "56px",
            background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("/textures/stone_texture.webp")`,
            backgroundSize: "auto, 32px 32px",
            boxShadow: `0 3px 0 ${hex(bg, -10)}, inset 0 1px 0 rgba(255,255,255,0.04)`,
            backdropFilter: "blur(8px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <McLinkButton href={`/dashboard/forms/${formId}/edit`} variant="ghost" size="sm">
              ← Back to Editor
            </McLinkButton>
            <McBadge variant="gold">👁 Preview Mode</McBadge>
            <span
              style={{
                fontFamily: "var(--font-mc)",
                fontSize: "12px",
                color: hex(textCol, -60),
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span style={{ color: "#ff8844" }}>⚠</span>
              Responses not saved
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {theme && (
              <span
                style={{
                  fontFamily: "var(--font-mc)",
                  fontSize: "11px",
                  color: primary,
                  background: `${primary}20`,
                  padding: "2px 8px",
                  border: `1px solid ${primary}40`,
                }}
              >
                🎨 {theme.name}
              </span>
            )}
            {form.status && (
              <McBadge variant={form.status === "published" ? "grass" : "stone"}>
                {form.status === "published" ? "🌐 Published" : `📦 ${form.status}`}
              </McBadge>
            )}
            <span
              style={{ fontFamily: "var(--font-mc)", fontSize: "12px", color: hex(textCol, -60) }}
            >
              {visibleFields.length} field{visibleFields.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div style={{ padding: "48px 16px 80px" }}>
          <div style={{ maxWidth: "620px", margin: "0 auto" }}>
            {visibleFields.length > 0 && (
              <div style={{ ...themedCardStyle, padding: "16px 20px", marginBottom: "24px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mc)",
                      fontSize: "13px",
                      color: hex(textCol, -60),
                      letterSpacing: "0.05em",
                    }}
                  >
                    PROGRESS
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mc)",
                      fontSize: "13px",
                      color: primary,
                      fontWeight: 700,
                    }}
                  >
                    {completedCount}/{visibleFields.length} filled
                  </span>
                </div>
                <div
                  style={{
                    height: "12px",
                    background: hex(bg, -4),
                    borderWidth: "2px",
                    borderStyle: "solid",
                    borderTopColor: hex(bg, 10),
                    borderLeftColor: hex(bg, 18),
                    borderRightColor: hex(bg, 18),
                    borderBottomColor: hex(bg, 18),
                    boxShadow: "inset 0 3px 4px rgba(0,0,0,0.95)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      bottom: 0,
                      width: `${visibleFields.length > 0 ? (completedCount / visibleFields.length) * 100 : 0}%`,
                      background: primary,
                      backgroundImage:
                        "repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)",
                      boxShadow: `inset 0 2px 0 rgba(255,255,255,0.35), inset 0 -2px 0 rgba(0,0,0,0.5), 0 0 12px ${primary}60`,
                      transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
                    }}
                  />
                </div>
                {requiredTotal > 0 && (
                  <div
                    style={{
                      marginTop: "6px",
                      fontFamily: "var(--font-mc)",
                      fontSize: "12px",
                      color: hex(textCol, -80),
                    }}
                  >
                    {completedRequired}/{requiredTotal} required fields completed
                  </div>
                )}
              </div>
            )}

            <div style={{ ...themedCardStyle, padding: "36px 32px", marginBottom: "8px" }}>
              <h1
                style={{
                  fontFamily: "var(--font-mc)",
                  fontSize: "26px",
                  fontWeight: 700,
                  color: primary,
                  textShadow: "1px 2px 0 rgba(0,0,0,0.9)",
                  letterSpacing: "0.03em",
                  marginBottom: "10px",
                  lineHeight: 1.3,
                }}
              >
                {form.title}
              </h1>
              {form.description && (
                <p
                  style={{
                    fontFamily: "var(--font-mc)",
                    fontSize: "15px",
                    color: hex(textCol, -40),
                    lineHeight: 1.7,
                  }}
                >
                  {form.description}
                </p>
              )}
            </div>

            <div style={{ ...themedCardStyle, padding: "32px" }}>
              {form.fields.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "56px 24px",
                    border: `2px dashed ${hex(bg, 20)}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  <div style={{ fontSize: "48px", opacity: 0.4 }}>📭</div>
                  <div
                    style={{
                      fontFamily: "var(--font-mc)",
                      fontSize: "16px",
                      color: hex(textCol, -60),
                    }}
                  >
                    No fields yet.
                  </div>
                  <McLinkButton href={`/dashboard/forms/${formId}/edit`} variant="grass" size="sm">
                    + Add Fields
                  </McLinkButton>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {visibleFields.map((field, idx) => {
                    const isLast = idx === visibleFields.length - 1;
                    return (
                      <div
                        key={field.id}
                        style={{
                          paddingBottom: isLast ? "0" : "28px",
                          marginBottom: isLast ? "0" : "28px",
                          borderBottom: isLast ? "none" : `1px solid ${hex(bg, 18)}`,
                        }}
                      >
                        <label
                          style={{
                            display: "block",
                            fontFamily: "var(--font-mc)",
                            fontWeight: 700,
                            fontSize: "15px",
                            color: textCol,
                            letterSpacing: "0.03em",
                            textShadow: "1px 1px 0 rgba(0,0,0,0.7)",
                          }}
                        >
                          {field.label}
                          {field.required && (
                            <span
                              style={{
                                color: "#ff4444",
                                marginLeft: "6px",
                                textShadow: "0 0 8px rgba(255,68,68,0.5)",
                              }}
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
                              color: hex(textCol, -60),
                              marginTop: "4px",
                              lineHeight: 1.5,
                            }}
                          >
                            {field.description}
                          </p>
                        )}

                        <McFieldInput
                          fieldId={field.id}
                          field={field}
                          answers={answers}
                          onChange={handleFieldChange}
                          theme={theme}
                        />
                      </div>
                    );
                  })}

                  {form.collectEmail && (
                    <>
                      <McDivider label="Respondent Info" />
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontFamily: "var(--font-mc)",
                            fontWeight: 700,
                            fontSize: "15px",
                            color: textCol,
                            letterSpacing: "0.03em",
                            textShadow: "1px 1px 0 rgba(0,0,0,0.7)",
                            marginBottom: "8px",
                          }}
                        >
                          Your Email <span style={{ color: "#ff4444" }}>*</span>
                        </label>
                        <input
                          style={{
                            ...inputStyle,
                            ...(emailFocused
                              ? {
                                  borderColor: primary,
                                  borderTopColor: hex(primary, -20),
                                  borderLeftColor: primary,
                                  borderRightColor: primary,
                                  borderBottomColor: primary,
                                  boxShadow: `inset 0 3px 5px rgba(0,0,0,0.8), 0 0 0 2px ${primary}50`,
                                }
                              : {}),
                          }}
                          type="email"
                          value={respondentEmail}
                          onChange={(e) => setRespondentEmail(e.target.value)}
                          placeholder="your@email.com"
                          onFocus={() => setEmailFocused(true)}
                          onBlur={() => setEmailFocused(false)}
                        />
                      </div>
                    </>
                  )}

                  {form.fields.length > 0 && (
                    <div
                      style={{
                        marginTop: "32px",
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        flexWrap: "wrap",
                      }}
                    >
                      <McButton
                        variant="grass"
                        size="md"
                        onClick={() => alert("Preview mode — submission disabled")}
                        style={
                          {
                            background: primary,
                            borderTopColor: hex(primary, 20),
                            borderLeftColor: hex(primary, 20),
                            borderRightColor: hex(primary, -20),
                            borderBottomColor: hex(primary, -20),
                          } as React.CSSProperties
                        }
                      >
                        Submit Form
                      </McButton>
                      <span
                        style={{
                          fontFamily: "var(--font-mc)",
                          fontSize: "12px",
                          color: hex(textCol, -80),
                          letterSpacing: "0.04em",
                        }}
                      >
                        ⚠ Preview mode — not saved
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div
              style={{
                marginTop: "20px",
                textAlign: "center",
                fontFamily: "var(--font-mc)",
                fontSize: "12px",
                color: hex(textCol, -100),
                letterSpacing: "0.04em",
              }}
            >
              ⛏ Powered by FormCraft
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
