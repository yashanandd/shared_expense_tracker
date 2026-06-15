import { useState, useEffect } from 'react'
import {
  HiOutlineBanknotes,
  HiOutlineUserGroup,
  HiOutlineArrowTrendingUp,
  HiOutlineClock,
  HiOutlinePlusCircle,
} from 'react-icons/hi2'
import {
  HiArrowSmUp,
  HiArrowSmDown,
} from 'react-icons/hi'
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
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts'
import { LoadingSpinner, Button } from '../components/ui'
import { formatCurrency } from '../utils/format'
import { getDashboard } from '../services/service'

const iconMap = {
  HiOutlineBanknotes,
  HiOutlineArrowTrendingUp,
  HiOutlineUserGroup,
  HiOutlineClock,
}

function StatCard({ label, value, trend, trendUp, icon: Icon }) {
  return (
    <div className="flex min-h-[140px] flex-col rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-primary-light)]">
          <Icon className="h-5 w-5 text-[var(--color-primary)]" />
        </div>
        <span
          className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${
            trendUp
              ? 'bg-[var(--color-success-bg)] text-[#16a34a]'
              : 'bg-[var(--color-danger-bg)] text-[#dc2626]'
          }`}
        >
          {trendUp ? (
            <HiArrowSmUp className="h-3 w-3" />
          ) : (
            <HiArrowSmDown className="h-3 w-3" />
          )}
          {trend}
        </span>
      </div>
      <div className="mt-auto pt-4">
        <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-[var(--color-text)]">
          {typeof value === 'number' ? formatCurrency(value) : value}
        </p>
      </div>
    </div>
  )
}

function ChartCard({ title, children, height = 320 }) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
      <h3 className="mb-5 text-sm font-semibold text-[var(--color-text)]">
        {title}
      </h3>
      <div style={{ height }}>{children}</div>
    </div>
  )
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState({
    kpi: [],
    spendingByUser: [],
    expenseDistribution: [],
    monthlyTrend: [],
    recentActivity: [],
    quickActions: [],
  })

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await getDashboard()
      setData({
        kpi: res.data.kpi.map((k) => ({ ...k, icon: iconMap[k.icon] || HiOutlineBanknotes })),
        spendingByUser: res.data.spendingByUser,
        expenseDistribution: res.data.expenseDistribution,
        monthlyTrend: res.data.monthlyTrend,
        recentActivity: res.data.recentActivity,
        quickActions: res.data.quickActions,
      })
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data')
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
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--color-danger-bg)]">
          <HiOutlineClock className="h-6 w-6 text-[var(--color-danger)]" />
        </div>
        <p className="text-base font-semibold text-[var(--color-text)]">Failed to load dashboard</p>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">{error}</p>
        <Button className="mt-6" onClick={load}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text)]">
          Shared Expense Manager
        </h1>
        <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
          Track expenses, manage settlements and analyze spending.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {data.kpi.map((kpi) => (
          <StatCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Spending by User">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.spendingByUser} margin={{ top: 0, right: 0, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                  padding: '8px 12px',
                  fontSize: 13,
                }}
                formatter={(v) => [formatCurrency(v), 'Amount']}
                cursor={{ fill: '#f1f5f9' }}
              />
              <Bar
                dataKey="amount"
                fill="#2563eb"
                radius={[6, 6, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Expense Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.expenseDistribution}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
              >
                {data.expenseDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                  padding: '8px 12px',
                  fontSize: 13,
                }}
                formatter={(v) => [formatCurrency(v), 'Amount']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {data.expenseDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[var(--color-text-secondary)] truncate">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Monthly Spending Trend" height={300}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.monthlyTrend} margin={{ top: 4, right: 0, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                padding: '8px 12px',
                fontSize: 13,
              }}
              formatter={(v) => [formatCurrency(v), 'Spending']}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#2563eb"
              strokeWidth={2}
              fill="url(#trendGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">
              Recent Activity
            </h3>
            <button className="text-xs font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors">
              View all
            </button>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {data.recentActivity.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-[var(--color-surface-hover)]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-xs font-medium text-[var(--color-primary)]">
                    {item.user.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-[var(--color-text)] truncate">
                      <span className="font-medium">{item.user}</span>{' '}
                      {item.action}{' '}
                      <span className="text-[var(--color-text-muted)]">
                        {item.detail}
                      </span>
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      {item.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="text-sm font-semibold text-[var(--color-text)]">
                    {formatCurrency(item.amount, item.currency)}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      item.status === 'settled'
                        ? 'bg-[var(--color-success-bg)] text-[#16a34a]'
                        : 'bg-[var(--color-warning-bg)] text-[#d97706]'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
          <div className="border-b border-[var(--color-border)] px-6 py-4">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">
              Quick Actions
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3 p-6">
            {data.quickActions.map((action) => {
              const Icon = iconMap[action.icon] || HiOutlinePlusCircle
              return (
                <button
                  key={action.label}
                  className="group flex flex-col items-center gap-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6 text-center transition-all duration-200 hover:shadow-md cursor-pointer"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] ${action.bg} transition-transform duration-200 group-hover:scale-105`}
                  >
                    <Icon className={`h-6 w-6 ${action.color}`} />
                  </div>
                  <span className="text-sm font-medium text-[var(--color-text)]">
                    {action.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
