import { forwardRef } from 'react'
import LoadingSpinner from './LoadingSpinner'

const variants = {
  primary:
    'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-hover)] shadow-sm',
  secondary:
    'bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-hover)] active:bg-[var(--color-secondary-hover)] shadow-sm',
  outline:
    'border border-[var(--color-border)] bg-white text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] active:bg-[var(--color-surface-hover)]',
  ghost:
    'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] active:bg-[var(--color-surface-hover)]',
  danger:
    'bg-[var(--color-danger)] text-white hover:bg-[var(--color-danger-hover)] active:bg-[var(--color-danger-hover)] shadow-sm',
}

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
}

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, children, className = '', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium rounded-[var(--radius-md)] transition-base focus-ring cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  )
})

export default Button
