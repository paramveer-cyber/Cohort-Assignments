"use client";

import { use, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Download, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { McCard, McButton, McBadge, McSectionTitle, McModal } from "~/components/mc";
import { useForm } from "~/hooks/api/forms";
import { useResponses, useDeleteResponse, useDeleteAllResponses } from "~/hooks/api/responses";
import { useInvalidateCache } from "~/hooks/api/useInvalidateCache";

const PAGE_SIZE = 50;

type Params = { formId: string };
type ConfirmState = { type: "deleteOne"; responseId: string } | { type: "deleteAll" } | null;

interface FormField {
  id: string;
  label: string;
}

interface FormData {
  title: string;
  slug: string | null;
  fields: FormField[];
}

interface ResponseItem {
  id: string;
  submittedAt: string | null;
  respondentEmail: string | null;
  answers: Record<string, unknown>;
}

function McConfirmModal({
  state,
  onConfirm,
  onCancel,
  isPending,
}: {
  state: ConfirmState;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  if (!state) return null;
  const msg =
    state.type === "deleteAll"
      ? "Delete ALL responses? Cannot be undone."
      : "Delete this response? Cannot be undone.";
  return (
    <McModal open title="⚠ Confirm Deletion" onClose={onCancel}>
      <p
        style={{
          fontFamily: "var(--font-mc)",
          fontSize: "15px",
          color: "#c8c8c8",
          marginBottom: "24px",
          lineHeight: 1.6,
        }}
      >
        {msg}
      </p>
      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <McButton variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </McButton>
        <McButton variant="danger" size="sm" onClick={onConfirm} disabled={isPending}>
          {isPending ? "Deleting..." : "Delete"}
        </McButton>
      </div>
    </McModal>
  );
}

export default function ResponsesPage({ params }: { params: Promise<Params> }) {
  const { formId } = use(params);
  const { invalidateCache } = useInvalidateCache();
  const [page, setPage] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);

  const { form: formRaw } = useForm({ formId });
  const form = formRaw as FormData | undefined;

  const { responses: responsesRaw, isLoading } = useResponses({
    formId,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });
  const responses = responsesRaw as ResponseItem[] | undefined;

  const { deleteResponse, isPending: deleteOnePending } = useDeleteResponse({
    onSuccess: () => {
      invalidateCache("analytics.formStats");
      invalidateCache("forms.list");
      toast.success("Response deleted");
      setConfirmState(null);
    },
    onError: (e: { message: string }) => {
      toast.error(e.message);
      setConfirmState(null);
    },
  });

  const { deleteAllResponses, isPending: deleteAllPending } = useDeleteAllResponses({
    onSuccess: () => {
      invalidateCache("analytics.formStats");
      invalidateCache("forms.list");
      toast.success("All responses deleted");
      setConfirmState(null);
      setPage(0);
    },
    onError: (e: { message: string }) => {
      toast.error(e.message);
      setConfirmState(null);
    },
  });

  const isPending = deleteOnePending || deleteAllPending;

  function handleConfirm() {
    if (!confirmState) return;
    if (confirmState.type === "deleteOne") deleteResponse({ responseId: confirmState.responseId });
    if (confirmState.type === "deleteAll") deleteAllResponses({ formId });
  }

  function formatAnswer(fieldId: string, value: unknown): string {
    if (value === null || value === undefined || value === "") return "—";
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
  }

  function exportCSV() {
    if (!responses || !form) return;
    const headers = ["Submitted At", "Email", ...form.fields.map((f) => f.label)];
    const rows = responses.map((r) => [
      new Date(r.submittedAt!).toISOString(),
      r.respondentEmail ?? "",
      ...form.fields.map((f) => formatAnswer(f.id, r.answers[f.id])),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.slug}-responses.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const hasPrev = page > 0;
  const hasNext = (responses?.length ?? 0) === PAGE_SIZE;

  return (
    <>
      <McConfirmModal
        state={confirmState}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmState(null)}
        isPending={isPending}
      />

      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ marginBottom: "20px" }}>
          <Link
            href={`/dashboard/forms/${formId}`}
            style={{
              fontFamily: "var(--font-mc)",
              fontSize: "13px",
              color: "#606060",
              letterSpacing: "0.03em",
              transition: "color 0.1s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#5aaa38")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#606060")}
          >
            ← {form?.title ?? "Form"}
          </Link>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "28px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <McSectionTitle accent>
            📬 Responses{" "}
            {responses && (
              <span
                style={{
                  fontFamily: "var(--font-mc)",
                  fontSize: "14px",
                  color: "#505050",
                  fontWeight: "normal",
                }}
              >
                ({responses.length}
                {hasNext ? "+" : ""})
              </span>
            )}
          </McSectionTitle>

          {responses && responses.length > 0 && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <McButton variant="ghost" size="sm" onClick={exportCSV}>
                <Download size={14} />
                Export CSV
              </McButton>
              <McButton
                variant="danger"
                size="sm"
                onClick={() => setConfirmState({ type: "deleteAll" })}
              >
                <Trash2 size={14} />
                Delete all
              </McButton>
            </div>
          )}
        </div>

        {isLoading && (
          <div
            style={{
              fontFamily: "var(--font-mc)",
              color: "#5aaa38",
              fontSize: "15px",
              textAlign: "center",
              padding: "64px",
              letterSpacing: "0.08em",
              animation: "mc-blink 1s step-end infinite",
            }}
          >
            Loading responses...
          </div>
        )}

        {!isLoading && responses?.length === 0 && (
          <McCard
            variant="stone"
            style={{
              padding: "64px 32px",
              textAlign: "center",
              borderStyle: "dashed",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
            <p
              style={{
                fontFamily: "var(--font-mc)",
                fontSize: "16px",
                color: "#585858",
                letterSpacing: "0.04em",
              }}
            >
              No responses yet
            </p>
          </McCard>
        )}

        {responses && responses.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {responses.map((r, i) => {
              const isExpanded = expandedId === r.id;
              return (
                <McCard key={r.id} variant="inventory" style={{ padding: 0, overflow: "hidden" }}>
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : r.id)}
                    style={{
                      padding: "14px 18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      background: isExpanded ? "rgba(90,170,56,0.06)" : "transparent",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isExpanded)
                        (e.currentTarget as HTMLDivElement).style.background =
                          "rgba(255,255,255,0.03)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isExpanded)
                        (e.currentTarget as HTMLDivElement).style.background = "transparent";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "14px",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <McBadge variant="stone">#{page * PAGE_SIZE + responses.length - i}</McBadge>
                      {r.respondentEmail && (
                        <span
                          style={{
                            fontFamily: "var(--font-mc)",
                            fontSize: "14px",
                            color: "#20d4e8",
                            textShadow: "1px 1px 0 rgba(0,0,0,0.8)",
                          }}
                        >
                          {r.respondentEmail}
                        </span>
                      )}
                      <span
                        style={{
                          fontFamily: "var(--font-mc)",
                          fontSize: "12px",
                          color: "#505050",
                          letterSpacing: "0.03em",
                        }}
                      >
                        {new Date(r.submittedAt!).toLocaleString()}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmState({ type: "deleteOne", responseId: r.id });
                        }}
                        title="Delete response"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "30px",
                          height: "30px",
                          background: "#3a0808",
                          color: "#ff6666",
                          border: "2px solid #5a0a0a",
                          borderTopColor: "#7a1010",
                          cursor: "pointer",
                          transition: "all 0.08s",
                          flexShrink: 0,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#5a1010";
                          e.currentTarget.style.color = "#ff9999";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#3a0808";
                          e.currentTarget.style.color = "#ff6666";
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                      <span style={{ color: "#404040" }}>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div
                      style={{
                        borderTop: "2px solid #1e1e1e",
                        padding: "18px",
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                        gap: "14px",
                      }}
                    >
                      {form?.fields.map((field) => (
                        <div key={field.id}>
                          <div
                            style={{
                              fontFamily: "var(--font-mc)",
                              fontSize: "11px",
                              color: "#505050",
                              letterSpacing: "0.06em",
                              marginBottom: "4px",
                              textTransform: "uppercase",
                            }}
                          >
                            {field.label}
                          </div>
                          <div
                            style={{
                              fontFamily: "var(--font-mc)",
                              fontSize: "14px",
                              color: "#d0d0d0",
                              textShadow: "1px 1px 0 rgba(0,0,0,0.6)",
                              wordBreak: "break-word",
                            }}
                          >
                            {formatAnswer(field.id, r.answers[field.id])}
                          </div>
                        </div>
                      ))}
                      {!form &&
                        Object.entries(r.answers).map(([k, v]) => (
                          <div key={k}>
                            <div
                              style={{
                                fontFamily: "var(--font-mc)",
                                fontSize: "11px",
                                color: "#505050",
                                letterSpacing: "0.06em",
                                marginBottom: "4px",
                                textTransform: "uppercase",
                              }}
                            >
                              {k}
                            </div>
                            <div
                              style={{
                                fontFamily: "var(--font-mc)",
                                fontSize: "14px",
                                color: "#d0d0d0",
                                wordBreak: "break-word",
                              }}
                            >
                              {formatAnswer(k, v)}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </McCard>
              );
            })}
          </div>
        )}

        {(hasPrev || hasNext) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              marginTop: "24px",
            }}
          >
            <McButton
              variant="stone"
              size="sm"
              disabled={!hasPrev}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={15} />
              Prev
            </McButton>
            <span
              style={{
                fontFamily: "var(--font-mc)",
                fontSize: "14px",
                color: "#505050",
                letterSpacing: "0.04em",
              }}
            >
              Page {page + 1}
            </span>
            <McButton
              variant="stone"
              size="sm"
              disabled={!hasNext}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight size={15} />
            </McButton>
          </div>
        )}
      </div>
    </>
  );
}
