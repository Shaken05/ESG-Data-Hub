<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900">ESG Data Inventory</h1>
    </div>
    
    <!-- Stats Cards -->
    <div v-if="stats" class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Total Metrics</p>
            <p class="text-3xl font-bold text-gray-900">{{ stats.total }}</p>
          </div>
          <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Environmental</p>
            <p class="text-3xl font-bold text-green-600">{{ getCategoryCount('E') }}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">🌱</span>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Social</p>
            <p class="text-3xl font-bold text-blue-600">{{ getCategoryCount('S') }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">👥</span>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Governance</p>
            <p class="text-3xl font-bold text-purple-600">{{ getCategoryCount('G') }}</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">⚖️</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Status Overview -->
    <div class="card">
      <h2 class="text-xl font-semibold mb-4">Data Collection Status</h2>
      <div v-if="stats" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="flex items-center space-x-3">
          <div class="w-3 h-3 bg-green-500 rounded-full"></div>
          <div>
            <p class="text-sm text-gray-600">Collected</p>
            <p class="text-2xl font-semibold">{{ getStatusCount('COLLECTED') }}</p>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div>
            <p class="text-sm text-gray-600">Partial</p>
            <p class="text-2xl font-semibold">{{ getStatusCount('PARTIAL') }}</p>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <div class="w-3 h-3 bg-gray-500 rounded-full"></div>
          <div>
            <p class="text-sm text-gray-600">Planned</p>
            <p class="text-2xl font-semibold">{{ getStatusCount('PLANNED') }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Recent Metrics -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">Recent Metrics</h2>
        <RouterLink to="/metrics" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
          View All →
        </RouterLink>
      </div>
      
      <div v-if="loading" class="text-center py-8">
        <p class="text-gray-500">Loading...</p>
      </div>
      
      <div v-else-if="recentMetrics.length > 0" class="space-y-3">
        <div 
          v-for="metric in recentMetrics" 
          :key="metric.id"
          class="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors cursor-pointer"
          @click="$router.push(`/metrics/${metric.id}`)"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-1">
                <span :class="`badge badge-${metric.category.toLowerCase()}`">{{ metric.category }}</span>
                <span :class="`badge badge-${metric.status.toLowerCase()}`">{{ metric.status }}</span>
              </div>
              <h3 class="font-medium text-gray-900">{{ metric.name }}</h3>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-8 text-gray-500">
        No metrics found
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useMetricsStore } from '../stores/metricsStore'

const router = useRouter()
const metricsStore = useMetricsStore()

const stats = ref(null)
const loading = computed(() => metricsStore.loading)
const recentMetrics = computed(() => metricsStore.metrics.slice(0, 5))

onMounted(async () => {
  await metricsStore.fetchMetrics()
  await metricsStore.fetchStats()
  stats.value = metricsStore.stats
})

function getCategoryCount(category) {
  if (!stats.value?.byCategory) return 0
  const item = stats.value.byCategory.find(c => c.category === category)
  return item?._count || 0
}

function getStatusCount(status) {
  if (!stats.value?.byStatus) return 0
  const item = stats.value.byStatus.find(s => s.status === status)
  return item?._count || 0
}
</script>
