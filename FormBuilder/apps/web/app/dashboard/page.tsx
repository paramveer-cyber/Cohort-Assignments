"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { McCard, McBadge, McLinkButton, McSectionTitle } from "~/components/mc";
import { useDashboardStats } from "~/hooks/api/analytics";

gsap.registerPlugin(ScrollTrigger);

const statusVariantMap: Record<string, "grass" | "danger" | "stone"> = {
  published: "grass",
  archived: "danger",
  draft: "stone",
};

export default function DashboardPage() {
  const { stats, isLoading } = useDashboardStats();
  const statsRowRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!stats) return;

    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" },
        );
      }

      const statCards = statsRowRef.current?.querySelectorAll(".stat-card");
      if (statCards?.length) {
        gsap.fromTo(
          Array.from(statCards),
          { opacity: 0, y: 28, scale: 0.94 },
          { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.08, ease: "back.out(1.4)" },
        );

        statCards.forEach((card) => {
          const valEl = card.querySelector(".stat-value");
          if (!valEl) return;
          const raw = valEl.getAttribute("data-val");
          if (!raw) return;
          const end = parseInt(raw, 10);
          if (isNaN(end)) return;
          const obj = { v: 0 };
          gsap.to(obj, {
            v: end,
            duration: 1.4,
            delay: 0.3,
            ease: "power2.out",
            onUpdate() {
              valEl.textContent = Math.round(obj.v).toString();
            },
          });
        });
      }

      if (tableRef.current) {
        const rows = tableRef.current.querySelectorAll("tbody tr");
        gsap.fromTo(
          Array.from(rows),
          { opacity: 0, x: -16 },
          {
            opacity: 1,
            x: 0,
            duration: 0.4,
            stagger: 0.06,
            ease: "power2.out",
            scrollTrigger: { trigger: tableRef.current, start: "top 88%", once: true },
          },
        );
      }
    });

    return () => ctx.revert();
  }, [stats]);

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", position: "relative" }}>
      <div
        ref={titleRef}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "40px",
          opacity: 0,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-mc)",
              fontSize: "26px",
              color: "#e0e0e0",
              textShadow: "1px 2px 0 rgba(0,0,0,0.9)",
              letterSpacing: "0.04em",
            }}
          >
            Dashboard
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "15px",
              color: "#505050",
              marginTop: "6px",
            }}
          >
            Your form crafting HQ
          </p>
        </div>
        <McLinkButton href="/dashboard/forms/new" variant="grass" size="sm">
          ⛏ New Form
        </McLinkButton>
      </div>

      {isLoading && (
        <div
          style={{
            fontFamily: "var(--font-mc)",
            color: "#5aaa38",
            fontSize: "16px",
            letterSpacing: "0.1em",
            animation: "mc-blink 1s step-end infinite",
            textAlign: "center",
            padding: "64px",
          }}
        >
          Generating terrain...
        </div>
      )}

      {stats && (
        <>
          <div
            ref={statsRowRef}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "14px",
              marginBottom: "48px",
            }}
          >
            {[
              { label: "Total Forms", val: stats.totalForms, icon: "📋", accent: "#20d4e8" },
              { label: "Published", val: stats.publishedForms, icon: "🌍", accent: "#5aaa38" },
              { label: "Responses", val: stats.totalResponses, icon: "📬", accent: "#20d4e8" },
              { label: "Views", val: stats.totalViews, icon: "👁", accent: "#e8a020" },
            ].map((s) => (
              <McCard
                key={s.label}
                variant="inventory"
                className="stat-card"
                style={{ padding: "24px 20px", opacity: 0 }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <span
                    style={{ fontSize: "24px", filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.7))" }}
                  >
                    {s.icon}
                  </span>
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      background: s.accent,
                      boxShadow: `0 0 8px ${s.accent}`,
                      animation: "mc-blink 2s step-end infinite",
                    }}
                  />
                </div>
                <div
                  className="stat-value"
                  data-val={s.val}
                  style={{
                    fontFamily: "var(--font-mc)",
                    fontSize: "34px",
                    fontWeight: 700,
                    color: s.accent,
                    textShadow: `1px 2px 0 rgba(0,0,0,0.9)`,
                    marginBottom: "6px",
                  }}
                >
                  0
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mc)",
                    fontSize: "12px",
                    color: "#606060",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "2px",
                    background: `linear-gradient(90deg, transparent, ${s.accent}50, transparent)`,
                  }}
                />
              </McCard>
            ))}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <McSectionTitle accent>Your Forms</McSectionTitle>
          </div>

          {stats.forms.length === 0 ? (
            <McCard
              variant="inventory"
              style={{ padding: "80px 32px", textAlign: "center", border: "2px dashed #343434" }}
            >
              <div style={{ fontSize: "56px", marginBottom: "18px", filter: "grayscale(0.3)" }}>
                📭
              </div>
              <p
                style={{
                  fontFamily: "var(--font-mc)",
                  fontSize: "17px",
                  color: "#585858",
                  letterSpacing: "0.04em",
                }}
              >
                No forms yet
              </p>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "15px",
                  color: "#404040",
                  margin: "10px 0 28px",
                  lineHeight: 1.6,
                }}
              >
                Your inventory is empty. Start crafting!
              </p>
              <McLinkButton href="/dashboard/forms/new" variant="grass" size="sm">
                ⛏ Create First Form
              </McLinkButton>
            </McCard>
          ) : (
            <div ref={tableRef}>
              <McCard variant="stone" style={{ padding: "0", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        background: "#181818",
                        borderBottom: "2px solid #2a2a2a",
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url("/textures/stone_texture.webp")`,
                        backgroundSize: "auto, 32px 32px",
                      }}
                    >
                      {["Title", "Status", "Responses", "Views", ""].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "14px 20px",
                            textAlign: h === "" ? "right" : "left",
                            fontFamily: "var(--font-mc)",
                            fontSize: "12px",
                            color: "#fff",
                            letterSpacing: "0.08em",
                            fontWeight: "normal",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stats.forms.map((f, i) => (
                      <tr
                        key={f.id}
                        style={{
                          borderBottom: i < stats.forms.length - 1 ? "1px solid #232323" : "none",
                          transition: "background 0.12s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#1e1e1e")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: "15px 20px" }}>
                          <Link
                            href={`/dashboard/forms/${f.id}`}
                            style={{
                              fontFamily: "var(--font-body)",
                              fontSize: "15px",
                              color: "#d0d0d0",
                              fontWeight: "500",
                              transition: "color 0.1s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#5aaa38")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#d0d0d0")}
                          >
                            {f.title}
                          </Link>
                        </td>
                        <td style={{ padding: "15px 20px" }}>
                          <McBadge variant={statusVariantMap[f.status] ?? "stone"}>
                            {f.status}
                          </McBadge>
                        </td>
                        <td
                          style={{
                            padding: "15px 20px",
                            fontFamily: "var(--font-mc)",
                            fontSize: "15px",
                            color: "#20d4e8",
                          }}
                        >
                          {f.responseCount ?? 0}
                        </td>
                        <td
                          style={{
                            padding: "15px 20px",
                            fontFamily: "var(--font-mc)",
                            fontSize: "15px",
                            color: "#e8a020",
                          }}
                        >
                          {f.viewCount ?? 0}
                        </td>
                        <td style={{ padding: "15px 20px", textAlign: "right" }}>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                            {[
                              {
                                label: "Edit",
                                href: `/dashboard/forms/${f.id}/edit`,
                                hover: "#5aaa38",
                              },
                              {
                                label: "Analytics",
                                href: `/dashboard/forms/${f.id}/analytics`,
                                hover: "#20d4e8",
                              },
                              {
                                label: "Responses",
                                href: `/dashboard/forms/${f.id}/responses`,
                                hover: "#20d4e8",
                              },
                            ].map((a) => (
                              <Link
                                key={a.label}
                                href={a.href}
                                style={{
                                  fontFamily: "var(--font-mc)",
                                  fontSize: "12px",
                                  color: "#505050",
                                  letterSpacing: "0.04em",
                                  padding: "5px 12px",
                                  borderWidth: "2px",
                                  borderStyle: "solid",
                                  borderTopColor: "#383838",
                                  borderLeftColor: "#303030",
                                  borderRightColor: "#303030",
                                  borderBottomColor: "#303030",
                                  transition: "all 0.1s",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = a.hover;
                                  e.currentTarget.style.borderColor = a.hover + "55";
                                  e.currentTarget.style.background = a.hover + "12";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = "#505050";
                                  e.currentTarget.style.borderColor = "#303030";
                                  e.currentTarget.style.background = "transparent";
                                }}
                              >
                                {a.label}
                              </Link>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </McCard>
            </div>
          )}
        </>
      )}
    </div>
  );
}
