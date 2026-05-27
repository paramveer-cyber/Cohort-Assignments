"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  McPanorama,
  McFloatingParticles,
  McLinkButton,
  McSplashText,
  McCard,
  McPublicNav,
} from "~/components/mc";

gsap.registerPlugin(ScrollTrigger);

const splashTexts = [
  "Now with 100% fewer Creepers",
  "Build forms faster than a speedrun",
  "No Herobrine",
  "Type-safe like Netherite armor",
  "Survives even the Nether",
  "More features than a chest shop",
];

const features = [
  {
    icon: "📝",
    title: "10 Field Types",
    desc: "Text, email, number, select, multi-select, checkbox, dropdown, rating, date, and more.",
    accent: "#20d4e8",
  },
  {
    icon: "🔓",
    title: "Public & Unlisted",
    desc: "Publish publicly to be discovered, or share a private link only with your audience.",
    accent: "#5aaa38",
  },
  {
    icon: "📊",
    title: "Analytics Built In",
    desc: "Response rates, daily trends, field-level completion — all in your dashboard.",
    accent: "#20d4e8",
  },
  {
    icon: "🚪",
    title: "No Login Required",
    desc: "Anyone can fill your form. No friction. No accounts required to submit.",
    accent: "#5aaa38",
  },
  {
    icon: "⚙️",
    title: "Type-Safe API",
    desc: "Full REST + tRPC API with OpenAPI docs. Build integrations with confidence.",
    accent: "#20d4e8",
  },
  {
    icon: "🎨",
    title: "Themed Forms",
    desc: "Choose from built-in themes. Customize colors and fonts per form.",
    accent: "#5aaa38",
  },
];

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const splashRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const featuresTitleRef = useRef<HTMLHeadingElement>(null);
  const featuresGridRef = useRef<HTMLDivElement>(null);
  const ctaSectionRef = useRef<HTMLDivElement>(null);
  const panoramaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(splashRef.current, { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.5 })
        .fromTo(
          h1Ref.current,
          { opacity: 0, y: 28, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.7 },
          "-=0.2",
        )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.4",
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5 },
          "-=0.3",
        );

      if (panoramaRef.current) {
        gsap.to(panoramaRef.current, {
          yPercent: 30,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      const featureCards = featuresGridRef.current?.querySelectorAll(".feature-card");
      if (featureCards?.length) {
        gsap.fromTo(
          Array.from(featureCards),
          { opacity: 0, y: 40, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.65,
            stagger: 0.09,
            ease: "power3.out",
            scrollTrigger: { trigger: featuresGridRef.current, start: "top 85%", once: true },
          },
        );
      }

      if (featuresTitleRef.current) {
        gsap.fromTo(
          featuresTitleRef.current,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            scrollTrigger: { trigger: featuresTitleRef.current, start: "top 88%", once: true },
          },
        );
      }

      if (ctaSectionRef.current) {
        gsap.fromTo(
          ctaSectionRef.current,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: ctaSectionRef.current, start: "top 88%", once: true },
          },
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#0e0e0e",
      }}
    >
      <McPublicNav />

      <section
        ref={heroRef}
        style={{
          position: "relative",
          minHeight: "600px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <div ref={panoramaRef} style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <McPanorama />
        </div>
        <McFloatingParticles count={20} />

        <div
          ref={heroContentRef}
          style={{ position: "relative", zIndex: 5, textAlign: "center", padding: "80px 32px" }}
        >
          <div
            ref={splashRef}
            style={{
              marginBottom: "20px",
              height: "32px",
              display: "flex",
              justifyContent: "center",
              opacity: 0,
            }}
          >
            <McSplashText texts={splashTexts} />
          </div>

          <h1
            ref={h1Ref}
            style={{
              fontFamily: "var(--font-mc)",
              fontSize: "clamp(30px, 5vw, 58px)",
              color: "#ffffff",
              textShadow:
                "3px 4px 0 rgba(0,0,0,0.95), 1px 1px 0 #1e4c10, 0 0 40px rgba(90,170,56,0.15)",
              lineHeight: 1.15,
              marginBottom: "24px",
              maxWidth: "720px",
              letterSpacing: "0.03em",
              margin: "0 auto 24px",
              opacity: 0,
            }}
          >
            Build forms people actually fill out
          </h1>

          <p
            ref={subtitleRef}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "18px",
              color: "#b8c8b8",
              marginBottom: "48px",
              maxWidth: "500px",
              margin: "0 auto 48px",
              lineHeight: 1.7,
              textShadow: "1px 1px 0 rgba(0,0,0,0.7)",
              opacity: 0,
            }}
          >
            Create dynamic forms, collect responses, and analyze results.
            <br />
            No login required for respondents.
          </p>

          <div
            ref={ctaRef}
            style={{
              display: "flex",
              gap: "14px",
              justifyContent: "center",
              flexWrap: "wrap",
              opacity: 0,
            }}
          >
            <McLinkButton href="/register" variant="grass" size="lg">
              ⛏ Start for Free
            </McLinkButton>
            <McLinkButton href="/explore" variant="ghost" size="lg">
              Browse Forms
            </McLinkButton>
          </div>
        </div>
      </section>

      <section
        style={{
          padding: "96px 32px",
          background: "#161616",
          borderTop: "3px solid #2e2e2e",
          boxShadow: "inset 0 4px 0 #0a0a0a",
        }}
      >
        <div style={{ maxWidth: "1060px", margin: "0 auto" }}>
          <h2
            ref={featuresTitleRef}
            style={{
              fontFamily: "var(--font-mc)",
              fontSize: "26px",
              color: "#20d4e8",
              textShadow: "1px 2px 0 rgba(0,0,0,0.9), 0 0 28px rgba(32,212,232,0.35)",
              textAlign: "center",
              marginBottom: "60px",
              letterSpacing: "0.05em",
              opacity: 0,
            }}
          >
            Everything in your inventory
          </h2>

          <div
            ref={featuresGridRef}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "16px",
            }}
          >
            {features.map((f) => (
              <McCard
                key={f.title}
                variant="inventory"
                className="feature-card"
                style={{ padding: "30px", opacity: 0 }}
              >
                <div
                  style={{
                    fontSize: "34px",
                    marginBottom: "16px",
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))",
                  }}
                >
                  {f.icon}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-mc)",
                    fontSize: "17px",
                    color: f.accent,
                    textShadow: "1px 1px 0 rgba(0,0,0,0.8)",
                    marginBottom: "10px",
                    letterSpacing: "0.04em",
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "15px",
                    color: "#888888",
                    lineHeight: 1.7,
                  }}
                >
                  {f.desc}
                </p>
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "2px",
                    background: `linear-gradient(90deg, transparent, ${f.accent}60, transparent)`,
                  }}
                />
              </McCard>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={ctaSectionRef}
        style={{
          padding: "96px 32px",
          background: "#0e0e0e",
          borderTop: "3px solid #242424",
          textAlign: "center",
          opacity: 0,
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "56px 80px",
            background: "#141414",
            backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("/textures/stone_texture.webp`,
            backgroundSize: "auto, 32px 32px",
            borderWidth: "2px",
            borderStyle: "solid",
            borderTopColor: "#383838",
            borderLeftColor: "#2a2a2a",
            borderRightColor: "#2a2a2a",
            borderBottomColor: "#1e1e1e",
            boxShadow: "0 8px 0 #080808, inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-mc)",
              fontSize: "28px",
              color: "#e0e0e0",
              textShadow: "1px 2px 0 rgba(0,0,0,0.9)",
              marginBottom: "14px",
              letterSpacing: "0.03em",
            }}
          >
            Ready to craft?
          </h2>
          <p
            style={{
              fontFamily: "var(--font-body)",
              color: "#585858",
              marginBottom: "36px",
              fontSize: "16px",
              lineHeight: 1.6,
            }}
          >
            Free forever. No credit card. No Herobrine.
          </p>
          <McLinkButton href="/register" variant="grass" size="lg">
            ⛏ Create Your First Form
          </McLinkButton>
        </div>
      </section>

      <footer
        style={{
          borderTop: "2px solid #2a2a2a",
          padding: "22px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#141414",
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("/textures/stone_texture.webp`,
          backgroundSize: "auto, 32px 32px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mc)",
            fontSize: "13px",
            color: "#fff",
            letterSpacing: "0.05em",
          }}
        >
          FormCraft © 2026
        </span>
        <div style={{ display: "flex", gap: "20px" }}>
          {[
            { label: "Pricing", href: "/pricing" },
            { label: "Explore", href: "/explore" },
            { label: "API Docs", href: "/docs" },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              style={{
                fontFamily: "var(--font-mc)",
                fontSize: "14px",
                color: "#fff",
                letterSpacing: "0.04em",
                textDecoration: "none",
                transition: "color 0.1s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ddd")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#fff")}
            >
              {l.label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
