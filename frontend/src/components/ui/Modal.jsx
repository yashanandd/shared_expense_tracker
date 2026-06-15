import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { HiOutlineX } from 'react-icons/hi'

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className = '',
}) {
  const overlayRef = useRef(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape') onClose?.()
    }
    if (open) {
      document.addEventListener('keydown', handleEscape)
    }
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === overlayRef.current) onClose?.()
        }}
      />
      <div
        className={`relative w-full ${sizes[size]} bg-[var(--color-surface)] rounded-[var(--radius-xl)] shadow-xl animate-in ${className}`}
      >
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div className="flex-1 min-w-0 pr-8">
            {title && (
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                {description}
              </p>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] transition-base"
            >
              <HiOutlineX className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="px-6 pb-6">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-[var(--color-border)] px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
