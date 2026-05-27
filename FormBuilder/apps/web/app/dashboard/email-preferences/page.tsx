"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useEmailPreferences, useUpdateEmailPreferences } from "~/hooks/api/user";
import { useInvalidateCache } from "~/hooks/api/useInvalidateCache";

const EMAIL_TYPE_LABELS: Record<string, { title: string; description: string }> = {
  new_response: {
    title: "New response notifications",
    description: "Get notified when someone submits a response to your form.",
  },
  password_reset: {
    title: "Password reset emails",
    description: "Receive emails when a password reset is requested for your account.",
  },
  account_deletion: {
    title: "Account deletion confirmation",
    description: "Receive a confirmation email when your account is scheduled for deletion.",
  },
};

export default function EmailPreferencesPage() {
  const { prefs, isLoading } = useEmailPreferences();
  const { invalidateCache } = useInvalidateCache();

  const { updateEmailPreferences, isPending } = useUpdateEmailPreferences({
    onSuccess: () => {
      invalidateCache("user.getEmailPreferences");
      toast.success("Preferences saved");
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) return <div style={{ color: "#666" }}>Loading...</div>;
  if (!prefs) return null;

  const togglePref = (type: string, currentValue: boolean) => {
    updateEmailPreferences({ [type]: !currentValue });
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px" }}>
        <Link href="/dashboard/profile" style={{ fontSize: "13px", color: "#666" }}>
          ← Back to profile
        </Link>
      </div>

      <h1 style={{ fontSize: "22px", fontWeight: "600", marginBottom: "8px" }}>
        Email preferences
      </h1>
      <p style={{ fontSize: "14px", color: "#666", marginBottom: "32px" }}>
        Choose which emails you want to receive from FormCraft.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
        {Object.entries(EMAIL_TYPE_LABELS).map(([type, meta], i, arr) => {
          const enabled = prefs[type as keyof typeof prefs] ?? true;
          return (
            <div
              key={type}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 0",
                borderBottom: i < arr.length - 1 ? "1px solid #f0f0f0" : "none",
              }}
            >
              <div style={{ flex: 1, paddingRight: "24px" }}>
                <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>
                  {meta.title}
                </div>
                <div style={{ fontSize: "13px", color: "#666" }}>{meta.description}</div>
              </div>
              <button
                onClick={() => togglePref(type, enabled)}
                disabled={isPending}
                style={{
                  width: "44px",
                  height: "24px",
                  borderRadius: "99px",
                  border: "none",
                  cursor: "pointer",
                  background: enabled ? "#111" : "#e0e0e0",
                  position: "relative",
                  flexShrink: 0,
                  transition: "background 0.15s",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: "3px",
                    left: enabled ? "23px" : "3px",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: "#fff",
                    transition: "left 0.15s",
                  }}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
