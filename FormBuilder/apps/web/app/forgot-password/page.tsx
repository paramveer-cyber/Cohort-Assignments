"use client";

import { useState } from "react";
import { toast } from "sonner";
import { McCard, McInput, McButton, McPanorama, McFloatingParticles } from "~/components/mc";
import { useForgotPassword } from "~/hooks/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const { forgotPassword, isPending } = useForgotPassword({
    onSuccess: () => setSent(true),
    onError: (err) => toast.error(err.message),
  });

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
              textShadow: "1px 2px 0 rgba(0,0,0,0.95), 0 0 24px rgba(90,170,56,0.35)",
              letterSpacing: "0.05em",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            ⛏ FormCraft
          </a>
        </div>

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
              🔓
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
              Forgot Password
            </h1>
          </div>

          {sent ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "44px", marginBottom: "16px" }}>📬</div>
              <p
                style={{
                  fontFamily: "var(--font-mc)",
                  fontSize: "15px",
                  color: "#c8c8c8",
                  marginBottom: "8px",
                  letterSpacing: "0.02em",
                }}
              >
                Check your inbox!
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
                If that email exists, a reset link has been dispatched.
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
                ← Back to Login
              </a>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                forgotPassword({ email });
              }}
              style={{ display: "flex", flexDirection: "column", gap: "18px" }}
            >
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "14px",
                  color: "#686868",
                  lineHeight: 1.65,
                  marginBottom: "4px",
                }}
              >
                Enter your email and we'll send a reset link.
              </p>
              <McInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
              <McButton
                type="submit"
                variant="grass"
                size="md"
                disabled={isPending}
                style={{ width: "100%" }}
              >
                {isPending ? "Sending..." : "Send Reset Link"}
              </McButton>
              <div style={{ textAlign: "center", marginTop: "4px" }}>
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
      </div>
    </div>
  );
}
