import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  { label, error, helperText, leftIcon: LeftIcon, className = '', ...props },
  ref,
) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-[var(--color-text)]">
          {label}
        </label>
      )}
      <div className="relative">
        {LeftIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <LeftIcon className="h-4 w-4 text-[var(--color-text-muted)]" />
          </div>
        )}
        <input
          ref={ref}
          className={`h-10 w-full rounded-[var(--radius-md)] border bg-white px-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] transition-base focus-ring ${
            error
              ? 'border-[var(--color-danger)]'
              : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'
          } ${LeftIcon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-[var(--color-text-muted)]">{helperText}</p>
      )}
    </div>
  )
})

export default Input
