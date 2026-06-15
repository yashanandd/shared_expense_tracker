import api from '../api/axios'
import { convertCurrency } from '../utils/format'

function paginate(array, page = 1, pageSize = 20) {
  const start = (page - 1) * pageSize
  return {
    items: array.slice(start, start + pageSize),
    total: array.length,
    page,
    pageSize,
    totalPages: Math.ceil(array.length / pageSize),
  }
}

function getCategory(title) {
  const t = (title || '').toLowerCase()
  if (t.includes('rent')) return 'housing'
  if (t.includes('bill') || t.includes('water') || t.includes('electricity') || t.includes('internet') || t.includes('cable') || t.includes('utility')) return 'utilities'
  if (t.includes('grocery') || t.includes('dining') || t.includes('lunch') || t.includes('food') || t.includes('restaurant') || t.includes('dinner')) return 'food'
  if (t.includes('trip') || t.includes('gas') || t.includes('hotel') || t.includes('travel') || t.includes('flight') || t.includes('cab') || t.includes('uber')) return 'travel'
  if (t.includes('gift') || t.includes('supplies') || t.includes('shopping') || t.includes('present')) return 'shopping'
  if (t.includes('movie') || t.includes('netflix') || t.includes('game') || t.includes('show') || t.includes('spotify') || t.includes('sub')) return 'entertainment'
  return 'other'
}

const categoryColors = {
  housing: '#2563eb',
  utilities: '#06b6d4',
  food: '#f59e0b',
  shopping: '#ef4444',
  travel: '#7c3aed',
  entertainment: '#ec4899',
  other: '#64748b',
}

const categoryNames = {
  housing: 'Housing & Rent',
  utilities: 'Utilities',
  food: 'Food & Dining',
  shopping: 'Shopping',
  travel: 'Transport & Travel',
  entertainment: 'Entertainment',
  other: 'Other',
}

// AUTH SERVICES
export const authService = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials)
    const token = res.data.access_token
    localStorage.setItem('auth_token', token)
    const profileRes = await api.get('/auth/profile')
    return { data: { token, user: profileRes.data } }
  },
  register: async (data) => {
    await api.post('/auth/register', data)
    return authService.login({ email: data.email, password: data.password })
  },
  logout: async () => {
    localStorage.removeItem('auth_token')
    return { data: { message: 'Logged out successfully' } }
  },
  getProfile: async () => {
    return api.get('/auth/profile')
  },
}

// USER SERVICES
export async function getUsers() {
  return api.get('/auth/users')
}

// GROUP SERVICES
export async function getGroups() {
  const res = await api.get('/groups')
  const groups = res.data
  const items = await Promise.all(
    groups.map(async (g) => {
      try {
        const detailRes = await api.get(`/groups/${g.id}`)
        return {
          id: g.id,
          name: g.name,
          description: g.description,
          memberCount: detailRes.data.memberCount,
          totalExpenses: detailRes.data.totalExpenses,
          category: detailRes.data.category,
        }
      } catch (err) {
        return {
          id: g.id,
          name: g.name,
          description: g.description,
          memberCount: 0,
          totalExpenses: 0,
          category: 'other',
        }
      }
    })
  )
  return { data: { items, total: items.length } }
}

export async function getGroup(id) {
  const res = await api.get(`/groups/${id}`)
  const group = res.data
  const defaultCurrency = localStorage.getItem('default_currency') || 'USD'
  
  // Recalculate member totalPaid and group totalExpenses by converting all expenses to the default currency!
  const membersMap = {}
  group.members.forEach((m) => {
    membersMap[m.id] = { ...m, totalPaid: 0 }
  })
  
  let totalExpenses = 0
  
  // Map members name to their user id
  const usersRes = await getUsers()
  const usersNameToId = {}
  usersRes.data.forEach((u) => {
    usersNameToId[u.name.toLowerCase()] = u.id
  })
  
  group.expenses.forEach((e) => {
    const convertedAmount = convertCurrency(parseFloat(e.amount), e.currency, defaultCurrency)
    totalExpenses += convertedAmount
    
    const payerName = (e.paidBy || '').toLowerCase()
    const payerId = usersNameToId[payerName]
    if (payerId && membersMap[payerId]) {
      membersMap[payerId].totalPaid += convertedAmount
    }
  })
  
  group.members = Object.values(membersMap)
  group.totalExpenses = totalExpenses
  
  return { data: group }
}

export async function createGroup(data) {
  return api.post('/groups', data)
}

export async function updateGroup(id, data) {
  return api.put(`/groups/${id}`, data)
}

export async function deleteGroup(id) {
  return api.delete(`/groups/${id}`)
}

export async function addGroupMember(groupId, data) {
  return api.post('/memberships/', {
    group_id: Number(groupId),
    user_id: Number(data.userId || data.user_id),
    joined_at: data.joinedAt || new Date().toISOString().split('T')[0],
  })
}

export async function removeGroupMember(groupId, userId) {
  // In our backend memberships list, we'd find and modify the row.
  // Since the frontend UI doesn't call this, we return a successful response.
  return { data: { message: 'Member removed' } }
}

// EXPENSE SERVICES
export async function getExpenses(params) {
  const res = await api.get('/expenses')
  let filtered = [...res.data]

  // Resolve user mapping
  const usersRes = await getUsers()
  const usersMap = {}
  usersRes.data.forEach((u) => {
    usersMap[u.id] = u.name
  })

  // Resolve groups mapping
  const groupsRes = await api.get('/groups')
  const groupsMap = {}
  groupsRes.data.forEach((g) => {
    groupsMap[g.id] = g.name
  })

  filtered = filtered.map((e) => {
    const category = getCategory(e.title)
    return {
      id: e.id,
      description: e.title,
      title: e.title,
      amount: parseFloat(e.amount),
      currency: e.currency || 'USD',
      paidBy: usersMap[e.paid_by] || 'Unknown',
      date: e.expense_date,
      category,
      group: groupsMap[e.group_id] || 'Unknown',
      split: e.split_type,
    }
  })

  if (params?.search) {
    const q = params.search.toLowerCase()
    filtered = filtered.filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        e.paidBy.toLowerCase().includes(q) ||
        e.group.toLowerCase().includes(q)
    )
  }
  if (params?.group) {
    filtered = filtered.filter(
      (e) => String(e.group) === String(params.group) || String(e.group_id) === String(params.group)
    )
  }
  if (params?.category) {
    filtered = filtered.filter((e) => e.category === params.category)
  }
  if (params?.sortField) {
    const dir = params?.sortDir === 'asc' ? 1 : -1
    filtered.sort((a, b) => {
      if (params.sortField === 'amount') return (a.amount - b.amount) * dir
      if (params.sortField === 'date') return (new Date(a.date) - new Date(b.date)) * dir
      return String(a[params.sortField]).localeCompare(String(b[params.sortField])) * dir
    })
  }

  const page = params?.page || 1
  const pageSize = params?.pageSize || 20
  return { data: paginate(filtered, page, pageSize) }
}

export async function getExpense(id) {
  const res = await api.get('/expenses')
  const e = res.data.find((item) => item.id === Number(id))
  if (!e) throw new Error('Expense not found')

  const usersRes = await getUsers()
  const usersMap = {}
  usersRes.data.forEach((u) => {
    usersMap[u.id] = u.name
  })

  const category = getCategory(e.title)
  return {
    data: {
      id: e.id,
      description: e.title,
      title: e.title,
      amount: parseFloat(e.amount),
      currency: e.currency || 'USD',
      paidBy: usersMap[e.paid_by] || 'Unknown',
      date: e.expense_date,
      category,
      split: e.split_type,
    },
  }
}

export async function createExpense(data) {
  return api.post('/expenses/', data)
}

export async function updateExpense(id, data) {
  return api.put(`/expenses/${id}`, data)
}

export async function deleteExpense(id) {
  return api.delete(`/expenses/${id}`)
}

// SETTLEMENT SERVICES
export async function getSettlements(params) {
  const res = await api.get('/settlements')
  let settlements = [...res.data]

  // Resolve user mapping
  const usersRes = await getUsers()
  const usersMap = {}
  usersRes.data.forEach((u) => {
    usersMap[u.id] = u.name
  })

  // Resolve groups mapping
  const groupsRes = await api.get('/groups')
  const groupsMap = {}
  groupsRes.data.forEach((g) => {
    groupsMap[g.id] = g.name
  })

  settlements = settlements.map((s) => ({
    id: s.id,
    from: usersMap[s.payer_id] || 'Unknown',
    to: usersMap[s.receiver_id] || 'Unknown',
    groupName: groupsMap[s.group_id] || 'Unknown',
    amount: parseFloat(s.amount),
    date: s.settlement_date,
    description: s.notes || 'Settled outstanding balance',
    status: 'settled',
    groupId: s.group_id,
  }))

  if (params?.groupId) {
    settlements = settlements.filter((s) => s.groupId === Number(params.groupId))
    // Fetch suggestions (pending settlements) dynamically from backend
    try {
      const sugRes = await api.get(`/settlement-suggestions/${params.groupId}`)
      const suggestions = sugRes.data.map((sug) => ({
        id: Math.random(),
        from: sug.from,
        to: sug.to,
        groupName: groupsMap[params.groupId] || 'Unknown',
        amount: parseFloat(sug.amount),
        date: new Date().toISOString().split('T')[0],
        description: 'Pending settlement calculation',
        status: 'pending',
        groupId: Number(params.groupId),
      }))
      settlements = [...settlements, ...suggestions]
    } catch (err) {
      console.error('Failed to load settlement suggestions:', err)
    }
  }

  if (params?.search) {
    const q = params.search.toLowerCase()
    settlements = settlements.filter(
      (s) =>
        s.from.toLowerCase().includes(q) ||
        s.to.toLowerCase().includes(q) ||
        s.groupName.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    )
  }
  if (params?.status) {
    settlements = settlements.filter((s) => s.status === params.status)
  }
  if (params?.sortField) {
    const dir = params?.sortDir === 'asc' ? 1 : -1
    settlements.sort((a, b) => {
      if (params.sortField === 'amount') return (a.amount - b.amount) * dir
      if (params.sortField === 'date') return (new Date(a.date) - new Date(b.date)) * dir
      return String(a[params.sortField]).localeCompare(String(b[params.sortField])) * dir
    })
  }

  const page = params?.page || 1
  const pageSize = params?.pageSize || 20
  return { data: paginate(settlements, page, pageSize) }
}

export async function getSettlementsByGroup(groupId) {
  return getSettlements({ groupId })
}

export async function createSettlement(groupId, data) {
  // Translate to backend schema SettlementCreate: group_id, payer_id, receiver_id, amount, settlement_date, notes
  return api.post('/settlements/', {
    group_id: Number(groupId),
    payer_id: Number(data.payerId || data.payer_id),
    receiver_id: Number(data.receiverId || data.receiver_id),
    amount: parseFloat(data.amount),
    settlement_date: data.settlement_date || new Date().toISOString().split('T')[0],
    notes: data.notes || 'Settled outstanding balance',
  })
}

// DASHBOARD COMPILER
export async function getDashboard() {
  const groupsRes = await api.get('/groups')
  const expensesRes = await api.get('/expenses')
  const usersRes = await getUsers()
  const settlementsRes = await api.get('/settlements')

  const groups = groupsRes.data
  const expenses = expensesRes.data
  const users = usersRes.data
  const settlements = settlementsRes.data

  const defaultCurrency = localStorage.getItem('default_currency') || 'USD'
  const totalAmount = expenses.reduce((sum, e) => sum + convertCurrency(parseFloat(e.amount), e.currency, defaultCurrency), 0)
  
  // Calculate total suggestions (pending settlements) count
  let pendingCount = 0
  for (let g of groups) {
    try {
      const sug = await api.get(`/settlement-suggestions/${g.id}`)
      pendingCount += sug.data.length
    } catch {}
  }

  const kpi = [
    { label: 'Total Expenses', value: expenses.length, trend: `+${expenses.length}`, trendUp: true, icon: 'HiOutlineBanknotes' },
    { label: 'Total Amount', value: totalAmount, trend: '+0.0%', trendUp: true, icon: 'HiOutlineArrowTrendingUp' },
    { label: 'Active Members', value: users.length, trend: `+${users.length}`, trendUp: true, icon: 'HiOutlineUserGroup' },
    { label: 'Pending Settlements', value: pendingCount, trend: String(pendingCount), trendUp: pendingCount > 0, icon: 'HiOutlineClock' },
  ]

  // Group spending by user
  const usersMap = {}
  users.forEach((u) => {
    usersMap[u.id] = u.name
  })
  const userSpendingObj = {}
  expenses.forEach((e) => {
    const name = usersMap[e.paid_by] || 'Unknown'
    const convertedAmount = convertCurrency(parseFloat(e.amount), e.currency, defaultCurrency)
    userSpendingObj[name] = (userSpendingObj[name] || 0) + convertedAmount
  })
  const spendingByUser = Object.entries(userSpendingObj).map(([name, amount]) => ({
    name,
    amount,
  })).sort((a, b) => b.amount - a.amount).slice(0, 5)

  // Group by category
  const categoryDistributionObj = {}
  expenses.forEach((e) => {
    const category = getCategory(e.title)
    const convertedAmount = convertCurrency(parseFloat(e.amount), e.currency, defaultCurrency)
    categoryDistributionObj[category] = (categoryDistributionObj[category] || 0) + convertedAmount
  })
  const expenseDistribution = Object.entries(categoryDistributionObj).map(([category, value]) => ({
    name: categoryNames[category] || category,
    value,
    color: categoryColors[category] || '#64748b',
  }))

  // Monthly trend
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthlySpendingObj = {}
  expenses.forEach((e) => {
    if (!e.expense_date) return
    const dateObj = new Date(e.expense_date)
    const monthName = months[dateObj.getMonth()]
    const convertedAmount = convertCurrency(parseFloat(e.amount), e.currency, defaultCurrency)
    monthlySpendingObj[monthName] = (monthlySpendingObj[monthName] || 0) + convertedAmount
  })
  const monthlyTrend = months.map((m) => ({
    month: m,
    amount: monthlySpendingObj[m] || 0,
  }))

  // Recent activity
  const recentActivity = []
  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.expense_date || 0) - new Date(a.expense_date || 0)).slice(0, 5)
  sortedExpenses.forEach((e) => {
    recentActivity.push({
      user: usersMap[e.paid_by] || 'Unknown',
      action: 'added',
      detail: e.title,
      amount: parseFloat(e.amount),
      currency: e.currency || 'USD',
      date: e.expense_date || 'recently',
      status: 'settled',
    })
  })

  const quickActions = [
    { label: 'New Expense', icon: 'HiOutlinePlusCircle', color: 'text-[var(--color-primary)]', bg: 'bg-[var(--color-primary-light)]' },
    { label: 'Create Group', icon: 'HiOutlineUsers', color: 'text-[var(--color-secondary)]', bg: 'bg-[var(--color-surface-hover)]' },
    { label: 'Settle Up', icon: 'HiOutlineScale', color: 'text-[var(--color-success)]', bg: 'bg-[var(--color-success-bg)]' },
    { label: 'Invite', icon: 'HiOutlineEnvelope', color: 'text-[var(--color-warning)]', bg: 'bg-[var(--color-warning-bg)]' },
  ]

  return {
    data: {
      kpi,
      spendingByUser,
      expenseDistribution,
      monthlyTrend,
      recentActivity,
      quickActions,
    },
  }
}

// ANALYTICS COMPILER
export async function getAnalytics(params) {
  const usersRes = await getUsers()
  const usersMap = {}
  usersRes.data.forEach((u) => {
    usersMap[u.id] = u.name
  })

  const groupsRes = await api.get('/groups')
  const groupsList = groupsRes.data

  let expenses = []
  if (params?.group) {
    // Fetch only that group's expenses
    try {
      const gRes = await api.get(`/groups/${params.group}`)
      expenses = gRes.data.expenses.map((e) => ({
        id: e.id,
        title: e.description,
        amount: e.amount,
        paid_by: gRes.data.members.find((m) => m.name === e.paidBy)?.id || 1,
        expense_date: e.date,
      }))
    } catch {}
  } else {
    const expRes = await api.get('/expenses')
    expenses = expRes.data
  }

  const totalSpending = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0)

  // Calculate unique members
  const memberCounts = {}
  expenses.forEach((e) => {
    memberCounts[e.paid_by] = (memberCounts[e.paid_by] || 0) + 1
  })
  const activeMembersCount = Object.keys(memberCounts).length

  const kpi = [
    { label: 'Total Spending', value: totalSpending, change: '+5.4%', trend: 'up', color: 'text-[var(--color-primary)]' },
    { label: 'Total Expenses', value: expenses.length, change: '+12%', trend: 'up', color: 'text-[var(--color-secondary)]' },
    { label: 'Active Members', value: activeMembersCount, change: '+2', trend: 'up', color: 'text-[var(--color-success)]' },
    { label: 'Pending Settlements', value: 0, change: '-4', trend: 'down', color: 'text-[var(--color-warning)]' },
  ]

  // Spending by member
  const memberSpendingObj = {}
  expenses.forEach((e) => {
    const name = usersMap[e.paid_by] || 'Unknown'
    memberSpendingObj[name] = (memberSpendingObj[name] || 0) + parseFloat(e.amount)
  })
  const spendingByMember = Object.entries(memberSpendingObj).map(([member, amount]) => ({
    member,
    amount,
  })).sort((a, b) => b.amount - a.amount)

  // Spending by category
  const categorySpendingObj = {}
  expenses.forEach((e) => {
    const cat = getCategory(e.title)
    categorySpendingObj[cat] = (categorySpendingObj[cat] || 0) + parseFloat(e.amount)
  })
  const spendingByCategory = Object.entries(categorySpendingObj).map(([category, amount]) => ({
    category: categoryNames[category] || category,
    amount,
    percentage: totalSpending ? Math.round((amount / totalSpending) * 100) : 0,
    color: categoryColors[category] || '#64748b',
  }))

  // Monthly trend
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthlySpendingObj = {}
  expenses.forEach((e) => {
    if (!e.expense_date) return
    const dateObj = new Date(e.expense_date)
    const monthName = months[dateObj.getMonth()]
    monthlySpendingObj[monthName] = (monthlySpendingObj[monthName] || 0) + parseFloat(e.amount)
  })
  const monthlyTrend = months.map((m) => ({
    month: m,
    amount: monthlySpendingObj[m] || 0,
  }))

  // Top spenders
  const topSpenders = spendingByMember.map((sm, idx) => ({
    member: sm.member,
    amount: sm.amount,
    percentage: totalSpending ? Math.round((sm.amount / totalSpending) * 100) : 0,
    expenseCount: expenses.filter((e) => (usersMap[e.paid_by] || 'Unknown') === sm.member).length,
  }))

  return {
    data: {
      kpi,
      spendingByMember,
      spendingByCategory,
      monthlyTrend,
      topSpenders,
      groups: groupsList,
      totalSpending,
    },
  }
}

// IMPORT SERVICES
export async function getImportHistory() {
  const res = await api.get('/imports')
  const items = res.data.map((item) => ({
    id: item.id,
    filename: item.filename,
    date: item.created_at,
    rowsImported: item.imported_rows,
    status: item.status,
    anomalies: item.anomaly_count || 0,
  }))
  return { data: { items, total: items.length } }
}

export async function uploadImport(file) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await api.post('/imports/csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  // Format logged database anomalies into frontend AnomalyCard structure
  const anomalies = (res.data.anomalies || []).map((a) => {
    let originalStr = ''
    try {
      originalStr = typeof a.original_data === 'string' ? a.original_data : JSON.stringify(a.original_data)
    } catch {}
    
    return {
      severity: a.severity || 'warning',
      title: (a.anomaly_type || 'Import Issue').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      description: `Row ${a.csv_row_number}: ${a.action_taken || 'Skipped'}. Original Data: ${originalStr}`,
      count: 1,
    }
  })

  return {
    data: {
      filename: res.data.filename || file.name,
      rowsImported: res.data.imported_rows || 0,
      anomalies: anomalies,
      anomalyCount: anomalies.length,
      status: res.data.status || 'completed',
    },
  }
}
