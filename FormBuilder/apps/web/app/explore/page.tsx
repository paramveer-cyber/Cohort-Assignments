"use client";

import { trpc } from "~/trpc/client";
import {
  McPublicNav,
  McCard,
  McLinkButton,
  McBadge,
  McFloatingParticles,
  McWorldBackground,
  McSectionTitle,
} from "~/components/mc";

export default function ExplorePage() {
  const { data: forms, isLoading } = trpc.public.exploreForms.useQuery({ limit: 20, offset: 0 });

  return (
    <div style={{ minHeight: "100vh", background: "#0e0e0e" }}>
      <McPublicNav />

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "64px 32px" }}>
        <div style={{ marginBottom: "52px", textAlign: "center" }}>
          <div
            style={{
              display: "inline-block",
              fontFamily: "var(--font-mc)",
              fontSize: "11px",
              color: "#5aaa38",
              letterSpacing: "0.16em",
              background: "#0e1e08",
              borderWidth: "2px",
              borderStyle: "solid",
              borderTopColor: "#3a6a18",
              borderLeftColor: "#0a1404",
              borderRightColor: "#0a1404",
              borderBottomColor: "#0a1404",
              padding: "4px 16px",
              marginBottom: "18px",
            }}
          >
            COMMUNITY FORMS
          </div>
          <h1
            style={{
              fontFamily: "var(--font-mc)",
              fontSize: "clamp(24px, 3.5vw, 38px)",
              color: "#e8e8e8",
              textShadow: "1px 2px 0 rgba(0,0,0,0.95)",
              letterSpacing: "0.04em",
              marginBottom: "12px",
            }}
          >
            Explore Forms
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              color: "#505050",
              fontSize: "15px",
              lineHeight: 1.6,
            }}
          >
            Browse publicly available forms crafted by the community.
          </p>
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
            Exploring terrain...
          </div>
        )}

        {!isLoading && forms?.length === 0 && (
          <McCard
            variant="inventory"
            style={{
              padding: "64px 32px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <McFloatingParticles count={8} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: "52px", marginBottom: "16px" }}>🗺</div>
              <p
                style={{
                  fontFamily: "var(--font-mc)",
                  fontSize: "17px",
                  color: "#585858",
                  marginBottom: "8px",
                }}
              >
                No public forms yet
              </p>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "15px",
                  color: "#404040",
                  marginBottom: "28px",
                  lineHeight: 1.6,
                }}
              >
                Be the first to craft one!
              </p>
              <McLinkButton href="/register" variant="grass" size="sm">
                ⛏ Start Crafting
              </McLinkButton>
            </div>
          </McCard>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "14px",
          }}
        >
          {forms?.map((f) => (
            <a
              key={f.id}
              href={`/f/${f.slug}`}
              style={{ textDecoration: "none", display: "block" }}
            >
              <McCard
                variant="inventory"
                style={{
                  padding: "24px",
                  cursor: "pointer",
                  transition: "transform 0.1s, box-shadow 0.1s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mc)",
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#e0e0e0",
                      textShadow: "1px 1px 0 rgba(0,0,0,0.7)",
                      lineHeight: 1.3,
                      flex: 1,
                      paddingRight: "10px",
                    }}
                  >
                    {f.title}
                  </div>
                  <McBadge variant="grass">📋</McBadge>
                </div>
                {f.description && (
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "13px",
                      color: "#686868",
                      lineHeight: 1.6,
                      marginBottom: "14px",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {f.description}
                  </p>
                )}
                <div
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mc)",
                      fontSize: "12px",
                      color: "#20d4e8",
                      textShadow: "1px 1px 0 rgba(0,0,0,0.8)",
                    }}
                  >
                    {f.responseCount ?? 0} responses
                  </span>
                  <span
                    style={{ fontFamily: "var(--font-mc)", fontSize: "12px", color: "#3a6a18" }}
                  >
                    Fill Form →
                  </span>
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "2px",
                    background:
                      "linear-gradient(90deg, transparent, rgba(90,170,56,0.4), transparent)",
                  }}
                />
              </McCard>
            </a>
          ))}
        </div>

        {forms && forms.length > 0 && (
          <div style={{ textAlign: "center", marginTop: "48px" }}>
            <McLinkButton href="/register" variant="ghost" size="sm">
              ⛏ Create Your Own Form
            </McLinkButton>
          </div>
        )}
      </div>

      <footer
        style={{
          borderTop: "2px solid #2a2a2a",
          padding: "22px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#141414",
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("/textures/stone_texture.webp")`,
          backgroundSize: "auto, 32px 32px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mc)",
            fontSize: "13px",
            color: "#484848",
            letterSpacing: "0.05em",
          }}
        >
          FormCraft © 2026
        </span>
        <a
          href="/"
          style={{
            fontFamily: "var(--font-mc)",
            fontSize: "13px",
            color: "#484848",
            letterSpacing: "0.04em",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#808080")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#484848")}
        >
          ← Back to Home
        </a>
      </footer>
    </div>
  );
}
