export default function GroupCardSkeleton() {
  return (
    <div className="relative rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm animate-pulse">
      <div className="absolute inset-x-0 top-0 h-1 rounded-t-[var(--radius-xl)] bg-[var(--color-border)]" />
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-5 w-40 rounded-md bg-[var(--color-border-light)]" />
            <div className="h-4 w-64 rounded-md bg-[var(--color-border-light)]" />
          </div>
          <div className="h-5 w-16 rounded-full bg-[var(--color-border-light)]" />
        </div>
        <div className="flex items-center gap-5 pt-2">
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
      </div>
      <div className="flex items-center gap-1 border-t border-[var(--color-border)] px-5 py-3">
        <div className="h-6 w-14 rounded-lg bg-[var(--color-border-light)]" />
        <div className="h-6 w-14 rounded-lg bg-[var(--color-border-light)]" />
        <div className="h-6 w-16 rounded-lg bg-[var(--color-border-light)] ml-auto" />
      </div>
    </div>
  )
}
