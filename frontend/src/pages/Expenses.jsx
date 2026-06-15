import { useState, useEffect, useMemo } from 'react'
import {
  HiOutlineMagnifyingGlass,
  HiOutlinePlus,
  HiOutlineFunnel,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineArrowsUpDown,
  HiOutlineChevronUp,
  HiOutlineChevronDown,
  HiOutlineXMark,
} from 'react-icons/hi2'
import { PageHeader, Button, Badge, EmptyState, LoadingSpinner } from '../components/ui'
import { Pagination } from '../components/tables'
import { formatCurrency, formatDate } from '../utils/format'
import { getExpenses } from '../services/service'

function SortIcon({ direction }) {
  if (direction === 'asc') return <HiOutlineChevronUp className="h-3 w-3" />
  if (direction === 'desc') return <HiOutlineChevronDown className="h-3 w-3" />
  return <HiOutlineArrowsUpDown className="h-3 w-3 opacity-40" />
}

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [groupFilter, setGroupFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sortField, setSortField] = useState('date')
  const [sortDir, setSortDir] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await getExpenses()
      setExpenses(res.data.items)
    } catch (err) {
      setError(err.message || 'Failed to load expenses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const groups = useMemo(() => [...new Set(expenses.map((e) => e.group))], [expenses])
  const categories = useMemo(() => [...new Set(expenses.map((e) => e.category))], [expenses])

  function handleSort(field) {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('desc')
    }
    setCurrentPage(1)
  }

  const sortableColumns = [
    { key: 'title', label: 'Expense Title' },
    { key: 'amount', label: 'Amount' },
    { key: 'paidBy', label: 'Paid By' },
    { key: 'date', label: 'Date' },
    { key: 'group', label: 'Group' },
    { key: 'splitType', label: 'Split Type' },
  ]

  const filtered = useMemo(() => {
    let data = [...expenses]
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.paidBy.toLowerCase().includes(q) ||
          e.group.toLowerCase().includes(q),
      )
    }
    if (groupFilter) data = data.filter((e) => e.group === groupFilter)
    if (categoryFilter) data = data.filter((e) => e.category === categoryFilter)
    return data
  }, [expenses, search, groupFilter, categoryFilter])

  const sorted = useMemo(() => {
    const data = [...filtered]
    data.sort((a, b) => {
      let cmp
      if (sortField === 'amount') {
        cmp = a.amount - b.amount
      } else if (sortField === 'date') {
        cmp = new Date(a.date) - new Date(b.date)
      } else {
        cmp = String(a[sortField]).localeCompare(String(b[sortField]))
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return data
  }, [filtered, sortField, sortDir])

  const totalPages = Math.ceil(sorted.length / pageSize)
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const hasActiveFilters = search || groupFilter || categoryFilter

  function clearFilters() {
    setSearch('')
    setGroupFilter('')
    setCategoryFilter('')
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Expenses"
          description="Track and manage all shared expenses."
          actions={
            <Button disabled>
              <HiOutlinePlus className="h-4 w-4" />
              Add Expense
            </Button>
          }
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
          title="Expenses"
          description="Track and manage all shared expenses."
        />
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-base font-semibold text-[var(--color-text)]">Failed to load expenses</p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{error}</p>
          <Button className="mt-6" onClick={load}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Track and manage all shared expenses."
        actions={
          <Button>
            <HiOutlinePlus className="h-4 w-4" />
            Add Expense
          </Button>
        }
      />

      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <div className="flex flex-col gap-4 border-b border-[var(--color-border)] px-6 py-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
              className="h-9 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] pl-9 pr-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] transition-all duration-150 hover:border-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] focus:outline-none focus:shadow-sm"
            />
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <select
              value={groupFilter}
              onChange={(e) => { setGroupFilter(e.target.value); setCurrentPage(1) }}
              className="h-9 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 pr-8 text-sm text-[var(--color-text)] transition-all duration-150 hover:border-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:shadow-sm appearance-none"
            >
              <option value="">All Groups</option>
              {groups.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1) }}
              className="h-9 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 pr-8 text-sm text-[var(--color-text)] transition-all duration-150 hover:border-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:shadow-sm appearance-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
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
            icon={HiOutlineFunnel}
            title="No expenses found"
            description={hasActiveFilters ? 'Try adjusting your search or filters.' : 'No expenses yet. Add your first expense to get started.'}
            action={
              hasActiveFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              ) : (
                <Button>
                  <HiOutlinePlus className="h-4 w-4" />
                  Add Expense
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    {sortableColumns.map((col) => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        className={`sticky top-0 bg-[var(--color-surface)] px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer select-none group ${
                          sortField === col.key
                            ? 'text-[var(--color-primary)]'
                            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                        } ${col.key === 'amount' ? 'text-right' : ''}`}
                      >
                        <div className={`inline-flex items-center gap-1.5 ${col.key === 'amount' ? 'flex-row-reverse' : ''}`}>
                          <span>{col.label}</span>
                          <SortIcon direction={sortField === col.key ? sortDir : null} />
                        </div>
                      </th>
                    ))}
                    <th className="sticky top-0 bg-[var(--color-surface)] px-6 py-3.5 text-right text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {paginated.map((expense) => (
                    <tr
                      key={expense.id}
                      className="group transition-colors hover:bg-[var(--color-surface-hover)]"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-[var(--color-text)]">
                          {expense.title}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-semibold text-[var(--color-text)] tabular-nums">
                          {formatCurrency(expense.amount, expense.currency)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[10px] font-medium text-[var(--color-primary)] shrink-0">
                            {expense.paidBy.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                          <span className="text-sm text-[var(--color-text-secondary)]">
                            {expense.paidBy}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[var(--color-text-muted)]">
                          {formatDate(expense.date)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="neutral" size="sm">
                          {expense.group}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[var(--color-text-secondary)]">
                          {expense.splitType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <button className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] transition-all duration-150">
                            <HiOutlinePencilSquare className="h-3.5 w-3.5" />
                          </button>
                          <button className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger)] transition-all duration-150">
                            <HiOutlineTrash className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
