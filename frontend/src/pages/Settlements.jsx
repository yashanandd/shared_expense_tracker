import { useState, useEffect, useMemo } from 'react'
import {
  HiOutlineMagnifyingGlass,
  HiOutlineScale,
  HiOutlineXMark,
} from 'react-icons/hi2'
import { HiChevronRight, HiArrowsRightLeft } from 'react-icons/hi2'
import { PageHeader, Badge, EmptyState, LoadingSpinner, Button } from '../components/ui'
import { Pagination } from '../components/tables'
import { formatCurrency, formatDate } from '../utils/format'
import { getSettlements } from '../services/service'

function Avatar({ name, className = '' }) {
  const initial = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-medium text-white ${className}`}
    >
      {initial}
    </div>
  )
}

function StatusBadge({ status }) {
  const variant = status === 'settled' ? 'success' : 'warning'
  return (
    <Badge variant={variant} size="sm" dot>
      {status}
    </Badge>
  )
}

export default function Settlements() {
  const [settlements, setSettlements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await getSettlements()
      setSettlements(res.data.items)
    } catch (err) {
      setError(err.message || 'Failed to load settlements')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    let data = [...settlements]
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(
        (s) =>
          s.from.toLowerCase().includes(q) ||
          s.to.toLowerCase().includes(q) ||
          s.groupName.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q),
      )
    }
    if (statusFilter) data = data.filter((s) => s.status === statusFilter)
    return data
  }, [settlements, search, statusFilter])

  const sorted = useMemo(() => {
    const data = [...filtered]
    data.sort((a, b) => new Date(b.date) - new Date(a.date))
    return data
  }, [filtered])

  const totalPages = Math.ceil(sorted.length / pageSize)
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const hasActiveFilters = search || statusFilter

  function clearFilters() {
    setSearch('')
    setStatusFilter('')
    setCurrentPage(1)
  }

  const totalPending = settlements.filter((s) => s.status === 'pending').length
  const totalSettled = settlements.filter((s) => s.status === 'settled').length
  const totalOwed = settlements
    .filter((s) => s.status === 'pending')
    .reduce((sum, s) => sum + s.amount, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Settlements"
          description="Track pending and completed payments between members."
        />
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm overflow-hidden">
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Settlements"
          description="Track pending and completed payments between members."
        />
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-base font-semibold text-[var(--color-text)]">Failed to load settlements</p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{error}</p>
          <Button className="mt-6" onClick={load}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settlements"
        description="Track pending and completed payments between members."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 shadow-sm">
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
            Pending
          </p>
          <p className="mt-1 text-xl font-bold tracking-tight text-[var(--color-text)]">
            {totalPending}
          </p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 shadow-sm">
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
            Settled
          </p>
          <p className="mt-1 text-xl font-bold tracking-tight text-[#16a34a]">
            {totalSettled}
          </p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 shadow-sm">
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
            Total Outstanding
          </p>
          <p className="mt-1 text-xl font-bold tracking-tight text-[var(--color-text)]">
            {formatCurrency(totalOwed)}
          </p>
        </div>
      </div>

      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <div className="flex flex-col gap-4 border-b border-[var(--color-border)] px-6 py-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search by person, group, or description..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
              className="h-9 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] pl-9 pr-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] transition-all duration-150 hover:border-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] focus:outline-none focus:shadow-sm"
            />
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
              className="h-9 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 pr-8 text-sm text-[var(--color-text)] transition-all duration-150 hover:border-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:shadow-sm appearance-none"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="settled">Settled</option>
            </select>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-all duration-150"
              >
                <HiOutlineXMark className="h-3.5 w-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {paginated.length === 0 ? (
          <EmptyState
            icon={HiOutlineScale}
            title="No settlements found"
            description={hasActiveFilters ? 'Try adjusting your search or filters.' : 'No settlements yet. They will appear once expenses are added to groups.'}
            action={
              hasActiveFilters ? (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-all duration-150"
                >
                  Clear Filters
                </button>
              ) : null
            }
          />
        ) : (
          <>
            <div className="divide-y divide-[var(--color-border)]">
              {paginated.map((settlement) => (
                <div
                  key={settlement.id}
                  className="flex flex-col gap-3 px-6 py-4 transition-colors hover:bg-[var(--color-surface-hover)] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <Avatar name={settlement.from} className="h-10 w-10 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-[var(--color-text)]">
                          {settlement.from}
                        </span>
                        <HiChevronRight className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
                        <span className="text-sm font-medium text-[var(--color-text)]">
                          {settlement.to}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                        <span>{settlement.groupName}</span>
                        <span aria-hidden="true">·</span>
                        <span>{formatDate(settlement.date)}</span>
                      </div>
                      {settlement.description && (
                        <p className="mt-0.5 text-xs text-[var(--color-text-muted)] truncate max-w-[320px]">
                          {settlement.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-0 sm:ml-4">
                    <span className="text-sm font-semibold tabular-nums text-[var(--color-text)] min-w-[80px] text-left sm:text-right">
                      {formatCurrency(settlement.amount)}
                    </span>
                    <StatusBadge status={settlement.status} />
                  </div>
                </div>
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={sorted.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  )
}
