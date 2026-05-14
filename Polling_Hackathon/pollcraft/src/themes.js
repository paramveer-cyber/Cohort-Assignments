const shared = {
  brand: {
    default: '#B91C3C',
    light: '#D4253F',
    dark: '#C73E57',
    muted: '#A31835',
    glow: 'rgba(185,28,60,0.20)',
    dim: 'rgba(185,28,60,0.07)',
    dimStrong: 'rgba(185,28,60,0.15)',
  },
  signal: {
    default: '#FF8A3D',
    dark: '#14B8A6',
    dim: 'rgba(255,138,61,0.12)',
  },
  status: {
    draft: '#78716C',
    draftBg: 'rgba(120,113,108,0.10)',
    draftBorder: 'rgba(120,113,108,0.28)',
    active: '#14B8A6',
    activeBg: 'rgba(20,184,166,0.10)',
    activeBorder: 'rgba(20,184,166,0.28)',
    published: '#2563EB',
    publishedBg: 'rgba(37,99,235,0.10)',
    publishedBorder: 'rgba(37,99,235,0.28)',
    expired: '#B91C3C',
    expiredBg: 'rgba(185,28,60,0.10)',
    expiredBorder: 'rgba(185,28,60,0.28)',
    scheduled: '#FB923C',
    scheduledBg: 'rgba(251,146,60,0.12)',
    scheduledBorder: 'rgba(251,146,60,0.25)',
  },
  jade: {
    default: '#14B8A6',
    dim: 'rgba(20,184,166,0.10)',
    border: 'rgba(20,184,166,0.30)',
    dimStrong: 'rgba(20,184,166,0.20)',
  },
  azure: {
    default: '#2563EB',
    dim: 'rgba(37,99,235,0.10)',
    border: 'rgba(37,99,235,0.30)',
    dimStrong: 'rgba(37,99,235,0.20)',
    dimBg: 'rgba(37,99,235,0.08)',
    dimBorder: 'rgba(37,99,235,0.18)',
  },
  crimson: {
    default: '#DC2626',
    dim: 'rgba(220,38,38,0.10)',
    border: 'rgba(220,38,38,0.30)',
    dimStrong: 'rgba(220,38,38,0.20)',
  },
  violet: {
    default: '#7C3AED',
  },
  chart: ['#FF6B35', '#14B8A6', '#FFB347', '#0F766E', '#FF3B5C', '#2DD4BF'],
  qr: { bg: '#ffffff', fg: '#0C0B0D' },
}

export const dark = {
  ...shared,
  violet: { default: '#A78BFA' },
  surface: { 900: '#0C0B0D', 800: '#131117', 700: '#1C1920', 600: '#27242D', 500: '#3D3946' },
  text: { primary: '#E8E6F0', secondary: '#8C8899', muted: '#58536A', inverse: '#1A1614' },
  border: { subtle: '#27242D', default: '#3D3946' },
  bg: {
    nav: 'rgba(12,11,13,0.97)', card: '#131117', page: '#0C0B0D', input: '#1C1920',
    modal: '#1C1920', modalBorder: '#3D3946', tab: '#1C1920', tabActive: '#27242D',
    modalOverlay: 'rgba(0,0,0,0.45)',
  },
  shadow: {
    card: '0 2px 16px rgba(0,0,0,0.32)',
    modal: '0 8px 48px rgba(0,0,0,0.56)',
    cardHover: '0 4px 24px rgba(0,0,0,0.18)',
  },
}

export const light = {
  ...shared,
  violet: { default: '#6D28D9' },
  surface: { 900: '#EDE9E4', 800: '#FAF8F5', 700: '#F0ECE7', 600: '#E5E0D9', 500: '#C8C2BB' },
  text: { primary: '#1A1614', secondary: '#4E4843', muted: '#8C857D', inverse: '#1A1614' },
  border: { subtle: '#DDD8D2', default: '#C4BDB5' },
  bg: {
    nav: 'rgba(240,236,231,0.97)', card: '#FAF8F5', page: '#EDE9E4', input: '#F5F2EE',
    modal: '#FAF8F5', modalBorder: '#C4BDB5', tab: '#F0ECE7', tabActive: '#E5E0D9',
    modalOverlay: 'rgba(60,40,30,0.30)',
  },
  shadow: {
    card: '0 1px 6px rgba(80,60,40,0.06), 0 2px 16px rgba(80,60,40,0.05)',
    modal: '0 8px 40px rgba(80,60,40,0.14), 0 2px 8px rgba(80,60,40,0.08)',
    cardHover: '0 4px 24px rgba(80,60,40,0.10)',
  },
}

export const retro = {
  ...shared,
  violet: { default: '#A020E8' },
  brand: {
    default: '#E8A020', light: '#F0B030', dark: '#D09010', muted: '#B07010',
    glow: 'rgba(232,160,32,0.20)', dim: 'rgba(232,160,32,0.08)', dimStrong: 'rgba(232,160,32,0.16)',
  },
  signal: { default: '#E85C20', dark: '#20A8E8', dim: 'rgba(232,92,32,0.12)' },
  chart: ['#E8A020', '#E85C20', '#20A8E8', '#E8D020', '#A020E8', '#20E8A0'],
  surface: { 900: '#1A1208', 800: '#231A0C', 700: '#2E2210', 600: '#3D2E18', 500: '#564228' },
  text: { primary: '#F0DFA0', secondary: '#C8A860', muted: '#806840', inverse: '#1A1208' },
  border: { subtle: '#3D2E18', default: '#564228' },
  bg: {
    nav: 'rgba(26,18,8,0.97)', card: '#231A0C', page: '#1A1208', input: '#2E2210',
    modal: '#2E2210', modalBorder: '#564228', tab: '#2E2210', tabActive: '#3D2E18',
    modalOverlay: 'rgba(0,0,0,0.55)',
  },
  shadow: {
    card: '0 2px 16px rgba(0,0,0,0.40)',
    modal: '0 8px 48px rgba(0,0,0,0.60)',
    cardHover: '0 4px 24px rgba(0,0,0,0.24)',
  },
}

export const terminal = {
  ...shared,
  violet: { default: '#FF00FF' },
  brand: {
    default: '#00FF41', light: '#33FF66', dark: '#00CC33', muted: '#009926',
    glow: 'rgba(0,255,65,0.20)', dim: 'rgba(0,255,65,0.06)', dimStrong: 'rgba(0,255,65,0.14)',
  },
  signal: { default: '#00FF41', dark: '#00CC33', dim: 'rgba(0,255,65,0.10)' },
  jade: { default: '#00FF41', dim: 'rgba(0,255,65,0.10)', border: 'rgba(0,255,65,0.30)', dimStrong: 'rgba(0,255,65,0.18)' },
  chart: ['#00FF41', '#00CC33', '#33FF66', '#66FF99', '#00FF99', '#99FFCC'],
  surface: { 900: '#000000', 800: '#040804', 700: '#081008', 600: '#0C180C', 500: '#142814' },
  text: { primary: '#00FF41', secondary: '#00CC33', muted: '#006618', inverse: '#000000' },
  border: { subtle: '#0C180C', default: '#142814' },
  bg: {
    nav: 'rgba(0,0,0,0.98)', card: '#040804', page: '#000000', input: '#081008',
    modal: '#081008', modalBorder: '#142814', tab: '#081008', tabActive: '#0C180C',
    modalOverlay: 'rgba(0,0,0,0.70)',
  },
  shadow: {
    card: '0 2px 16px rgba(0,255,65,0.08)',
    modal: '0 8px 48px rgba(0,255,65,0.12)',
    cardHover: '0 4px 24px rgba(0,255,65,0.10)',
  },
}

export const neon = {
  ...shared,
  violet: { default: '#D500FF' },
  brand: {
    default: '#FF00FF', light: '#FF33FF', dark: '#CC00CC', muted: '#990099',
    glow: 'rgba(255,0,255,0.25)', dim: 'rgba(255,0,255,0.07)', dimStrong: 'rgba(255,0,255,0.16)',
  },
  signal: { default: '#00FFFF', dark: '#FF00FF', dim: 'rgba(0,255,255,0.12)' },
  jade: { default: '#00FFFF', dim: 'rgba(0,255,255,0.10)', border: 'rgba(0,255,255,0.30)', dimStrong: 'rgba(0,255,255,0.20)' },
  azure: { default: '#7B00FF', dim: 'rgba(123,0,255,0.10)', border: 'rgba(123,0,255,0.30)', dimStrong: 'rgba(123,0,255,0.20)', dimBg: 'rgba(123,0,255,0.08)', dimBorder: 'rgba(123,0,255,0.18)' },
  chart: ['#FF00FF', '#00FFFF', '#FF6600', '#7B00FF', '#FF0066', '#00FF99'],
  surface: { 900: '#060010', 800: '#0C0018', 700: '#140028', 600: '#1E0038', 500: '#2E0058' },
  text: { primary: '#F0E0FF', secondary: '#B090D0', muted: '#704090', inverse: '#060010' },
  border: { subtle: '#1E0038', default: '#2E0058' },
  bg: {
    nav: 'rgba(6,0,16,0.97)', card: '#0C0018', page: '#060010', input: '#140028',
    modal: '#140028', modalBorder: '#2E0058', tab: '#140028', tabActive: '#1E0038',
    modalOverlay: 'rgba(0,0,0,0.60)',
  },
  shadow: {
    card: '0 2px 16px rgba(255,0,255,0.12)',
    modal: '0 8px 48px rgba(255,0,255,0.20)',
    cardHover: '0 4px 24px rgba(255,0,255,0.16)',
  },
}

export const minimal = {
  ...shared,
  violet: { default: '#555555' },
  brand: {
    default: '#111111', light: '#333333', dark: '#000000', muted: '#555555',
    glow: 'rgba(17,17,17,0.10)', dim: 'rgba(17,17,17,0.05)', dimStrong: 'rgba(17,17,17,0.10)',
  },
  signal: { default: '#555555', dark: '#111111', dim: 'rgba(85,85,85,0.10)' },
  jade: { default: '#333333', dim: 'rgba(51,51,51,0.08)', border: 'rgba(51,51,51,0.20)', dimStrong: 'rgba(51,51,51,0.14)' },
  azure: { default: '#444444', dim: 'rgba(68,68,68,0.08)', border: 'rgba(68,68,68,0.20)', dimStrong: 'rgba(68,68,68,0.14)', dimBg: 'rgba(68,68,68,0.06)', dimBorder: 'rgba(68,68,68,0.14)' },
  chart: ['#111111', '#555555', '#888888', '#333333', '#777777', '#999999'],
  surface: { 900: '#FFFFFF', 800: '#FAFAFA', 700: '#F4F4F4', 600: '#EBEBEB', 500: '#DDDDDD' },
  text: { primary: '#111111', secondary: '#444444', muted: '#888888', inverse: '#FFFFFF' },
  border: { subtle: '#EBEBEB', default: '#DDDDDD' },
  bg: {
    nav: 'rgba(255,255,255,0.97)', card: '#FAFAFA', page: '#FFFFFF', input: '#F4F4F4',
    modal: '#FAFAFA', modalBorder: '#DDDDDD', tab: '#F4F4F4', tabActive: '#EBEBEB',
    modalOverlay: 'rgba(0,0,0,0.20)',
  },
  shadow: {
    card: '0 1px 4px rgba(0,0,0,0.06)',
    modal: '0 8px 40px rgba(0,0,0,0.10)',
    cardHover: '0 2px 12px rgba(0,0,0,0.08)',
  },
}

export const glass = {
  ...shared,
  violet: { default: '#A78BFA' },
  brand: {
    default: '#60A5FA', light: '#93C5FD', dark: '#3B82F6', muted: '#2563EB',
    glow: 'rgba(96,165,250,0.25)', dim: 'rgba(96,165,250,0.08)', dimStrong: 'rgba(96,165,250,0.16)',
  },
  signal: { default: '#F472B6', dark: '#60A5FA', dim: 'rgba(244,114,182,0.12)' },
  jade: { default: '#34D399', dim: 'rgba(52,211,153,0.10)', border: 'rgba(52,211,153,0.25)', dimStrong: 'rgba(52,211,153,0.18)' },
  chart: ['#60A5FA', '#F472B6', '#34D399', '#FBBF24', '#A78BFA', '#2DD4BF'],
  surface: { 900: '#0F172A', 800: 'rgba(255,255,255,0.04)', 700: 'rgba(255,255,255,0.07)', 600: 'rgba(255,255,255,0.10)', 500: 'rgba(255,255,255,0.16)' },
  text: { primary: '#F1F5F9', secondary: '#94A3B8', muted: '#475569', inverse: '#0F172A' },
  border: { subtle: 'rgba(255,255,255,0.07)', default: 'rgba(255,255,255,0.12)' },
  bg: {
    nav: 'rgba(15,23,42,0.85)', card: 'rgba(255,255,255,0.05)', page: '#0F172A', input: 'rgba(255,255,255,0.06)',
    modal: 'rgba(15,23,42,0.90)', modalBorder: 'rgba(255,255,255,0.14)', tab: 'rgba(255,255,255,0.04)', tabActive: 'rgba(255,255,255,0.09)',
    modalOverlay: 'rgba(0,0,0,0.50)',
  },
  shadow: {
    card: '0 4px 24px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.06)',
    modal: '0 8px 48px rgba(0,0,0,0.48)',
    cardHover: '0 8px 32px rgba(96,165,250,0.12)',
  },
}

export const mono = {
  ...shared,
  violet: { default: '#AAAAAA' },
  brand: {
    default: '#E8E8E8', light: '#FFFFFF', dark: '#CCCCCC', muted: '#AAAAAA',
    glow: 'rgba(232,232,232,0.20)', dim: 'rgba(232,232,232,0.06)', dimStrong: 'rgba(232,232,232,0.12)',
  },
  signal: { default: '#FFFFFF', dark: '#CCCCCC', dim: 'rgba(255,255,255,0.10)' },
  jade: { default: '#CCCCCC', dim: 'rgba(204,204,204,0.10)', border: 'rgba(204,204,204,0.25)', dimStrong: 'rgba(204,204,204,0.18)' },
  azure: { default: '#AAAAAA', dim: 'rgba(170,170,170,0.10)', border: 'rgba(170,170,170,0.25)', dimStrong: 'rgba(170,170,170,0.18)', dimBg: 'rgba(170,170,170,0.06)', dimBorder: 'rgba(170,170,170,0.14)' },
  chart: ['#FFFFFF', '#BBBBBB', '#888888', '#EEEEEE', '#999999', '#DDDDDD'],
  surface: { 900: '#080808', 800: '#111111', 700: '#1A1A1A', 600: '#242424', 500: '#333333' },
  text: { primary: '#EEEEEE', secondary: '#999999', muted: '#555555', inverse: '#080808' },
  border: { subtle: '#242424', default: '#333333' },
  bg: {
    nav: 'rgba(8,8,8,0.98)', card: '#111111', page: '#080808', input: '#1A1A1A',
    modal: '#1A1A1A', modalBorder: '#333333', tab: '#1A1A1A', tabActive: '#242424',
    modalOverlay: 'rgba(0,0,0,0.60)',
  },
  shadow: {
    card: '0 2px 16px rgba(0,0,0,0.50)',
    modal: '0 8px 48px rgba(0,0,0,0.70)',
    cardHover: '0 4px 24px rgba(255,255,255,0.04)',
  },
}

export const cyberpunk = {
  ...shared,
  violet: { default: '#BC13FE' },
  brand: {
    default: '#FEE715', light: '#FFF05A', dark: '#CFC010', muted: '#9A8E0A',
    glow: 'rgba(254,231,21,0.20)', dim: 'rgba(254,231,21,0.08)', dimStrong: 'rgba(254,231,21,0.16)',
  },
  signal: { default: '#FF003C', dark: '#FEE715', dim: 'rgba(255,0,60,0.12)' },
  jade: { default: '#00F0FF', dim: 'rgba(0,240,255,0.10)', border: 'rgba(0,240,255,0.30)', dimStrong: 'rgba(0,240,255,0.20)' },
  chart: ['#FEE715', '#FF003C', '#00F0FF', '#BC13FE', '#FF5200', '#00FF66'],
  surface: { 900: '#0E0916', 800: '#170F24', 700: '#231836', 600: '#32234B', 500: '#463266' },
  text: { primary: '#E2D9F3', secondary: '#9B8CB3', muted: '#63567A', inverse: '#0E0916' },
  border: { subtle: '#32234B', default: '#463266' },
  bg: {
    nav: 'rgba(14,9,22,0.97)', card: '#170F24', page: '#0E0916', input: '#231836',
    modal: '#231836', modalBorder: '#463266', tab: '#231836', tabActive: '#32234B',
    modalOverlay: 'rgba(0,0,0,0.65)',
  },
  shadow: {
    card: '0 2px 16px rgba(255,0,60,0.15)',
    modal: '0 8px 48px rgba(0,240,255,0.20)',
    cardHover: '0 4px 24px rgba(254,231,21,0.20)',
  },
}

export const ocean = {
  ...shared,
  violet: { default: '#8B5CF6' },
  brand: {
    default: '#0EA5E9', light: '#38BDF8', dark: '#0284C7', muted: '#0369A1',
    glow: 'rgba(14,165,233,0.20)', dim: 'rgba(14,165,233,0.08)', dimStrong: 'rgba(14,165,233,0.16)',
  },
  signal: { default: '#F59E0B', dark: '#10B981', dim: 'rgba(245,158,11,0.12)' },
  jade: { default: '#10B981', dim: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.30)', dimStrong: 'rgba(16,185,129,0.20)' },
  chart: ['#0EA5E9', '#10B981', '#6366F1', '#F59E0B', '#14B8A6', '#8B5CF6'],
  surface: { 900: '#081426', 800: '#0C1C35', 700: '#112648', 600: '#183460', 500: '#22467D' },
  text: { primary: '#E0F2FE', secondary: '#93C5FD', muted: '#60A5FA', inverse: '#081426' },
  border: { subtle: '#183460', default: '#22467D' },
  bg: {
    nav: 'rgba(8,20,38,0.97)', card: '#0C1C35', page: '#081426', input: '#112648',
    modal: '#112648', modalBorder: '#22467D', tab: '#112648', tabActive: '#183460',
    modalOverlay: 'rgba(0,0,0,0.50)',
  },
  shadow: {
    card: '0 2px 16px rgba(0,0,0,0.40)',
    modal: '0 8px 48px rgba(0,0,0,0.60)',
    cardHover: '0 4px 24px rgba(14,165,233,0.15)',
  },
}

export const forest = {
  ...shared,
  violet: { default: '#86198F' },
  brand: {
    default: '#22C55E', light: '#4ADE80', dark: '#16A34A', muted: '#15803D',
    glow: 'rgba(34,197,94,0.20)', dim: 'rgba(34,197,94,0.08)', dimStrong: 'rgba(34,197,94,0.16)',
  },
  signal: { default: '#EAB308', dark: '#84CC16', dim: 'rgba(234,179,8,0.12)' },
  jade: { default: '#84CC16', dim: 'rgba(132,204,22,0.10)', border: 'rgba(132,204,22,0.30)', dimStrong: 'rgba(132,204,22,0.20)' },
  chart: ['#22C55E', '#EAB308', '#84CC16', '#F97316', '#14B8A6', '#10B981'],
  surface: { 900: '#0D1711', 800: '#132118', 700: '#1A2C21', 600: '#233A2B', 500: '#2D4B38' },
  text: { primary: '#DCFCE7', secondary: '#86EFAC', muted: '#4ADE80', inverse: '#0D1711' },
  border: { subtle: '#233A2B', default: '#2D4B38' },
  bg: {
    nav: 'rgba(13,23,17,0.97)', card: '#132118', page: '#0D1711', input: '#1A2C21',
    modal: '#1A2C21', modalBorder: '#2D4B38', tab: '#1A2C21', tabActive: '#233A2B',
    modalOverlay: 'rgba(0,0,0,0.50)',
  },
  shadow: {
    card: '0 2px 16px rgba(0,0,0,0.35)',
    modal: '0 8px 48px rgba(0,0,0,0.50)',
    cardHover: '0 4px 24px rgba(34,197,94,0.12)',
  },
}

export const themes = { dark, light, retro, terminal, neon, minimal, glass, mono, cyberpunk, ocean, forest }

export const themeList = [
  { id: 'dark', label: 'Dark', preview: ['#0C0B0D', '#131117', '#B91C3C'] },
  { id: 'light', label: 'Light', preview: ['#EDE9E4', '#FAF8F5', '#B91C3C'] },
  { id: 'retro', label: 'Retro', preview: ['#1A1208', '#231A0C', '#E8A020'] },
  { id: 'terminal', label: 'Terminal', preview: ['#000000', '#040804', '#00FF41'] },
  { id: 'neon', label: 'Neon', preview: ['#060010', '#0C0018', '#FF00FF'] },
  { id: 'minimal', label: 'Minimal', preview: ['#FFFFFF', '#FAFAFA', '#111111'] },
  { id: 'glass', label: 'Glass', preview: ['#0F172A', '#1E293B', '#60A5FA'] },
  { id: 'mono', label: 'Mono', preview: ['#080808', '#111111', '#E8E8E8'] },
  { id: 'cyberpunk', label: 'Cyberpunk', preview: ['#0E0916', '#170F24', '#FEE715'] },
  { id: 'ocean', label: 'Ocean', preview: ['#081426', '#0C1C35', '#0EA5E9'] },
  { id: 'forest', label: 'Forest', preview: ['#0D1711', '#132118', '#22C55E'] },
]