export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse rounded-md bg-[var(--color-border-light)] ${className}`} />
  )
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="animate-pulse space-y-4 p-6">
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 flex-1 rounded bg-[var(--color-border-light)]" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className={`h-8 flex-1 rounded bg-[var(--color-border-light)] ${
                c === 0 ? 'max-w-[200px]' : ''
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-5 w-40 rounded-md bg-[var(--color-border-light)]" />
              <div className="h-4 w-64 rounded-md bg-[var(--color-border-light)]" />
            </div>
            <div className="h-5 w-16 rounded-full bg-[var(--color-border-light)]" />
          </div>
          <div className="flex items-center gap-5 pt-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[var(--color-border-light)]" />
              <div className="space-y-1.5">
                <div className="h-3 w-12 rounded bg-[var(--color-border-light)]" />
                <div className="h-4 w-6 rounded bg-[var(--color-border-light)]" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[var(--color-border-light)]" />
              <div className="space-y-1.5">
                <div className="h-3 w-12 rounded bg-[var(--color-border-light)]" />
                <div className="h-4 w-16 rounded bg-[var(--color-border-light)]" />
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 border-t border-[var(--color-border)] pt-3">
            <div className="h-6 w-14 rounded-lg bg-[var(--color-border-light)]" />
            <div className="h-6 w-14 rounded-lg bg-[var(--color-border-light)]" />
            <div className="h-6 w-16 ml-auto rounded-lg bg-[var(--color-border-light)]" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function KpiSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div className="h-11 w-11 rounded-[var(--radius-lg)] bg-[var(--color-border-light)]" />
            <div className="h-5 w-12 rounded-full bg-[var(--color-border-light)]" />
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 w-24 rounded bg-[var(--color-border-light)]" />
            <div className="h-7 w-20 rounded bg-[var(--color-border-light)]" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ListSkeleton({ count = 5 }) {
  return (
    <div className="animate-pulse divide-y divide-[var(--color-border)]">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[var(--color-border-light)]" />
            <div className="space-y-1.5">
              <div className="h-4 w-40 rounded bg-[var(--color-border-light)]" />
              <div className="h-3 w-24 rounded bg-[var(--color-border-light)]" />
            </div>
          </div>
          <div className="space-y-1.5 text-right">
            <div className="h-4 w-20 ml-auto rounded bg-[var(--color-border-light)]" />
            <div className="h-3 w-12 ml-auto rounded bg-[var(--color-border-light)]" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ChartSkeleton({ height = 320 }) {
  return (
    <div className="animate-pulse rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
      <div className="h-5 w-48 rounded bg-[var(--color-border-light)] mb-5" />
      <div
        className="rounded-[var(--radius-lg)] bg-[var(--color-border-light)]"
        style={{ height }}
      />
    </div>
  )
}
