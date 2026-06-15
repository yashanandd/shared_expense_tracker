export default function PageHeader({
  title,
  description,
  actions,
  className = '',
}) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  )
}
