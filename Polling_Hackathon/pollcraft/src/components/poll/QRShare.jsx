import { useEffect, useRef, useState, useCallback } from 'react'
import { Copy, Download, Check, ExternalLink } from 'lucide-react'
import QRCode from 'qrcode'
import { useTheme } from '../../context/ThemeContext.jsx'

const THEME_COLORS = {
  dark: { dark: '#B91C3C', light: '#0C0B0D' },
  light: { dark: '#B91C3C', light: '#FAF8F5' },
}

function QRCanvas({ url, size = 180 }) {
  const canvasRef = useRef(null)
  const { themeName } = useTheme()
  const colors = THEME_COLORS[themeName] || THEME_COLORS.dark

  useEffect(() => {
    if (!canvasRef.current || !url) return
    QRCode.toCanvas(canvasRef.current, url, {
      width: size,
      margin: 1,
      color: { dark: colors.dark, light: colors.light },
    })
  }, [url, size, colors.dark, colors.light])

  return <canvas ref={canvasRef} width={size} height={size} style={{ imageRendering: 'pixelated' }} />
}

export default function QRShare({ pollSlug, pollId }) {
  const [copied, setCopied] = useState(false)
  const { themeName } = useTheme()
  const colors = THEME_COLORS[themeName] || THEME_COLORS.dark
  const pollUrl = `${window.location.origin}/poll/${pollSlug || pollId}`

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(pollUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [pollUrl])

  const handleDownload = useCallback(async () => {
    const canvas = document.createElement('canvas')
    await QRCode.toCanvas(canvas, pollUrl, {
      width: 512,
      margin: 2,
      color: { dark: colors.dark, light: colors.light },
    })
    const link = document.createElement('a')
    link.download = `poll-qr-${pollSlug || pollId}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [pollUrl, pollSlug, pollId, colors])

  return (
    <div className="card p-6 relative overflow-hidden" style={{ borderColor: 'var(--brand-dim-strong)' }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, var(--brand), transparent)` }} />
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1.5 h-6 rounded-full" style={{ background: 'var(--brand)' }} />
        <h3 className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Share Poll</h3>
      </div>
      <div className="flex gap-6 items-start">
        <div className="relative shrink-0">
          <div className="p-2 rounded-sm" style={{ background: colors.light, border: '1px solid var(--border-default)' }}>
            <QRCanvas url={pollUrl} size={144} />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3" style={{ borderTop: '2px solid var(--brand)', borderRight: '2px solid var(--brand)' }} />
          <div className="absolute -bottom-1 -left-1 w-3 h-3" style={{ borderBottom: '2px solid var(--brand)', borderLeft: '2px solid var(--brand)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Poll Link</p>
          <p className="text-xs font-mono truncate mb-4 select-all" style={{ color: 'var(--text-secondary)', wordBreak: 'break-all' }}>{pollUrl}</p>
          <div className="space-y-2">
            <button onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-body font-semibold rounded-sm transition-all duration-150 active:scale-[0.98]"
              style={copied ? { background: 'var(--jade-dim)', color: 'var(--jade)', border: '1px solid var(--jade-border)' } : { background: 'var(--brand)', color: 'var(--text-inverse)', border: '1px solid transparent' }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <div className="flex gap-2">
              <button onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-mono rounded-sm transition-all duration-150"
                style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              >
                <Download size={12} />QR
              </button>
              <a href={pollUrl} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-mono rounded-sm transition-all duration-150"
                style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--jade)'; e.currentTarget.style.color = 'var(--jade)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              >
                <ExternalLink size={12} />Open
              </a>
            </div>
          </div>
          <p className="text-xs font-mono mt-3" style={{ color: 'var(--text-muted)' }}>Scan QR to respond on mobile</p>
        </div>
      </div>
    </div>
  )
}