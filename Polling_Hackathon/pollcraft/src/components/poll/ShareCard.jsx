import { useRef, useState, useCallback, useEffect } from 'react'
import { X, Download } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext.jsx'

function getPct(votes, total) {
  if (!total) return 0
  return Math.round((votes / total) * 100)
}

function getWinner(options) {
  if (!options || !options.length) return null
  return options.reduce((a, b) => b.votes > a.votes ? b : a)
}

function drawRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

function cut(str, max) {
  if (!str) return ''
  return str.length > max ? str.slice(0, max) + '\u2026' : str
}

function renderToCanvas(canvas, results, theme) {
  const dpr = 2
  const W = 520
  const chartColors = theme.chart || ['#FF6B35', '#14B8A6', '#FFB347']
  const brand = theme.brand?.default || '#B91C3C'
  const textInverse = theme.text?.inverse || '#E8E6F0'
  const brandDim = theme.brand?.dim || 'rgba(185,28,60,0.07)'
  const bgPage = theme.bg?.page || '#0C0B0D'
  const bgCard = theme.bg?.card || '#131117'
  const textPrimary = theme.text?.primary || '#E8E6F0'
  const textSecondary = theme.text?.secondary || '#8C8899'
  const textMuted = theme.text?.muted || '#58536A'
  const borderSubtle = theme.border?.subtle || '#27242D'

  const questions = results.questions || []
  const totalResponses = results.totalResponses ?? 0

  let H = 76
  H += 16
  if (results.pollDescription) {
    H += 24
  }
  H += 16
  H += 92
  questions.forEach(q => {
    H += 34
    const winner = getWinner(q.options)
    if (winner) H += 54
    const opts = [...q.options].sort((a, b) => b.votes - a.votes).slice(0, 4)
    H += opts.length * 36
    H += 12
  })
  H += 16
  H += 48

  canvas.width = W * dpr
  canvas.height = H * dpr
  canvas.style.width = W + 'px'
  canvas.style.height = H + 'px'

  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  ctx.textBaseline = 'alphabetic'

  ctx.fillStyle = bgPage
  drawRoundRect(ctx, 0, 0, W, H, 12)
  ctx.fill()
  ctx.strokeStyle = borderSubtle
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.fillStyle = brand
  drawRoundRect(ctx, 0, 0, W, 40, 12)
  ctx.fill()
  ctx.fillRect(0, 20, W, 20)

  ctx.font = '700 12px monospace'
  ctx.fillStyle = textInverse
  ctx.textAlign = 'left'
  ctx.fillText('POLLCRAFT', 24, 25)

  ctx.font = '500 11px monospace'
  ctx.fillStyle = textInverse
  ctx.textAlign = 'right'
  ctx.fillText('RESULTS', W - 24, 25)

  let y = 76

  ctx.font = '700 22px system-ui, -apple-system, sans-serif'
  ctx.fillStyle = textPrimary
  ctx.textAlign = 'left'
  ctx.fillText(cut(results.pollTitle || 'Poll Results', 52), 24, y)
  y += 16

  if (results.pollDescription) {
    y += 8
    ctx.font = '400 13px system-ui, -apple-system, sans-serif'
    ctx.fillStyle = textMuted
    ctx.fillText(cut(results.pollDescription, 80), 24, y)
    y += 16
  }

  y += 16

  const bw = 110, bh = 56
  ;[
    { val: String(totalResponses), label: 'RESPONSES', color: brand, x: 24 },
    { val: String(questions.length), label: 'QUESTIONS', color: textSecondary, x: 24 + bw + 16 },
  ].forEach(({ val, label, color, x }) => {
    drawRoundRect(ctx, x, y, bw, bh, 8)
    ctx.fillStyle = bgCard
    ctx.fill()
    ctx.strokeStyle = borderSubtle
    ctx.stroke()

    ctx.textAlign = 'center'
    ctx.font = '700 24px monospace'
    ctx.fillStyle = color
    ctx.fillText(val, x + bw / 2, y + 34)
    ctx.font = '500 10px monospace'
    ctx.fillStyle = textMuted
    ctx.fillText(label, x + bw / 2, y + 48)
  })

  y += bh + 36

  ctx.textAlign = 'left'

  questions.forEach((q, qi) => {
    const totalQ = q.options.reduce((s, o) => s + o.votes, 0)
    const winner = getWinner(q.options)
    const sortedOpts = [...q.options].sort((a, b) => b.votes - a.votes).slice(0, 4)

    drawRoundRect(ctx, 24, y, 34, 22, 6)
    ctx.fillStyle = bgCard
    ctx.fill()
    ctx.strokeStyle = borderSubtle
    ctx.stroke()

    ctx.font = '600 11px monospace'
    ctx.fillStyle = textMuted
    ctx.textAlign = 'center'
    ctx.fillText('Q' + (qi + 1), 41, y + 15)

    ctx.textAlign = 'left'
    ctx.font = '600 14px system-ui, -apple-system, sans-serif'
    ctx.fillStyle = textSecondary
    ctx.fillText(cut(q.content, 55), 70, y + 16)

    y += 34

    if (winner) {
      const winnerPct = getPct(winner.votes, totalQ)
      drawRoundRect(ctx, 24, y, W - 48, 38, 8)
      ctx.fillStyle = brandDim
      ctx.fill()
      ctx.strokeStyle = brand + '33'
      ctx.stroke()

      ctx.font = '700 13px monospace'
      ctx.fillStyle = brand
      ctx.fillText(winnerPct + '%', 38, y + 24)

      ctx.font = '600 13px system-ui, -apple-system, sans-serif'
      ctx.fillStyle = textPrimary
      ctx.fillText(cut(winner.text, 40), 80, y + 23)

      ctx.textAlign = 'right'
      ctx.font = '600 10px monospace'
      ctx.fillStyle = brand
      ctx.fillText('LEADING', W - 38, y + 23)
      ctx.textAlign = 'left'

      y += 54
    }

    sortedOpts.forEach((opt, oi) => {
      const pct = getPct(opt.votes, totalQ)
      const isWin = winner && opt.text === winner.text
      const barColor = isWin ? brand : chartColors[oi % chartColors.length]

      ctx.font = isWin ? '600 12px system-ui, -apple-system, sans-serif' : '400 12px system-ui, -apple-system, sans-serif'
      ctx.fillStyle = isWin ? textPrimary : textSecondary
      ctx.fillText(cut(opt.text, 50), 24, y + 12)

      ctx.textAlign = 'right'
      ctx.font = '600 12px monospace'
      ctx.fillStyle = isWin ? brand : textMuted
      ctx.fillText(pct + '%', W - 24, y + 12)
      ctx.textAlign = 'left'

      drawRoundRect(ctx, 24, y + 20, W - 48, 6, 3)
      ctx.fillStyle = bgCard
      ctx.fill()
      ctx.strokeStyle = borderSubtle
      ctx.stroke()

      if (pct > 0) {
        const barW = Math.max(6, Math.round((W - 48) * pct / 100))
        drawRoundRect(ctx, 24, y + 20, barW, 6, 3)
        ctx.fillStyle = barColor
        ctx.fill()
      }

      y += 36
    })
    y += 12
  })

  y += 16

  ctx.beginPath()
  ctx.moveTo(0, y)
  ctx.lineTo(W, y)
  ctx.strokeStyle = borderSubtle
  ctx.stroke()

  ctx.fillStyle = bgCard
  drawRoundRect(ctx, 0, y, W, 48, 12)
  ctx.fill()
  ctx.fillRect(0, y, W, 24)

  ctx.textAlign = 'left'
  ctx.font = '500 11px monospace'
  ctx.fillStyle = textMuted
  ctx.fillText('pollcraft.app', 24, y + 28)

  ctx.textAlign = 'right'
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  ctx.fillText(dateStr, W - 24, y + 28)
}

export default function ShareCard({ results, onClose }) {
  const { theme, themeName } = useTheme()
  const canvasRef = useRef(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (canvasRef.current) renderToCanvas(canvasRef.current, results, theme)
  }, [results, theme])

  const exportPNG = useCallback(() => {
    if (!canvasRef.current) return
    setExporting(true)
    try {
      const url = canvasRef.current.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = url
      const slug = (results.pollTitle || 'poll').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      link.download = slug + '-results.png'
      link.click()
    } finally {
      setExporting(false)
    }
  }, [results])

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'var(--modal-overlay)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: 'var(--modal-bg)', border: '1px solid var(--modal-border)', borderRadius: '4px', padding: '24px', maxWidth: '600px', width: '100%', boxShadow: 'var(--shadow-modal)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '15px', margin: 0, letterSpacing: '0.06em' }}>SHARE RESULTS</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: '2px 0 0', fontFamily: 'monospace' }}>export as png · theme: {themeName}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button onClick={exportPNG} disabled={exporting} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '2px', border: 'none', background: 'var(--brand)', color: 'var(--text-inverse)', fontSize: '12px', fontWeight: 600, cursor: exporting ? 'wait' : 'pointer', opacity: exporting ? 0.7 : 1 }}>
              <Download size={13} />
              {exporting ? 'Exporting\u2026' : 'Download PNG'}
            </button>
            <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '2px', border: '1px solid var(--border-default)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={15} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', overflow: 'auto' }}>
          <canvas ref={canvasRef} style={{ borderRadius: '10px', display: 'block', maxWidth: '100%' }} />
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'monospace', marginTop: '12px' }}>
          canvas render — what you see is what exports
        </p>
      </div>
    </div>
  )
}