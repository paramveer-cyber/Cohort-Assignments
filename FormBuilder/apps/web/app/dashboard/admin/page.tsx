"use client";

import { useState } from "react";
import { toast } from "sonner";
import { McCard, McButton, McBadge, McModal, McSectionTitle, McStatCard } from "~/components/mc";
import {
  useAdminStats,
  useAdminUsers,
  useAdminForms,
  useAdminDeleteUser,
  useAdminDeleteForm,
  useAdminSetTemplate,
} from "~/hooks/api/admin";
import type { AdminUser } from "~/hooks/api/admin/useAdminUsers";
import type { AdminForm } from "~/hooks/api/admin/useAdminForms";
import { useInvalidateCache } from "~/hooks/api/useInvalidateCache";

type AdminTab = "overview" | "users" | "forms";

export default function AdminDashboardPage() {
  const { invalidateCache } = useInvalidateCache();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [confirmDelete, setConfirmDelete] = useState<{
    type: "user" | "form";
    id: string;
    label: string;
  } | null>(null);

  const { stats } = useAdminStats();
  const { users, isLoading: usersLoading } = useAdminUsers({ enabled: tab === "users" });
  const { forms, isLoading: formsLoading } = useAdminForms({ enabled: tab === "forms" });

  const { adminDeleteUser, isPending: deleteUserPending } = useAdminDeleteUser({
    onSuccess: () => {
      invalidateCache("admin.listUsers");
      invalidateCache("admin.stats");
      toast.success("User deleted");
      setConfirmDelete(null);
    },
    onError: (e) => {
      toast.error(e.message);
      setConfirmDelete(null);
    },
  });

  const { adminDeleteForm, isPending: deleteFormPending } = useAdminDeleteForm({
    onSuccess: () => {
      invalidateCache("admin.listForms");
      invalidateCache("admin.stats");
      toast.success("Form deleted");
      setConfirmDelete(null);
    },
    onError: (e) => {
      toast.error(e.message);
      setConfirmDelete(null);
    },
  });

  const { adminSetTemplate } = useAdminSetTemplate({
    onSuccess: () => {
      invalidateCache("admin.listForms");
      toast.success("Template updated");
    },
    onError: (e) => toast.error(e.message),
  });

  function handleConfirmDelete() {
    if (!confirmDelete) return;
    if (confirmDelete.type === "user") adminDeleteUser({ userId: confirmDelete.id });
    if (confirmDelete.type === "form") adminDeleteForm({ formId: confirmDelete.id });
  }

  const isPending = deleteUserPending || deleteFormPending;

  const mcTh: React.CSSProperties = {
    padding: "12px 16px",
    textAlign: "left",
    fontFamily: "var(--font-mc)",
    fontSize: "11px",
    color: "#fff",
    letterSpacing: "0.08em",
    fontWeight: "normal",
  };

  const mcTd: React.CSSProperties = {
    padding: "13px 16px",
    fontFamily: "var(--font-body)",
    fontSize: "14px",
    color: "#c0c0c0",
    borderBottom: "1px solid #232323",
  };

  return (
    <>
      <McModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="⚠ Confirm Delete"
      >
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "15px",
            color: "#c8c8c8",
            marginBottom: "20px",
            lineHeight: 1.65,
          }}
        >
          Delete <strong style={{ color: "#e0e0e0" }}>{confirmDelete?.label}</strong>? This cannot
          be undone.
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <McButton variant="ghost" size="sm" onClick={() => setConfirmDelete(null)}>
            Cancel
          </McButton>
          <McButton variant="danger" size="sm" onClick={handleConfirmDelete} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete"}
          </McButton>
        </div>
      </McModal>

      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ marginBottom: "36px" }}>
          <McSectionTitle accent sub="Server administration panel">
            ⚡ Admin Dashboard
          </McSectionTitle>
        </div>

        {stats && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "14px",
              marginBottom: "36px",
            }}
          >
            <McStatCard label="Total Users" value={stats.totalUsers} icon="👥" accent="#20d4e8" />
            <McStatCard label="Total Forms" value={stats.totalForms} icon="📋" accent="#5aaa38" />
            <McStatCard
              label="Published Forms"
              value={stats.publishedForms}
              icon="🌍"
              accent="#5aaa38"
            />
            <McStatCard
              label="Total Responses"
              value={stats.totalResponses}
              icon="📬"
              accent="#20d4e8"
            />
          </div>
        )}

        <div style={{ display: "flex", gap: "4px", marginBottom: "24px" }}>
          {(["overview", "users", "forms"] as AdminTab[]).map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: "10px 20px",
                  fontFamily: "var(--font-mc)",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: active ? "#20d4e8" : "#606060",
                  background: active ? "#1a1a1a" : "transparent",
                  border: "2px solid",
                  borderTopColor: active ? "#303030" : "transparent",
                  borderLeftColor: active ? "#303030" : "transparent",
                  borderRightColor: active ? "#303030" : "transparent",
                  borderBottomColor: active ? "#20d4e8" : "transparent",
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                  transition: "all 0.1s",
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            );
          })}
        </div>

        {tab === "overview" && (
          <McCard variant="inventory" style={{ padding: "48px 32px", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏰</div>
            <p
              style={{
                fontFamily: "var(--font-mc)",
                fontSize: "16px",
                color: "#585858",
                letterSpacing: "0.04em",
              }}
            >
              Switch to Users or Forms tabs to manage content.
            </p>
          </McCard>
        )}

        {tab === "users" && (
          <>
            {usersLoading && (
              <div
                style={{
                  fontFamily: "var(--font-mc)",
                  color: "#5aaa38",
                  textAlign: "center",
                  padding: "48px",
                  animation: "mc-blink 1s step-end infinite",
                  letterSpacing: "0.08em",
                }}
              >
                Loading users...
              </div>
            )}
            {users && (
              <McCard variant="stone" style={{ padding: 0, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        background: "#181818",
                        borderBottom: "2px solid #2a2a2a",
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.3),rgba(0,0,0,0.3)),url("/textures/stone_texture.webp")`,
                        backgroundSize: "auto,32px 32px",
                      }}
                    >
                      {["Name", "Email", "Role", "Joined", "Actions"].map((h) => (
                        <th key={h} style={mcTh}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u: AdminUser) => (
                      <tr
                        key={u.id}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#1e1e1e")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        style={{ transition: "background 0.1s" }}
                      >
                        <td style={mcTd}>{u.name}</td>
                        <td style={{ ...mcTd, color: "#808080", fontSize: "13px" }}>{u.email}</td>
                        <td style={mcTd}>
                          <McBadge variant={u.role === "admin" ? "diamond" : "stone"}>
                            {u.role ?? "user"}
                          </McBadge>
                        </td>
                        <td style={{ ...mcTd, color: "#606060", fontSize: "13px" }}>
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td style={{ ...mcTd, borderBottom: mcTd.borderBottom }}>
                          <McButton
                            variant="danger"
                            size="sm"
                            onClick={() =>
                              setConfirmDelete({ type: "user", id: u.id, label: u.email })
                            }
                            style={{ fontSize: "12px", padding: "5px 12px", height: "auto" }}
                          >
                            Delete
                          </McButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </McCard>
            )}
          </>
        )}

        {tab === "forms" && (
          <>
            {formsLoading && (
              <div
                style={{
                  fontFamily: "var(--font-mc)",
                  color: "#5aaa38",
                  textAlign: "center",
                  padding: "48px",
                  animation: "mc-blink 1s step-end infinite",
                  letterSpacing: "0.08em",
                }}
              >
                Loading forms...
              </div>
            )}
            {forms && (
              <McCard variant="stone" style={{ padding: 0, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        background: "#181818",
                        borderBottom: "2px solid #2a2a2a",
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.3),rgba(0,0,0,0.3)),url("/textures/stone_texture.webp")`,
                        backgroundSize: "auto,32px 32px",
                      }}
                    >
                      {["Title", "Slug", "Status", "Responses", "Template", "Actions"].map((h) => (
                        <th key={h} style={mcTh}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {forms.map((f: AdminForm) => (
                      <tr
                        key={f.id}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#1e1e1e")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        style={{ transition: "background 0.1s" }}
                      >
                        <td style={mcTd}>{f.title}</td>
                        <td style={{ ...mcTd, color: "#606060", fontSize: "12px" }}>{f.slug}</td>
                        <td style={mcTd}>
                          <McBadge
                            variant={
                              f.status === "published"
                                ? "grass"
                                : f.status === "archived"
                                  ? "danger"
                                  : "stone"
                            }
                          >
                            {f.status}
                          </McBadge>
                        </td>
                        <td style={{ ...mcTd, color: "#20d4e8", fontFamily: "var(--font-mc)" }}>
                          {f.responseCount ?? 0}
                        </td>
                        <td style={mcTd}>
                          <input
                            type="checkbox"
                            checked={!!f.isTemplate}
                            onChange={(e) =>
                              adminSetTemplate({ formId: f.id, isTemplate: e.target.checked })
                            }
                            style={{ cursor: "pointer", accentColor: "#20d4e8" }}
                          />
                        </td>
                        <td style={{ ...mcTd, borderBottom: mcTd.borderBottom }}>
                          <McButton
                            variant="danger"
                            size="sm"
                            onClick={() =>
                              setConfirmDelete({ type: "form", id: f.id, label: f.title })
                            }
                            style={{ fontSize: "12px", padding: "5px 12px", height: "auto" }}
                          >
                            Delete
                          </McButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </McCard>
            )}
          </>
        )}
      </div>
    </>
  );
}
