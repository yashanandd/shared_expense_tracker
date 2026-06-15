import { forwardRef } from 'react'
import { HiOutlineChevronDown } from 'react-icons/hi'

const Select = forwardRef(function Select(
  { label, error, options, placeholder, className = '', ...props },
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
        <select
          ref={ref}
          className={`h-10 w-full appearance-none rounded-[var(--radius-md)] border bg-white px-3 pr-10 text-sm text-[var(--color-text)] transition-base focus-ring ${
            error
              ? 'border-[var(--color-danger)]'
              : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <HiOutlineChevronDown className="h-4 w-4 text-[var(--color-text-muted)]" />
        </div>
      </div>
      {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
    </div>
  )
})

export default Select
