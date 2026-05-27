"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { McCard, McInput, McButton, McPanorama, McFloatingParticles } from "~/components/mc";
import { useResetPassword } from "~/hooks/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) router.replace("/forgot-password");
  }, [token, router]);

  const { resetPassword, isPending } = useResetPassword({
    onSuccess: () => setDone(true),
    onError: (err) => toast.error(err.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    resetPassword({ token, password });
  }

  return (
    <McCard variant="stone" style={{ padding: "38px 34px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "28px",
          paddingBottom: "18px",
          borderBottom: "2px solid #1e1e1e",
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            background: "#1a1a1a",
            borderWidth: "2px",
            borderStyle: "solid",
            borderTopColor: "#505050",
            borderLeftColor: "#404040",
            borderRightColor: "#303030",
            borderBottomColor: "#282828",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
          }}
        >
          🔑
        </div>
        <h1
          style={{
            fontFamily: "var(--font-mc)",
            fontSize: "17px",
            color: "#e0e0e0",
            textShadow: "1px 2px 0 rgba(0,0,0,0.9)",
            letterSpacing: "0.04em",
          }}
        >
          Reset Password
        </h1>
      </div>

      {done ? (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "44px", marginBottom: "16px" }}>✅</div>
          <p
            style={{
              fontFamily: "var(--font-mc)",
              fontSize: "15px",
              color: "#5aaa38",
              marginBottom: "8px",
            }}
          >
            Password updated!
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              color: "#686868",
              marginBottom: "28px",
              lineHeight: 1.65,
            }}
          >
            You can now sign in with your new password.
          </p>
          <a
            href="/login"
            style={{
              fontFamily: "var(--font-mc)",
              fontSize: "14px",
              color: "#5aaa38",
              textShadow: "1px 1px 0 rgba(0,0,0,0.7)",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Sign In →
          </a>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "18px" }}
        >
          <McInput
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="8+ characters"
            minLength={8}
          />
          <McInput
            label="Confirm Password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            placeholder="Repeat password"
          />
          <McButton
            type="submit"
            variant="grass"
            size="md"
            disabled={isPending}
            style={{ width: "100%" }}
          >
            {isPending ? "Resetting..." : "Reset Password"}
          </McButton>
          <div style={{ textAlign: "center" }}>
            <a
              href="/login"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                color: "#484848",
                textDecoration: "none",
                transition: "color 0.1s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#787878")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#484848")}
            >
              ← Back to Login
            </a>
          </div>
        </form>
      )}
    </McCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <McPanorama />
      <McFloatingParticles count={10} />
      <div
        style={{ position: "relative", zIndex: 5, width: "400px", maxWidth: "calc(100vw - 32px)" }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <a
            href="/"
            style={{
              fontFamily: "var(--font-mc)",
              fontSize: "26px",
              color: "#5aaa38",
              textShadow: "1px 2px 0 rgba(0,0,0,0.95)",
              letterSpacing: "0.05em",
              textDecoration: "none",
            }}
          >
            ⛏ FormCraft
          </a>
        </div>
        <Suspense
          fallback={
            <div
              style={{
                fontFamily: "var(--font-mc)",
                color: "#5aaa38",
                textAlign: "center",
                padding: "48px",
                animation: "mc-blink 1s step-end infinite",
              }}
            >
              Loading...
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
