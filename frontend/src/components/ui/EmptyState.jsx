export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--color-surface-hover)]">
          <Icon className="h-6 w-6 text-[var(--color-text-muted)]" />
        </div>
      )}
      {title && (
        <h3 className="text-base font-semibold text-[var(--color-text)]">
          {title}
        </h3>
      )}
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-[var(--color-text-muted)]">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
