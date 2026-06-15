import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  HiOutlineArrowLeft,
  HiOutlineUserGroup,
  HiOutlineCalendarDays,
  HiOutlinePlus,
} from 'react-icons/hi2'
import { HiChevronRight } from 'react-icons/hi'
import { Button, Badge, LoadingSpinner } from '../components/ui'
import { formatCurrency, formatDate } from '../utils/format'
import { getGroup } from '../services/service'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const categoryColors = {
  housing: '#2563eb',
  utilities: '#06b6d4',
  food: '#f59e0b',
  shopping: '#ef4444',
  travel: '#7c3aed',
  entertainment: '#ec4899',
  other: '#64748b',
}

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

export default function GroupDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await getGroup(id)
      setGroup(res.data)
    } catch (err) {
      setError(err.message || 'Failed to load group')
      setGroup(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!group) {
    return (
      <div className="text-center py-24">
        <p className="text-base font-semibold text-[var(--color-text)]">
          {error || 'Group not found'}
        </p>
        {error && (
          <div className="flex items-center justify-center gap-3 mt-4">
            <Button onClick={load}>Retry</Button>
            <Button variant="outline" onClick={() => navigate('/groups')}>
              Back to Groups
            </Button>
          </div>
        )}
        {!error && (
          <Button variant="outline" className="mt-4" onClick={() => navigate('/groups')}>
            Back to Groups
          </Button>
        )}
      </div>
    )
  }

  const totalPaidByMembers = group.members.reduce((s, m) => s + m.totalPaid, 0)
  const pendingSettlements = group.settlements.filter((s) => s.status === 'pending')
  const settledCount = group.settlements.filter((s) => s.status === 'settled').length
  const avgPerPerson = totalPaidByMembers / group.members.length

  const breakdownData = Object.entries(
    group.expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount
      return acc
    }, {}),
  ).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: categoryColors[name] || '#64748b',
  }))

  const memberSpending = group.members.map((m) => ({
    name: m.name.split(' ')[0],
    amount: m.totalPaid,
  }))

  return (
    <div className="space-y-8">
      <button
        onClick={() => navigate('/groups')}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
      >
        <HiOutlineArrowLeft className="h-4 w-4" />
        Back to Groups
      </button>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">
              {group.name}
            </h1>
            <Badge variant="info" size="sm">
              {group.category}
            </Badge>
          </div>
          <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
            {group.description}
          </p>
          <div className="mt-3 flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1.5">
              <HiOutlineCalendarDays className="h-3.5 w-3.5" />
              Created {formatDate(group.createdAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <HiOutlineUserGroup className="h-3.5 w-3.5" />
              {group.memberCount} members
            </span>
          </div>
        </div>
        <Button>
          <HiOutlinePlus className="h-4 w-4" />
          Add Expense
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
            Total Expenses
          </p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-[var(--color-text)]">
            {group.expenses.length}
          </p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
            Total Amount
          </p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-[var(--color-text)]">
            {formatCurrency(group.totalExpenses)}
          </p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
            Avg per Person
          </p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-[var(--color-text)]">
            {formatCurrency(avgPerPerson)}
          </p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
            Pending Settlements
          </p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-[var(--color-text)]">
            {pendingSettlements.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">
              Members
            </h3>
            <span className="text-xs text-[var(--color-text-muted)]">
              {group.memberCount} total
            </span>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {group.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-[var(--color-surface-hover)]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={member.name} className="h-9 w-9 text-xs" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text)] truncate">
                      {member.name}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {member.email}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-sm font-semibold text-[var(--color-text)]">
                    {formatCurrency(member.totalPaid)}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {member.expensesCount} expenses
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
            <div className="border-b border-[var(--color-border)] px-6 py-4">
              <h3 className="text-sm font-semibold text-[var(--color-text)]">
                Expense Breakdown
              </h3>
            </div>
            <div className="p-6">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={breakdownData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {breakdownData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #e2e8f0',
                        padding: '6px 10px',
                        fontSize: 12,
                      }}
                      formatter={(v) => [formatCurrency(v), 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {breakdownData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[var(--color-text-secondary)]">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-semibold text-[var(--color-text)]">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
            <div className="border-b border-[var(--color-border)] px-6 py-4">
              <h3 className="text-sm font-semibold text-[var(--color-text)]">
                Member Spending
              </h3>
            </div>
            <div className="p-6">
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={memberSpending} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #e2e8f0',
                        padding: '6px 10px',
                        fontSize: 12,
                      }}
                      formatter={(v) => [formatCurrency(v), 'Spent']}
                      cursor={{ fill: '#f1f5f9' }}
                    />
                    <Bar
                      dataKey="amount"
                      fill="#2563eb"
                      radius={[4, 4, 0, 0]}
                      barSize={28}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text)]">
              Expenses
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              {group.expenses.length} transactions
            </p>
          </div>
          <button className="text-xs font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors">
            View all
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="px-6 py-3.5 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                  Paid By
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider hidden sm:table-cell">
                  Category
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider hidden md:table-cell">
                  Split
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {group.expenses.map((expense) => (
                <tr
                  key={expense.id}
                  className="transition-colors hover:bg-[var(--color-surface-hover)]"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text)]">
                        {expense.description}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                        {formatDate(expense.date)}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Avatar name={expense.paidBy} className="h-7 w-7 text-[10px]" />
                      <span className="text-sm text-[var(--color-text)]">
                        {expense.paidBy}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <Badge variant="neutral" size="sm">
                      {expense.category}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-sm text-[var(--color-text-muted)]">
                      {expense.split}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-semibold text-[var(--color-text)]">
                      {formatCurrency(expense.amount, expense.currency)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text)]">
              Settlement Suggestions
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              {settledCount} of {group.settlements.length} completed
            </p>
          </div>
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {group.settlements.map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-[var(--color-surface-hover)]"
            >
              <div className="flex items-center gap-4 min-w-0">
                <Avatar name={s.from} className="h-9 w-9 text-xs shrink-0" />
                <div className="hidden sm:flex items-center gap-2 text-[var(--color-text-muted)]">
                  <HiOutlineArrowLeft className="h-4 w-4 rotate-180" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-[var(--color-text)]">
                    {s.from}
                  </span>
                  <div className="hidden sm:flex items-center gap-2 text-[var(--color-text-muted)]">
                    <span className="text-xs">pays</span>
                    <HiChevronRight className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-[var(--color-text)]">
                    {s.to}
                  </span>
                </div>
                <Avatar name={s.to} className="h-9 w-9 text-xs shrink-0" />
              </div>
              <div className="flex items-center gap-4 shrink-0 ml-4">
                <span className="text-sm font-semibold text-[var(--color-text)]">
                  {formatCurrency(s.amount)}
                </span>
                <Badge
                  variant={s.status === 'settled' ? 'success' : 'warning'}
                  size="sm"
                  dot
                >
                  {s.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
