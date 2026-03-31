<template>
  <div class="space-y-6">
    <!-- Back Button -->
    <button @click="$router.back()" class="flex items-center text-gray-600 hover:text-gray-900">
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
      </svg>
      {{ t('metricDetails.back') }}
    </button>
    
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">{{ t('metricDetails.loading') }}</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="card bg-red-50 text-red-800">
      <p>{{ t('metricDetails.error') }} {{ error }}</p>
    </div>
    
    <!-- Metric Details -->
    <div v-else-if="metric" class="space-y-6">
      <!-- Header -->
      <div class="card">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <div class="flex items-center space-x-2 mb-3">
              <span :class="`badge badge-${metric.category.toLowerCase()}`">
                {{ metric.category }}
              </span>
              <span :class="`badge badge-${metric.status.toLowerCase()}`">
                {{ metric.status }}
              </span>
            </div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ metric.name }}</h1>
            <p v-if="metric.description" class="text-gray-600">{{ metric.description }}</p>
          </div>
          <button v-if="authStore.isEditor" @click="showEditModal = true" class="btn-secondary">
            {{ t('metricDetails.edit') }}
          </button>
          <button v-if="canDelete" @click="handleDelete" class="btn-danger" :disabled="deleting">
            {{ deleting ? t('common.deleting') : t('common.delete') }}
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div v-if="metric.scope">
            <p class="text-sm text-gray-500">Scope</p>
            <p class="text-lg font-medium">{{ metric.scope }}</p>
          </div>
          <div v-if="metric.subcategory">
            <p class="text-sm text-gray-500">{{ t('metricsList.subcategory') }}</p>
            <p class="text-lg font-medium">{{ metric.subcategory }}</p>
          </div>
          <div v-if="metric.unit">
            <p class="text-sm text-gray-500">{{ t('metricDetails.unitOfMeasurement') }}</p>
            <p class="text-lg font-medium">{{ metric.unit }}</p>
          </div>
          <div v-if="metric.standard || displayStandards.length">
            <p class="text-sm text-gray-500">{{ t('metricDetails.standard') }}</p>
            <p class="text-lg font-medium">{{ displayStandards.length ? displayStandards.join(', ') : metric.standard }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">{{ t('metricDetails.created') }}</p>
            <p class="text-lg font-medium">{{ formatDate(metric.createdAt) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">{{ t('metricDetails.lastUpdated') }}</p>
            <p class="text-lg font-medium">{{ formatDate(metric.updatedAt) }}</p>
          </div>
        </div>
      </div>
      
      <!-- Metric Links -->
      <div v-if="metric.metricLinks && metric.metricLinks.length > 0" class="space-y-4">
        <h2 class="text-2xl font-bold">{{ t('metricDetails.dataSourcesStorage') }}</h2>
        
        <div v-for="link in metric.metricLinks" :key="link.id" class="card">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Data Source -->
            <div v-if="link.source">
              <h3 class="text-lg font-semibold mb-3 flex items-center">
                <svg class="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                {{ t('metricDetails.dataSource') }}
              </h3>
              <div class="space-y-2">
                <div>
                  <p class="text-sm text-gray-500">{{ t('common.name') }}</p>
                  <p class="font-medium">{{ link.source.name }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">{{ t('metricDetails.type') }}</p>
                  <p class="font-medium">{{ link.source.type }}</p>
                </div>
                <div v-if="link.source.format">
                  <p class="text-sm text-gray-500">{{ t('metricDetails.format') }}</p>
                  <p class="font-medium">{{ link.source.format }}</p>
                </div>
                <div v-if="link.source.updateFrequency">
                  <p class="text-sm text-gray-500">{{ t('metricDetails.updateFrequency') }}</p>
                  <p class="font-medium">{{ link.source.updateFrequency }}</p>
                </div>
              </div>
            </div>
            
            <!-- Department -->
            <div v-if="link.department">
              <h3 class="text-lg font-semibold mb-3 flex items-center">
                <svg class="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                {{ t('metricDetails.responsibleDepartment') }}
              </h3>
              <div class="space-y-2">
                <div>
                  <p class="text-sm text-gray-500">{{ t('nav.departments') }}</p>
                  <p class="font-medium">{{ link.department.name }}</p>
                </div>
                <div v-if="link.department.owner">
                  <p class="text-sm text-gray-500">{{ t('metricDetails.owner') }}</p>
                  <p class="font-medium">{{ link.department.owner }}</p>
                </div>
                <div v-if="link.department.email">
                  <p class="text-sm text-gray-500">{{ t('metricDetails.contact') }}</p>
                  <p class="font-medium">{{ link.department.email }}</p>
                </div>
              </div>
            </div>
            
            <!-- Storage -->
            <div v-if="link.storage">
              <h3 class="text-lg font-semibold mb-3 flex items-center">
                <svg class="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
                </svg>
                {{ t('metricDetails.storageLocation') }}
              </h3>
              <div class="space-y-2">
                <div>
                  <p class="text-sm text-gray-500">{{ t('metricDetails.location') }}</p>
                  <p class="font-medium">{{ link.storage.locationName }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">{{ t('metricDetails.type') }}</p>
                  <p class="font-medium">{{ link.storage.type }}</p>
                </div>
              </div>
            </div>
            
            <!-- Quality & Updates -->
            <div>
              <h3 class="text-lg font-semibold mb-3 flex items-center">
                <svg class="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {{ t('metricDetails.qualityStatus') }}
              </h3>
              <div class="space-y-2">
                <div v-if="link.qualityScore !== null">
                  <p class="text-sm text-gray-500">{{ t('metricDetails.qualityScore') }}</p>
                  <p class="font-medium">{{ link.qualityScore }}/100</p>
                </div>
                <div v-if="link.lastUpdate">
                  <p class="text-sm text-gray-500">{{ t('metricDetails.lastUpdate') }}</p>
                  <p class="font-medium">{{ formatDate(link.lastUpdate) }}</p>
                </div>
                <div v-if="link.issues">
                  <p class="text-sm text-gray-500">{{ t('metricDetails.issues') }}</p>
                  <p class="font-medium text-red-600">{{ link.issues }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- No Links -->
      <div v-else class="card text-center py-8 text-gray-500">
        <p>{{ t('metricDetails.noLinks') }}</p>
      </div>
    </div>
    
    <!-- Edit Modal -->
    <div v-if="showEditModal && metric" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold">{{ t('metricDetails.updateMetric') }}</h2>
            <button @click="showEditModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <form @submit.prevent="handleUpdate" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('common.name') }} *</label>
              <input v-model="editForm.name" type="text" required class="input-field" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('common.description') }}</label>
              <textarea v-model="editForm.description" rows="3" class="input-field"></textarea>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('common.category') }} *</label>
                <select v-model="editForm.category" required class="input-field">
                  <option value="E">{{ t('common.environmental') }}</option>
                  <option value="S">{{ t('common.social') }}</option>
                  <option value="G">{{ t('common.governance') }}</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('common.status') }} *</label>
                <select v-model="editForm.status" required class="input-field">
                  <option value="PLANNED">{{ t('common.planned') }}</option>
                  <option value="PARTIAL">{{ t('common.partial') }}</option>
                  <option value="COLLECTED">{{ t('common.collected') }}</option>
                </select>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div v-if="editForm.category === 'E'">
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('metricsList.scope') }}</label>
                <select v-model="editForm.scope" class="input-field">
                  <option value="">—</option>
                  <option value="SCOPE_1">{{ t('metricsList.scope1') }}</option>
                  <option value="SCOPE_2">{{ t('metricsList.scope2') }}</option>
                  <option value="SCOPE_3">{{ t('metricsList.scope3') }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('metricsList.subcategory') }}</label>
                <input v-model="editForm.subcategory" type="text" class="input-field" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('common.unit') }}</label>
                <input v-model="editForm.unit" type="text" class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('metricsList.standards') }}</label>
                <select v-model="editForm.standards" multiple class="input-field min-h-[80px]">
                  <option value="GRI">GRI</option>
                  <option value="SASB">SASB</option>
                  <option value="TCFD">TCFD</option>
                  <option value="SDG">SDG</option>
                  <option value="STARS">STARS</option>
                </select>
              </div>
            </div>
            
            <div class="flex space-x-3 pt-4">
              <button type="submit" class="btn-primary flex-1">{{ t('metricDetails.updateMetric') }}</button>
              <button type="button" @click="showEditModal = false" class="btn-secondary flex-1">{{ t('common.cancel') }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useMetricsStore } from '../stores/metricsStore'
import { useAuthStore } from '../stores/authStore'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const metricsStore = useMetricsStore()
const authStore = useAuthStore()

const showEditModal = ref(false)
const editForm = ref({})
const deleting = ref(false)

const loading = computed(() => metricsStore.loading)
const error = computed(() => metricsStore.error)
const metric = computed(() => metricsStore.currentMetric)

// Can delete if: user is admin OR user created the metric
const canDelete = computed(() => {
  if (!authStore.isEditor || !metric.value) return false
  return authStore.user.role === 'admin' || metric.value.createdBy === authStore.user.id
})

onMounted(async () => {
  try {
    await metricsStore.fetchMetricById(route.params.id)
    if (metric.value) {
      const m = metric.value
      const standards = typeof m.standards === 'string'
        ? (() => { try { return JSON.parse(m.standards) } catch { return [] } })()
        : (m.standards || [])
      editForm.value = { ...m, standards }
    }
  } catch (err) {
    // Error will be shown via computed error property
  }
})

const displayStandards = computed(() => {
  const m = metric.value
  if (!m) return []
  if (Array.isArray(m.standards)) return m.standards
  if (typeof m.standards === 'string') {
    try { return JSON.parse(m.standards) }
    catch { return m.standards ? [m.standards] : [] }
  }
  return []
})

watch(metric, (newMetric) => {
  if (newMetric) {
    const standards = typeof newMetric.standards === 'string'
      ? (() => { try { return JSON.parse(newMetric.standards) } catch { return [] } })()
      : (newMetric.standards || [])
    editForm.value = { ...newMetric, standards }
  }
})

async function handleUpdate() {
  try {
    const payload = { ...editForm.value }
    if (payload.standards && payload.standards.length) payload.standards = payload.standards
    else payload.standards = []
    await metricsStore.updateMetric(metric.value.id, payload)
    showEditModal.value = false
  } catch (err) {
    alert('Error updating metric: ' + err.message)
  }
}

async function handleDelete() {
  if (!window.confirm(t('metricDetails.deleteConfirm'))) {
    return
  }

  deleting.value = true
  try {
    await metricsStore.deleteMetric(metric.value.id)
    alert(t('metricDetails.deleteSuccess'))
    router.push('/metrics')
  } catch (err) {
    alert('Error deleting metric: ' + (err.response?.data?.error || err.message))
  } finally {
    deleting.value = false
  }
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>
