"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowUp, ArrowDown, X, Plus, Globe, Link2, Eye, ChevronDown } from "lucide-react";
import {
  McCard,
  McButton,
  McLinkButton,
  McBadge,
  McSectionTitle,
  McFloatingParticles,
  McDivider,
} from "~/components/mc";
import {
  useForm,
  useFormThemes,
  useUpdateForm,
  useUpdateFormFields,
  usePublishForm,
} from "~/hooks/api/forms";
import { useInvalidateCache } from "~/hooks/api/useInvalidateCache";

type FieldType =
  | "short_text"
  | "long_text"
  | "email"
  | "number"
  | "single_select"
  | "multi_select"
  | "checkbox"
  | "dropdown"
  | "rating"
  | "date"
  | "page_break";

type ConditionalOperator = "equals" | "not_equals" | "contains";

interface ConditionalLogic {
  showIf?: { fieldId: string; operator: ConditionalOperator; value: string };
}

interface LocalField {
  _key: string;
  label: string;
  description: string;
  fieldType: FieldType;
  placeholder: string;
  required: boolean;
  orderIndex: number;
  validationRules: Record<string, unknown>;
  config: { options: string[]; max?: number; conditionalLogic?: ConditionalLogic };
}

type Params = { formId: string };
type EditorTab = "editor" | "logic";
type AccordionSection = "appearance" | "identity" | "access" | "behaviour" | null;

interface ThemeData {
  id: string;
  name: string;
  description: string | null;
  primaryColor: string | null;
  backgroundColor: string | null;
  textColor: string | null;
}

interface RawFieldConfig {
  options?: string[];
  max?: number;
  conditionalLogic?: ConditionalLogic;
}

interface FormShape {
  title: string;
  description: string | null;
  successMessage: string | null;
  collectEmail: boolean | null;
  allowMultipleSubmissions: boolean | null;
  themeId: string | null;
  slug: string | null;
  expiresAt: string | null;
  responseLimit: number | null;
  closedMessage: string | null;
  status: string;
  isPasswordProtected: boolean | null;
  fields: Array<{
    label: string;
    description: string | null;
    fieldType: string;
    placeholder: string | null;
    required: boolean | null;
    orderIndex: number;
    validationRules: Record<string, number | string | boolean | null | undefined>;
    config: RawFieldConfig | null;
  }>;
}

const FIELD_TYPES: { value: FieldType; label: string; icon: string }[] = [
  { value: "short_text", label: "Short Text", icon: "📝" },
  { value: "long_text", label: "Long Text", icon: "📄" },
  { value: "email", label: "Email", icon: "📧" },
  { value: "number", label: "Number", icon: "#" },
  { value: "single_select", label: "Single Select", icon: "⊙" },
  { value: "multi_select", label: "Multi Select", icon: "☑" },
  { value: "checkbox", label: "Checkbox", icon: "✓" },
  { value: "dropdown", label: "Dropdown", icon: "▼" },
  { value: "rating", label: "Rating", icon: "⭐" },
  { value: "date", label: "Date", icon: "📅" },
  { value: "page_break", label: "Page Break", icon: "—" },
];

const CONDITION_OPERATORS: { value: ConditionalOperator; label: string }[] = [
  { value: "equals", label: "equals" },
  { value: "not_equals", label: "does not equal" },
  { value: "contains", label: "contains" },
];

function buildThemedInputStyle(theme: ThemeData | null): React.CSSProperties {
  if (!theme) return MC_INPUT;
  const bg = theme.backgroundColor ?? "#0e0e0e";
  return {
    ...MC_INPUT,
    background: bg,
    color: theme.textColor ?? "#e8e8e8",
    borderTopColor: adjustColor(bg, 10),
    borderLeftColor: adjustColor(bg, 15),
    borderRightColor: adjustColor(bg, 15),
    borderBottomColor: adjustColor(bg, 15),
  };
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

const MC_INPUT: React.CSSProperties = {
  fontFamily: "var(--font-mc)",
  fontSize: "14px",
  padding: "9px 12px",
  background: "#0e0e0e",
  color: "#e8e8e8",
  borderWidth: "2px",
  borderStyle: "solid",
  borderTopColor: "#1e1e1e",
  borderLeftColor: "#2a2a2a",
  borderRightColor: "#2a2a2a",
  borderBottomColor: "#2a2a2a",
  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.8)",
  outline: "none",
  width: "100%",
  letterSpacing: "0.02em",
};

const MC_LABEL: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-mc)",
  fontSize: "11px",
  fontWeight: 700,
  color: "#606060",
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  marginBottom: "4px",
  marginTop: "12px",
};

function themedLabel(theme: ThemeData | null): React.CSSProperties {
  if (!theme) return MC_LABEL;
  return { ...MC_LABEL, color: adjustColor(theme.primaryColor ?? "#606060", -20) };
}

function McFieldInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & { theme?: ThemeData | null },
) {
  const { theme, ...rest } = props;
  const baseStyle = theme ? buildThemedInputStyle(theme) : MC_INPUT;
  const primary = theme?.primaryColor ?? "#3a9828";
  return (
    <input
      {...rest}
      style={{ ...baseStyle, ...rest.style }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = primary;
        e.currentTarget.style.boxShadow = `inset 0 2px 4px rgba(0,0,0,0.8), 0 0 0 2px ${primary}40`;
        rest.onFocus?.(e);
      }}
      onBlur={(e) => {
        const bg = theme?.backgroundColor ?? "#0e0e0e";
        e.currentTarget.style.borderTopColor = adjustColor(bg, 10);
        e.currentTarget.style.borderLeftColor = adjustColor(bg, 15);
        e.currentTarget.style.borderRightColor = adjustColor(bg, 15);
        e.currentTarget.style.borderBottomColor = adjustColor(bg, 15);
        e.currentTarget.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.8)";
        rest.onBlur?.(e);
      }}
    />
  );
}

function McFieldTextarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { theme?: ThemeData | null },
) {
  const { theme, ...rest } = props;
  const baseStyle = theme ? buildThemedInputStyle(theme) : MC_INPUT;
  const primary = theme?.primaryColor ?? "#3a9828";
  return (
    <textarea
      {...rest}
      style={{ ...baseStyle, minHeight: "64px", resize: "vertical", ...rest.style }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = primary;
        e.currentTarget.style.boxShadow = `inset 0 2px 4px rgba(0,0,0,0.8), 0 0 0 2px ${primary}40`;
        rest.onFocus?.(e);
      }}
      onBlur={(e) => {
        const bg = theme?.backgroundColor ?? "#0e0e0e";
        e.currentTarget.style.borderTopColor = adjustColor(bg, 10);
        e.currentTarget.style.borderLeftColor = adjustColor(bg, 15);
        e.currentTarget.style.borderRightColor = adjustColor(bg, 15);
        e.currentTarget.style.borderBottomColor = adjustColor(bg, 15);
        e.currentTarget.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.8)";
        rest.onBlur?.(e);
      }}
    />
  );
}

function McFieldSelect(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & { theme?: ThemeData | null },
) {
  const { theme, ...rest } = props;
  const baseStyle = theme ? buildThemedInputStyle(theme) : MC_INPUT;
  return (
    <select
      {...rest}
      style={{
        ...baseStyle,
        cursor: "pointer",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23606060' d='M0 0l6 8 6-8z'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
        paddingRight: "32px",
        ...rest.style,
      }}
    />
  );
}

function makeKey() {
  return Math.random().toString(36).slice(2);
}

function defaultField(orderIndex: number): LocalField {
  return {
    _key: makeKey(),
    label: "",
    description: "",
    fieldType: "short_text",
    placeholder: "",
    required: false,
    orderIndex,
    validationRules: {},
    config: { options: [] },
  };
}

function McCheckRow({
  checked,
  onChange,
  label,
  theme,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  theme?: ThemeData | null;
}) {
  const primary = theme?.primaryColor ?? "#3a9828";
  const primaryDark = adjustColor(primary, -20);
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        cursor: "pointer",
        fontFamily: "var(--font-mc)",
        fontSize: "13px",
        color: theme?.textColor ? adjustColor(theme.textColor, -30) : "#a0a0a0",
        marginTop: "12px",
        userSelect: "none",
      }}
    >
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: "18px",
          height: "18px",
          flexShrink: 0,
          background: checked ? primaryDark : "#0e0e0e",
          borderWidth: "2px",
          borderStyle: "solid",
          borderTopColor: checked ? primary : "#1e1e1e",
          borderLeftColor: checked ? primary : "#2a2a2a",
          borderRightColor: checked ? primaryDark : "#2a2a2a",
          borderBottomColor: checked ? primaryDark : "#2a2a2a",
          boxShadow: checked
            ? `inset 0 2px 0 rgba(0,0,0,0.5), 0 0 8px ${primary}50`
            : "inset 0 2px 4px rgba(0,0,0,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.1s",
          cursor: "pointer",
        }}
      >
        {checked && (
          <span style={{ color: primary, fontSize: "12px", fontWeight: 700, lineHeight: 1 }}>
            ✓
          </span>
        )}
      </div>
      <span onClick={() => onChange(!checked)}>{label}</span>
    </label>
  );
}

function AccordionHeader({
  label,
  icon,
  open,
  onClick,
  theme,
}: {
  label: string;
  icon: string;
  open: boolean;
  onClick: () => void;
  theme: ThemeData | null;
}) {
  const primary = theme?.primaryColor ?? "#5aaa38";
  const bg = theme?.backgroundColor ?? "#0e0e0e";
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "11px 14px",
        background: open ? adjustColor(bg, 8) : adjustColor(bg, 4),
        border: "none",
        borderBottom: open ? `2px solid ${primary}80` : "2px solid transparent",
        borderTop: `1px solid ${adjustColor(bg, 15)}`,
        cursor: "pointer",
        fontFamily: "var(--font-mc)",
        fontSize: "13px",
        fontWeight: 700,
        color: open ? primary : theme?.textColor ? adjustColor(theme.textColor, -20) : "#909090",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        transition: "all 0.15s",
        textAlign: "left",
      }}
      onMouseEnter={(e) => {
        if (!open) e.currentTarget.style.color = theme?.textColor ?? "#c0c0c0";
      }}
      onMouseLeave={(e) => {
        if (!open)
          e.currentTarget.style.color = theme?.textColor
            ? adjustColor(theme.textColor, -20)
            : "#909090";
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span>{icon}</span>
        {label}
      </span>
      <ChevronDown
        size={14}
        style={{
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s",
          color: open ? primary : "inherit",
          flexShrink: 0,
        }}
      />
    </button>
  );
}

function SettingsPanel({
  form,
  title,
  setTitle,
  description,
  setDescription,
  successMessage,
  setSuccessMessage,
  themeId,
  setThemeId,
  slug,
  setSlug,
  password,
  setPassword,
  clearPassword,
  setClearPassword,
  expiresAt,
  setExpiresAt,
  responseLimit,
  setResponseLimit,
  closedMessage,
  setClosedMessage,
  collectEmail,
  setCollectEmail,
  allowMultiple,
  setAllowMultiple,
  themes,
  onSave,
  isSaving,
}: {
  form: { isPasswordProtected?: boolean | null };
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  successMessage: string;
  setSuccessMessage: (v: string) => void;
  themeId: string;
  setThemeId: (v: string) => void;
  slug: string;
  setSlug: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  clearPassword: boolean;
  setClearPassword: (v: boolean) => void;
  expiresAt: string;
  setExpiresAt: (v: string) => void;
  responseLimit: string;
  setResponseLimit: (v: string) => void;
  closedMessage: string;
  setClosedMessage: (v: string) => void;
  collectEmail: boolean;
  setCollectEmail: (v: boolean) => void;
  allowMultiple: boolean;
  setAllowMultiple: (v: boolean) => void;
  themes: ThemeData[] | undefined;
  onSave: () => void;
  isSaving: boolean;
}) {
  const [openSection, setOpenSection] = useState<AccordionSection>("appearance");

  const activeTheme = themes?.find((t) => t.id === themeId) ?? null;
  const primary = activeTheme?.primaryColor ?? "#5aaa38";
  const bg = activeTheme?.backgroundColor ?? "#181818";
  const textCol = activeTheme?.textColor ?? "#e8e8e8";

  const panelBg = adjustColor(bg, 6);
  const panelBorder = adjustColor(bg, 20);

  function toggleSection(s: AccordionSection) {
    setOpenSection((prev) => (prev === s ? null : s));
  }

  return (
    <div
      style={{
        background: panelBg,
        borderWidth: "2px",
        borderStyle: "solid",
        borderTopColor: panelBorder,
        borderLeftColor: panelBorder,
        borderRightColor: adjustColor(bg, 2),
        borderBottomColor: adjustColor(bg, 2),
        boxShadow: `0 6px 0 ${adjustColor(bg, -4)}, inset 0 1px 0 rgba(255,255,255,0.05)`,
        overflow: "hidden",
        transition: "all 0.2s",
      }}
    >
      <div
        style={{
          padding: "14px 16px 12px",
          borderBottom: `2px solid ${adjustColor(bg, 20)}`,
          background: adjustColor(bg, 3),
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span style={{ fontSize: "16px" }}>⚙</span>
        <span
          style={{
            fontFamily: "var(--font-mc)",
            fontSize: "13px",
            fontWeight: 700,
            color: primary,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            textShadow: `1px 1px 0 rgba(0,0,0,0.8)`,
          }}
        >
          Form Settings
        </span>
        {activeTheme && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: "10px",
              fontFamily: "var(--font-mc)",
              color: adjustColor(primary, -10),
              background: `${primary}20`,
              padding: "2px 7px",
              border: `1px solid ${primary}40`,
            }}
          >
            {activeTheme.name}
          </span>
        )}
      </div>

      <AccordionHeader
        label="Appearance"
        icon="🎨"
        open={openSection === "appearance"}
        onClick={() => toggleSection("appearance")}
        theme={activeTheme}
      />
      {openSection === "appearance" && (
        <div style={{ padding: "14px 16px 16px", background: adjustColor(bg, 5) }}>
          <div style={{ marginBottom: "12px" }}>
            <div style={{ ...MC_LABEL, color: adjustColor(primary, -10) }}>Theme</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "6px",
                marginTop: "6px",
              }}
            >
              <div
                onClick={() => setThemeId("")}
                style={{
                  gridColumn: "1 / -1",
                  padding: "8px 12px",
                  cursor: "pointer",
                  fontFamily: "var(--font-mc)",
                  fontSize: "12px",
                  background: themeId === "" ? `${primary}25` : adjustColor(bg, 8),
                  border: `2px solid ${themeId === "" ? primary : adjustColor(bg, 18)}`,
                  color: themeId === "" ? primary : adjustColor(textCol, -20),
                  letterSpacing: "0.04em",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.1s",
                }}
              >
                <span
                  style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "0",
                    background: "linear-gradient(135deg, #5aaa38 50%, #0e0e0e 50%)",
                    flexShrink: 0,
                    display: "inline-block",
                  }}
                />
                Classic Craft (Default)
                {themeId === "" && <span style={{ marginLeft: "auto", color: primary }}>✓</span>}
              </div>
              {themes?.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setThemeId(t.id)}
                  style={{
                    padding: "8px 10px",
                    cursor: "pointer",
                    fontFamily: "var(--font-mc)",
                    fontSize: "11px",
                    background:
                      themeId === t.id ? `${t.primaryColor ?? primary}20` : adjustColor(bg, 8),
                    border: `2px solid ${themeId === t.id ? (t.primaryColor ?? primary) : adjustColor(bg, 18)}`,
                    color:
                      themeId === t.id ? (t.primaryColor ?? primary) : adjustColor(textCol, -20),
                    letterSpacing: "0.03em",
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                    transition: "all 0.1s",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span
                      style={{
                        width: "12px",
                        height: "12px",
                        background: t.primaryColor ?? "#5aaa38",
                        flexShrink: 0,
                        display: "inline-block",
                        boxShadow: `0 0 6px ${t.primaryColor ?? "#5aaa38"}80`,
                      }}
                    />
                    <span style={{ fontWeight: 700 }}>{t.name}</span>
                    {themeId === t.id && (
                      <span style={{ marginLeft: "auto", fontSize: "10px" }}>✓</span>
                    )}
                  </div>
                  {t.description && (
                    <span style={{ fontSize: "10px", opacity: 0.6, lineHeight: 1.3 }}>
                      {t.description}
                    </span>
                  )}
                  <div
                    style={{
                      display: "flex",
                      gap: "2px",
                      marginTop: "2px",
                    }}
                  >
                    <div
                      style={{ flex: 1, height: "3px", background: t.backgroundColor ?? "#0e0e0e" }}
                    />
                    <div
                      style={{ flex: 1, height: "3px", background: t.primaryColor ?? "#5aaa38" }}
                    />
                    <div style={{ flex: 1, height: "3px", background: t.textColor ?? "#e8e8e8" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <AccordionHeader
        label="Identity"
        icon="🪧"
        open={openSection === "identity"}
        onClick={() => toggleSection("identity")}
        theme={activeTheme}
      />
      {openSection === "identity" && (
        <div style={{ padding: "14px 16px 16px", background: adjustColor(bg, 5) }}>
          <label style={themedLabel(activeTheme)}>Title</label>
          <McFieldInput
            theme={activeTheme}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label style={themedLabel(activeTheme)}>Description</label>
          <McFieldTextarea
            theme={activeTheme}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label style={themedLabel(activeTheme)}>Success message</label>
          <McFieldInput
            theme={activeTheme}
            value={successMessage}
            onChange={(e) => setSuccessMessage(e.target.value)}
            placeholder="Thank you for your response!"
          />

          <label style={themedLabel(activeTheme)}>Slug (URL)</label>
          <McFieldInput
            theme={activeTheme}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="my-form-slug"
          />
        </div>
      )}

      <AccordionHeader
        label="Access"
        icon="🔐"
        open={openSection === "access"}
        onClick={() => toggleSection("access")}
        theme={activeTheme}
      />
      {openSection === "access" && (
        <div style={{ padding: "14px 16px 16px", background: adjustColor(bg, 5) }}>
          <label style={themedLabel(activeTheme)}>Password protection</label>
          {form.isPasswordProtected && !clearPassword && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "6px",
                marginTop: "8px",
                fontFamily: "var(--font-mc)",
                fontSize: "12px",
                color: "#e8a020",
              }}
            >
              <span>🔒 Password set</span>
              <button
                onClick={() => setClearPassword(true)}
                style={{
                  fontFamily: "var(--font-mc)",
                  fontSize: "11px",
                  color: "#cc4444",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  transition: "color 0.08s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ff6666")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#cc4444")}
              >
                Remove
              </button>
            </div>
          )}
          {clearPassword && (
            <div
              style={{
                fontFamily: "var(--font-mc)",
                fontSize: "11px",
                color: "#cc4444",
                marginBottom: "6px",
                marginTop: "6px",
              }}
            >
              Password will be removed on save.
            </div>
          )}
          <McFieldInput
            theme={activeTheme}
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setClearPassword(false);
            }}
            placeholder={
              form.isPasswordProtected ? "Set new password" : "Leave blank for no password"
            }
          />

          <label style={{ ...themedLabel(activeTheme), marginTop: "14px" }}>
            Close date (optional)
          </label>
          <McFieldInput
            theme={activeTheme}
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />

          <label style={themedLabel(activeTheme)}>Response limit (optional)</label>
          <McFieldInput
            theme={activeTheme}
            type="number"
            min={1}
            value={responseLimit}
            onChange={(e) => setResponseLimit(e.target.value)}
            placeholder="No limit"
          />

          <label style={themedLabel(activeTheme)}>Closed message</label>
          <McFieldInput
            theme={activeTheme}
            value={closedMessage}
            onChange={(e) => setClosedMessage(e.target.value)}
            placeholder="This form is no longer accepting responses."
          />
        </div>
      )}

      <AccordionHeader
        label="Behaviour"
        icon="⚡"
        open={openSection === "behaviour"}
        onClick={() => toggleSection("behaviour")}
        theme={activeTheme}
      />
      {openSection === "behaviour" && (
        <div style={{ padding: "10px 16px 16px", background: adjustColor(bg, 5) }}>
          <McCheckRow
            theme={activeTheme}
            checked={collectEmail}
            onChange={setCollectEmail}
            label="Collect respondent email"
          />
          <McCheckRow
            theme={activeTheme}
            checked={allowMultiple}
            onChange={setAllowMultiple}
            label="Allow multiple submissions"
          />
        </div>
      )}

      <div
        style={{
          padding: "14px 16px",
          borderTop: `2px solid ${adjustColor(bg, 20)}`,
          background: adjustColor(bg, 3),
        }}
      >
        <McButton
          variant="grass"
          size="md"
          onClick={onSave}
          disabled={isSaving}
          style={{ width: "100%" }}
        >
          {isSaving ? "Saving..." : "Save settings"}
        </McButton>
      </div>
    </div>
  );
}

export default function FormEditPage({ params }: { params: Promise<Params> }) {
  const { formId } = use(params);
  const router = useRouter();
  const { invalidateCache } = useInvalidateCache();

  const { form: formRaw, isLoading } = useForm({ formId });
  const form = formRaw as FormShape | undefined;
  const { themes: themesRaw } = useFormThemes();
  const themes = themesRaw as ThemeData[] | undefined;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [collectEmail, setCollectEmail] = useState(false);
  const [allowMultiple, setAllowMultiple] = useState(true);
  const [themeId, setThemeId] = useState("");
  const [fields, setFields] = useState<LocalField[]>([]);
  const [activeFieldKey, setActiveFieldKey] = useState<string | null>(null);
  const [optionInput, setOptionInput] = useState("");
  const [activeTab, setActiveTab] = useState<EditorTab>("editor");
  const [slug, setSlug] = useState("");
  const [password, setPassword] = useState("");
  const [clearPassword, setClearPassword] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [responseLimit, setResponseLimit] = useState("");
  const [closedMessage, setClosedMessage] = useState("");

  useEffect(() => {
    if (!form) return;
    setTitle(form.title);
    setDescription(form.description ?? "");
    setSuccessMessage(form.successMessage ?? "");
    setCollectEmail(form.collectEmail ?? false);
    setAllowMultiple(form.allowMultipleSubmissions ?? true);
    setThemeId(form.themeId ?? "");
    setSlug(form.slug ?? "");
    setExpiresAt(form.expiresAt ? new Date(form.expiresAt).toISOString().slice(0, 16) : "");
    setResponseLimit(form.responseLimit ? String(form.responseLimit) : "");
    setClosedMessage(form.closedMessage ?? "");
    setFields(
      form.fields.map((f) => ({
        _key: makeKey(),
        label: f.label,
        description: f.description ?? "",
        fieldType: f.fieldType as FieldType,
        placeholder: f.placeholder ?? "",
        required: f.required ?? false,
        orderIndex: f.orderIndex,
        validationRules: f.validationRules ?? {},
        config: {
          options: f.config?.options ?? [],
          max: f.config?.max,
          conditionalLogic: f.config?.conditionalLogic,
        },
      })),
    );
  }, [form]);

  const { updateForm, isPending: updateFormPending } = useUpdateForm({
    onSuccess: () => {
      invalidateCache("forms.get");
      toast.success("Form settings saved");
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const { updateFormFields, isPending: updateFieldsPending } = useUpdateFormFields({
    onSuccess: () => {
      invalidateCache("forms.get");
      toast.success("Fields saved");
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const { publishForm, isPending: publishPending } = usePublishForm({
    onSuccess: () => {
      invalidateCache("forms.get");
      toast.success("Form published");
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const activeTheme = themes?.find((t) => t.id === themeId) ?? null;

  function saveSettings() {
    updateForm({
      formId,
      title,
      slug: slug || undefined,
      description: description || undefined,
      successMessage: successMessage || undefined,
      closedMessage: closedMessage || undefined,
      collectEmail,
      allowMultipleSubmissions: allowMultiple,
      themeId: themeId || undefined,
      password: clearPassword ? null : password || undefined,
      expiresAt: expiresAt
        ? new Date(expiresAt).toISOString()
        : expiresAt === ""
          ? null
          : undefined,
      responseLimit: responseLimit
        ? parseInt(responseLimit)
        : responseLimit === ""
          ? null
          : undefined,
    });
    setPassword("");
    setClearPassword(false);
  }

  function saveFields() {
    const badField = fields.find((f) => f.fieldType !== "page_break" && !f.label.trim());
    if (badField) {
      toast.error("All fields must have a label");
      return;
    }
    updateFormFields({
      formId,
      fields: fields.map((f, i) => ({
        label: f.label,
        description: f.description || undefined,
        fieldType: f.fieldType,
        placeholder: f.placeholder || undefined,
        required: f.required,
        orderIndex: i,
        validationRules: Object.keys(f.validationRules).length > 0 ? f.validationRules : undefined,
        config: buildFieldConfig(f),
      })),
    });
  }

  function buildFieldConfig(f: LocalField): Record<string, unknown> | undefined {
    const out: Record<string, unknown> = {};
    if (f.fieldType === "rating") out.max = f.config.max ?? 5;
    if (["single_select", "multi_select", "dropdown"].includes(f.fieldType))
      out.options = f.config.options;
    if (f.config.conditionalLogic?.showIf) out.conditionalLogic = f.config.conditionalLogic;
    return Object.keys(out).length > 0 ? out : undefined;
  }

  function addField() {
    const newField = defaultField(fields.length);
    setFields((prev) => [...prev, newField]);
    setActiveFieldKey(newField._key);
  }

  function removeField(key: string) {
    setFields((prev) =>
      prev.filter((f) => f._key !== key).map((f, i) => ({ ...f, orderIndex: i })),
    );
    if (activeFieldKey === key) setActiveFieldKey(null);
  }

  function moveField(key: string, dir: -1 | 1) {
    setFields((prev) => {
      const idx = prev.findIndex((f) => f._key === key);
      if (idx + dir < 0 || idx + dir >= prev.length) return prev;
      const next = [...prev];
      const tmp = next[idx]!;
      next[idx] = next[idx + dir]!;
      next[idx + dir] = tmp;
      return next.map((f, i) => ({ ...f, orderIndex: i }));
    });
  }

  function updateField(key: string, patch: Partial<LocalField>) {
    setFields((prev) => prev.map((f) => (f._key === key ? { ...f, ...patch } : f)));
  }

  function addOption(key: string) {
    const opt = optionInput.trim();
    if (!opt) return;
    const f = fields.find((f) => f._key === key)!;
    updateField(key, { config: { ...f.config, options: [...(f.config.options ?? []), opt] } });
    setOptionInput("");
  }

  function removeOption(key: string, opt: string) {
    const f = fields.find((f) => f._key === key)!;
    updateField(key, {
      config: { ...f.config, options: f.config.options.filter((o) => o !== opt) },
    });
  }

  function setConditionalLogic(key: string, logic: ConditionalLogic) {
    const f = fields.find((f) => f._key === key)!;
    updateField(key, { config: { ...f.config, conditionalLogic: logic } });
  }

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "200px",
          fontFamily: "var(--font-mc)",
          color: "#606060",
          fontSize: "18px",
          gap: "14px",
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: "16px",
            height: "16px",
            background: "#5aaa38",
            animation: "mc-particle-rise 1s ease-in-out infinite alternate",
          }}
        />
        Loading editor...
      </div>
    );
  }

  if (!form) {
    return (
      <McCard
        variant="stone"
        style={{ padding: "48px", textAlign: "center", maxWidth: "480px", margin: "0 auto" }}
      >
        <div style={{ fontFamily: "var(--font-mc)", fontSize: "18px", color: "#ff6666" }}>
          ⚠ Form not found.
        </div>
      </McCard>
    );
  }

  const activeField = fields.find((f) => f._key === activeFieldKey) ?? null;
  const hasOptions =
    activeField && ["single_select", "multi_select", "dropdown"].includes(activeField.fieldType);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <Link
            href={`/dashboard/forms/${formId}`}
            style={{
              fontFamily: "var(--font-mc)",
              fontSize: "13px",
              color: "#585858",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              transition: "color 0.1s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#909090")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#585858")}
          >
            ← {form.title}
          </Link>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <McLinkButton
            href={`/dashboard/forms/${formId}/preview`}
            variant="ghost"
            size="sm"
            style={{ textDecoration: "none" } as React.CSSProperties}
          >
            <Eye size={13} /> Preview ↗
          </McLinkButton>
          {form.status !== "published" && (
            <>
              <McButton
                variant="grass"
                size="sm"
                onClick={() => publishForm({ formId, visibility: "public" })}
                disabled={publishPending}
              >
                <Globe size={13} /> Publish public
              </McButton>
              <McButton
                variant="stone"
                size="sm"
                onClick={() => publishForm({ formId, visibility: "unlisted" })}
                disabled={publishPending}
              >
                <Link2 size={13} /> Publish unlisted
              </McButton>
            </>
          )}
          {form.status === "published" && (
            <a href={`/f/${form.slug}`} target="_blank" rel="noreferrer">
              <McButton variant="ghost" size="sm">
                View live ↗
              </McButton>
            </a>
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "0",
          marginBottom: "20px",
          borderBottom: "2px solid #1e1e1e",
        }}
      >
        {(["editor", "logic"] as const).map((tab) => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "11px 22px",
                border: "none",
                background: active
                  ? "linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)), url('/textures/stone_texture.webp')"
                  : "transparent",
                backgroundSize: active ? "auto, 32px 32px" : "auto",
                cursor: "pointer",
                fontFamily: "var(--font-mc)",
                fontSize: "14px",
                fontWeight: 700,
                color: active ? "#e0e0e0" : "#505050",
                borderBottom: active
                  ? `2px solid ${activeTheme?.primaryColor ?? "#5aaa38"}`
                  : "2px solid transparent",
                marginBottom: "-2px",
                letterSpacing: "0.04em",
                transition: "all 0.1s",
                textShadow: active ? "1px 1px 0 rgba(0,0,0,0.8)" : "none",
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.color = "#909090";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.color = "#505050";
              }}
            >
              {tab === "editor" ? "🔨 Fields & Settings" : "⚡ Conditional Logic"}
            </button>
          );
        })}
      </div>

      {activeTab === "editor" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            gap: "20px",
            alignItems: "start",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <McCard variant="inventory" style={{ padding: "20px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <McSectionTitle>🧱 Fields</McSectionTitle>
                <div style={{ display: "flex", gap: "8px" }}>
                  <McButton
                    variant="grass"
                    size="sm"
                    onClick={saveFields}
                    disabled={updateFieldsPending}
                  >
                    {updateFieldsPending ? "Saving..." : "Save fields"}
                  </McButton>
                  <McButton variant="stone" size="sm" onClick={addField}>
                    <Plus size={13} /> Add field
                  </McButton>
                </div>
              </div>

              {fields.length === 0 && (
                <div
                  style={{
                    padding: "48px 24px",
                    border: "2px dashed #2a2a2a",
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <McFloatingParticles count={5} />
                  <div
                    style={{
                      position: "relative",
                      zIndex: 1,
                      fontFamily: "var(--font-mc)",
                      fontSize: "16px",
                      color: "#404040",
                      marginBottom: "8px",
                    }}
                  >
                    No fields placed.
                  </div>
                  <div
                    style={{
                      position: "relative",
                      zIndex: 1,
                      fontFamily: "var(--font-mc)",
                      fontSize: "13px",
                      color: "#303030",
                    }}
                  >
                    Click "+ Add field" to begin building.
                  </div>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {fields.map((field, i) => {
                  const active = activeFieldKey === field._key;
                  const fieldMeta = FIELD_TYPES.find((t) => t.value === field.fieldType);
                  const activePrimary = activeTheme?.primaryColor ?? "#3a9828";
                  return (
                    <div
                      key={field._key}
                      onClick={() => setActiveFieldKey(field._key)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 14px",
                        background: active ? "#252525" : "#1a1a1a",
                        borderWidth: "2px",
                        borderStyle: "solid",
                        borderTopColor: active ? activePrimary : "#252525",
                        borderLeftColor: active ? activePrimary : "#252525",
                        borderRightColor: active ? adjustColor(activePrimary, -20) : "#141414",
                        borderBottomColor: active ? adjustColor(activePrimary, -20) : "#141414",
                        boxShadow: active
                          ? `inset 0 1px 0 rgba(90,170,56,0.08), 0 0 12px ${activePrimary}20`
                          : "inset 0 1px 0 rgba(255,255,255,0.02)",
                        cursor: "pointer",
                        transition: "all 0.08s",
                      }}
                      onMouseEnter={(e) => {
                        if (!active) e.currentTarget.style.background = "#202020";
                      }}
                      onMouseLeave={(e) => {
                        if (!active) e.currentTarget.style.background = "#1a1a1a";
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-mc)",
                          fontSize: "11px",
                          color: "#383838",
                          width: "18px",
                          flexShrink: 0,
                          textAlign: "right",
                        }}
                      >
                        {i + 1}
                      </span>
                      <span style={{ fontSize: "15px", flexShrink: 0 }}>
                        {fieldMeta?.icon ?? "•"}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mc)",
                          fontSize: "11px",
                          background: "#282828",
                          padding: "2px 7px",
                          color: "#585858",
                          borderWidth: "1px",
                          borderStyle: "solid",
                          borderColor: "#303030",
                          flexShrink: 0,
                        }}
                      >
                        {fieldMeta?.label ?? field.fieldType}
                      </span>
                      <span
                        style={{
                          flex: 1,
                          fontFamily: "var(--font-mc)",
                          fontSize: "14px",
                          color: field.label ? "#d0d0d0" : "#404040",
                          fontStyle: field.label ? "normal" : "italic",
                          minWidth: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {field.label || "Untitled field"}
                      </span>
                      <div
                        style={{ display: "flex", gap: "4px", alignItems: "center", flexShrink: 0 }}
                      >
                        {field.config.conditionalLogic?.showIf && (
                          <McBadge variant="diamond">⚡</McBadge>
                        )}
                        {field.required && <McBadge variant="danger">*</McBadge>}
                      </div>
                      <div
                        style={{ display: "flex", gap: "3px", flexShrink: 0 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {[
                          {
                            icon: <ArrowUp size={11} />,
                            action: () => moveField(field._key, -1),
                            disabled: i === 0,
                            danger: false,
                          },
                          {
                            icon: <ArrowDown size={11} />,
                            action: () => moveField(field._key, 1),
                            disabled: i === fields.length - 1,
                            danger: false,
                          },
                          {
                            icon: <X size={11} />,
                            action: () => removeField(field._key),
                            disabled: false,
                            danger: true,
                          },
                        ].map((btn, bi) => (
                          <button
                            key={bi}
                            onClick={btn.action}
                            disabled={btn.disabled}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "26px",
                              height: "26px",
                              background: btn.danger ? "#280808" : "#202020",
                              border: `1px solid ${btn.danger ? "#4a0808" : "#303030"}`,
                              borderTopColor: btn.danger ? "#6a1010" : "#383838",
                              color: btn.disabled ? "#303030" : btn.danger ? "#cc4444" : "#686868",
                              cursor: btn.disabled ? "not-allowed" : "pointer",
                              transition: "all 0.06s",
                              flexShrink: 0,
                            }}
                            onMouseEnter={(e) => {
                              if (!btn.disabled) {
                                e.currentTarget.style.color = btn.danger ? "#ff6666" : "#c0c0c0";
                                if (btn.danger) e.currentTarget.style.background = "#400a0a";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!btn.disabled) {
                                e.currentTarget.style.color = btn.danger ? "#cc4444" : "#686868";
                                if (btn.danger) e.currentTarget.style.background = "#280808";
                              }
                            }}
                          >
                            {btn.icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </McCard>

            {activeField && (
              <McCard variant="stone" style={{ padding: "20px" }}>
                <McSectionTitle sub={`Editing: ${activeField.label || "Untitled field"}`}>
                  ✏ Field Editor
                </McSectionTitle>

                <label style={MC_LABEL}>Field type</label>
                <McFieldSelect
                  value={activeField.fieldType}
                  onChange={(e) =>
                    updateField(activeField._key, {
                      fieldType: e.target.value as FieldType,
                      label: e.target.value === "page_break" ? "Page Break" : activeField.label,
                    })
                  }
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.icon} {t.label}
                    </option>
                  ))}
                </McFieldSelect>

                {activeField.fieldType === "page_break" ? (
                  <div
                    style={{
                      marginTop: "14px",
                      padding: "14px",
                      background: "#181818",
                      borderWidth: "2px",
                      borderStyle: "solid",
                      borderColor: "#2a2a2a",
                      fontFamily: "var(--font-mc)",
                      fontSize: "13px",
                      color: "#585858",
                      lineHeight: 1.7,
                    }}
                  >
                    — Page break — splits form into multiple pages. No label needed.
                  </div>
                ) : (
                  <>
                    <label style={MC_LABEL}>Label *</label>
                    <McFieldInput
                      value={activeField.label}
                      onChange={(e) => updateField(activeField._key, { label: e.target.value })}
                      placeholder="Question label"
                    />

                    <label style={MC_LABEL}>Description</label>
                    <McFieldInput
                      value={activeField.description}
                      onChange={(e) =>
                        updateField(activeField._key, { description: e.target.value })
                      }
                      placeholder="Helper text (optional)"
                    />

                    {![
                      "checkbox",
                      "rating",
                      "date",
                      "single_select",
                      "multi_select",
                      "dropdown",
                    ].includes(activeField.fieldType) && (
                      <>
                        <label style={MC_LABEL}>Placeholder</label>
                        <McFieldInput
                          value={activeField.placeholder}
                          onChange={(e) =>
                            updateField(activeField._key, { placeholder: e.target.value })
                          }
                          placeholder="Placeholder text"
                        />
                      </>
                    )}

                    {activeField.fieldType === "rating" && (
                      <>
                        <label style={MC_LABEL}>Max rating</label>
                        <McFieldInput
                          type="number"
                          min={2}
                          max={10}
                          value={activeField.config.max ?? 5}
                          onChange={(e) =>
                            updateField(activeField._key, {
                              config: { ...activeField.config, max: parseInt(e.target.value) },
                            })
                          }
                        />
                      </>
                    )}

                    {activeField.fieldType === "number" && (
                      <>
                        <label style={MC_LABEL}>Min value</label>
                        <McFieldInput
                          type="number"
                          value={(activeField.validationRules.min as number) ?? ""}
                          onChange={(e) =>
                            updateField(activeField._key, {
                              validationRules: {
                                ...activeField.validationRules,
                                min: e.target.value ? parseFloat(e.target.value) : undefined,
                              },
                            })
                          }
                          placeholder="No minimum"
                        />
                        <label style={MC_LABEL}>Max value</label>
                        <McFieldInput
                          type="number"
                          value={(activeField.validationRules.max as number) ?? ""}
                          onChange={(e) =>
                            updateField(activeField._key, {
                              validationRules: {
                                ...activeField.validationRules,
                                max: e.target.value ? parseFloat(e.target.value) : undefined,
                              },
                            })
                          }
                          placeholder="No maximum"
                        />
                      </>
                    )}

                    {(activeField.fieldType === "short_text" ||
                      activeField.fieldType === "long_text") && (
                      <>
                        <label style={MC_LABEL}>Min length</label>
                        <McFieldInput
                          type="number"
                          min={0}
                          value={(activeField.validationRules.minLength as number) ?? ""}
                          onChange={(e) =>
                            updateField(activeField._key, {
                              validationRules: {
                                ...activeField.validationRules,
                                minLength: e.target.value ? parseInt(e.target.value) : undefined,
                              },
                            })
                          }
                          placeholder="No minimum"
                        />
                        <label style={MC_LABEL}>Max length</label>
                        <McFieldInput
                          type="number"
                          min={0}
                          value={(activeField.validationRules.maxLength as number) ?? ""}
                          onChange={(e) =>
                            updateField(activeField._key, {
                              validationRules: {
                                ...activeField.validationRules,
                                maxLength: e.target.value ? parseInt(e.target.value) : undefined,
                              },
                            })
                          }
                          placeholder="No maximum"
                        />
                      </>
                    )}

                    {hasOptions && (
                      <>
                        <label style={MC_LABEL}>Options</label>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                            marginBottom: "8px",
                          }}
                        >
                          {activeField.config.options.map((opt) => (
                            <div
                              key={opt}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "6px 10px",
                                background: "#181818",
                                borderWidth: "1px",
                                borderStyle: "solid",
                                borderColor: "#2a2a2a",
                                borderTopColor: "#303030",
                              }}
                            >
                              <span
                                style={{
                                  flex: 1,
                                  fontFamily: "var(--font-mc)",
                                  fontSize: "13px",
                                  color: "#b0b0b0",
                                }}
                              >
                                {opt}
                              </span>
                              <button
                                onClick={() => removeOption(activeField._key, opt)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  color: "#cc4444",
                                  display: "flex",
                                  alignItems: "center",
                                  padding: "2px",
                                  transition: "color 0.08s",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "#ff6666")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "#cc4444")}
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <McFieldInput
                            style={{ flex: 1 }}
                            value={optionInput}
                            onChange={(e) => setOptionInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addOption(activeField._key);
                              }
                            }}
                            placeholder="Add option..."
                          />
                          <McButton
                            variant="stone"
                            size="sm"
                            onClick={() => addOption(activeField._key)}
                            style={{ flexShrink: 0, height: "auto" }}
                          >
                            Add
                          </McButton>
                        </div>
                      </>
                    )}

                    <McCheckRow
                      checked={activeField.required}
                      onChange={(v) => updateField(activeField._key, { required: v })}
                      label="Required field"
                    />
                  </>
                )}
              </McCard>
            )}
          </div>

          <SettingsPanel
            form={form}
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            successMessage={successMessage}
            setSuccessMessage={setSuccessMessage}
            themeId={themeId}
            setThemeId={setThemeId}
            slug={slug}
            setSlug={setSlug}
            password={password}
            setPassword={setPassword}
            clearPassword={clearPassword}
            setClearPassword={setClearPassword}
            expiresAt={expiresAt}
            setExpiresAt={setExpiresAt}
            responseLimit={responseLimit}
            setResponseLimit={setResponseLimit}
            closedMessage={closedMessage}
            setClosedMessage={setClosedMessage}
            collectEmail={collectEmail}
            setCollectEmail={setCollectEmail}
            allowMultiple={allowMultiple}
            setAllowMultiple={setAllowMultiple}
            themes={themes}
            onSave={saveSettings}
            isSaving={updateFormPending}
          />
        </div>
      )}

      {activeTab === "logic" && (
        <div style={{ maxWidth: "680px" }}>
          <McCard variant="inventory" style={{ padding: "20px", marginBottom: "20px" }}>
            <p
              style={{
                fontFamily: "var(--font-mc)",
                fontSize: "15px",
                color: "#585858",
                lineHeight: 1.7,
              }}
            >
              ⚡ Set conditions that control when a field is shown. Fields with no condition are
              always visible.
            </p>
          </McCard>

          {fields.length < 2 && (
            <McCard variant="stone" style={{ padding: "40px", textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "var(--font-mc)",
                  fontSize: "16px",
                  color: "#404040",
                  marginBottom: "8px",
                }}
              >
                Not enough fields.
              </div>
              <div style={{ fontFamily: "var(--font-mc)", fontSize: "13px", color: "#303030" }}>
                Add at least 2 fields to set up conditional logic.
              </div>
            </McCard>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {fields.map((field, i) => {
              if (i === 0) return null;
              const logic = field.config.conditionalLogic;
              return (
                <McCard key={field._key} variant="stone" style={{ padding: "16px 18px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "12px",
                      gap: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-mc)",
                          fontSize: "15px",
                          fontWeight: 700,
                          color: "#d0d0d0",
                        }}
                      >
                        {field.label || "Untitled field"}
                      </span>
                      <McBadge variant="stone">{field.fieldType}</McBadge>
                    </div>
                    {logic?.showIf && (
                      <McButton
                        variant="danger"
                        size="sm"
                        onClick={() => setConditionalLogic(field._key, {})}
                      >
                        <X size={12} /> Remove
                      </McButton>
                    )}
                  </div>

                  {!logic?.showIf ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                      }}
                    >
                      <span
                        style={{ fontFamily: "var(--font-mc)", fontSize: "13px", color: "#484848" }}
                      >
                        Always visible
                      </span>
                      <McButton
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setConditionalLogic(field._key, {
                            showIf: { fieldId: fields[0]!._key, operator: "equals", value: "" },
                          })
                        }
                      >
                        <Plus size={12} /> Add condition
                      </McButton>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{ fontFamily: "var(--font-mc)", fontSize: "13px", color: "#707070" }}
                      >
                        Show if
                      </span>
                      <McFieldSelect
                        style={{ ...MC_INPUT, width: "auto", flex: "1 1 120px" }}
                        value={logic.showIf!.fieldId}
                        onChange={(e) =>
                          setConditionalLogic(field._key, {
                            showIf: { ...logic.showIf!, fieldId: e.target.value },
                          })
                        }
                      >
                        {fields
                          .filter((f) => f._key !== field._key)
                          .map((f) => (
                            <option key={f._key} value={f._key}>
                              {f.label || "Untitled"}
                            </option>
                          ))}
                      </McFieldSelect>
                      <McFieldSelect
                        style={{ ...MC_INPUT, width: "auto", flex: "1 1 140px" }}
                        value={logic.showIf!.operator}
                        onChange={(e) =>
                          setConditionalLogic(field._key, {
                            showIf: {
                              ...logic.showIf!,
                              operator: e.target.value as ConditionalOperator,
                            },
                          })
                        }
                      >
                        {CONDITION_OPERATORS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </McFieldSelect>
                      <McFieldInput
                        style={{ flex: "1 1 120px", width: "auto" }}
                        value={logic.showIf!.value}
                        onChange={(e) =>
                          setConditionalLogic(field._key, {
                            showIf: { ...logic.showIf!, value: e.target.value },
                          })
                        }
                        placeholder="value"
                      />
                    </div>
                  )}
                </McCard>
              );
            })}
          </div>

          {fields.length >= 2 && (
            <div style={{ marginTop: "20px" }}>
              <McButton
                variant="grass"
                size="md"
                onClick={saveFields}
                disabled={updateFieldsPending}
              >
                {updateFieldsPending ? "Saving..." : "Save logic"}
              </McButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
