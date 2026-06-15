import {
  HiOutlineInformationCircle,
  HiOutlineExclamationTriangle,
  HiOutlineXCircle,
} from 'react-icons/hi2'
import { cn } from '../../utils/cn'

const severityConfig = {
  info: {
    icon: HiOutlineInformationCircle,
    containerClass:
      'border-l-[3px] border-[var(--color-info)] bg-[var(--color-info-bg)]',
    iconBgClass: 'bg-blue-100',
    iconClass: 'text-[var(--color-info)]',
    labelClass: 'text-[var(--color-info)]',
    badgeClass:
      'bg-[var(--color-info)]/10 text-[var(--color-info)] ring-1 ring-[var(--color-info)]/20',
    label: 'Info',
  },
  warning: {
    icon: HiOutlineExclamationTriangle,
    containerClass:
      'border-l-[3px] border-[var(--color-warning)] bg-[var(--color-warning-bg)]',
    iconBgClass: 'bg-amber-100',
    iconClass: 'text-[var(--color-warning)]',
    labelClass: 'text-[var(--color-warning)]',
    badgeClass:
      'bg-[var(--color-warning)]/10 text-[var(--color-warning)] ring-1 ring-[var(--color-warning)]/20',
    label: 'Warning',
  },
  error: {
    icon: HiOutlineXCircle,
    containerClass:
      'border-l-[3px] border-[var(--color-danger)] bg-[var(--color-danger-bg)]',
    iconBgClass: 'bg-red-100',
    iconClass: 'text-[var(--color-danger)]',
    labelClass: 'text-[var(--color-danger)]',
    badgeClass:
      'bg-[var(--color-danger)]/10 text-[var(--color-danger)] ring-1 ring-[var(--color-danger)]/20',
    label: 'Error',
  },
}

export default function AnomalyCard({
  severity = 'info',
  title,
  description,
  count,
  className = '',
}) {
  const config = severityConfig[severity]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'animate-in rounded-[var(--radius-md)] p-4 shadow-sm transition-all duration-200 hover:shadow-md',
        config.containerClass,
        className,
      )}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-lg)] ring-1 ring-black/5',
            config.iconBgClass,
          )}
        >
          <Icon className={cn('h-5 w-5', config.iconClass)} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                'text-xs font-semibold uppercase tracking-wider',
                config.labelClass,
              )}
            >
              {config.label}
            </span>
            {count != null && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                  config.badgeClass,
                )}
              >
                {count} {count === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
            {title}
          </p>
          {description && (
            <p className="mt-0.5 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
