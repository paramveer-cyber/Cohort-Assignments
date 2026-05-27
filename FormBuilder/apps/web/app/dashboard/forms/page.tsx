"use client";

import Link from "next/link";
import { toast } from "sonner";
import {
  Pencil,
  BarChart2,
  List,
  EyeOff,
  Trash2,
  ExternalLink,
  Plus,
  FileText,
} from "lucide-react";
import {
  McCard,
  McButton,
  McLinkButton,
  McBadge,
  McSectionTitle,
  McFloatingParticles,
} from "~/components/mc";
import { useFormList, useUnpublishForm, useDeleteForm } from "~/hooks/api/forms";
import { useInvalidateCache } from "~/hooks/api/useInvalidateCache";

interface FormListItem {
  id: string;
  title: string;
  status: string;
  slug: string | null;
  visibility: string | null;
  responseCount: number | null;
  expiresAt: string | null;
  responseLimit: number | null;
  isPasswordProtected: boolean | null;
  isTemplate: boolean | null;
}

function McIconBtn({
  onClick,
  title,
  icon,
  danger,
  disabled,
}: {
  onClick?: () => void;
  title: string;
  icon: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "36px",
        height: "36px",
        background: danger ? "#3a0808" : "#2a2a2a",
        color: danger ? "#ff6666" : "#a0a0a0",
        border: `2px solid ${danger ? "#5a0a0a" : "#3a3a3a"}`,
        borderTopColor: danger ? "#7a1010" : "#484848",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        boxShadow: "0 3px 0 #111, inset 0 1px 0 rgba(255,255,255,0.06)",
        transition: "all 0.08s",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = danger ? "#5a1010" : "#383838";
        e.currentTarget.style.color = danger ? "#ff8888" : "#e0e0e0";
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = `0 4px 0 #111, inset 0 1px 0 rgba(255,255,255,0.08)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = danger ? "#3a0808" : "#2a2a2a";
        e.currentTarget.style.color = danger ? "#ff6666" : "#a0a0a0";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 3px 0 #111, inset 0 1px 0 rgba(255,255,255,0.06)";
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = "translateY(2px)";
        e.currentTarget.style.boxShadow = "0 1px 0 #111, inset 0 2px 4px rgba(0,0,0,0.6)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 4px 0 #111, inset 0 1px 0 rgba(255,255,255,0.08)";
      }}
    >
      {icon}
    </button>
  );
}

function McIconLink({
  href,
  title,
  icon,
  external,
}: {
  href: string;
  title: string;
  icon: React.ReactNode;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "36px",
        height: "36px",
        background: "#2a2a2a",
        color: "#a0a0a0",
        border: "2px solid #3a3a3a",
        borderTopColor: "#484848",
        cursor: "pointer",
        boxShadow: "0 3px 0 #111, inset 0 1px 0 rgba(255,255,255,0.06)",
        transition: "all 0.08s",
        flexShrink: 0,
        textDecoration: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#383838";
        e.currentTarget.style.color = "#e0e0e0";
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 4px 0 #111, inset 0 1px 0 rgba(255,255,255,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#2a2a2a";
        e.currentTarget.style.color = "#a0a0a0";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 3px 0 #111, inset 0 1px 0 rgba(255,255,255,0.06)";
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = "translateY(2px)";
        e.currentTarget.style.boxShadow = "0 1px 0 #111, inset 0 2px 4px rgba(0,0,0,0.6)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 4px 0 #111, inset 0 1px 0 rgba(255,255,255,0.08)";
      }}
    >
      {icon}
    </Link>
  );
}

function FormStatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, "grass" | "stone" | "danger"> = {
    published: "grass",
    archived: "danger",
    draft: "stone",
  };
  return <McBadge variant={variantMap[status] ?? "stone"}>{status}</McBadge>;
}

export default function FormsListPage() {
  const { invalidateCache } = useInvalidateCache();
  const { forms: formsRaw, isLoading } = useFormList();
  const forms = formsRaw as FormListItem[] | undefined;

  const { unpublishForm, isPending: unpublishPending } = useUnpublishForm({
    onSuccess: () => {
      invalidateCache("forms.list");
      toast.success("Form unpublished");
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const { deleteForm, isPending: deletePending } = useDeleteForm({
    onSuccess: () => {
      invalidateCache("forms.list");
      toast.success("Form deleted");
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", position: "relative" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "32px",
        }}
      >
        <McSectionTitle sub="Manage your form collection">📋 My Forms</McSectionTitle>
        <McLinkButton href="/dashboard/forms/new" variant="grass" size="sm">
          <Plus size={15} />
          New Form
        </McLinkButton>
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
          Loading forms...
        </div>
      )}

      {!isLoading && forms?.length === 0 && (
        <McCard
          variant="stone"
          style={{
            padding: "64px 32px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <McFloatingParticles count={8} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <FileText
              size={48}
              style={{
                color: "#484848",
                marginBottom: "16px",
                display: "block",
                margin: "0 auto 16px",
              }}
            />
            <div
              style={{
                fontFamily: "var(--font-mc)",
                fontSize: "18px",
                color: "#707070",
                marginBottom: "8px",
              }}
            >
              No forms crafted yet
            </div>
            <div
              style={{
                fontFamily: "var(--font-mc)",
                fontSize: "14px",
                color: "#484848",
                marginBottom: "28px",
              }}
            >
              Start building your first form
            </div>
            <McLinkButton href="/dashboard/forms/new" variant="grass" size="sm">
              <Plus size={14} /> Create your first form
            </McLinkButton>
          </div>
        </McCard>
      )}

      {forms && forms.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {forms.map((f: FormListItem) => (
            <McCard
              key={f.id}
              variant="inventory"
              style={{
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mc)",
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#e0e0e0",
                      textShadow: "1px 1px 0 rgba(0,0,0,0.7)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {f.title}
                  </span>
                  {f.isPasswordProtected && <McBadge variant="gold">🔒 locked</McBadge>}
                  {f.isTemplate && <McBadge variant="diamond">template</McBadge>}
                </div>
                <div
                  style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}
                >
                  <FormStatusBadge status={f.status} />
                  {f.visibility && (
                    <span
                      style={{
                        fontFamily: "var(--font-mc)",
                        fontSize: "12px",
                        color: "#606060",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {f.visibility}
                    </span>
                  )}
                  <span
                    style={{
                      fontFamily: "var(--font-mc)",
                      fontSize: "12px",
                      color: "#505050",
                    }}
                  >
                    {f.responseCount ?? 0} responses
                  </span>
                  {f.expiresAt && (
                    <span
                      style={{ fontFamily: "var(--font-mc)", fontSize: "12px", color: "#505050" }}
                    >
                      expires {new Date(f.expiresAt).toLocaleDateString()}
                    </span>
                  )}
                  {f.responseLimit && (
                    <span
                      style={{ fontFamily: "var(--font-mc)", fontSize: "12px", color: "#505050" }}
                    >
                      limit {f.responseLimit}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: "6px", alignItems: "center", flexShrink: 0 }}>
                {f.status === "published" && (
                  <McIconLink
                    href={`/f/${f.slug}`}
                    title="View live form"
                    icon={<ExternalLink size={15} />}
                    external
                  />
                )}
                <McIconLink
                  href={`/dashboard/forms/${f.id}/edit`}
                  title="Edit form"
                  icon={<Pencil size={15} />}
                />
                <McIconLink
                  href={`/dashboard/forms/${f.id}/analytics`}
                  title="Analytics"
                  icon={<BarChart2 size={15} />}
                />
                <McIconLink
                  href={`/dashboard/forms/${f.id}/responses`}
                  title="Responses"
                  icon={<List size={15} />}
                />
                {f.status === "published" && (
                  <McIconBtn
                    onClick={() => unpublishForm({ formId: f.id })}
                    title="Unpublish"
                    icon={<EyeOff size={15} />}
                    disabled={unpublishPending}
                  />
                )}
                <McIconBtn
                  onClick={() => {
                    if (confirm("Delete this form?")) deleteForm({ formId: f.id });
                  }}
                  title="Delete form"
                  icon={<Trash2 size={15} />}
                  danger
                  disabled={deletePending}
                />
              </div>
            </McCard>
          ))}
        </div>
      )}
    </div>
  );
}
