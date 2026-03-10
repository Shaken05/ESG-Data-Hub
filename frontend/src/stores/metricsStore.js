import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { metricsAPI } from '../services/api'

export const useMetricsStore = defineStore('metrics', () => {
  const metrics = ref([])
  const currentMetric = ref(null)
  const stats = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  // Filters
  const filters = ref({
    category: '',
    status: '',
    search: ''
  })
  
  // Computed
  const filteredMetrics = computed(() => {
    return metrics.value.filter(metric => {
      const matchCategory = !filters.value.category || metric.category === filters.value.category
      const matchStatus = !filters.value.status || metric.status === filters.value.status
      const matchSearch = !filters.value.search || 
        metric.name.toLowerCase().includes(filters.value.search.toLowerCase()) ||
        metric.description?.toLowerCase().includes(filters.value.search.toLowerCase())
      
      return matchCategory && matchStatus && matchSearch
    })
  })
  
  // Actions
  async function fetchMetrics(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await metricsAPI.getAll(params)
      metrics.value = response.data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching metrics:', err)
    } finally {
      loading.value = false
    }
  }
  
  async function fetchMetricById(id) {
    loading.value = true
    error.value = null
    try {
      const response = await metricsAPI.getById(id)
      currentMetric.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching metric:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function fetchStats() {
    try {
      const response = await metricsAPI.getStats()
      stats.value = response.data
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }
  
  async function createMetric(data) {
    loading.value = true
    error.value = null
    try {
      const response = await metricsAPI.create(data)
      metrics.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err.message
      console.error('Error creating metric:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function updateMetric(id, data) {
    loading.value = true
    error.value = null
    try {
      const response = await metricsAPI.update(id, data)
      const index = metrics.value.findIndex(m => m.id === id)
      if (index !== -1) {
        metrics.value[index] = response.data
      }
      if (currentMetric.value?.id === id) {
        currentMetric.value = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.message
      console.error('Error updating metric:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function deleteMetric(id) {
    loading.value = true
    error.value = null
    try {
      await metricsAPI.delete(id)
      metrics.value = metrics.value.filter(m => m.id !== id)
    } catch (err) {
      error.value = err.message
      console.error('Error deleting metric:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  function setFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
  }
  
  function clearFilters() {
    filters.value = {
      category: '',
      status: '',
      search: ''
    }
  }
  
  return {
    metrics,
    currentMetric,
    stats,
    loading,
    error,
    filters,
    filteredMetrics,
    fetchMetrics,
    fetchMetricById,
    fetchStats,
    createMetric,
    updateMetric,
    deleteMetric,
    setFilters,
    clearFilters
  }
})
