"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { setToken } from "~/lib/auth";
import { toast } from "sonner";
import { GoogleLogin } from "@react-oauth/google";
import {
  McCard,
  McInput,
  McButton,
  McDivider,
  McFloatingParticles,
  McPanorama,
} from "~/components/mc";
import { useRegister, useGoogleLogin, useInvalidateCache } from "~/hooks/api";

export default function RegisterPage() {
  const router = useRouter();
  const { invalidateCache } = useInvalidateCache();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const logoRef = useRef<HTMLAnchorElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const fieldsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        logoRef.current,
        { opacity: 0, y: -20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6 },
      )
        .fromTo(
          cardRef.current,
          { opacity: 0, y: 32, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.65 },
          "-=0.3",
        )
        .fromTo(
          fieldsRef.current?.querySelectorAll(".field-row") ?? [],
          { opacity: 0, x: -16 },
          { opacity: 1, x: 0, duration: 0.4, stagger: 0.07 },
          "-=0.25",
        );
    });
    return () => ctx.revert();
  }, []);

  function onAuthSuccess(data: {
    accessToken: string;
    user: { id: string; name: string; email: string };
  }) {
    setToken(data.accessToken);
    invalidateCache("auth.me");
    toast.success("Account created");
    router.push("/dashboard");
  }

  const { register, isPending: registerPending } = useRegister({
    onSuccess: onAuthSuccess,
    onError(err) {
      toast.error(err.message);
    },
  });

  const { googleLogin, isPending: googlePending } = useGoogleLogin({
    onSuccess: onAuthSuccess,
    onError(err) {
      toast.error(err.message);
    },
  });

  const isPending = registerPending || googlePending;

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
      <McFloatingParticles count={14} />

      <div
        style={{ position: "relative", zIndex: 5, width: "420px", maxWidth: "calc(100vw - 32px)" }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <a
            ref={logoRef}
            href="/"
            style={{
              fontFamily: "var(--font-mc)",
              fontSize: "28px",
              color: "#5aaa38",
              textShadow: "1px 2px 0 rgba(0,0,0,0.95), 0 0 24px rgba(90,170,56,0.35)",
              letterSpacing: "0.05em",
              textDecoration: "none",
              display: "inline-block",
              opacity: 0,
            }}
          >
            ⛏ FormCraft
          </a>
        </div>

        <div ref={cardRef} style={{ opacity: 0 }}>
          <McCard variant="stone" style={{ padding: "40px 36px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "32px",
                paddingBottom: "20px",
                borderBottom: "2px solid #1e1e1e",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
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
                  fontSize: "20px",
                }}
              >
                🪪
              </div>
              <h1
                style={{
                  fontFamily: "var(--font-mc)",
                  fontSize: "18px",
                  color: "#e0e0e0",
                  textShadow: "1px 2px 0 rgba(0,0,0,0.9)",
                  letterSpacing: "0.04em",
                }}
              >
                Create Your Account
              </h1>
            </div>

            <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center" }}>
              <GoogleLogin
                onSuccess={(r) => {
                  if (r.credential) googleLogin({ idToken: r.credential });
                }}
                onError={() => toast.error("Google sign-in failed")}
                useOneTap={false}
              />
            </div>

            <McDivider label="or" />

            <div ref={fieldsRef}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  register({ name, email, password });
                }}
                style={{ display: "flex", flexDirection: "column", gap: "18px" }}
              >
                <div className="field-row" style={{ opacity: 0 }}>
                  <McInput
                    label="Name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Your name"
                  />
                </div>
                <div className="field-row" style={{ opacity: 0 }}>
                  <McInput
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                  />
                </div>
                <div className="field-row" style={{ opacity: 0 }}>
                  <McInput
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="8+ characters"
                    minLength={8}
                  />
                </div>

                <div className="field-row" style={{ opacity: 0 }}>
                  <McButton
                    type="submit"
                    variant="grass"
                    size="md"
                    disabled={isPending}
                    style={{ width: "100%", marginTop: "4px" }}
                  >
                    {registerPending ? "Creating..." : "Create Account"}
                  </McButton>
                </div>
              </form>
            </div>

            <div style={{ marginTop: "22px", textAlign: "center" }}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: "15px", color: "#686868" }}>
                Already have an account?{" "}
              </span>
              <Link
                href="/login"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "15px",
                  color: "#5aaa38",
                  textShadow: "1px 1px 0 rgba(0,0,0,0.7)",
                  fontWeight: 700,
                }}
              >
                Sign In
              </Link>
            </div>

            <div style={{ marginTop: "12px", textAlign: "center" }}>
              <Link
                href="/"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "14px",
                  color: "#484848",
                  transition: "color 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#787878")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#484848")}
              >
                ← Back to home
              </Link>
            </div>
          </McCard>
        </div>
      </div>
    </div>
  );
}
