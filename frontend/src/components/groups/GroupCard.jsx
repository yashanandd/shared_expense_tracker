import { HiOutlineUserGroup, HiOutlineBanknotes, HiOutlineEye, HiOutlinePencilSquare, HiOutlineTrash } from 'react-icons/hi2'
import { formatCurrency } from '../../utils/format'

export default function GroupCard({ group, onView, onEdit, onDelete }) {
  return (
    <div className="group relative min-h-[220px] rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
      <div className="absolute inset-x-0 top-0 h-1 rounded-t-[var(--radius-xl)] bg-[var(--color-primary)]" />

      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-[var(--color-text)] truncate">
              {group.name}
            </h3>
            <p className="mt-1 text-sm text-[var(--color-text-muted)] line-clamp-2">
              {group.description}
            </p>
          </div>
          <span className="shrink-0 ml-3 inline-flex items-center rounded-full bg-[var(--color-primary-light)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--color-primary)] capitalize">
            {group.category}
          </span>
        </div>

        <div className="mt-5 flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-surface-hover)]">
              <HiOutlineUserGroup className="h-4 w-4 text-[var(--color-text-muted)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Members</p>
              <p className="text-sm font-semibold text-[var(--color-text)]">
                {group.memberCount}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary-light)]">
              <HiOutlineBanknotes className="h-4 w-4 text-[var(--color-primary)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Total</p>
              <p className="text-sm font-semibold text-[var(--color-text)]">
                {formatCurrency(group.totalExpenses)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 border-t border-[var(--color-border)] px-5 py-3">
        <button
          onClick={() => onView(group)}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] transition-all duration-150"
        >
          <HiOutlineEye className="h-3.5 w-3.5" />
          View
        </button>
        <button
          onClick={() => onEdit(group)}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] transition-all duration-150"
        >
          <HiOutlinePencilSquare className="h-3.5 w-3.5" />
          Edit
        </button>
        <button
          onClick={() => onDelete(group)}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger)] transition-all duration-150 ml-auto"
        >
          <HiOutlineTrash className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </div>
  )
}
