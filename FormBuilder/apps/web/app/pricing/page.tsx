"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { McCard, McPublicNav, McLinkButton, McXPBar, McBadge } from "~/components/mc";

gsap.registerPlugin(ScrollTrigger);

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    icon: "🪨",
    cardVariant: "stone" as const,
    features: ["3 forms", "100 responses/month", "All field types", "Public sharing", "Basic analytics"],
    cta: "Get Started",
    ctaVariant: "stone" as const,
    href: "/register",
    highlight: false,
    xpColor: "#808080",
    xpValue: 33,
    nameColor: "#c0c0c0",
  },
  {
    name: "Pro",
    price: "$12",
    period: "/month",
    icon: "⚔️",
    cardVariant: "wood" as const,
    features: ["Unlimited forms", "Unlimited responses", "Analytics dashboard", "Custom themes", "API access", "Email notifications", "Remove branding"],
    cta: "Start Pro",
    ctaVariant: "wood" as const,
    href: "/register",
    highlight: true,
    xpColor: "#e8a020",
    xpValue: 66,
    nameColor: "#e8a020",
  },
  {
    name: "Team",
    price: "$39",
    period: "/month",
    icon: "💎",
    cardVariant: "diamond" as const,
    features: ["Everything in Pro", "5 team members", "Shared workspace", "Priority support", "Custom domain", "Advanced analytics", "Export to CSV"],
    cta: "Start Team",
    ctaVariant: "diamond" as const,
    href: "/register",
    highlight: false,
    xpColor: "#20d4e8",
    xpValue: 100,
    nameColor: "#20d4e8",
  },
];

export default function PricingPage() {
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const enterpriseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.1 }
        );
      }

      const cards = cardsRef.current?.querySelectorAll(".plan-card");
      if (cards?.length) {
        gsap.fromTo(
          Array.from(cards),
          { opacity: 0, y: 48, scale: 0.95 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 0.7, stagger: 0.12, ease: "back.out(1.3)",
            scrollTrigger: { trigger: cardsRef.current, start: "top 85%", once: true },
          }
        );
      }

      const xpBars = cardsRef.current?.querySelectorAll(".xp-fill");
      if (xpBars?.length) {
        xpBars.forEach((bar) => {
          const target = parseFloat((bar as HTMLElement).dataset.target ?? "0");
          gsap.fromTo(
            bar,
            { width: "0%" },
            {
              width: `${target}%`,
              duration: 1.2,
              ease: "power2.out",
              scrollTrigger: { trigger: bar, start: "top 90%", once: true },
            }
          );
        });
      }

      if (enterpriseRef.current) {
        gsap.fromTo(
          enterpriseRef.current,
          { opacity: 0, y: 24 },
          {
            opacity: 1, y: 0, duration: 0.6, ease: "power3.out",
            scrollTrigger: { trigger: enterpriseRef.current, start: "top 88%", once: true },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0e0e0e" }}>
      <McPublicNav />

      <div style={{ maxWidth: "1060px", margin: "0 auto", padding: "96px 32px" }}>
        <div ref={titleRef} style={{ textAlign: "center", marginBottom: "80px", opacity: 0 }}>
          <div style={{
            display: "inline-block",
            fontFamily: "var(--font-mc)", fontSize: "12px",
            color: "#20d4e8", letterSpacing: "0.14em",
            background: "#051420",
            borderWidth: "2px", borderStyle: "solid",
            borderTopColor: "#0c8898", borderLeftColor: "#031828",
            borderRightColor: "#031828", borderBottomColor: "#031828",
            padding: "4px 16px", marginBottom: "20px",
          }}>
            CHOOSE YOUR TIER
          </div>
          <h1 style={{
            fontFamily: "var(--font-mc)",
            fontSize: "clamp(28px, 4vw, 46px)",
            color: "#e8e8e8",
            textShadow: "1px 2px 0 rgba(0,0,0,0.95)",
            marginBottom: "14px",
            letterSpacing: "0.05em",
          }}>
            Pick Your Loadout
          </h1>
          <p style={{ fontFamily: "var(--font-body)", color: "#585858", fontSize: "16px", lineHeight: 1.6 }}>
            No payment required for demo. All plans available on launch.
          </p>
        </div>

        <div
          ref={cardsRef}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", alignItems: "start" }}
        >
          {plans.map((p) => (
            <div key={p.name} className="plan-card" style={{ position: "relative", opacity: 0 }}>
              {p.highlight && (
                <div style={{ position: "absolute", top: "-18px", left: "50%", transform: "translateX(-50%)", zIndex: 5, whiteSpace: "nowrap" }}>
                  <McBadge variant="gold">⭐ MOST POPULAR</McBadge>
                </div>
              )}

              <McCard
                variant={p.cardVariant}
                glow={p.name === "Team"}
                style={{ padding: "36px 32px" }}
              >
                <div style={{ marginBottom: "28px" }}>
                  <div style={{ fontSize: "40px", marginBottom: "12px", filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.7))" }}>
                    {p.icon}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-mc)", fontSize: "20px",
                    color: p.nameColor,
                    textShadow: "1px 2px 0 rgba(0,0,0,0.9)",
                    letterSpacing: "0.05em", marginBottom: "12px",
                  }}>
                    {p.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                    <span style={{
                      fontFamily: "var(--font-mc)", fontSize: "48px",
                      color: "#ffffff", textShadow: "2px 3px 0 rgba(0,0,0,0.9)",
                    }}>
                      {p.price}
                    </span>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "15px", color: "#686868" }}>
                      {p.period}
                    </span>
                  </div>
                </div>

                <div style={{ marginBottom: "28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontFamily: "var(--font-mc)", fontSize: "12px", color: "#606060", letterSpacing: "0.06em" }}>
                      POWER LEVEL
                    </span>
                    <span style={{ fontFamily: "var(--font-mc)", fontSize: "12px", color: p.xpColor }}>
                      {p.xpValue}%
                    </span>
                  </div>
                  <div style={{
                    height: "16px", background: "#080808",
                    borderWidth: "2px", borderStyle: "solid",
                    borderTopColor: "#181818", borderLeftColor: "#2a2a2a",
                    borderRightColor: "#2a2a2a", borderBottomColor: "#2a2a2a",
                    boxShadow: "inset 0 3px 4px rgba(0,0,0,0.95)",
                    position: "relative", overflow: "hidden",
                  }}>
                    <div
                      className="xp-fill"
                      data-target={p.xpValue}
                      style={{
                        position: "absolute", top: 0, left: 0, bottom: 0,
                        width: "0%",
                        background: p.xpColor,
                        backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)`,
                        boxShadow: `inset 0 2px 0 rgba(255,255,255,0.35), inset 0 -2px 0 rgba(0,0,0,0.5), 0 0 12px ${p.xpColor}70`,
                      }}
                    />
                  </div>
                </div>

                <ul style={{ listStyle: "none", marginBottom: "32px", display: "flex", flexDirection: "column" }}>
                  {p.features.map((f, fi) => (
                    <li key={f} style={{
                      padding: "11px 0",
                      fontFamily: "var(--font-body)", fontSize: "15px", color: "#c0c0c0",
                      borderBottom: fi < p.features.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                      display: "flex", alignItems: "center", gap: "12px",
                    }}>
                      <span style={{ color: p.xpColor, fontSize: "11px", flexShrink: 0 }}>▶</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <McLinkButton
                  href={p.href}
                  variant={p.ctaVariant}
                  size="md"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {p.cta}
                </McLinkButton>
              </McCard>
            </div>
          ))}
        </div>

        <div ref={enterpriseRef} style={{ textAlign: "center", marginTop: "80px", opacity: 0 }}>
          <McCard variant="stone" style={{ padding: "36px", display: "inline-block", maxWidth: "580px" }}>
            <div style={{ fontSize: "28px", marginBottom: "12px" }}>🏰</div>
            <h3 style={{
              fontFamily: "var(--font-mc)", fontSize: "18px",
              color: "#c8c8c8", marginBottom: "12px", letterSpacing: "0.04em",
            }}>
              Enterprise / Custom
            </h3>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "15px", color: "#686868", marginBottom: "24px", lineHeight: 1.7 }}>
              Need more than Team? Custom contracts, SLAs, SSO, and dedicated support available.
            </p>
            <a href="mailto:hello@formcraft.app" style={{
              fontFamily: "var(--font-mc)", fontSize: "15px",
              color: "#20d4e8", textShadow: "1px 1px 0 rgba(0,0,0,0.7)",
              letterSpacing: "0.04em", transition: "color 0.1s",
            }}
              onMouseEnter={e => (e.currentTarget.style.color = "#40e8f8")}
              onMouseLeave={e => (e.currentTarget.style.color = "#20d4e8")}
            >
              📧 Contact Us →
            </a>
          </McCard>
        </div>
      </div>

      <footer style={{
        borderTop: "2px solid #2a2a2a", padding: "22px 32px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "#141414",
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("/textures/stone_texture.webp")`,
        backgroundSize: "auto, 32px 32px",
      }}>
        <span style={{ fontFamily: "var(--font-mc)", fontSize: "13px", color: "#484848", letterSpacing: "0.05em" }}>
          FormCraft © 2025
        </span>
        <Link href="/" style={{ fontFamily: "var(--font-mc)", fontSize: "13px", color: "#484848", letterSpacing: "0.04em" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#808080")}
          onMouseLeave={e => (e.currentTarget.style.color = "#484848")}
        >
          ← Back to Home
        </Link>
      </footer>
    </div>
  );
}
