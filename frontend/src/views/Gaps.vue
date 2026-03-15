<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <h1 class="text-3xl font-bold text-gray-900">{{ t('gaps.title') }}</h1>
      <div class="flex items-center gap-2">
        <select v-model="view" @change="fetchGaps" class="input-field w-auto">
          <option value="department">{{ t('gaps.byDepartment') }}</option>
          <option value="source">{{ t('gaps.bySource') }}</option>
        </select>
      </div>
    </div>
    <p class="text-gray-600">
      {{ t('gaps.description', { axis: view === 'department' ? t('gaps.axisDepartment') : t('gaps.axisSource') }) }}
    </p>

    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">{{ t('gaps.loading') }}</p>
    </div>
    <div v-else-if="error" class="card bg-red-50 text-red-800">
      <p>{{ error }}</p>
    </div>
    <div v-else class="card overflow-x-auto">
      <table class="w-full min-w-[600px]">
        <thead>
          <tr class="border-b border-gray-200">
            <th class="text-left py-3 px-4 font-semibold text-gray-700">{{ t('gaps.category') }}</th>
            <th class="text-left py-3 px-4 font-semibold text-gray-700">{{ view === 'department' ? t('nav.departments') : t('nav.dataSources') }}</th>
            <th class="text-right py-3 px-4 font-semibold text-gray-700">{{ t('gaps.metricCount') }}</th>
            <th class="text-right py-3 px-4 font-semibold text-gray-700">{{ t('gaps.avgQuality') }}</th>
            <th class="text-left py-3 px-4 font-semibold text-gray-700">{{ t('gaps.statuses') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, idx) in rows"
            :key="idx"
            class="border-b border-gray-100 hover:bg-gray-50"
          >
            <td class="py-3 px-4">
              <span :class="categoryClass(row.category)">{{ row.category }}</span>
            </td>
            <td class="py-3 px-4 font-medium">{{ row.dimension }}</td>
            <td class="py-3 px-4 text-right">{{ row.metricCount }}</td>
            <td class="py-3 px-4 text-right">
              <span :class="qualityClass(row.avgQuality)">
                {{ row.avgQuality != null ? row.avgQuality : '—' }}
              </span>
            </td>
            <td class="py-3 px-4 text-sm text-gray-600">
              <span v-for="(count, status) in row.statuses" :key="status" class="mr-2">
                {{ status }}: {{ count }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="rows.length === 0" class="py-12 text-center text-gray-500">
        {{ t('gaps.noData') }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { gapsAPI } from '../services/api'

const { t } = useI18n()
const view = ref('department')
const loading = ref(false)
const error = ref(null)
const rows = ref([])

async function fetchGaps() {
  loading.value = true
  error.value = null
  try {
    const res = await gapsAPI.getGaps({ view: view.value })
    rows.value = res.data.rows || []
  } catch (err) {
    error.value = err.response?.data?.message || err.message
  } finally {
    loading.value = false
  }
}

function categoryClass(cat) {
  const map = { E: 'badge bg-green-100 text-green-800', S: 'badge bg-blue-100 text-blue-800', G: 'badge bg-purple-100 text-purple-800' }
  return map[cat] || 'badge'
}

function qualityClass(q) {
  if (q == null) return ''
  if (q >= 70) return 'text-green-600 font-medium'
  if (q >= 40) return 'text-yellow-600 font-medium'
  return 'text-red-600 font-medium'
}

onMounted(() => fetchGaps())
</script>
