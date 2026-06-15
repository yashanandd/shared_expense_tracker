import { HiOutlineX } from 'react-icons/hi'

const variants = {
  success: 'bg-[var(--color-success-bg)] text-[#16a34a]',
  warning: 'bg-[var(--color-warning-bg)] text-[#d97706]',
  danger: 'bg-[var(--color-danger-bg)] text-[#dc2626]',
  info: 'bg-[var(--color-info-bg)] text-[var(--color-primary)]',
  neutral: 'bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]',
}

const sizes = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-0.5 text-xs',
}

export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  onRemove,
  className = '',
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            variant === 'success'
              ? 'bg-[#16a34a]'
              : variant === 'warning'
                ? 'bg-[#d97706]'
                : variant === 'danger'
                  ? 'bg-[#dc2626]'
                  : variant === 'info'
                    ? 'bg-[var(--color-primary)]'
                    : 'bg-[var(--color-text-muted)]'
          }`}
        />
      )}
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 rounded-full p-0.5 hover:bg-black/5 transition-base"
        >
          <HiOutlineX className="h-3 w-3" />
        </button>
      )}
    </span>
  )
}
