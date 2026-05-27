"use client";

import { use } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { McCard, McBadge, McSectionTitle, McLinkButton } from "~/components/mc";
import { useFormStats } from "~/hooks/api/analytics";

type Params = { formId: string };

interface ValueBreakdownItem {
  value: string;
  count: number;
}

interface FieldBreakdownItem {
  fieldId: string;
  label: string;
  fieldType: string;
  answered: number;
  completionRate: number;
  valueBreakdown: ValueBreakdownItem[];
}

interface DailyDataItem {
  date: string;
  count: number;
}

interface FormStats {
  title: string;
  totalResponses: number;
  viewCount: number;
  last7Days: number;
  dailyData: DailyDataItem[];
  fieldBreakdown: FieldBreakdownItem[];
}

const MC_PIE_COLORS = ["#5aaa38", "#20d4e8", "#e8a020", "#cc2222", "#9060c8", "#3d8c28", "#0a6878"];

const statItems = (
  totalResponses: number,
  viewCount: number,
  conversionRate: string,
  last7Days: number,
) => [
  { label: "Total Responses", value: totalResponses, icon: "📬", accent: "#20d4e8" },
  { label: "Total Views", value: viewCount, icon: "👁", accent: "#e8a020" },
  { label: "Conversion", value: `${conversionRate}%`, icon: "⚡", accent: "#5aaa38" },
  { label: "Last 7 Days", value: last7Days, icon: "📅", accent: "#20d4e8" },
];

const mcTooltipStyle = {
  background: "#1e1e1e",
  border: "2px solid #3a3a3a",
  borderTop: "2px solid #505050",
  borderRadius: 0,
  fontFamily: "var(--font-mc)",
  fontSize: "12px",
  color: "#e0e0e0",
  boxShadow: "0 4px 0 #0e0e0e",
};

export default function AnalyticsPage({ params }: { params: Promise<Params> }) {
  const { formId } = use(params);
  const { stats: statsRaw, isLoading } = useFormStats({ formId });
  const stats = statsRaw as FormStats | undefined;

  if (isLoading) {
    return (
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
        Crunching numbers...
      </div>
    );
  }

  if (!stats) {
    return (
      <McCard variant="stone" style={{ padding: "40px", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-mc)", color: "#585858" }}>Form not found.</p>
      </McCard>
    );
  }

  const conversionRate =
    stats.viewCount > 0 ? ((stats.totalResponses / stats.viewCount) * 100).toFixed(1) : "0.0";

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto" }}>
      <div style={{ marginBottom: "20px" }}>
        <Link
          href={`/dashboard/forms/${formId}`}
          style={{
            fontFamily: "var(--font-mc)",
            fontSize: "13px",
            color: "#606060",
            letterSpacing: "0.03em",
            transition: "color 0.1s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#5aaa38")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#606060")}
        >
          ← {stats.title}
        </Link>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "28px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <McSectionTitle accent>📊 Analytics</McSectionTitle>
        <McLinkButton href={`/dashboard/forms/${formId}/responses`} variant="ghost" size="sm">
          View Responses →
        </McLinkButton>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          marginBottom: "28px",
        }}
      >
        {statItems(stats.totalResponses, stats.viewCount, conversionRate, stats.last7Days).map(
          (s) => (
            <McCard key={s.label} variant="inventory" style={{ padding: "20px 18px" }}>
              <div
                style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}
              >
                <span style={{ fontSize: "20px" }}>{s.icon}</span>
                <div
                  style={{
                    width: "7px",
                    height: "7px",
                    background: s.accent,
                    boxShadow: `0 0 6px ${s.accent}`,
                    animation: "mc-blink 2s step-end infinite",
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mc)",
                  fontSize: "28px",
                  fontWeight: 700,
                  color: s.accent,
                  textShadow: "1px 2px 0 rgba(0,0,0,0.9)",
                  marginBottom: "4px",
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mc)",
                  fontSize: "11px",
                  color: "#505050",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {s.label}
              </div>
            </McCard>
          ),
        )}
      </div>

      {stats.dailyData.length > 0 && (
        <McCard variant="stone" style={{ padding: "20px", marginBottom: "20px" }}>
          <div
            style={{
              fontFamily: "var(--font-mc)",
              fontSize: "14px",
              color: "#20d4e8",
              letterSpacing: "0.05em",
              marginBottom: "16px",
              textShadow: "1px 1px 0 rgba(0,0,0,0.8)",
            }}
          >
            Responses — last 30 days
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.dailyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fontFamily: "var(--font-mc)", fill: "#505050" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(d) => d.slice(5)}
                interval={Math.floor(stats.dailyData.length / 6)}
              />
              <YAxis
                tick={{ fontSize: 10, fontFamily: "var(--font-mc)", fill: "#505050" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip contentStyle={mcTooltipStyle} cursor={{ fill: "rgba(90,170,56,0.08)" }} />
              <Bar dataKey="count" name="Responses" fill="#5aaa38" radius={[0, 0, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </McCard>
      )}

      {stats.fieldBreakdown.length > 0 && (
        <div>
          <div style={{ marginBottom: "14px" }}>
            <McSectionTitle>Field Breakdown</McSectionTitle>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {stats.fieldBreakdown.map((field: FieldBreakdownItem) => {
              const isChoice =
                field.valueBreakdown.length > 0 &&
                ["single_select", "multi_select", "dropdown", "rating", "checkbox"].includes(
                  field.fieldType,
                );

              return (
                <McCard key={field.fieldId} variant="inventory" style={{ padding: "18px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "10px",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-mc)",
                          fontSize: "15px",
                          color: "#e0e0e0",
                          fontWeight: 700,
                          textShadow: "1px 1px 0 rgba(0,0,0,0.7)",
                        }}
                      >
                        {field.label}
                      </span>
                      <McBadge variant="stone">{field.fieldType.replace("_", " ")}</McBadge>
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-mc)",
                        fontSize: "12px",
                        color: "#505050",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {field.answered}/{stats.totalResponses} answered ({field.completionRate}%)
                    </span>
                  </div>

                  <div
                    style={{
                      height: "12px",
                      background: "#080808",
                      borderWidth: "2px",
                      borderStyle: "solid",
                      borderTopColor: "#181818",
                      borderLeftColor: "#2a2a2a",
                      borderRightColor: "#2a2a2a",
                      borderBottomColor: "#2a2a2a",
                      boxShadow: "inset 0 3px 4px rgba(0,0,0,0.95)",
                      marginBottom: "14px",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: `${field.completionRate}%`,
                        background: "#5aaa38",
                        backgroundImage:
                          "repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)",
                        boxShadow:
                          "inset 0 2px 0 rgba(255,255,255,0.35), inset 0 -2px 0 rgba(0,0,0,0.5), 0 0 8px #5aaa3870",
                        transition: "width 0.9s cubic-bezier(0.4,0,0.2,1)",
                      }}
                    />
                  </div>

                  {isChoice && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        gap: "20px",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        {field.valueBreakdown.map((v: ValueBreakdownItem, idx: number) => {
                          const pct =
                            field.answered > 0 ? Math.round((v.count / field.answered) * 100) : 0;
                          const barColor = MC_PIE_COLORS[idx % MC_PIE_COLORS.length];
                          return (
                            <div
                              key={v.value}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginBottom: "7px",
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: "var(--font-mc)",
                                  fontSize: "12px",
                                  color: "#a0a0a0",
                                  width: "110px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  flexShrink: 0,
                                }}
                              >
                                {v.value}
                              </span>
                              <div
                                style={{
                                  flex: 1,
                                  height: "12px",
                                  background: "#080808",
                                  border: "2px solid #1e1e1e",
                                  position: "relative",
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    position: "absolute",
                                    inset: 0,
                                    width: `${pct}%`,
                                    background: barColor,
                                    boxShadow: `0 0 6px ${barColor}60`,
                                  }}
                                />
                              </div>
                              <span
                                style={{
                                  fontFamily: "var(--font-mc)",
                                  fontSize: "11px",
                                  color: "#606060",
                                  width: "56px",
                                  textAlign: "right",
                                  flexShrink: 0,
                                }}
                              >
                                {v.count} ({pct}%)
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <PieChart width={140} height={140}>
                        <Pie
                          data={field.valueBreakdown.map((v: ValueBreakdownItem) => ({
                            name: v.value,
                            value: v.count,
                          }))}
                          cx={65}
                          cy={65}
                          outerRadius={52}
                          innerRadius={20}
                          dataKey="value"
                          label={({ percent }) => `${Math.round((percent ?? 0) * 100)}%`}
                          labelLine={false}
                        >
                          {field.valueBreakdown.map((_: ValueBreakdownItem, idx: number) => (
                            <Cell key={idx} fill={MC_PIE_COLORS[idx % MC_PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={mcTooltipStyle} />
                      </PieChart>
                    </div>
                  )}
                </McCard>
              );
            })}
          </div>
        </div>
      )}

      {stats.fieldBreakdown.length === 0 && stats.totalResponses === 0 && (
        <McCard
          variant="stone"
          style={{
            padding: "64px 32px",
            textAlign: "center",
            borderStyle: "dashed",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
          <p
            style={{
              fontFamily: "var(--font-mc)",
              fontSize: "16px",
              color: "#585858",
              letterSpacing: "0.04em",
            }}
          >
            No data yet. Share your form to start collecting.
          </p>
        </McCard>
      )}
    </div>
  );
}
