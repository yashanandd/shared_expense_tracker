import { useState, useEffect, useMemo } from 'react'
import { HiOutlineMagnifyingGlass, HiOutlineChevronUp, HiOutlineChevronDown } from 'react-icons/hi2'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Label,
  AreaChart, Area, CartesianGrid,
} from 'recharts'
import { LoadingSpinner, Button } from '../components/ui'
import { formatCurrency } from '../utils/format'
import { getAnalytics } from '../services/service'

function KpiCard({ label, value, change, trend, color }) {
  const isUp = trend === 'up'
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
      <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-[var(--color-text)]">
        {typeof value === 'number' && label !== 'Total Expenses' && label !== 'Active Members' && label !== 'Pending Settlements'
          ? formatCurrency(value)
          : value}
      </p>
      <div className={`mt-2 inline-flex items-center gap-0.5 text-xs font-medium ${isUp ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
        {isUp ? <HiOutlineChevronUp className="h-3 w-3" /> : <HiOutlineChevronDown className="h-3 w-3" />}
        <span>{change}</span>
        <span className="text-[var(--color-text-muted)] ml-1">vs last month</span>
      </div>
    </div>
  )
}

function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`flex flex-col rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm ${className}`}>
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{subtitle}</p>
        )}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}

function BarChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 shadow-lg">
      <p className="text-xs font-medium text-[var(--color-text-muted)] mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold text-[var(--color-text)]">
          {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  )
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 shadow-lg">
      <div className="flex items-center gap-2 mb-1">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.payload.color }} />
        <p className="text-xs font-medium text-[var(--color-text-muted)]">{entry.payload.category}</p>
      </div>
      <p className="text-sm font-semibold text-[var(--color-text)]">
        {formatCurrency(entry.value)}
      </p>
      <p className="text-xs text-[var(--color-text-muted)]">
        {entry.payload.percentage}% of total
      </p>
    </div>
  )
}

const datePresets = [
  { value: 'all', label: 'All Time' },
  { value: '1m', label: 'This Month' },
  { value: '3m', label: 'Last 3 Months' },
  { value: '6m', label: 'Last 6 Months' },
  { value: '1y', label: 'This Year' },
]

export default function Analytics() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [groupFilter, setGroupFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('all')

  const categories = data?.spendingByCategory || []

  const totalCategoryAmount = useMemo(
    () => categories.reduce((s, c) => s + c.amount, 0),
    [categories],
  )

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await getAnalytics()
      setData(res.data)
    } catch (err) {
      setError(err.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-base font-semibold text-[var(--color-text)]">Failed to load analytics</p>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">{error}</p>
        <Button className="mt-6" onClick={load}>Retry</Button>
      </div>
    )
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">
          Analytics
        </h1>
        <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
          Deep dive into your spending patterns and trends.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.kpi.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search analytics..."
            className="h-9 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] pl-9 pr-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] transition-all duration-150 hover:border-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] focus:outline-none focus:shadow-sm"
          />
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="h-9 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 pr-8 text-sm text-[var(--color-text)] transition-all duration-150 hover:border-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:shadow-sm appearance-none"
          >
            <option value="">All Groups</option>
            {data.groups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-9 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 pr-8 text-sm text-[var(--color-text)] transition-all duration-150 hover:border-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:shadow-sm appearance-none"
          >
            {datePresets.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Spending by Member" subtitle="Who spent the most">
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.spendingByMember} margin={{ top: 0, right: 4, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="member" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<BarChartTooltip />} cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="amount" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Spending by Category" subtitle="Breakdown by category" className="h-[520px]">
          <div className="flex flex-col h-full gap-4">
            <div className="flex-1 relative min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={95}
                    outerRadius={155}
                    paddingAngle={3}
                    dataKey="amount"
                    nameKey="category"
                    label={({ cx, cy, midAngle, outerRadius, percent }) => {
                      if (percent < 0.08) return null
                      const RADIAN = Math.PI / 180
                      const radius = outerRadius - 10
                      const x = cx + radius * Math.cos(-midAngle * RADIAN)
                      const y = cy + radius * Math.sin(-midAngle * RADIAN)
                      return (
                        <text x={x} y={y} fill="#475569" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12} fontWeight={600}>
                          {(percent * 100).toFixed(0)}%
                        </text>
                      )
                    }}
                    labelLine={false}
                  >
                    {categories.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                    <Label
                      position="center"
                      content={({ cx, cy }) => (
                        <>
                          <text x={cx} y={cy - 8} textAnchor="middle" fill="#64748b" fontSize={13}>
                            Total Spending
                          </text>
                          <text x={cx} y={cy + 18} textAnchor="middle" fill="#0f172a" fontSize={28} fontWeight={700}>
                            {formatCurrency(totalCategoryAmount)}
                          </text>
                        </>
                      )}
                    />
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2.5 shrink-0">
              {categories.map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-[var(--color-text-secondary)] truncate">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    <span className="text-sm font-bold tabular-nums text-[var(--color-text)] w-14 text-right">
                      {item.percentage}%
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-[var(--color-text)] w-20 text-right">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Monthly Spending Trend" subtitle="12-month overview">
        <div className="h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.monthlyTrend} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="analyticsTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<BarChartTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '3 3' }} />
              <Area type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2} fill="url(#analyticsTrend)" dot={{ r: 3, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 5, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Top Spenders" subtitle="Highest contributors by total amount">
        <div className="divide-y divide-[var(--color-border)]">
          {data.topSpenders.map((spender, index) => (
            <div
              key={spender.member}
              className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  index === 0
                    ? 'bg-yellow-100 text-yellow-700'
                    : index === 1
                      ? 'bg-gray-100 text-gray-600'
                      : index === 2
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]'
                }`}>
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text)] truncate">
                    {spender.member}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {spender.expenseCount} expenses
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  {formatCurrency(spender.amount)}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {spender.percentage}% of total
                </p>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  )
}
