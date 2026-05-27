"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useCreateForm, useFormTemplates, useCloneTemplate } from "~/hooks/api/forms";

interface FormTemplate {
  id: string;
  title: string;
  description: string | null;
  fields: unknown[];
}

interface CreatedForm {
  id: string;
}

type Tab = "blank" | "templates";

export default function NewFormPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("blank");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const { templates: templatesRaw, isLoading: templatesLoading } = useFormTemplates();
  const templates = templatesRaw as FormTemplate[] | undefined;

  const { createForm, isPending: createPending } = useCreateForm({
    onSuccess(form) {
      const { id } = form as CreatedForm;
      toast.success("Form created");
      router.push(`/dashboard/forms/${id}/edit`);
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const { cloneTemplate, isPending: clonePending } = useCloneTemplate({
    onSuccess(form) {
      const { id } = form as CreatedForm;
      toast.success("Form created from template");
      router.push(`/dashboard/forms/${id}/edit`);
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const inputStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
    fontSize: "14px",
    marginBottom: "20px",
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 18px",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    border: "none",
    background: active ? "#111" : "none",
    color: active ? "#fff" : "#666",
  });

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px" }}>
        <Link href="/dashboard/forms" style={{ fontSize: "13px", color: "#666" }}>
          ← Back to forms
        </Link>
      </div>

      <h1 style={{ fontSize: "22px", fontWeight: "600", marginBottom: "20px" }}>Create new form</h1>

      <div
        style={{
          display: "flex",
          gap: "4px",
          marginBottom: "28px",
          background: "#f3f4f6",
          padding: "4px",
          borderRadius: "6px",
          width: "fit-content",
        }}
      >
        <button style={tabStyle(tab === "blank")} onClick={() => setTab("blank")}>
          Start blank
        </button>
        <button style={tabStyle(tab === "templates")} onClick={() => setTab("templates")}>
          Use template {templates && templates.length > 0 && `(${templates.length})`}
        </button>
      </div>

      {tab === "blank" && (
        <div style={{ maxWidth: "520px" }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createForm({ title, description: description || undefined });
            }}
          >
            <label
              style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px" }}
            >
              Form title *
            </label>
            <input
              style={inputStyle}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Customer Feedback Survey"
              autoFocus
            />
            <label
              style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px" }}
            >
              Description
            </label>
            <textarea
              style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description shown to respondents"
            />
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="submit"
                disabled={createPending || !title.trim()}
                style={{
                  padding: "10px 20px",
                  background: "#111",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                {createPending ? "Creating..." : "Create form"}
              </button>
              <Link
                href="/dashboard/forms"
                style={{
                  padding: "10px 20px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      )}

      {tab === "templates" && (
        <div>
          {templatesLoading && <div style={{ color: "#666" }}>Loading templates...</div>}
          {!templatesLoading && (!templates || templates.length === 0) && (
            <div
              style={{
                textAlign: "center",
                padding: "48px",
                border: "1px dashed #e0e0e0",
                borderRadius: "4px",
                color: "#666",
              }}
            >
              No templates available yet.
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
            {templates?.map((t: FormTemplate) => (
              <div
                key={t.id}
                style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "6px",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div style={{ fontWeight: "600", fontSize: "15px" }}>{t.title}</div>
                {t.description && (
                  <div style={{ fontSize: "13px", color: "#666" }}>{t.description}</div>
                )}
                <div style={{ fontSize: "12px", color: "#999" }}>{t.fields.length} fields</div>
                <button
                  onClick={() => cloneTemplate({ formId: t.id })}
                  disabled={clonePending}
                  style={{
                    marginTop: "8px",
                    padding: "8px 16px",
                    background: "#111",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "500",
                  }}
                >
                  {clonePending ? "Creating..." : "Use this template"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
