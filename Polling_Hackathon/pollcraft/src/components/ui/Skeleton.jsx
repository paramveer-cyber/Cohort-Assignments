export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3">
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
      <div className="skeleton h-3 w-full" />
      <div className="flex gap-2 pt-2">
        <div className="skeleton h-7 w-20" />
        <div className="skeleton h-7 w-20" />
      </div>
    </div>
  )
}

export function SkeletonLine({ className = '' }) {
  return <div className={`skeleton ${className}`} />
}

export function SkeletonAnalytics() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[0,1,2].map(i => (
          <div key={i} className="card p-5">
            <div className="skeleton h-3 w-20 rounded mb-3" />
            <div className="skeleton h-8 w-16 rounded" />
          </div>
        ))}
      </div>
      <div className="card p-6">
        <div className="skeleton h-4 w-32 rounded mb-4" />
        <div className="skeleton h-48 w-full rounded" />
      </div>
    </div>
  )
}