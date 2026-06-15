const sizes = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[2.5px]',
}

export default function LoadingSpinner({ size = 'md', className = '' }) {
  return (
    <div
      className={`animate-spin rounded-full border-[var(--color-border)] border-t-[var(--color-primary)] ${sizes[size]} ${className}`}
    />
  )
}
