"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import {
  Pencil,
  BarChart2,
  List,
  Eye,
  Globe,
  Link2,
  Copy,
  ExternalLink,
  QrCode,
  Trash2,
  Archive,
  GitBranch,
  EyeOff,
} from "lucide-react";
import {
  McCard,
  McButton,
  McLinkButton,
  McBadge,
  McSectionTitle,
  McStatCard,
  McModal,
  McFloatingParticles,
} from "~/components/mc";
import {
  useForm,
  useDeleteForm,
  usePublishForm,
  useUnpublishForm,
  useCloneForm,
  useArchiveForm,
} from "~/hooks/api/forms";
import { useInvalidateCache } from "~/hooks/api/useInvalidateCache";

type Params = { formId: string };
type ModalKind = "delete" | "qr" | null;

interface FormFieldConfig {
  conditionalLogic?: Record<string, string | boolean | null | undefined>;
  options?: string[];
  max?: number;
}

interface FormField {
  id: string;
  label: string;
  fieldType: string;
  required: boolean | null;
  config: FormFieldConfig | null;
}

interface FormDetail {
  title: string;
  description: string | null;
  status: string;
  slug: string | null;
  visibility: string | null;
  isPasswordProtected: boolean | null;
  responseCount: number | null;
  viewCount: number | null;
  fields: FormField[];
}

interface ClonedForm {
  id: string;
}

const MC_INPUT: React.CSSProperties = {
  fontFamily: "var(--font-mc)",
  fontSize: "15px",
  padding: "10px 14px",
  background: "#0e0e0e",
  color: "#e8e8e8",
  borderWidth: "2px",
  borderStyle: "solid",
  borderTopColor: "#252525",
  borderLeftColor: "#3a3a3a",
  borderRightColor: "#3a3a3a",
  borderBottomColor: "#3a3a3a",
  boxShadow: "inset 0 3px 5px rgba(0,0,0,0.8)",
  outline: "none",
  width: "100%",
  letterSpacing: "0.02em",
};

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
        width: "38px",
        height: "38px",
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
        width: "38px",
        height: "38px",
        background: "#2a2a2a",
        color: "#a0a0a0",
        border: "2px solid #3a3a3a",
        borderTopColor: "#484848",
        cursor: "pointer",
        boxShadow: "0 3px 0 #111, inset 0 1px 0 rgba(255,255,255,0.06)",
        transition: "all 0.08s",
        flexShrink: 0,
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

const STATUS_BADGE: Record<
  string,
  { variant: "grass" | "stone" | "gold"; label: string; icon: string }
> = {
  published: { variant: "grass", label: "Published", icon: "🌿" },
  draft: { variant: "gold", label: "Draft", icon: "📜" },
  archived: { variant: "stone", label: "Archived", icon: "🪨" },
};

const FIELD_TYPE_ICONS: Record<string, string> = {
  short_text: "📝",
  long_text: "📄",
  email: "📧",
  number: "#",
  single_select: "⊙",
  multi_select: "☑",
  checkbox: "✓",
  dropdown: "▼",
  rating: "⭐",
  date: "📅",
  page_break: "---",
};

export default function FormDetailPage({ params }: { params: Promise<Params> }) {
  const { formId } = use(params);
  const { invalidateCache } = useInvalidateCache();
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<ModalKind>(null);

  const { form: formRaw, isLoading } = useForm({ formId });
  const form = formRaw as FormDetail | undefined;

  const { deleteForm, isPending: deletePending } = useDeleteForm({
    onSuccess: () => {
      toast.success("Form deleted");
      router.push("/dashboard/forms");
    },
    onError: (e: { message: string }) => {
      toast.error(e.message);
      setActiveModal(null);
    },
  });

  const { publishForm, isPending: publishPending } = usePublishForm({
    onSuccess: () => {
      invalidateCache("forms.get");
      toast.success("Form published");
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const { unpublishForm, isPending: unpublishPending } = useUnpublishForm({
    onSuccess: () => {
      invalidateCache("forms.get");
      toast.success("Form unpublished");
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const { cloneForm, isPending: clonePending } = useCloneForm({
    onSuccess: (data) => {
      const { id } = data as ClonedForm;
      invalidateCache("forms.list");
      toast.success("Form cloned");
      router.push(`/dashboard/forms/${id}`);
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const { archiveForm, isPending: archivePending } = useArchiveForm({
    onSuccess: () => {
      invalidateCache("forms.get");
      toast.success("Form archived");
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "200px",
          fontFamily: "var(--font-mc)",
          color: "#606060",
          fontSize: "18px",
          gap: "14px",
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: "16px",
            height: "16px",
            background: "#5aaa38",
            animation: "mc-particle-rise 1s ease-in-out infinite alternate",
          }}
        />
        Loading form...
      </div>
    );
  }

  if (!form) {
    return (
      <McCard
        variant="stone"
        style={{ padding: "48px", textAlign: "center", maxWidth: "480px", margin: "0 auto" }}
      >
        <div style={{ fontFamily: "var(--font-mc)", fontSize: "18px", color: "#ff6666" }}>
          ⚠ Form not found.
        </div>
      </McCard>
    );
  }

  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/f/${form.slug}` : `/f/${form.slug}`;

  const statusMeta = STATUS_BADGE[form.status] ?? {
    variant: "stone" as const,
    label: form.status,
    icon: "•",
  };

  function downloadQR() {
    const svg = document.getElementById("form-qr-svg");
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([xml], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form?.slug}-qr.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <McModal
        open={activeModal === "delete"}
        onClose={() => setActiveModal(null)}
        title="⚠ Delete Form"
      >
        <p
          style={{
            fontFamily: "var(--font-mc)",
            fontSize: "16px",
            color: "#c8c8c8",
            marginBottom: "10px",
            lineHeight: 1.7,
          }}
        >
          Permanently delete <strong style={{ color: "#ff8888" }}>{form.title}</strong> and all its
          responses?
        </p>
        <p
          style={{
            fontFamily: "var(--font-mc)",
            fontSize: "14px",
            color: "#606060",
            marginBottom: "28px",
            lineHeight: 1.6,
          }}
        >
          This cannot be undone.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <McButton variant="ghost" size="sm" onClick={() => setActiveModal(null)}>
            Cancel
          </McButton>
          <McButton
            variant="danger"
            size="sm"
            onClick={() => deleteForm({ formId })}
            disabled={deletePending}
          >
            {deletePending ? "Deleting..." : "Yes, delete"}
          </McButton>
        </div>
      </McModal>

      <McModal open={activeModal === "qr"} onClose={() => setActiveModal(null)} title="📱 QR Code">
        <p
          style={{
            fontFamily: "var(--font-mc)",
            fontSize: "14px",
            color: "#707070",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          {form.title}
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "22px",
            padding: "16px",
            background: "#fff",
          }}
        >
          <QRCode id="form-qr-svg" value={shareUrl} size={180} />
        </div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <McButton variant="ghost" size="sm" onClick={downloadQR}>
            Download SVG
          </McButton>
          <McButton variant="stone" size="sm" onClick={() => setActiveModal(null)}>
            Close
          </McButton>
        </div>
      </McModal>

      <div style={{ maxWidth: "780px", margin: "0 auto", position: "relative" }}>
        <div style={{ marginBottom: "22px" }}>
          <Link
            href="/dashboard/forms"
            style={{
              fontFamily: "var(--font-mc)",
              fontSize: "14px",
              color: "#606060",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              transition: "color 0.1s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#a0a0a0")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#606060")}
          >
            ← Back to forms
          </Link>
        </div>

        <McCard
          variant="wood"
          style={{
            padding: "28px 28px 24px",
            marginBottom: "20px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <McFloatingParticles count={6} />
          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "20px",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1
                style={{
                  fontFamily: "var(--font-mc)",
                  fontSize: "26px",
                  fontWeight: 700,
                  color: "#f5e8cc",
                  textShadow: "1px 2px 0 rgba(0,0,0,0.9)",
                  marginBottom: "8px",
                  letterSpacing: "0.03em",
                  lineHeight: 1.2,
                }}
              >
                {form.title}
              </h1>
              {form.description && (
                <p
                  style={{
                    fontFamily: "var(--font-mc)",
                    fontSize: "15px",
                    color: "#a08060",
                    lineHeight: 1.6,
                  }}
                >
                  {form.description}
                </p>
              )}
              <div style={{ display: "flex", gap: "10px", marginTop: "14px", flexWrap: "wrap" }}>
                <McBadge variant={statusMeta.variant}>
                  {statusMeta.icon} {statusMeta.label}
                </McBadge>
                {form.isPasswordProtected && <McBadge variant="gold">🔒 Password</McBadge>}
                {form.visibility === "unlisted" && <McBadge variant="stone">🔗 Unlisted</McBadge>}
                {form.visibility === "public" && <McBadge variant="grass">🌍 Public</McBadge>}
              </div>
            </div>
          </div>
        </McCard>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <McStatCard
            label="Responses"
            value={form.responseCount ?? 0}
            icon="📨"
            accent="#5aaa38"
          />
          <McStatCard label="Views" value={form.viewCount ?? 0} icon="👁" accent="#20d4e8" />
          <McStatCard label="Fields" value={form.fields.length} icon="🧱" accent="#e8a020" />
        </div>

        <McCard variant="stone" style={{ padding: "18px 20px", marginBottom: "20px" }}>
          <div
            style={{
              fontFamily: "var(--font-mc)",
              fontSize: "13px",
              color: "#606060",
              marginBottom: "14px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Actions
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <McLinkButton href={`/dashboard/forms/${formId}/edit`} variant="grass" size="sm">
              <Pencil size={14} /> Edit
            </McLinkButton>
            <McLinkButton href={`/dashboard/forms/${formId}/analytics`} variant="diamond" size="sm">
              <BarChart2 size={14} /> Analytics
            </McLinkButton>
            <McLinkButton href={`/dashboard/forms/${formId}/responses`} variant="stone" size="sm">
              <List size={14} /> Responses
            </McLinkButton>
            <McLinkButton
              href={`/dashboard/forms/${formId}/preview`}
              variant="ghost"
              size="sm"
              style={{ textDecoration: "none" }}
            >
              <Eye size={14} /> Preview ↗
            </McLinkButton>

            <div style={{ width: "2px", height: "32px", background: "#323232", flexShrink: 0 }} />

            <McButton
              variant="ghost"
              size="sm"
              onClick={() => cloneForm({ formId })}
              disabled={clonePending}
            >
              <GitBranch size={14} /> {clonePending ? "Cloning..." : "Clone"}
            </McButton>

            {form.status !== "archived" && (
              <McButton
                variant="ghost"
                size="sm"
                onClick={() => archiveForm({ formId })}
                disabled={archivePending}
              >
                <Archive size={14} /> {archivePending ? "Archiving..." : "Archive"}
              </McButton>
            )}

            {form.status !== "published" && (
              <>
                <McButton
                  variant="grass"
                  size="sm"
                  onClick={() => publishForm({ formId, visibility: "public" })}
                  disabled={publishPending}
                >
                  <Globe size={14} /> Publish (public)
                </McButton>
                <McButton
                  variant="stone"
                  size="sm"
                  onClick={() => publishForm({ formId, visibility: "unlisted" })}
                  disabled={publishPending}
                >
                  <Link2 size={14} /> Publish (unlisted)
                </McButton>
              </>
            )}

            {form.status === "published" && (
              <McButton
                variant="ghost"
                size="sm"
                onClick={() => unpublishForm({ formId })}
                disabled={unpublishPending}
              >
                <EyeOff size={14} /> {unpublishPending ? "..." : "Unpublish"}
              </McButton>
            )}

            <div style={{ width: "2px", height: "32px", background: "#323232", flexShrink: 0 }} />

            <McButton variant="danger" size="sm" onClick={() => setActiveModal("delete")}>
              <Trash2 size={14} /> Delete
            </McButton>
          </div>
        </McCard>

        {form.status === "published" && (
          <McCard variant="inventory" style={{ padding: "20px", marginBottom: "20px" }}>
            <div
              style={{
                fontFamily: "var(--font-mc)",
                fontSize: "13px",
                color: "#606060",
                marginBottom: "14px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <ExternalLink size={13} /> Share
            </div>
            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
                marginBottom: "16px",
                flexWrap: "wrap",
              }}
            >
              <input
                readOnly
                value={shareUrl}
                style={{ ...MC_INPUT, flex: 1, minWidth: "200px" }}
              />
              <McButton
                variant="stone"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  toast.success("Copied!");
                }}
              >
                <Copy size={13} /> Copy
              </McButton>
              <a href={shareUrl} target="_blank" rel="noreferrer">
                <McButton variant="ghost" size="sm">
                  <ExternalLink size={13} /> Open
                </McButton>
              </a>
              <McButton variant="ghost" size="sm" onClick={() => setActiveModal("qr")}>
                <QrCode size={13} /> QR
              </McButton>
            </div>
            {form.visibility && (
              <div
                style={{
                  marginTop: "12px",
                  fontFamily: "var(--font-mc)",
                  fontSize: "13px",
                  color: "#484848",
                  textAlign: "center",
                }}
              >
                {form.visibility === "public"
                  ? "🌍 Public — appears in Explore"
                  : "🔗 Unlisted — only via link"}
              </div>
            )}
          </McCard>
        )}

        <McCard variant="inventory" style={{ padding: "20px" }}>
          <McSectionTitle
            sub={`${form.fields.length} field${form.fields.length !== 1 ? "s" : ""} configured`}
          >
            🧱 Fields
          </McSectionTitle>

          {form.fields.length === 0 ? (
            <div
              style={{
                padding: "36px",
                textAlign: "center",
                border: "2px dashed #2a2a2a",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <McFloatingParticles count={4} />
              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  fontFamily: "var(--font-mc)",
                  color: "#484848",
                  fontSize: "16px",
                  marginBottom: "16px",
                }}
              >
                No fields placed yet.
              </div>
              <McLinkButton href={`/dashboard/forms/${formId}/edit`} variant="grass" size="sm">
                + Add fields in editor
              </McLinkButton>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {form.fields.map((field: FormField, i: number) => (
                <div
                  key={field.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 14px",
                    background: "#1a1a1a",
                    borderWidth: "2px",
                    borderStyle: "solid",
                    borderTopColor: "#2a2a2a",
                    borderLeftColor: "#2a2a2a",
                    borderRightColor: "#141414",
                    borderBottomColor: "#141414",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
                    transition: "background 0.08s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#222")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#1a1a1a")}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mc)",
                      fontSize: "12px",
                      color: "#404040",
                      width: "22px",
                      textAlign: "right",
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mc)",
                      fontSize: "16px",
                      width: "22px",
                      flexShrink: 0,
                      textAlign: "center",
                    }}
                  >
                    {FIELD_TYPE_ICONS[field.fieldType] ?? "•"}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mc)",
                      fontSize: "12px",
                      background: "#2a2a2a",
                      padding: "3px 8px",
                      color: "#707070",
                      borderWidth: "1px",
                      borderStyle: "solid",
                      borderColor: "#323232",
                      flexShrink: 0,
                    }}
                  >
                    {field.fieldType}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      fontFamily: "var(--font-mc)",
                      fontSize: "15px",
                      color: "#d0d0d0",
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {field.label}
                  </span>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center", flexShrink: 0 }}>
                    {!!field.config?.conditionalLogic && (
                      <McBadge variant="diamond">⚡ conditional</McBadge>
                    )}
                    {field.required && <McBadge variant="danger">* required</McBadge>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </McCard>
      </div>
    </>
  );
}
