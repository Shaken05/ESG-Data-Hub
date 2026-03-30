import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)
  const error = ref(null)

  // Computed
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isEditor = computed(() => ['admin', 'editor'].includes(user.value?.role))
  const isViewer = computed(() => user.value?.role === 'viewer')

  // Actions
  async function login(email, password) {
    loading.value = true
    error.value = null
    try {
      const response = await authAPI.login(email, password)
      token.value = response.data.token
      user.value = response.data.user
      localStorage.setItem('token', token.value)
      return true
    } catch (err) {
      error.value = err.response?.data?.error || err.message
      return false
    } finally {
      loading.value = false
    }
  }

  async function register(name, email, password) {
    loading.value = true
    error.value = null
    try {
      const response = await authAPI.register({ name, email, password })
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || err.message
      return null
    } finally {
      loading.value = false
    }
  }

  async function fetchCurrentUser() {
    if (!token.value) return false
    
    loading.value = true
    error.value = null
    try {
      const response = await authAPI.getCurrentUser()
      user.value = response.data
      return true
    } catch (err) {
      error.value = err.response?.data?.error || err.message
      logout()
      return false
    } finally {
      loading.value = false
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isEditor,
    isViewer,
    login,
    register,
    fetchCurrentUser,
    logout
  }
})
