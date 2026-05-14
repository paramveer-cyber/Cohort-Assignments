export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Movement', 'Bebas Neue', 'sans-serif'],
        sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          DEFAULT: 'var(--brand)',
          light: 'var(--brand-light)',
          dark: 'var(--brand-dark)',
          muted: 'var(--brand-muted)',
        },
        signal: {
          DEFAULT: 'var(--signal)',
          dark: 'var(--signal-dark)',
          dim: 'var(--signal-dim)',
        },
        jade: { DEFAULT: 'var(--jade)', dim: 'var(--jade-dim)' },
        azure: { DEFAULT: 'var(--azure)', dim: 'var(--azure-dim)' },
        crimson: { DEFAULT: 'var(--crimson)', dim: 'var(--crimson-dim)' },
        status: {
          draft: 'var(--status-draft)',
          active: 'var(--status-active)',
          published: 'var(--status-published)',
          expired: 'var(--status-expired)',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'bar-grow': 'barGrow 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'marquee': 'marquee 24s linear infinite',
      },
    },
  },
  plugins: [],
}