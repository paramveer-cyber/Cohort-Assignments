const CIRC = 703.7
const R = 112

export default function Arc({ pct = 1, children }) {
  const offset = CIRC * (1 - pct)

  return (
    <div style={{ position: 'relative', width: 260, height: 260 }}>
      <svg
        viewBox="0 0 260 260"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}
      >
        <circle cx="130" cy="130" r={R} fill="none" stroke="var(--grid-line)" strokeWidth="4" />
        <circle
          cx="130" cy="130" r={R}
          fill="none"
          stroke="var(--fg)"
          strokeWidth="3"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          strokeLinecap="butt"
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center'
      }}>
        {children}
      </div>
    </div>
  )
}
