export default function StatusBadge({ status }) {
  const map = {
    draft: { label: 'Draft', style: { background: 'var(--status-draft-bg)', color: 'var(--status-draft)', border: '1px solid var(--status-draft-border)' } },
    active: { label: 'Live', style: { background: 'var(--status-active-bg)', color: 'var(--status-active)', border: '1px solid var(--status-active-border)' } },
    published: { label: 'Published', style: { background: 'var(--status-published-bg)', color: 'var(--status-published)', border: '1px solid var(--status-published-border)' } },
    expired: { label: 'Expired', style: { background: 'var(--status-expired-bg)', color: 'var(--status-expired)', border: '1px solid var(--status-expired-border)' } },
    scheduled: { label: 'Scheduled', style: { background: 'var(--status-scheduled-bg)', color: 'var(--status-scheduled)', border: '1px solid var(--status-scheduled-border)' } },
  }
  const { label, style } = map[status] || map.draft
  return (
    <span className="status-badge" style={style}>
      {status === 'active' && <span className="w-1.5 h-1.5 rounded-full animate-pulse-slow" style={{ background: 'var(--status-active)' }} />}
      {status === 'scheduled' && <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--status-scheduled)' }} />}
      {label}
    </span>
  )
}
