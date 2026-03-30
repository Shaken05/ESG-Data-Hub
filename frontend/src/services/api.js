import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to request headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  checkEmail: (email) => api.get('/auth/check-email', { params: { email } }),
  createUser: (data) => api.post('/auth/users', data),
  getCurrentUser: () => api.get('/auth/me'),
  getUsers: () => api.get('/auth/users'),
  updateUserRole: (id, role) => api.put(`/auth/users/${id}/role`, { role }),
  deactivateUser: (id) => api.put(`/auth/users/${id}/deactivate`),
  deleteUser: (id) => api.delete(`/auth/users/${id}`)
}

// Metrics API
export const metricsAPI = {
  getAll: (params) => api.get('/metrics', { params }),
  getById: (id) => api.get(`/metrics/${id}`),
  getStats: () => api.get('/metrics/stats'),
  create: (data) => api.post('/metrics', data),
  update: (id, data) => api.put(`/metrics/${id}`, data),
  delete: (id) => api.delete(`/metrics/${id}`)
}

// Data Sources API
export const sourcesAPI = {
  getAll: () => api.get('/sources'),
  getById: (id) => api.get(`/sources/${id}`),
  create: (data) => api.post('/sources', data),
  update: (id, data) => api.put(`/sources/${id}`, data),
  delete: (id) => api.delete(`/sources/${id}`)
}

// Departments API
export const departmentsAPI = {
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`)
}

// Storage Locations API
export const storageAPI = {
  getAll: () => api.get('/storage'),
  getById: (id) => api.get(`/storage/${id}`),
  create: (data) => api.post('/storage', data),
  update: (id, data) => api.put(`/storage/${id}`, data),
  delete: (id) => api.delete(`/storage/${id}`)
}

// Metric Links API
export const metricLinksAPI = {
  getAll: (params) => api.get('/metric-links', { params }),
  getById: (id) => api.get(`/metric-links/${id}`),
  create: (data) => api.post('/metric-links', data),
  update: (id, data) => api.put(`/metric-links/${id}`, data),
  delete: (id) => api.delete(`/metric-links/${id}`)
}

// Gaps (heatmap) API
export const gapsAPI = {
  getGaps: (params) => api.get('/gaps', { params })
}

// Audit log API (admin only)
export const auditLogsAPI = {
  getLogs: (params) => api.get('/audit', { params })
}

// Export API - returns blob for file download
function getExportFilename(disposition) {
  const match = disposition && disposition.match(/filename="?([^";\n]+)"?/)
  return match ? match[1].trim() : 'export'
}

export const exportAPI = {
  // Metrics: params = { category?, status?, search? }
  async downloadMetrics(format, params = {}) {
    const qs = new URLSearchParams()
    if (params.category) qs.set('category', params.category)
    if (params.status) qs.set('status', params.status)
    if (params.search && params.search.trim()) qs.set('search', params.search.trim())
    const suffix = qs.toString() ? '?' + qs.toString() : ''
    const res = await api.get(`/export/metrics.${format}${suffix}`, { responseType: 'blob' })
    const name = getExportFilename(res.headers['content-disposition']) || `esg-metrics-export.${format}`
    triggerDownload(res.data, name)
  },
  async downloadSources(format) {
    const res = await api.get(`/export/sources.${format}`, { responseType: 'blob' })
    const name = getExportFilename(res.headers['content-disposition']) || `esg-sources-export.${format}`
    triggerDownload(res.data, name)
  },
  async downloadDepartments(format) {
    const res = await api.get(`/export/departments.${format}`, { responseType: 'blob' })
    const name = getExportFilename(res.headers['content-disposition']) || `esg-departments-export.${format}`
    triggerDownload(res.data, name)
  }
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default api
