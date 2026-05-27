"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "~/lib/utils";

const stoneOverlay = `
  repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px),
  repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(0,0,0,0.04) 6px, rgba(0,0,0,0.04) 7px)
`;

export type McVariant = "stone" | "wood" | "grass" | "danger" | "ghost" | "diamond";

const VARIANTS: Record<
  McVariant,
  {
    bg: string;
    bgHover: string;
    bgActive: string;
    border: string;
    borderTop: string;
    borderBottom: string;
    text: string;
    shadow: string;
    textureSrc?: string;
  }
> = {
  stone: {
    bg: "#5a5a5a",
    bgHover: "#6e6e6e",
    bgActive: "#484848",
    border: "#303030",
    borderTop: "#8a8a8a",
    borderBottom: "#282828",
    text: "#ffffff",
    shadow: "0 4px 0 #1e1e1e",
    textureSrc: "/textures/stone_texture.webp",
  },
  wood: {
    bg: "#7a5230",
    bgHover: "#8e6040",
    bgActive: "#664020",
    border: "#3c1e0a",
    borderTop: "#a87040",
    borderBottom: "#2e1408",
    text: "#f5e8cc",
    shadow: "0 4px 0 #200c04",
    textureSrc: "/textures/oakplanks_texture.webp",
  },
  grass: {
    bg: "#2e7a1e",
    bgHover: "#3a9828",
    bgActive: "#226018",
    border: "#143c0e",
    borderTop: "#52b832",
    borderBottom: "#0e2c08",
    text: "#e8ffe8",
    shadow: "0 4px 0 #081804",
    textureSrc: "/textures/dirt_texture.webp",
  },
  danger: {
    bg: "#8a1010",
    bgHover: "#aa1a1a",
    bgActive: "#6e0808",
    border: "#480404",
    borderTop: "#cc2828",
    borderBottom: "#380202",
    text: "#ffe8e8",
    shadow: "0 4px 0 #200202",
  },
  ghost: {
    bg: "rgba(48,48,48,0.6)",
    bgHover: "rgba(68,68,68,0.8)",
    bgActive: "rgba(32,32,32,0.9)",
    border: "#404040",
    borderTop: "#606060",
    borderBottom: "#282828",
    text: "#d8d8d8",
    shadow: "0 4px 0 #141414",
  },
  diamond: {
    bg: "#0a6878",
    bgHover: "#0c8090",
    bgActive: "#085060",
    border: "#034050",
    borderTop: "#20c8dc",
    borderBottom: "#022830",
    text: "#d0ffff",
    shadow: "0 4px 0 #011820",
  },
};

function buildButtonStyle(
  v: (typeof VARIANTS)[McVariant],
  sz: { padding: string; fontSize: string; height: string },
  pressed: boolean,
  hovered: boolean,
  disabled: boolean,
  extra?: React.CSSProperties,
): React.CSSProperties {
  const bgColor = pressed ? v.bgActive : hovered ? v.bgHover : v.bg;
  return {
    padding: sz.padding,
    fontSize: sz.fontSize,
    height: sz.height,
    fontFamily: "var(--font-mc)",
    fontWeight: 700,
    backgroundColor: bgColor,
    backgroundImage: v.textureSrc ? `${stoneOverlay}, url("${v.textureSrc}")` : stoneOverlay,
    backgroundSize: v.textureSrc ? "auto, 32px 32px" : "auto",
    backgroundBlendMode: v.textureSrc ? "overlay, normal" : "normal",
    color: v.text,
    borderWidth: "2px",
    borderStyle: "solid",
    borderTopColor: pressed ? v.borderBottom : v.borderTop,
    borderLeftColor: pressed ? v.borderBottom : v.borderTop,
    borderRightColor: pressed ? v.borderTop : v.borderBottom,
    borderBottomColor: pressed ? v.borderTop : v.borderBottom,
    boxShadow: pressed
      ? `inset 0 3px 6px rgba(0,0,0,0.7), inset 0 -1px 0 rgba(255,255,255,0.06)`
      : `${v.shadow}, inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.5)`,
    transform: pressed ? "translateY(3px)" : "translateY(0)",
    letterSpacing: "0.05em",
    lineHeight: 1,
    opacity: disabled ? 0.4 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    textShadow: `1px 2px 0 rgba(0,0,0,0.85)`,
    transition: "background-color 0.06s, transform 0.06s, box-shadow 0.06s",
    userSelect: "none",
    whiteSpace: "nowrap",
    ...extra,
  };
}

const SIZE_MAP = {
  sm: { padding: "9px 20px", fontSize: "14px", height: "38px" },
  md: { padding: "13px 28px", fontSize: "16px", height: "48px" },
  lg: { padding: "16px 36px", fontSize: "18px", height: "56px" },
};

interface McButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: McVariant;
  size?: "sm" | "md" | "lg";
}

export function McButton({
  variant = "stone",
  size = "md",
  className,
  children,
  disabled,
  ...rest
}: McButtonProps) {
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const v = VARIANTS[variant];
  const sz = SIZE_MAP[size];

  return (
    <button
      {...rest}
      disabled={disabled}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => {
        setPressed(false);
        setHovered(false);
      }}
      onMouseEnter={() => setHovered(true)}
      className={cn(className)}
      style={buildButtonStyle(v, sz, pressed, hovered, !!disabled, rest.style)}
    >
      {children}
    </button>
  );
}

interface McLinkButtonProps {
  href: string;
  variant?: McVariant;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function McLinkButton({
  href,
  variant = "stone",
  size = "md",
  children,
  className,
  style,
}: McLinkButtonProps) {
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const v = VARIANTS[variant];
  const sz = SIZE_MAP[size];

  return (
    <Link
      href={href}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => {
        setPressed(false);
        setHovered(false);
      }}
      onMouseEnter={() => setHovered(true)}
      className={cn(className)}
      style={buildButtonStyle(v, sz, pressed, hovered, false, style)}
    >
      {children}
    </Link>
  );
}

interface McCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "chest" | "stone" | "wood" | "inventory" | "panel" | "diamond";
  glow?: boolean;
}

const CARD_VARIANTS = {
  chest: {
    bg: "#3e2410",
    border: "#1e0c04",
    top: "#6a4428",
    accent: "#e8a020",
    tex: "/textures/chest_texture.webp",
  },
  stone: {
    bg: "#303030",
    border: "#1c1c1c",
    top: "#505050",
    accent: "#808080",
    tex: "/textures/stone_texture.webp",
  },
  wood: {
    bg: "#503018",
    border: "#201008",
    top: "#7a5030",
    accent: "#c89040",
    tex: "/textures/oakplanks_texture.webp",
  },
  inventory: {
    bg: "#222222",
    border: "#101010",
    top: "#383838",
    accent: "#585858",
    tex: null,
  },
  panel: {
    bg: "#262626",
    border: "#404040",
    top: "#404040",
    accent: "#a0a0a0",
    tex: null,
  },
  diamond: {
    bg: "#051420",
    border: "#031828",
    top: "#0c8898",
    accent: "#20d4e8",
    tex: null,
  },
};

export function McCard({
  variant = "stone",
  glow,
  className,
  children,
  style,
  ...rest
}: McCardProps) {
  const v = CARD_VARIANTS[variant];
  const texLayer = v.tex
    ? `linear-gradient(rgba(0,0,0,0.72), rgba(0,0,0,0.72)), url("${v.tex}")`
    : "none";

  return (
    <div
      {...rest}
      className={cn("relative overflow-hidden", className)}
      style={{
        backgroundColor: v.bg,
        backgroundImage: texLayer,
        backgroundSize: v.tex ? "auto, 32px 32px" : "auto",
        borderWidth: "2px",
        borderStyle: "solid",
        borderTopColor: v.top,
        borderLeftColor: v.top,
        borderRightColor: v.border,
        borderBottomColor: v.border,
        boxShadow: `0 6px 0 ${v.border}, inset 0 1px 0 rgba(255,255,255,0.07)${glow ? `, 0 0 32px ${v.accent}55, 0 0 80px ${v.accent}18` : ""}`,
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: `linear-gradient(90deg, transparent, ${v.accent}90, transparent)`,
        }}
      />
      {children}
    </div>
  );
}

interface McInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function McInput({ label, error, className, style, ...rest }: McInputProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
      {label && (
        <label
          style={{
            fontFamily: "var(--font-mc)",
            fontSize: "15px",
            fontWeight: 700,
            color: "#d8d8d8",
            letterSpacing: "0.03em",
            textShadow: "1px 1px 0 rgba(0,0,0,0.7)",
          }}
        >
          {label}
        </label>
      )}
      <input
        {...rest}
        className={cn(className)}
        style={{
          fontFamily: "var(--font-mc)",
          fontSize: "16px",
          padding: "12px 16px",
          background: "#0e0e0e",
          color: "#e8e8e8",
          borderWidth: "2px",
          borderStyle: "solid",
          borderTopColor: "#252525",
          borderLeftColor: "#3a3a3a",
          borderRightColor: "#3a3a3a",
          borderBottomColor: "#3a3a3a",
          boxShadow: "inset 0 3px 5px rgba(0,0,0,0.8)",
          outline: "none",
          width: "100%",
          letterSpacing: "0.02em",
          transition: "border-color 0.1s, box-shadow 0.1s",
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "#3a9828";
          e.currentTarget.style.borderTopColor = "#1e5810";
          e.currentTarget.style.borderLeftColor = "#3a9828";
          e.currentTarget.style.borderRightColor = "#3a9828";
          e.currentTarget.style.borderBottomColor = "#3a9828";
          e.currentTarget.style.boxShadow =
            "inset 0 3px 5px rgba(0,0,0,0.8), 0 0 0 2px rgba(58,152,40,0.3)";
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "#3a3a3a";
          e.currentTarget.style.borderTopColor = "#252525";
          e.currentTarget.style.borderLeftColor = "#3a3a3a";
          e.currentTarget.style.borderRightColor = "#3a3a3a";
          e.currentTarget.style.borderBottomColor = "#3a3a3a";
          e.currentTarget.style.boxShadow = "inset 0 3px 5px rgba(0,0,0,0.8)";
          rest.onBlur?.(e);
        }}
      />
      {error && (
        <span
          style={{
            fontFamily: "var(--font-mc)",
            fontSize: "14px",
            color: "#ff6666",
            textShadow: "1px 1px 0 rgba(0,0,0,0.8)",
          }}
        >
          ⚠ {error}
        </span>
      )}
    </div>
  );
}

interface McXPBarProps {
  value: number;
  max?: number;
  label?: string;
  color?: string;
}

export function McXPBar({ value, max = 100, label, color = "#5aaa38" }: McXPBarProps) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {label && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--font-mc)", fontSize: "14px", color: "#a8a8a8" }}>
            {label}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mc)",
              fontSize: "14px",
              color,
              fontWeight: 700,
              textShadow: "1px 1px 0 rgba(0,0,0,0.8)",
            }}
          >
            {Math.round(pct)}%
          </span>
        </div>
      )}
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
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: `${pct}%`,
            background: color,
            backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)`,
            boxShadow: `inset 0 2px 0 rgba(255,255,255,0.35), inset 0 -2px 0 rgba(0,0,0,0.5), 0 0 12px ${color}70`,
            transition: "width 0.9s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>
    </div>
  );
}

interface McBadgeProps {
  children: React.ReactNode;
  variant?: "grass" | "stone" | "diamond" | "danger" | "gold" | "wood";
}

const BADGE_COLORS = {
  grass: { bg: "#143a0a", text: "#6acc40", border: "#0a2005" },
  stone: { bg: "#303030", text: "#c0c0c0", border: "#1c1c1c" },
  diamond: { bg: "#041018", text: "#20d4e8", border: "#020a10" },
  danger: { bg: "#400606", text: "#ff6666", border: "#280202" },
  gold: { bg: "#301a04", text: "#e8a020", border: "#1c0e02" },
  wood: { bg: "#281208", text: "#c89040", border: "#160802" },
};

export function McBadge({ children, variant = "stone" }: McBadgeProps) {
  const c = BADGE_COLORS[variant];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 12px",
        fontFamily: "var(--font-mc)",
        fontSize: "13px",
        fontWeight: 700,
        background: c.bg,
        color: c.text,
        borderWidth: "2px",
        borderStyle: "solid",
        borderTopColor: `${c.text}55`,
        borderLeftColor: c.border,
        borderRightColor: c.border,
        borderBottomColor: c.border,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 2px 0 ${c.border}`,
        letterSpacing: "0.06em",
        textShadow: "1px 1px 0 rgba(0,0,0,0.9)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

interface McStatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  accent?: string;
}

export function McStatCard({ label, value, icon, accent = "#20d4e8" }: McStatCardProps) {
  return (
    <McCard variant="inventory" style={{ padding: "24px 20px" }}>
      <div
        style={{
          fontFamily: "var(--font-mc)",
          fontSize: "30px",
          fontWeight: 700,
          color: accent,
          textShadow: `1px 2px 0 rgba(0,0,0,0.9)`,
          marginBottom: "8px",
        }}
      >
        {icon && <span style={{ marginRight: "10px", fontSize: "22px" }}>{icon}</span>}
        {value}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mc)",
          fontSize: "13px",
          color: "#808080",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        {label}
      </div>
    </McCard>
  );
}

interface McSectionTitleProps {
  children: React.ReactNode;
  sub?: string;
  accent?: boolean;
}

export function McSectionTitle({ children, sub, accent }: McSectionTitleProps) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <h2
        style={{
          fontFamily: "var(--font-mc)",
          fontSize: "20px",
          fontWeight: 700,
          color: accent ? "#20d4e8" : "#e0e0e0",
          textShadow: accent ? "1px 2px 0 rgba(0,0,0,0.9)" : "1px 1px 0 rgba(0,0,0,0.7)",
          letterSpacing: "0.03em",
        }}
      >
        {children}
      </h2>
      {sub && (
        <p
          style={{
            fontFamily: "var(--font-mc)",
            fontSize: "15px",
            color: "#707070",
            marginTop: "5px",
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

interface McDividerProps {
  label?: string;
}

export function McDivider({ label }: McDividerProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "14px", margin: "22px 0" }}>
      <div style={{ flex: 1, height: "2px", background: "#242424", borderTopColor: "#303030" }} />
      {label && (
        <span style={{ fontFamily: "var(--font-mc)", fontSize: "14px", color: "#545454" }}>
          {label}
        </span>
      )}
      <div style={{ flex: 1, height: "2px", background: "#242424", borderTopColor: "#303030" }} />
    </div>
  );
}

interface McModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function McModal({ open, onClose, title, children }: McModalProps) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.88)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <McCard
        variant="stone"
        style={{ width: "440px", padding: 0, maxWidth: "calc(100vw - 32px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "18px 22px",
            borderBottom: "2px solid #1e1e1e",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mc)",
              fontSize: "17px",
              fontWeight: 700,
              color: "#e0e0e0",
              textShadow: "1px 1px 0 rgba(0,0,0,0.7)",
            }}
          >
            {title}
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#606060",
              fontFamily: "var(--font-mc)",
              fontSize: "20px",
              lineHeight: 1,
              padding: "2px 8px",
              transition: "color 0.1s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ff6666")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#606060")}
          >
            ✕
          </button>
        </div>
        <div style={{ padding: "26px 22px" }}>{children}</div>
      </McCard>
    </div>
  );
}

export function McFloatingParticles({ count = 12 }: { count?: number }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${(i / count) * 100}%`,
    delay: `${(i * 0.35) % 4}s`,
    duration: `${3.5 + (i % 4) * 0.8}s`,
    size: i % 3 === 0 ? 7 : i % 2 === 0 ? 5 : 4,
    color: ["#5aaa38", "#20d4e8", "#3d8c28", "#8b5e3c", "#606060"][i % 5],
    drift: `${((i % 3) - 1) * 28}px`,
    top: `${62 + (i % 5) * 6}%`,
  }));

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {particles.map((p) => (
        <div
          key={p.id}
          style={
            {
              position: "absolute",
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.color,
              boxShadow: `0 0 6px ${p.color}99`,
              animationName: "mc-particle-rise",
              animationDuration: p.duration,
              animationDelay: p.delay,
              animationTimingFunction: "ease-out",
              animationIterationCount: "infinite",
              "--drift": p.drift,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

export function McPanorama() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, #06080e 0%, #0a1020 15%, #0e1e3a 30%, #1a3060 45%, #2a5898 58%, #3d7050 65%, #3d8c28 72%, #326818 78%, #5c3820 83%, #3a2010 87%, #221408 91%, #181010 95%, #0e0e0e 100%)`,
        }}
      />

      <svg
        style={{ position: "absolute", bottom: 0, left: 0, width: "100%", opacity: 0.95 }}
        viewBox="0 0 1400 220"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="#3d8c28">
          <rect x="0" y="100" width="80" height="80" />
          <rect x="80" y="64" width="80" height="116" />
          <rect x="160" y="80" width="80" height="100" />
          <rect x="240" y="40" width="80" height="140" />
          <rect x="320" y="96" width="80" height="84" />
          <rect x="400" y="20" width="80" height="160" />
          <rect x="480" y="56" width="80" height="124" />
          <rect x="560" y="72" width="80" height="108" />
          <rect x="640" y="0" width="80" height="180" />
          <rect x="720" y="56" width="80" height="124" />
          <rect x="800" y="88" width="80" height="92" />
          <rect x="880" y="32" width="80" height="148" />
          <rect x="960" y="16" width="80" height="164" />
          <rect x="1040" y="68" width="80" height="112" />
          <rect x="1120" y="48" width="80" height="132" />
          <rect x="1200" y="88" width="80" height="92" />
          <rect x="1280" y="36" width="80" height="144" />
          <rect x="1360" y="60" width="80" height="120" />
        </g>
        <g fill="#326818" opacity="0.9">
          <rect x="0" y="168" width="1400" height="52" />
        </g>
        <g fill="#284e12" opacity="0.7">
          <rect x="0" y="184" width="1400" height="36" />
        </g>
        <g fill="#5c3820">
          <rect x="0" y="196" width="1400" height="24" />
        </g>
        <g fill="#3a2010">
          <rect x="0" y="206" width="1400" height="14" />
        </g>
      </svg>

      <svg
        style={{
          position: "absolute",
          top: "18%",
          left: "8%",
          opacity: 0.55,
          animation: "mc-cloud-drift 70s linear infinite",
        }}
        width="140"
        height="56"
        viewBox="0 0 140 56"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="#b0c8e8">
          <rect x="16" y="16" width="96" height="40" />
          <rect x="0" y="28" width="56" height="28" />
          <rect x="84" y="28" width="56" height="28" />
          <rect x="36" y="8" width="56" height="20" />
        </g>
      </svg>
      <svg
        style={{
          position: "absolute",
          top: "15%",
          left: "62%",
          opacity: 0.38,
          animation: "mc-cloud-drift 100s linear infinite",
          animationDelay: "-38s",
        }}
        width="96"
        height="40"
        viewBox="0 0 96 40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="#b0c8e8">
          <rect x="10" y="10" width="68" height="30" />
          <rect x="0" y="20" width="38" height="20" />
          <rect x="58" y="20" width="38" height="20" />
        </g>
      </svg>

      <div
        style={{
          position: "absolute",
          top: "48%",
          left: 0,
          right: 0,
          height: "100px",
          background: "linear-gradient(180deg, rgba(42,88,152,0.18) 0%, transparent 100%)",
          animation: "mc-fog-drift 20s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 55%, transparent 25%, rgba(0,0,0,0.65) 100%)",
        }}
      />
      <div style={{ position: "absolute", inset: 0, background: "rgba(8,10,14,0.3)" }} />
    </div>
  );
}

function NetherPanorama() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, #0a0000 0%, #1a0400 15%, #2d0800 30%, #4a0e00 45%, #6b1500 58%, #3d0a00 70%, #1e0500 82%, #0d0200 92%, #050000 100%)",
        }}
      />
      <svg
        style={{ position: "absolute", bottom: 0, left: 0, width: "100%", opacity: 0.95 }}
        viewBox="0 0 1400 220"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="#3d0a00">
          <rect x="0" y="110" width="80" height="110" />
          <rect x="80" y="74" width="80" height="146" />
          <rect x="160" y="90" width="80" height="130" />
          <rect x="240" y="50" width="80" height="170" />
          <rect x="320" y="106" width="80" height="114" />
          <rect x="400" y="30" width="80" height="190" />
          <rect x="480" y="66" width="80" height="154" />
          <rect x="560" y="82" width="80" height="138" />
          <rect x="640" y="10" width="80" height="210" />
          <rect x="720" y="66" width="80" height="154" />
          <rect x="800" y="98" width="80" height="122" />
          <rect x="880" y="42" width="80" height="178" />
          <rect x="960" y="26" width="80" height="194" />
          <rect x="1040" y="78" width="80" height="142" />
          <rect x="1120" y="58" width="80" height="162" />
          <rect x="1200" y="98" width="80" height="122" />
          <rect x="1280" y="46" width="80" height="174" />
          <rect x="1360" y="70" width="80" height="150" />
        </g>
        <g fill="#5c1400" opacity="0.9">
          <rect x="0" y="178" width="1400" height="42" />
        </g>
        <g fill="#7a1e00" opacity="0.6">
          <rect x="0" y="194" width="1400" height="26" />
        </g>
        <g fill="#4a0800">
          <rect x="0" y="206" width="1400" height="14" />
        </g>
      </svg>
      {[
        { x: "12%", y: "55%", size: 18, delay: "0s" },
        { x: "28%", y: "70%", size: 12, delay: "1.2s" },
        { x: "45%", y: "60%", size: 20, delay: "0.5s" },
        { x: "67%", y: "65%", size: 14, delay: "2s" },
        { x: "82%", y: "58%", size: 16, delay: "0.8s" },
        { x: "91%", y: "72%", size: 10, delay: "1.5s" },
      ].map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, #ff6600 0%, #cc3300 50%, transparent 70%)`,
            borderRadius: "50%",
            opacity: 0.7,
            animation: `mc-pulse-glow ${1.5 + i * 0.3}s ease-in-out ${p.delay} infinite`,
            boxShadow: "0 0 20px #ff440088, 0 0 40px #cc220044",
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 60%, rgba(180,40,0,0.12) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 55%, transparent 25%, rgba(0,0,0,0.75) 100%)",
        }}
      />
    </div>
  );
}

function OceanPanorama() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, #000810 0%, #000e1e 10%, #011428 22%, #021e3d 35%, #032855 48%, #043570 60%, #053c7e 70%, #032055 80%, #020e2e 90%, #010814 100%)",
        }}
      />
      <svg
        style={{ position: "absolute", bottom: 0, left: 0, width: "100%", opacity: 0.9 }}
        viewBox="0 0 1400 240"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="#043570">
          <rect x="0" y="140" width="80" height="100" />
          <rect x="80" y="104" width="80" height="136" />
          <rect x="160" y="120" width="80" height="120" />
          <rect x="240" y="80" width="80" height="160" />
          <rect x="320" y="136" width="80" height="104" />
          <rect x="400" y="60" width="80" height="180" />
          <rect x="480" y="96" width="80" height="144" />
          <rect x="560" y="112" width="80" height="128" />
          <rect x="640" y="40" width="80" height="200" />
          <rect x="720" y="96" width="80" height="144" />
          <rect x="800" y="128" width="80" height="112" />
          <rect x="880" y="72" width="80" height="168" />
          <rect x="960" y="56" width="80" height="184" />
          <rect x="1040" y="108" width="80" height="132" />
          <rect x="1120" y="88" width="80" height="152" />
          <rect x="1200" y="128" width="80" height="112" />
          <rect x="1280" y="76" width="80" height="164" />
          <rect x="1360" y="100" width="80" height="140" />
        </g>
        <g fill="#021e3d" opacity="0.9">
          <rect x="0" y="200" width="1400" height="40" />
        </g>
        <g fill="#032855" opacity="0.6">
          <rect x="0" y="215" width="1400" height="25" />
        </g>
        <g fill="#020e1e">
          <rect x="0" y="226" width="1400" height="14" />
        </g>
        <g fill="#20d4e8" opacity="0.15">
          <rect x="120" y="185" width="6" height="6" />
          <rect x="280" y="170" width="8" height="8" />
          <rect x="440" y="178" width="6" height="6" />
          <rect x="600" y="165" width="10" height="10" />
          <rect x="760" y="180" width="6" height="6" />
          <rect x="920" y="172" width="8" height="8" />
          <rect x="1080" y="168" width="6" height="6" />
          <rect x="1240" y="176" width="8" height="8" />
        </g>
      </svg>
      {[
        { cx: "15%", cy: "75%", r: 60, color: "#20d4e8", delay: "0s" },
        { cx: "42%", cy: "80%", r: 45, color: "#0a88a0", delay: "1.8s" },
        { cx: "70%", cy: "72%", r: 70, color: "#20d4e8", delay: "0.9s" },
        { cx: "88%", cy: "78%", r: 50, color: "#0a88a0", delay: "2.4s" },
      ].map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: b.cx,
            top: b.cy,
            width: b.r * 2,
            height: b.r * 2,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${b.color}18 0%, transparent 70%)`,
            transform: "translate(-50%, -50%)",
            animation: `mc-float ${3 + i * 0.7}s ease-in-out ${b.delay} infinite`,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(32,212,232,0.06) 0%, transparent 65%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 55%, transparent 25%, rgba(0,0,0,0.8) 100%)",
        }}
      />
    </div>
  );
}

function EndPanorama() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, #000000 0%, #040008 15%, #080010 30%, #0e0018 48%, #140022 62%, #0a0018 75%, #060010 88%, #020008 100%)",
        }}
      />
      <svg
        style={{ position: "absolute", bottom: 0, left: 0, width: "100%", opacity: 0.85 }}
        viewBox="0 0 1400 220"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="#1a0030">
          <rect x="0" y="120" width="80" height="100" />
          <rect x="80" y="84" width="80" height="136" />
          <rect x="160" y="100" width="80" height="120" />
          <rect x="240" y="60" width="80" height="160" />
          <rect x="320" y="116" width="80" height="104" />
          <rect x="400" y="40" width="80" height="180" />
          <rect x="480" y="76" width="80" height="144" />
          <rect x="560" y="92" width="80" height="128" />
          <rect x="640" y="20" width="80" height="200" />
          <rect x="720" y="76" width="80" height="144" />
          <rect x="800" y="108" width="80" height="112" />
          <rect x="880" y="52" width="80" height="168" />
          <rect x="960" y="36" width="80" height="184" />
          <rect x="1040" y="88" width="80" height="132" />
          <rect x="1120" y="68" width="80" height="152" />
          <rect x="1200" y="108" width="80" height="112" />
          <rect x="1280" y="56" width="80" height="164" />
          <rect x="1360" y="80" width="80" height="140" />
        </g>
        <g fill="#0e0020" opacity="0.95">
          <rect x="0" y="186" width="1400" height="34" />
        </g>
        <g fill="#080018" opacity="0.8">
          <rect x="0" y="202" width="1400" height="18" />
        </g>
        <g fill="#050010">
          <rect x="0" y="212" width="1400" height="8" />
        </g>
      </svg>
      {Array.from({ length: 28 }, (_, i) => ({
        x: `${(i * 37 + 5) % 95}%`,
        y: `${(i * 23 + 8) % 55}%`,
        size: 1 + (i % 3),
        delay: `${(i * 0.4) % 4}s`,
        dur: `${2 + (i % 3)}s`,
      })).map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            background: "#d4a0ff",
            boxShadow: "0 0 4px #b060ff",
            animation: `mc-blink ${s.dur} ${s.delay} infinite`,
          }}
        />
      ))}
      {[
        { x: "20%", y: "65%", color: "#b060ff" },
        { x: "55%", y: "70%", color: "#8040cc" },
        { x: "78%", y: "62%", color: "#b060ff" },
      ].map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: 80,
            height: 80,
            background: `radial-gradient(circle, ${p.color}20 0%, transparent 70%)`,
            transform: "translate(-50%, -50%)",
            animation: `mc-float ${4 + i}s ease-in-out ${i * 1.2}s infinite`,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 55%, transparent 25%, rgba(0,0,0,0.85) 100%)",
        }}
      />
    </div>
  );
}

function ForestPanorama() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, #010802 0%, #020e04 12%, #041408 25%, #061c0a 38%, #081e0c 52%, #0a2810 64%, #061808 76%, #040e05 88%, #020804 100%)",
        }}
      />
      <svg
        style={{ position: "absolute", bottom: 0, left: 0, width: "100%", opacity: 0.95 }}
        viewBox="0 0 1400 260"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="#1a4a08">
          <rect x="0" y="60" width="80" height="200" />
          <rect x="80" y="20" width="80" height="240" />
          <rect x="160" y="40" width="80" height="220" />
          <rect x="240" y="0" width="80" height="260" />
          <rect x="320" y="56" width="80" height="204" />
          <rect x="400" y="10" width="80" height="250" />
          <rect x="480" y="30" width="80" height="230" />
          <rect x="560" y="44" width="80" height="216" />
          <rect x="640" y="0" width="80" height="260" />
          <rect x="720" y="28" width="80" height="232" />
          <rect x="800" y="52" width="80" height="208" />
          <rect x="880" y="8" width="80" height="252" />
          <rect x="960" y="16" width="80" height="244" />
          <rect x="1040" y="38" width="80" height="222" />
          <rect x="1120" y="22" width="80" height="238" />
          <rect x="1200" y="50" width="80" height="210" />
          <rect x="1280" y="12" width="80" height="248" />
          <rect x="1360" y="34" width="80" height="226" />
        </g>
        <g fill="#0e3004" opacity="0.9">
          <rect x="0" y="200" width="1400" height="60" />
        </g>
        <g fill="#2d6a10" opacity="0.5">
          <rect x="0" y="180" width="1400" height="30" />
        </g>
        <g fill="#061808" opacity="0.8">
          <rect x="0" y="222" width="1400" height="38" />
        </g>
      </svg>
      {[
        { x: "8%", y: "40%", delay: "0s" },
        { x: "22%", y: "35%", delay: "0.8s" },
        { x: "38%", y: "42%", delay: "1.6s" },
        { x: "55%", y: "38%", delay: "0.4s" },
        { x: "72%", y: "44%", delay: "1.2s" },
        { x: "88%", y: "37%", delay: "2s" },
      ].map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: 6,
            height: 6,
            background: "#78cc50",
            boxShadow: "0 0 8px #5aaa3880",
            animation: `mc-float ${2.5 + i * 0.4}s ease-in-out ${p.delay} infinite`,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(58,152,40,0.08) 0%, transparent 65%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 55%, transparent 20%, rgba(0,0,0,0.82) 100%)",
        }}
      />
    </div>
  );
}

function DesertPanorama() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, #0a0600 0%, #140c02 12%, #1e1204 24%, #2a1a06 36%, #3a2408 48%, #4a2e0a 58%, #3a2408 68%, #281a06 78%, #180e02 88%, #0c0800 100%)",
        }}
      />
      <svg
        style={{ position: "absolute", bottom: 0, left: 0, width: "100%", opacity: 0.95 }}
        viewBox="0 0 1400 180"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="#7a5020">
          <rect x="0" y="120" width="120" height="60" />
          <rect x="100" y="100" width="200" height="80" />
          <rect x="280" y="130" width="160" height="50" />
          <rect x="420" y="90" width="180" height="90" />
          <rect x="580" y="115" width="140" height="65" />
          <rect x="700" y="80" width="200" height="100" />
          <rect x="880" y="110" width="160" height="70" />
          <rect x="1020" y="95" width="180" height="85" />
          <rect x="1180" y="120" width="140" height="60" />
          <rect x="1300" y="100" width="100" height="80" />
        </g>
        <g fill="#5c3a14" opacity="0.9">
          <rect x="0" y="154" width="1400" height="26" />
        </g>
        <g fill="#e8a020" opacity="0.12">
          <rect x="0" y="148" width="1400" height="8" />
        </g>
        <g fill="#3a2408">
          <rect x="0" y="168" width="1400" height="12" />
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "70%",
          width: 80,
          height: 80,
          background: "radial-gradient(circle, #e8a02030 0%, #c87010 20%, transparent 65%)",
          borderRadius: "50%",
          boxShadow: "0 0 60px #e8a02040, 0 0 120px #c8701020",
          animation: "mc-float 6s ease-in-out infinite",
        }}
      />
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${15 + i * 22}%`,
            top: `${30 + (i % 2) * 15}%`,
            width: 3,
            height: 3,
            background: "#e8a020",
            opacity: 0.3 + i * 0.05,
            animation: `mc-blink ${2 + i * 0.5}s ease-in-out ${i * 0.7}s infinite`,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 65% 30%, rgba(232,160,32,0.1) 0%, transparent 55%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 55%, transparent 25%, rgba(0,0,0,0.78) 100%)",
        }}
      />
    </div>
  );
}

function IcePanorama() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, #000408 0%, #010810 10%, #020c18 22%, #030e20 34%, #04122a 46%, #050e22 58%, #030a18 70%, #020610 82%, #010408 92%, #000204 100%)",
        }}
      />
      <svg
        style={{ position: "absolute", bottom: 0, left: 0, width: "100%", opacity: 0.95 }}
        viewBox="0 0 1400 200"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="#0a2040">
          <rect x="0" y="100" width="80" height="100" />
          <rect x="80" y="64" width="80" height="136" />
          <rect x="160" y="80" width="80" height="120" />
          <rect x="240" y="40" width="80" height="160" />
          <rect x="320" y="96" width="80" height="104" />
          <rect x="400" y="20" width="80" height="180" />
          <rect x="480" y="56" width="80" height="144" />
          <rect x="560" y="72" width="80" height="128" />
          <rect x="640" y="0" width="80" height="200" />
          <rect x="720" y="56" width="80" height="144" />
          <rect x="800" y="88" width="80" height="112" />
          <rect x="880" y="32" width="80" height="168" />
          <rect x="960" y="16" width="80" height="184" />
          <rect x="1040" y="68" width="80" height="132" />
          <rect x="1120" y="48" width="80" height="152" />
          <rect x="1200" y="88" width="80" height="112" />
          <rect x="1280" y="36" width="80" height="164" />
          <rect x="1360" y="60" width="80" height="140" />
        </g>
        <g fill="#061828" opacity="0.9">
          <rect x="0" y="170" width="1400" height="30" />
        </g>
        <g fill="#88ccff" opacity="0.08">
          <rect x="0" y="162" width="1400" height="10" />
        </g>
        <g fill="#040e18">
          <rect x="0" y="188" width="1400" height="12" />
        </g>
        <g fill="#88ccff" opacity="0.2">
          {[80, 180, 280, 420, 560, 680, 820, 960, 1100, 1240, 1360].map((x, i) => (
            <rect
              key={i}
              x={x}
              y={155 + (i % 3) * 4}
              width={20 + (i % 4) * 8}
              height={10 + (i % 3) * 5}
            />
          ))}
        </g>
      </svg>
      {Array.from({ length: 20 }, (_, i) => ({
        x: `${(i * 5 + 2) % 96}%`,
        y: `${(i * 7 + 5) % 60}%`,
        size: 2 + (i % 3),
        delay: `${(i * 0.3) % 3}s`,
      })).map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            background: "#88ccff",
            opacity: 0.3 + (i % 4) * 0.1,
            boxShadow: "0 0 4px #88ccff60",
            animation: `mc-float ${3 + (i % 4)}s ease-in-out ${s.delay} infinite`,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(136,204,255,0.07) 0%, transparent 65%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 55%, transparent 25%, rgba(0,0,0,0.82) 100%)",
        }}
      />
    </div>
  );
}

const THEME_PANORAMA_MAP: Record<string, () => React.ReactElement> = {
  "Nether Fortress": NetherPanorama,
  "Ocean Monument": OceanPanorama,
  "End Cities": EndPanorama,
  "Forest Biome": ForestPanorama,
  "Desert Temple": DesertPanorama,
  "Ice Plains": IcePanorama,
};

export function McWorldBackground({ themeName }: { themeName?: string | null }) {
  const PanoramaComponent = themeName ? (THEME_PANORAMA_MAP[themeName] ?? null) : null;
  if (PanoramaComponent) return <PanoramaComponent />;
  return <McPanorama />;
}

interface McNavLinkProps {
  href: string;
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function McNavLink({ href, active, children, onClick }: McNavLinkProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={href}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "8px 18px",
        fontFamily: "var(--font-mc)",
        fontSize: "15px",
        fontWeight: 700,
        color: active ? "#20d4e8" : hovered ? "#e8e8e8" : "#a0a0a0",
        textShadow: active ? "1px 1px 0 rgba(0,0,0,0.9)" : "none",
        background: active ? "#2e2e2e" : hovered ? "#262626" : "transparent",
        borderWidth: "2px",
        borderStyle: "solid",
        borderTopColor: "transparent",
        borderLeftColor: active ? "#424242" : "transparent",
        borderRightColor: active ? "#424242" : "transparent",
        borderBottomColor: active ? "#20d4e8" : "transparent",
        boxShadow: active ? "inset 0 1px 0 rgba(255,255,255,0.04)" : "none",
        letterSpacing: "0.03em",
        transition: "all 0.1s",
        cursor: "pointer",
        textDecoration: "none",
      }}
    >
      {children}
    </Link>
  );
}

export function McSplashText({ texts }: { texts: string[] }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % texts.length), 5000);
    return () => clearInterval(t);
  }, [texts.length]);
  return (
    <div
      style={{
        fontFamily: "var(--font-mc)",
        fontSize: "18px",
        fontWeight: 700,
        color: "#20d4e8",
        textShadow: "1px 2px 0 rgba(0,0,0,0.9), 0 0 20px rgba(32,212,232,0.4)",
        transform: "rotate(-5deg)",
        display: "inline-block",
        letterSpacing: "0.02em",
        animation: "mc-pulse-glow 2.2s ease-in-out infinite",
      }}
    >
      {texts[idx]}!
    </div>
  );
}

interface McTopNavProps {
  pathname: string;
  userName: string;
  userRole?: string;
  onLogout: () => void;
  logoutPending?: boolean;
}

export function McTopNav({ pathname, userName, userRole, onLogout, logoutPending }: McTopNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", active: pathname === "/dashboard" },
    { href: "/dashboard/forms", label: "Forms", active: pathname.startsWith("/dashboard/forms") },
    {
      href: "/dashboard/profile",
      label: "Profile",
      active: pathname.startsWith("/dashboard/profile"),
    },
    ...(userRole === "admin"
      ? [
          {
            href: "/dashboard/admin",
            label: "Admin",
            active: pathname.startsWith("/dashboard/admin"),
          },
        ]
      : []),
  ];

  return (
    <nav style={{ position: "relative", zIndex: 20 }}>
      <div
        style={{
          borderBottom: "2px solid #1e1e1e",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "60px",
          background: "#242424",
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("/textures/stone_texture.webp")`,
          backgroundSize: "auto, 32px 32px",
          boxShadow: "0 3px 0 #121212, inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Link
            href="/dashboard"
            style={{
              fontFamily: "var(--font-mc)",
              fontWeight: 700,
              fontSize: "22px",
              marginRight: "20px",
              color: "#5aaa38",
              textShadow: "1px 2px 0 rgba(0,0,0,0.9)",
              letterSpacing: "0.03em",
            }}
          >
            ⛏ FormCraft
          </Link>
          <div
            className="mc-desktop-nav"
            style={{ display: "flex", alignItems: "center", gap: "4px" }}
          >
            {navLinks.map((l) => (
              <McNavLink key={l.href} href={l.href} active={l.active}>
                {l.label}
              </McNavLink>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span
            className="mc-desktop-nav"
            style={{ fontFamily: "var(--font-mc)", fontSize: "15px", color: "#909090" }}
          >
            👤 {userName}
          </span>
          <button
            className="mc-desktop-nav"
            onClick={onLogout}
            disabled={logoutPending}
            style={{
              fontFamily: "var(--font-mc)",
              fontSize: "14px",
              fontWeight: 700,
              color: "#888888",
              background: "none",
              border: "2px solid transparent",
              cursor: "pointer",
              padding: "6px 14px",
              letterSpacing: "0.03em",
              transition: "all 0.1s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ff6666";
              e.currentTarget.style.borderColor = "#5a0a0a";
              e.currentTarget.style.background = "#280808";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#888888";
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.background = "none";
            }}
          >
            {logoutPending ? "..." : "Sign Out"}
          </button>

          <button
            className="mc-mobile-menu-btn"
            onClick={() => setMobileOpen((o) => !o)}
            style={{
              display: "none",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "5px",
              width: "40px",
              height: "40px",
              background: mobileOpen ? "#303030" : "#2a2a2a",
              border: "2px solid #3a3a3a",
              borderTopColor: "#484848",
              cursor: "pointer",
              flexShrink: 0,
              boxShadow: "0 3px 0 #111",
            }}
            aria-label="Menu"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  display: "block",
                  width: "18px",
                  height: "2px",
                  background: "#c0c0c0",
                  transition: "all 0.15s",
                  transform: mobileOpen
                    ? i === 0
                      ? "translateY(7px) rotate(45deg)"
                      : i === 2
                        ? "translateY(-7px) rotate(-45deg)"
                        : "scaleX(0)"
                    : "none",
                }}
              />
            ))}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          style={{
            position: "absolute",
            top: "60px",
            left: 0,
            right: 0,
            background: "#1e1e1e",
            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("/textures/stone_texture.webp")`,
            backgroundSize: "auto, 32px 32px",
            borderBottom: "2px solid #1a1a1a",
            boxShadow: "0 6px 0 #0a0a0a",
            padding: "12px 0",
            animation: "mc-slide-in 0.15s ease-out",
          }}
        >
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "block",
                padding: "12px 24px",
                fontFamily: "var(--font-mc)",
                fontSize: "15px",
                fontWeight: 700,
                color: l.active ? "#20d4e8" : "#a0a0a0",
                borderBottom: "1px solid #282828",
                letterSpacing: "0.03em",
                transition: "all 0.1s",
                background: l.active ? "rgba(32,212,232,0.06)" : "transparent",
              }}
            >
              {l.label}
            </Link>
          ))}
          <div
            style={{
              padding: "12px 24px",
              borderTop: "2px solid #282828",
              marginTop: "4px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontFamily: "var(--font-mc)", fontSize: "14px", color: "#606060" }}>
              👤 {userName}
            </span>
            <button
              onClick={onLogout}
              disabled={logoutPending}
              style={{
                fontFamily: "var(--font-mc)",
                fontSize: "13px",
                fontWeight: 700,
                color: "#ff6666",
                background: "#280808",
                border: "2px solid #5a0a0a",
                cursor: "pointer",
                padding: "6px 14px",
                letterSpacing: "0.03em",
              }}
            >
              {logoutPending ? "..." : "Sign Out"}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export function McPublicNav() {
  return (
    <nav
      style={{
        borderBottom: "2px solid #1e1e1e",
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "64px",
        background: "rgba(22,22,22,0.97)",
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("/textures/stone_texture.webp")`,
        backgroundSize: "auto, 32px 32px",
        boxShadow: "0 3px 0 #0e0e0e, inset 0 1px 0 rgba(255,255,255,0.04)",
        position: "relative",
        zIndex: 20,
        backdropFilter: "blur(6px)",
      }}
    >
      <Link
        href="/"
        style={{
          fontFamily: "var(--font-mc)",
          fontSize: "24px",
          fontWeight: 700,
          color: "#5aaa38",
          textShadow: "1px 2px 0 rgba(0,0,0,0.95)",
          letterSpacing: "0.03em",
          textDecoration: "none",
        }}
      >
        ⛏ FormCraft
      </Link>
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <McNavLink href="/explore">Explore</McNavLink>
        <McNavLink href="/pricing">Pricing</McNavLink>
        <McNavLink href="/login">Login</McNavLink>
        <McLinkButton href="/register" variant="grass" size="sm">
          Get Started
        </McLinkButton>
      </div>
    </nav>
  );
}

interface McIconBtnProps {
  onClick?: () => void;
  title: string;
  icon: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  size?: number;
}

export function McIconBtn({ onClick, title, icon, danger, disabled, size = 36 }: McIconBtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: `${size}px`,
        height: `${size}px`,
        background: danger ? "#3a0808" : "#2a2a2a",
        color: danger ? "#ff6666" : "#a0a0a0",
        border: `2px solid ${danger ? "#5a0a0a" : "#3a3a3a"}`,
        borderTopColor: danger ? "#7a1010" : "#484848",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        boxShadow: "0 3px 0 #111, inset 0 1px 0 rgba(255,255,255,0.06)",
        transition: "all 0.08s",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = danger ? "#5a1010" : "#383838";
        e.currentTarget.style.color = danger ? "#ff8888" : "#e0e0e0";
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = `0 4px 0 #111, inset 0 1px 0 rgba(255,255,255,0.08)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = danger ? "#3a0808" : "#2a2a2a";
        e.currentTarget.style.color = danger ? "#ff6666" : "#a0a0a0";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 3px 0 #111, inset 0 1px 0 rgba(255,255,255,0.06)";
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = "translateY(2px)";
        e.currentTarget.style.boxShadow = "0 1px 0 #111, inset 0 2px 4px rgba(0,0,0,0.6)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 4px 0 #111, inset 0 1px 0 rgba(255,255,255,0.08)";
      }}
    >
      {icon}
    </button>
  );
}

interface McIconLinkProps {
  href: string;
  title: string;
  icon: React.ReactNode;
  external?: boolean;
  size?: number;
}

export function McIconLink({ href, title, icon, external, size = 36 }: McIconLinkProps) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: `${size}px`,
        height: `${size}px`,
        background: "#2a2a2a",
        color: "#a0a0a0",
        border: "2px solid #3a3a3a",
        borderTopColor: "#484848",
        cursor: "pointer",
        boxShadow: "0 3px 0 #111, inset 0 1px 0 rgba(255,255,255,0.06)",
        transition: "all 0.08s",
        flexShrink: 0,
        textDecoration: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#383838";
        e.currentTarget.style.color = "#e0e0e0";
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 4px 0 #111, inset 0 1px 0 rgba(255,255,255,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#2a2a2a";
        e.currentTarget.style.color = "#a0a0a0";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 3px 0 #111, inset 0 1px 0 rgba(255,255,255,0.06)";
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = "translateY(2px)";
        e.currentTarget.style.boxShadow = "0 1px 0 #111, inset 0 2px 4px rgba(0,0,0,0.6)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 4px 0 #111, inset 0 1px 0 rgba(255,255,255,0.08)";
      }}
    >
      {icon}
    </Link>
  );
}

export function McDeleteModal({
  open,
  onConfirm,
  onCancel,
  isPending,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <McModal open={open} onClose={onCancel} title="⚠ Delete Account">
      <p
        style={{
          fontFamily: "var(--font-mc)",
          fontSize: "16px",
          color: "#c8c8c8",
          marginBottom: "12px",
          lineHeight: 1.6,
        }}
      >
        Your account will be scheduled for permanent deletion in{" "}
        <strong style={{ color: "#ff6666" }}>7 days</strong>.
      </p>
      <p
        style={{
          fontFamily: "var(--font-mc)",
          fontSize: "15px",
          color: "#686868",
          marginBottom: "28px",
          lineHeight: 1.6,
        }}
      >
        Log back in within 7 days to recover it. A confirmation email will be sent.
      </p>
      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
        <McButton variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </McButton>
        <McButton variant="danger" size="sm" onClick={onConfirm} disabled={isPending}>
          {isPending ? "Processing..." : "Yes, delete my account"}
        </McButton>
      </div>
    </McModal>
  );
}

export function McAchievementToast({ message, icon = "🏆" }: { message: string; icon?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "16px 20px",
        borderWidth: "2px",
        borderStyle: "solid",
        borderTopColor: "#40e8f8",
        borderLeftColor: "#20d4e8",
        borderRightColor: "#20d4e8",
        borderBottomColor: "#20d4e8",
        boxShadow: "0 0 28px rgba(32,212,232,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
        fontFamily: "var(--font-mc)",
        fontSize: "15px",
        color: "#20d4e8",
        textShadow: "1px 1px 0 rgba(0,0,0,0.8)",
      }}
    >
      <span style={{ fontSize: "26px" }}>{icon}</span>
      <div>
        <div
          style={{
            fontSize: "12px",
            color: "#407878",
            marginBottom: "3px",
            letterSpacing: "0.07em",
          }}
        >
          ACHIEVEMENT UNLOCKED
        </div>
        {message}
      </div>
    </div>
  );
}
