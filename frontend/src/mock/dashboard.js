export const kpiData = [
  { label: 'Total Expenses', value: 245, trend: '+12', trendUp: true, icon: 'HiOutlineBanknotes' },
  { label: 'Total Amount', value: 12845.5, trend: '+8.2%', trendUp: true, icon: 'HiOutlineArrowTrendingUp' },
  { label: 'Active Members', value: 18, trend: '+3', trendUp: true, icon: 'HiOutlineUserGroup' },
  { label: 'Pending Settlements', value: 7, trend: '-2', trendUp: false, icon: 'HiOutlineClock' },
]

export const spendingByUser = [
  { name: 'Alice', amount: 3200 },
  { name: 'Bob', amount: 2800 },
  { name: 'Carol', amount: 2100 },
  { name: 'David', amount: 1800 },
  { name: 'Eve', amount: 1500 },
]

export const expenseDistribution = [
  { name: 'Food & Dining', value: 4500, color: '#2563eb' },
  { name: 'Transport', value: 2300, color: '#7c3aed' },
  { name: 'Utilities', value: 1800, color: '#06b6d4' },
  { name: 'Entertainment', value: 1400, color: '#f59e0b' },
  { name: 'Shopping', value: 1200, color: '#ef4444' },
]

export const monthlyTrend = [
  { month: 'Jan', amount: 4200 },
  { month: 'Feb', amount: 3800 },
  { month: 'Mar', amount: 5100 },
  { month: 'Apr', amount: 4600 },
  { month: 'May', amount: 5400 },
  { month: 'Jun', amount: 4900 },
  { month: 'Jul', amount: 6100 },
  { month: 'Aug', amount: 5800 },
  { month: 'Sep', amount: 6300 },
  { month: 'Oct', amount: 5900 },
  { month: 'Nov', amount: 6700 },
  { month: 'Dec', amount: 7200 },
]

export const recentActivity = [
  { user: 'Alice', action: 'added', detail: 'Dinner at Italian place', amount: 85.0, date: '2 hours ago', status: 'settled' },
  { user: 'Bob', action: 'paid', detail: 'Uber ride', amount: 24.5, date: '5 hours ago', status: 'pending' },
  { user: 'Carol', action: 'added', detail: 'Groceries - Weekly', amount: 120.0, date: 'Yesterday', status: 'settled' },
  { user: 'David', action: 'settled', detail: 'All outstanding balances', amount: 340.0, date: 'Yesterday', status: 'settled' },
  { user: 'Eve', action: 'added', detail: 'Netflix subscription', amount: 15.99, date: '2 days ago', status: 'pending' },
]

export const quickActions = [
  { label: 'New Expense', icon: 'HiOutlinePlusCircle', color: 'text-[var(--color-primary)]', bg: 'bg-[var(--color-primary-light)]' },
  { label: 'Create Group', icon: 'HiOutlineUsers', color: 'text-[var(--color-secondary)]', bg: 'bg-[var(--color-surface-hover)]' },
  { label: 'Settle Up', icon: 'HiOutlineScale', color: 'text-[var(--color-success)]', bg: 'bg-[var(--color-success-bg)]' },
  { label: 'Invite', icon: 'HiOutlineEnvelope', color: 'text-[var(--color-warning)]', bg: 'bg-[var(--color-warning-bg)]' },
]
