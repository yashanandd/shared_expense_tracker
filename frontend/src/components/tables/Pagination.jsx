import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'

export default function Pagination({ currentPage, totalPages, totalItems, pageSize, onPageChange }) {
  if (totalPages <= 1) return null

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  function getPages() {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      let start = Math.max(2, currentPage - 1)
      let end = Math.min(totalPages - 1, currentPage + 1)

      if (currentPage <= 2) {
        start = 2
        end = Math.min(4, totalPages - 1)
      }
      if (currentPage >= totalPages - 1) {
        start = Math.max(totalPages - 3, 2)
        end = totalPages - 1
      }

      if (start > 2) pages.push('...')
      for (let i = start; i <= end; i++) pages.push(i)
      if (end < totalPages - 1) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="flex items-center justify-between border-t border-[var(--color-border)] px-5 py-3">
      <p className="text-xs text-[var(--color-text-muted)]">
        Showing <span className="font-medium text-[var(--color-text)]">{startItem}</span> to{' '}
        <span className="font-medium text-[var(--color-text)]">{endItem}</span> of{' '}
        <span className="font-medium text-[var(--color-text)]">{totalItems}</span> results
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
        >
          <HiChevronLeft className="h-4 w-4" />
        </button>
        {getPages().map((page, i) =>
          page === '...' ? (
            <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center text-xs text-[var(--color-text-muted)]">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-all duration-150 ${
                page === currentPage
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]'
              }`}
            >
              {page}
            </button>
          ),
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
        >
          <HiChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
