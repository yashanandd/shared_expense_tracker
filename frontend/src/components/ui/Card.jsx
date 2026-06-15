export default function Card({ children, hover = false, padding = true, className = '', ...props }) {
  return (
    <div
      className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-sm transition-base ${padding ? 'p-6' : ''} ${hover ? 'hover:shadow-md hover:border-[var(--color-border)]' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
