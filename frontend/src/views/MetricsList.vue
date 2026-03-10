<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900">Metrics Catalog</h1>
      <button v-if="authStore.isEditor" @click="showCreateModal = true" class="btn-primary">
        + Add Metric
      </button>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Filters Sidebar -->
      <div class="lg:col-span-1">
        <Filters 
          :filters="metricsStore.filters"
          @update:filters="handleFiltersUpdate"
          @clear="metricsStore.clearFilters()"
        />
      </div>
      
      <!-- Metrics List -->
      <div class="lg:col-span-3">
        <div v-if="loading" class="text-center py-12">
          <p class="text-gray-500">Loading metrics...</p>
        </div>
        
        <div v-else-if="error" class="card bg-red-50 text-red-800">
          <p>Error loading metrics: {{ error }}</p>
        </div>
        
        <div v-else-if="filteredMetrics.length === 0" class="card text-center py-12">
          <p class="text-gray-500">No metrics found. Try adjusting your filters.</p>
        </div>
        
        <div v-else class="space-y-4">
          <div class="card">
            <p class="text-sm text-gray-600">
              Showing {{ filteredMetrics.length }} of {{ metrics.length }} metrics
            </p>
          </div>
          
          <div class="grid grid-cols-1 gap-4">
            <MetricCard 
              v-for="metric in filteredMetrics" 
              :key="metric.id"
              :metric="metric"
              @click="$router.push(`/metrics/${metric.id}`)"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Create Metric Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold">Create New Metric</h2>
            <button @click="showCreateModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <form @submit.prevent="handleCreate" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input v-model="newMetric.name" type="text" required class="input-field" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea v-model="newMetric.description" rows="3" class="input-field"></textarea>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select v-model="newMetric.category" required class="input-field">
                  <option value="">Select...</option>
                  <option value="E">Environmental (E)</option>
                  <option value="S">Social (S)</option>
                  <option value="G">Governance (G)</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                <select v-model="newMetric.status" required class="input-field">
                  <option value="PLANNED">Planned</option>
                  <option value="PARTIAL">Partial</option>
                  <option value="COLLECTED">Collected</option>
                </select>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                <input v-model="newMetric.unit" type="text" class="input-field" />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Standard</label>
                <select v-model="newMetric.standard" class="input-field">
                  <option value="">Select...</option>
                  <option value="GRI">GRI</option>
                  <option value="STARS">STARS</option>
                  <option value="SDG">SDG</option>
                </select>
              </div>
            </div>
            
            <div class="flex space-x-3 pt-4">
              <button type="submit" class="btn-primary flex-1">Create Metric</button>
              <button type="button" @click="showCreateModal = false" class="btn-secondary flex-1">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMetricsStore } from '../stores/metricsStore'
import { useAuthStore } from '../stores/authStore'
import MetricCard from '../components/MetricCard.vue'
import Filters from '../components/Filters.vue'

const router = useRouter()
const metricsStore = useMetricsStore()
const authStore = useAuthStore()

const showCreateModal = ref(false)
const newMetric = ref({
  name: '',
  description: '',
  category: '',
  unit: '',
  standard: '',
  status: 'PLANNED'
})

const loading = computed(() => metricsStore.loading)
const error = computed(() => metricsStore.error)
const metrics = computed(() => metricsStore.metrics)
const filteredMetrics = computed(() => metricsStore.filteredMetrics)

onMounted(() => {
  metricsStore.fetchMetrics()
})

function handleFiltersUpdate(newFilters) {
  metricsStore.setFilters(newFilters)
}

async function handleCreate() {
  try {
    await metricsStore.createMetric(newMetric.value)
    showCreateModal.value = false
    newMetric.value = {
      name: '',
      description: '',
      category: '',
      unit: '',
      standard: '',
      status: 'PLANNED'
    }
  } catch (err) {
    alert('Error creating metric: ' + err.message)
  }
}
</script>
