<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <h1 class="text-3xl font-bold text-gray-900">{{ t('metricsList.title') }}</h1>
      <div class="flex items-center gap-2">
        <div class="relative">
          <button
            @click="exportDropdownOpen = !exportDropdownOpen"
            :disabled="exportLoading"
            class="btn-secondary flex items-center gap-2"
          >
            {{ exportLoading ? t('metricsList.exporting') : t('common.export') }}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
          </button>
          <div
            v-if="exportDropdownOpen"
            class="absolute right-0 mt-1 w-56 py-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          >
            <button
              @click="doExport('xlsx'); exportDropdownOpen = false"
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {{ t('metricsList.exportExcel') }}
            </button>
            <button
              @click="doExport('csv'); exportDropdownOpen = false"
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {{ t('metricsList.exportCsv') }}
            </button>
            <button
              @click="doExport('pdf'); exportDropdownOpen = false"
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {{ t('metricsList.exportPdf') }}
            </button>
          </div>
        </div>
        <button v-if="authStore.isEditor" @click="showCreateModal = true" class="btn-primary">
          + {{ t('metricsList.addMetric') }}
        </button>
      </div>
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
          <p class="text-gray-500">{{ t('common.loading') }}</p>
        </div>
        
        <div v-else-if="error" class="card bg-red-50 text-red-800">
          <p>{{ t('metricsList.errorLoad') }} {{ error }}</p>
        </div>
        
        <div v-else-if="filteredMetrics.length === 0" class="card text-center py-12">
          <p class="text-gray-500">{{ t('metricsList.noMetrics') }}</p>
        </div>
        
        <div v-else class="space-y-4">
          <div class="card flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm text-gray-600">
              {{ t('metricsList.showing') }} {{ paginationFrom }}-{{ paginationTo }} {{ t('metricsList.of') }} {{ filteredMetrics.length }} {{ t('metricsList.metrics') }}
            </p>
            <div v-if="totalPages > 1" class="flex items-center gap-2">
              <button
                :disabled="currentPage <= 1"
                @click="currentPage = currentPage - 1"
                class="px-3 py-1.5 rounded-lg text-sm font-medium border border-surface-200 bg-white text-surface-700 hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ t('common.previous') }}
              </button>
              <span class="flex items-center gap-1">
                <template v-for="p in visiblePages" :key="p">
                  <button
                    v-if="p !== '...'"
                    @click="currentPage = p"
                    :class="['min-w-[2rem] px-2 py-1.5 rounded-lg text-sm font-medium transition-colors', currentPage === p ? 'bg-primary-600 text-white' : 'border border-surface-200 bg-white text-surface-700 hover:bg-surface-50']"
                  >
                    {{ p }}
                  </button>
                  <span v-else class="px-1 text-surface-400">…</span>
                </template>
              </span>
              <button
                :disabled="currentPage >= totalPages"
                @click="currentPage = currentPage + 1"
                class="px-3 py-1.5 rounded-lg text-sm font-medium border border-surface-200 bg-white text-surface-700 hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ t('common.next') }}
              </button>
            </div>
          </div>
          
          <div class="grid grid-cols-1 gap-4">
            <MetricCard 
              v-for="metric in paginatedMetrics" 
              :key="metric.id"
              :metric="metric"
              @click="$router.push(`/metrics/${metric.id}`)"
            />
          </div>

          <!-- Pagination at bottom -->
          <div v-if="totalPages > 1" class="card flex flex-wrap items-center justify-center gap-2 pt-4">
            <button
              :disabled="currentPage <= 1"
              @click="currentPage = currentPage - 1"
              class="px-3 py-1.5 rounded-lg text-sm font-medium border border-surface-200 bg-white text-surface-700 hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ t('common.previous') }}
            </button>
            <span class="text-sm text-surface-600">
              {{ t('metricsList.page') }} {{ currentPage }} {{ t('metricsList.of') }} {{ totalPages }}
            </span>
            <button
              :disabled="currentPage >= totalPages"
              @click="currentPage = currentPage + 1"
              class="px-3 py-1.5 rounded-lg text-sm font-medium border border-surface-200 bg-white text-surface-700 hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ t('common.next') }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Create Metric Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold">{{ t('metricsList.createMetric') }}</h2>
            <button @click="showCreateModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <form @submit.prevent="handleCreate" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('common.name') }} *</label>
              <input v-model="newMetric.name" type="text" required class="input-field" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('common.description') }}</label>
              <textarea v-model="newMetric.description" rows="3" class="input-field"></textarea>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('common.category') }} *</label>
                <select v-model="newMetric.category" required class="input-field">
                  <option value="">{{ t('metricsList.selectCategory') }}</option>
                  <option value="E">{{ t('common.environmental') }}</option>
                  <option value="S">{{ t('common.social') }}</option>
                  <option value="G">{{ t('common.governance') }}</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('common.status') }} *</label>
                <select v-model="newMetric.status" required class="input-field">
                  <option value="PLANNED">{{ t('common.planned') }}</option>
                  <option value="PARTIAL">{{ t('common.partial') }}</option>
                  <option value="COLLECTED">{{ t('common.collected') }}</option>
                </select>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div v-if="newMetric.category === 'E'">
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('metricsList.scope') }}</label>
                <select v-model="newMetric.scope" class="input-field">
                  <option value="">{{ t('metricsList.selectScope') }}</option>
                  <option value="SCOPE_1">{{ t('metricsList.scope1') }}</option>
                  <option value="SCOPE_2">{{ t('metricsList.scope2') }}</option>
                  <option value="SCOPE_3">{{ t('metricsList.scope3') }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('metricsList.subcategory') }}</label>
                <input v-model="newMetric.subcategory" type="text" class="input-field" :placeholder="t('metricsList.subcategoryPlaceholder')" />
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('common.unit') }}</label>
                <input v-model="newMetric.unit" type="text" class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('metricsList.standards') }}</label>
                <select v-model="newMetric.standards" multiple class="input-field min-h-[80px]">
                  <option value="GRI">GRI</option>
                  <option value="SASB">SASB</option>
                  <option value="TCFD">TCFD</option>
                  <option value="SDG">SDG</option>
                  <option value="STARS">STARS</option>
                </select>
                <p class="text-xs text-gray-500 mt-1">{{ t('metricsList.standardsHint') }}</p>
              </div>
            </div>
            
            <div class="flex space-x-3 pt-4">
              <button type="submit" class="btn-primary flex-1">{{ t('metricsList.createButton') }}</button>
              <button type="button" @click="showCreateModal = false" class="btn-secondary flex-1">{{ t('common.cancel') }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useMetricsStore } from '../stores/metricsStore'
import { useAuthStore } from '../stores/authStore'
import MetricCard from '../components/MetricCard.vue'
import Filters from '../components/Filters.vue'
import { exportAPI } from '../services/api'

const { t } = useI18n()
const router = useRouter()
const metricsStore = useMetricsStore()
const authStore = useAuthStore()

const showCreateModal = ref(false)
const exportDropdownOpen = ref(false)
const exportLoading = ref(false)
const newMetric = ref({
  name: '',
  description: '',
  category: '',
  scope: '',
  subcategory: '',
  unit: '',
  standard: '',
  standards: [],
  status: 'PLANNED'
})

const PAGE_SIZE = 10
const currentPage = ref(1)

const loading = computed(() => metricsStore.loading)
const error = computed(() => metricsStore.error)
const metrics = computed(() => metricsStore.metrics)
const filteredMetrics = computed(() => metricsStore.filteredMetrics)

const totalPages = computed(() => Math.max(1, Math.ceil(filteredMetrics.value.length / PAGE_SIZE)))

const paginatedMetrics = computed(() => {
  const list = filteredMetrics.value
  const start = (currentPage.value - 1) * PAGE_SIZE
  return list.slice(start, start + PAGE_SIZE)
})

const paginationFrom = computed(() => {
  if (filteredMetrics.value.length === 0) return 0
  return (currentPage.value - 1) * PAGE_SIZE + 1
})

const paginationTo = computed(() => {
  const to = currentPage.value * PAGE_SIZE
  return Math.min(to, filteredMetrics.value.length)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const p = currentPage.value
  if (p <= 4) return [1, 2, 3, 4, 5, '...', total]
  if (p >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '...', p - 1, p, p + 1, '...', total]
})

onMounted(() => {
  metricsStore.fetchMetrics()
})

watch(filteredMetrics, () => { currentPage.value = 1 })

function handleFiltersUpdate(newFilters) {
  metricsStore.setFilters(newFilters)
}

async function doExport(format) {
  exportLoading.value = true
  try {
    await exportAPI.downloadMetrics(format, metricsStore.filters)
  } catch (err) {
    alert('Export failed: ' + (err.response?.data?.message || err.message))
  } finally {
    exportLoading.value = false
  }
}

async function handleCreate() {
  try {
    const payload = { ...newMetric.value }
    if (payload.standards && payload.standards.length) payload.standards = payload.standards
    else delete payload.standards
    if (!payload.scope) delete payload.scope
    if (!payload.subcategory) delete payload.subcategory
    await metricsStore.createMetric(payload)
    showCreateModal.value = false
    newMetric.value = {
      name: '',
      description: '',
      category: '',
      scope: '',
      subcategory: '',
      unit: '',
      standard: '',
      standards: [],
      status: 'PLANNED'
    }
  } catch (err) {
    alert('Error creating metric: ' + err.message)
  }
}
</script>
