import {
  mockCurrentUser,
  mockGroups,
  mockGroupDetail,
  mockExpenses,
  mockSettlements,
  mockImportHistory,
  mockAnomalies,
  kpiData,
  spendingByUser,
  expenseDistribution,
  monthlyTrend,
  recentActivity,
  quickActions,
} from '../mock'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

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

export const authService = {
  login: async () => {
    await delay(800)
    return { data: { token: 'mock-token-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', user: mockCurrentUser } }
  },
  register: async (data) => {
    await delay(800)
    return { data: { token: 'mock-token-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', user: { ...mockCurrentUser, email: data.email, name: data.name } } }
  },
  logout: async () => {
    await delay(300)
    return { data: { message: 'Logged out successfully' } }
  },
  getProfile: async () => {
    await delay(500)
    return { data: mockCurrentUser }
  },
}

export const expenseService = {
  getAll: async (params) => {
    await delay(600)
    let filtered = [...mockExpenses]
    if (params?.search) {
      const q = params.search.toLowerCase()
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.paidBy.toLowerCase().includes(q) ||
          e.group.toLowerCase().includes(q),
      )
    }
    if (params?.group) filtered = filtered.filter((e) => e.group === params.group)
    if (params?.category) filtered = filtered.filter((e) => e.category === params.category)
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
  },
  getById: async (id) => {
    await delay(400)
    const expense = mockExpenses.find((e) => e.id === Number(id))
    if (!expense) throw new Error('Expense not found')
    return { data: expense }
  },
  create: async (data) => {
    await delay(500)
    const newExpense = { id: mockExpenses.length + 1, ...data }
    return { data: newExpense }
  },
  update: async (id, data) => {
    await delay(500)
    return { data: { id: Number(id), ...data } }
  },
  delete: async (id) => {
    await delay(400)
    return { data: { message: 'Expense deleted', id: Number(id) } }
  },
}

export const groupService = {
  getAll: async () => {
    await delay(700)
    return { data: { items: mockGroups, total: mockGroups.length } }
  },
  getById: async (id) => {
    await delay(600)
    const group = Number(id) === mockGroupDetail.id ? mockGroupDetail : mockGroups.find((g) => g.id === Number(id))
    if (!group) throw new Error('Group not found')
    return { data: group }
  },
  create: async (data) => {
    await delay(500)
    const newGroup = { id: mockGroups.length + 1, ...data, memberCount: 1, totalExpenses: 0 }
    return { data: newGroup }
  },
  update: async (id, data) => {
    await delay(500)
    return { data: { id: Number(id), ...data } }
  },
  delete: async (id) => {
    await delay(400)
    return { data: { message: 'Group deleted', id: Number(id) } }
  },
  addMember: async (groupId, data) => {
    await delay(400)
    return { data: { id: Date.now(), ...data } }
  },
  removeMember: async () => {
    await delay(400)
    return { data: { message: 'Member removed' } }
  },
}

export const settlementService = {
  getAll: async (params) => {
    await delay(600)
    let settlements = [...mockSettlements]
    if (params?.groupId) {
      settlements = settlements.filter((s) => s.groupId === Number(params.groupId))
    }
    if (params?.search) {
      const q = params.search.toLowerCase()
      settlements = settlements.filter(
        (s) =>
          s.from.toLowerCase().includes(q) ||
          s.to.toLowerCase().includes(q) ||
          s.groupName.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q),
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
  },
  getByGroup: async (groupId) => {
    await delay(500)
    const settlements = mockSettlements.filter((s) => s.groupId === Number(groupId))
    return { data: { items: settlements, total: settlements.length } }
  },
  create: async (groupId, data) => {
    await delay(500)
    return { data: { id: Date.now(), groupId: Number(groupId), ...data, status: 'pending' } }
  },
}

export const dashboardService = {
  getKpiData: async () => {
    await delay(500)
    return { data: kpiData }
  },
  getSpendingByUser: async () => {
    await delay(400)
    return { data: spendingByUser }
  },
  getExpenseDistribution: async () => {
    await delay(400)
    return { data: expenseDistribution }
  },
  getMonthlyTrend: async () => {
    await delay(400)
    return { data: monthlyTrend }
  },
  getRecentActivity: async () => {
    await delay(400)
    return { data: recentActivity }
  },
  getQuickActions: async () => {
    await delay(200)
    return { data: quickActions }
  },
}

export const importService = {
  getHistory: async () => {
    await delay(500)
    return { data: { items: mockImportHistory, total: mockImportHistory.length } }
  },
  upload: async (file) => {
    await delay(1500)
    const imported = Math.floor(Math.random() * 40) + 15
    const anomalyCount = mockAnomalies.length
    return {
      data: {
        filename: file.name,
        rowsImported: imported,
        anomalies: mockAnomalies,
        anomalyCount,
        status: 'completed',
      },
    }
  },
}
