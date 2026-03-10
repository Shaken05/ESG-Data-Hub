import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
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
  getCurrentUser: () => api.get('/auth/me'),
  getUsers: () => api.get('/auth/users'),
  updateUserRole: (id, role) => api.put(`/auth/users/${id}/role`, { role }),
  deactivateUser: (id) => api.put(`/auth/users/${id}/deactivate`)
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

export default api
