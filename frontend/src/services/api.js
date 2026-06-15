import api from '../api/axios'

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
}

export const expenseService = {
  getAll: (params) => api.get('/expenses', { params }),
  getById: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
}

export const groupService = {
  getAll: () => api.get('/groups'),
  getById: (id) => api.get(`/groups/${id}`),
  create: (data) => api.post('/groups', data),
  update: (id, data) => api.put(`/groups/${id}`, data),
  delete: (id) => api.delete(`/groups/${id}`),
  addMember: (groupId, data) => api.post(`/groups/${groupId}/members`, data),
  removeMember: (groupId, userId) =>
    api.delete(`/groups/${groupId}/members/${userId}`),
}

export const settlementService = {
  getAll: (groupId) => api.get(`/groups/${groupId}/settlements`),
  create: (groupId, data) => api.post(`/groups/${groupId}/settlements`, data),
}
