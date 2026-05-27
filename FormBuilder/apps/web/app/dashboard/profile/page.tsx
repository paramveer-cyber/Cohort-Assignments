"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { clearToken } from "~/lib/auth";
import { toast } from "sonner";
import {
  McCard,
  McStatCard,
  McButton,
  McBadge,
  McLinkButton,
  McSectionTitle,
  McDeleteModal,
} from "~/components/mc";
import { useMe, useDeleteAccount } from "~/hooks/api/auth";
import {
  useUserProfileStats,
  type ResponseByDay,
  type RecentActivityItem,
} from "~/hooks/api/analytics";
import { useInvalidateCache } from "~/hooks/api/useInvalidateCache";

gsap.registerPlugin(ScrollTrigger);

export default function ProfilePage() {
  const router = useRouter();
  const { invalidateCache } = useInvalidateCache();
  const { user } = useMe({ staleTime: 0 });
  const { stats, isLoading } = useUserProfileStats();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const avatarCardRef = useRef<HTMLDivElement>(null);
  const statsRowRef = useRef<HTMLDivElement>(null);
  const rateCardRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const activityRef = useRef<HTMLDivElement>(null);
  const dangerRef = useRef<HTMLDivElement>(null);
  const xpFillRef = useRef<HTMLDivElement>(null);

  const { deleteAccount, isPending: deleteAccountPending } = useDeleteAccount({
    onSuccess: () => {
      clearToken();
      invalidateCache("auth.me");
      toast.success("Account scheduled for deletion. Check your email.");
      router.push("/login");
    },
    onError: (err) => {
      toast.error(err.message);
      setShowDeleteModal(false);
    },
  });

  useEffect(() => {
    if (!stats) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: -16 },
        { opacity: 1, y: 0, duration: 0.5 },
      ).fromTo(
        avatarCardRef.current,
        { opacity: 0, x: -24, scale: 0.97 },
        { opacity: 1, x: 0, scale: 1, duration: 0.6 },
        "-=0.2",
      );

      const statCards = statsRowRef.current?.querySelectorAll(".stat-card");
      if (statCards?.length) {
        gsap.fromTo(
          Array.from(statCards),
          { opacity: 0, y: 24, scale: 0.94 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.07,
            ease: "back.out(1.4)",
            scrollTrigger: { trigger: statsRowRef.current, start: "top 88%", once: true },
          },
        );
      }

      if (rateCardRef.current) {
        gsap.fromTo(
          rateCardRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            scrollTrigger: { trigger: rateCardRef.current, start: "top 88%", once: true },
          },
        );
      }

      if (xpFillRef.current && stats.avgResponseRate !== undefined) {
        gsap.fromTo(
          xpFillRef.current,
          { width: "0%" },
          {
            width: `${Math.min(stats.avgResponseRate, 100)}%`,
            duration: 1.4,
            ease: "power2.out",
            scrollTrigger: { trigger: xpFillRef.current, start: "top 90%", once: true },
          },
        );
      }

      if (chartRef.current) {
        const bars = chartRef.current.querySelectorAll(".chart-bar");
        gsap.fromTo(
          Array.from(bars),
          { scaleY: 0, transformOrigin: "bottom" },
          {
            scaleY: 1,
            duration: 0.5,
            stagger: 0.02,
            ease: "power2.out",
            scrollTrigger: { trigger: chartRef.current, start: "top 88%", once: true },
          },
        );
        gsap.fromTo(
          chartRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.4,
            scrollTrigger: { trigger: chartRef.current, start: "top 88%", once: true },
          },
        );
      }

      if (activityRef.current) {
        const rows = activityRef.current.querySelectorAll(".activity-row");
        gsap.fromTo(
          Array.from(rows),
          { opacity: 0, x: -12 },
          {
            opacity: 1,
            x: 0,
            duration: 0.4,
            stagger: 0.06,
            scrollTrigger: { trigger: activityRef.current, start: "top 88%", once: true },
          },
        );
      }

      if (dangerRef.current) {
        gsap.fromTo(
          dangerRef.current,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            scrollTrigger: { trigger: dangerRef.current, start: "top 92%", once: true },
          },
        );
      }
    });

    return () => ctx.revert();
  }, [stats]);

  if (isLoading) {
    return (
      <div
        style={{
          fontFamily: "var(--font-mc)",
          color: "#5aaa38",
          fontSize: "16px",
          letterSpacing: "0.1em",
          animation: "mc-blink 1s step-end infinite",
          padding: "64px",
          textAlign: "center",
        }}
      >
        Loading inventory...
      </div>
    );
  }

  const avatarInitial = user?.name?.[0]?.toUpperCase() ?? "?";
  const maxBars = Math.max(
    ...(stats?.responsesByDay?.map((d: ResponseByDay) => d.count) ?? [1]),
    1,
  );

  return (
    <>
      <McDeleteModal
        open={showDeleteModal}
        onConfirm={() => deleteAccount()}
        onCancel={() => setShowDeleteModal(false)}
        isPending={deleteAccountPending}
      />

      <div style={{ maxWidth: "780px", margin: "0 auto" }}>
        <div
          ref={headerRef}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "36px",
            opacity: 0,
          }}
        >
          <McSectionTitle accent>Player Profile</McSectionTitle>
          <McLinkButton href="/dashboard/email-preferences" variant="ghost" size="sm">
            Email Prefs
          </McLinkButton>
        </div>

        <div ref={avatarCardRef} style={{ opacity: 0, marginBottom: "20px" }}>
          <McCard variant="chest" style={{ padding: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "cover",
                    border: "2px solid #7a5828",
                    boxShadow: "0 4px 0 #1e0c04, inset 0 1px 0 rgba(255,255,255,0.12)",
                    imageRendering: "pixelated",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    background: "#2e1a08",
                    borderWidth: "2px",
                    borderStyle: "solid",
                    borderTopColor: "#a07040",
                    borderLeftColor: "#7a5828",
                    borderRightColor: "#7a5828",
                    borderBottomColor: "#7a5828",
                    boxShadow: "0 4px 0 #1e0c04, inset 0 1px 0 rgba(255,255,255,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-mc)",
                    fontSize: "36px",
                    color: "#e0e0e0",
                    textShadow: "1px 2px 0 rgba(0,0,0,0.9)",
                  }}
                >
                  {avatarInitial}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: "var(--font-mc)",
                    fontSize: "22px",
                    color: "#e0e0e0",
                    textShadow: "1px 2px 0 rgba(0,0,0,0.9)",
                    marginBottom: "6px",
                  }}
                >
                  {user?.name}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "15px",
                    color: "#787878",
                    marginBottom: "12px",
                  }}
                >
                  {user?.email}
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {user?.role === "admin" && <McBadge variant="diamond">⚡ Admin</McBadge>}
                  <McBadge variant="grass">🌍 Active</McBadge>
                </div>
              </div>
            </div>
          </McCard>
        </div>

        {stats && (
          <>
            <div
              ref={statsRowRef}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              {[
                { label: "Total Forms", value: stats.totalForms, icon: "📋" },
                { label: "Published", value: stats.publishedForms, icon: "🌍" },
                { label: "Responses", value: stats.totalResponses, icon: "📬" },
                { label: "Views", value: stats.totalViews, icon: "👁" },
              ].map((s) => (
                <div key={s.label} className="stat-card" style={{ opacity: 0 }}>
                  <McStatCard label={s.label} value={s.value} icon={s.icon} />
                </div>
              ))}
            </div>

            <div ref={rateCardRef} style={{ opacity: 0, marginBottom: "20px" }}>
              <McCard variant="inventory" style={{ padding: "28px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "14px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mc)",
                      fontSize: "15px",
                      color: "#c8c8c8",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Response Rate
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mc)",
                      fontSize: "26px",
                      color: "#20d4e8",
                      textShadow: "1px 2px 0 rgba(0,0,0,0.9)",
                    }}
                  >
                    {stats.avgResponseRate}%
                  </span>
                </div>
                <div
                  style={{
                    height: "16px",
                    background: "#080808",
                    borderWidth: "2px",
                    borderStyle: "solid",
                    borderTopColor: "#181818",
                    borderLeftColor: "#2a2a2a",
                    borderRightColor: "#2a2a2a",
                    borderBottomColor: "#2a2a2a",
                    boxShadow: "inset 0 3px 4px rgba(0,0,0,0.95)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    ref={xpFillRef}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      bottom: 0,
                      width: "0%",
                      background: "#20d4e8",
                      backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)`,
                      boxShadow:
                        "inset 0 2px 0 rgba(255,255,255,0.35), inset 0 -2px 0 rgba(0,0,0,0.5), 0 0 12px rgba(32,212,232,0.7)",
                    }}
                  />
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "14px",
                    color: "#484848",
                    marginTop: "10px",
                  }}
                >
                  responses / views across all forms
                </p>
              </McCard>
            </div>

            {stats.responsesByDay.length > 0 && (
              <div ref={chartRef} style={{ opacity: 0, marginBottom: "20px" }}>
                <McCard variant="inventory" style={{ padding: "28px" }}>
                  <McSectionTitle sub="Last 30 days">Responses by Day</McSectionTitle>
                  <div
                    style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "80px" }}
                  >
                    {stats.responsesByDay.map((d: ResponseByDay) => (
                      <div
                        key={d.date}
                        className="chart-bar"
                        title={`${d.date}: ${d.count}`}
                        style={{
                          flex: 1,
                          background: "#5aaa38",
                          backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 3px)`,
                          boxShadow: "inset 0 2px 0 rgba(255,255,255,0.3)",
                          height: `${Math.max((d.count / maxBars) * 72, 3)}px`,
                          cursor: "default",
                          transition: "background 0.1s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#6ec44a")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#5aaa38")}
                      />
                    ))}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontFamily: "var(--font-body)",
                      fontSize: "13px",
                      color: "#484848",
                      marginTop: "8px",
                    }}
                  >
                    <span>{stats.responsesByDay[0]?.date}</span>
                    <span>{stats.responsesByDay[stats.responsesByDay.length - 1]?.date}</span>
                  </div>
                </McCard>
              </div>
            )}

            {stats.recentActivity.length > 0 && (
              <div ref={activityRef} style={{ marginBottom: "20px" }}>
                <McCard variant="inventory" style={{ padding: "28px" }}>
                  <McSectionTitle>Recent Activity</McSectionTitle>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {stats.recentActivity.map((item: RecentActivityItem, i: number) => (
                      <div
                        key={item.formId}
                        className="activity-row"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "13px 0",
                          borderBottom:
                            i < stats.recentActivity.length - 1 ? "1px solid #282828" : "none",
                          opacity: 0,
                        }}
                      >
                        <Link
                          href={`/dashboard/forms/${item.formId}`}
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "15px",
                            color: "#c8c8c8",
                            transition: "color 0.1s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#5aaa38")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#c8c8c8")}
                        >
                          {item.formTitle}
                        </Link>
                        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                          <span
                            style={{
                              fontFamily: "var(--font-mc)",
                              fontSize: "14px",
                              color: "#20d4e8",
                              textShadow: "1px 1px 0 rgba(0,0,0,0.8)",
                            }}
                          >
                            {item.responseCount} resp
                          </span>
                          {item.lastResponseAt && (
                            <span
                              style={{
                                fontFamily: "var(--font-body)",
                                fontSize: "13px",
                                color: "#484848",
                              }}
                            >
                              {new Date(item.lastResponseAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </McCard>
              </div>
            )}

            {stats.totalForms === 0 && (
              <McCard
                variant="inventory"
                style={{ padding: "64px", textAlign: "center", marginBottom: "20px" }}
              >
                <div style={{ fontSize: "48px", marginBottom: "14px" }}>📭</div>
                <p
                  style={{
                    fontFamily: "var(--font-mc)",
                    fontSize: "16px",
                    color: "#585858",
                    letterSpacing: "0.04em",
                    marginBottom: "20px",
                  }}
                >
                  No forms yet
                </p>
                <McLinkButton href="/dashboard/forms/new" variant="grass" size="sm">
                  ⛏ Create First Form
                </McLinkButton>
              </McCard>
            )}
          </>
        )}

        <div
          ref={dangerRef}
          style={{
            opacity: 0,
            borderWidth: "2px",
            borderStyle: "solid",
            borderTopColor: "#1e0606",
            borderLeftColor: "#5a0e0e",
            borderRightColor: "#5a0e0e",
            borderBottomColor: "#5a0e0e",
            background: "#120404",
            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("/textures/bricks_texture.webp")`,
            backgroundSize: "auto, 32px 32px",
            boxShadow:
              "0 6px 0 #200202, inset 0 1px 0 rgba(255,255,255,0.03), 0 0 24px rgba(180,32,32,0.15)",
            padding: "28px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mc)",
              fontSize: "15px",
              color: "#ff6666",
              textShadow: "1px 1px 0 rgba(0,0,0,0.9)",
              marginBottom: "10px",
              letterSpacing: "0.04em",
            }}
          >
            ⚠ Danger Zone
          </div>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "15px",
              color: "#dfdfdf",
              marginBottom: "20px",
              lineHeight: 1.65,
            }}
          >
            Deleting your account schedules permanent removal in 7 days. Log back in within that
            window to recover it.
          </p>
          <McButton variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
            Delete Account
          </McButton>
        </div>
      </div>
    </>
  );
}
