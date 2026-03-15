<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-gray-900">{{ t('audit.title') }}</h1>
    <p class="text-gray-600">
      {{ t('audit.description') }}
    </p>

    <div class="flex flex-wrap gap-2 items-center">
      <select v-model="filters.entityType" @change="fetchLogs" class="input-field w-auto">
        <option value="">{{ t('audit.allEntities') }}</option>
        <option value="metric">{{ t('audit.metric') }}</option>
        <option value="data_source">{{ t('audit.source') }}</option>
        <option value="department">{{ t('audit.department') }}</option>
        <option value="storage_location">{{ t('audit.storage') }}</option>
        <option value="metric_link">{{ t('audit.link') }}</option>
      </select>
      <select v-model="filters.action" @change="fetchLogs" class="input-field w-auto">
        <option value="">{{ t('audit.allActions') }}</option>
        <option value="CREATE">{{ t('audit.create') }}</option>
        <option value="UPDATE">{{ t('audit.update') }}</option>
        <option value="DELETE">{{ t('audit.delete') }}</option>
      </select>
      <button @click="fetchLogs" class="btn-secondary">{{ t('audit.refresh') }}</button>
    </div>

    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">{{ t('common.loading') }}</p>
    </div>
    <div v-else-if="accessError" class="card bg-red-50 text-red-800">
      <p>{{ accessError }}</p>
    </div>
    <div v-else-if="error" class="card bg-red-50 text-red-800">
      <p>{{ error }}</p>
    </div>
    <div v-else class="card overflow-x-auto">
      <table class="w-full min-w-[700px]">
        <thead>
          <tr class="border-b border-gray-200">
            <th class="text-left py-3 px-4 font-semibold text-gray-700">{{ t('audit.date') }}</th>
            <th class="text-left py-3 px-4 font-semibold text-gray-700">{{ t('audit.user') }}</th>
            <th class="text-left py-3 px-4 font-semibold text-gray-700">{{ t('audit.entity') }}</th>
            <th class="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
            <th class="text-left py-3 px-4 font-semibold text-gray-700">{{ t('audit.action') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="log in logs"
            :key="log.id"
            class="border-b border-gray-100 hover:bg-gray-50"
          >
            <td class="py-3 px-4 text-sm text-gray-600">{{ formatDate(log.createdAt) }}</td>
            <td class="py-3 px-4">{{ log.userEmail || log.userId || '—' }}</td>
            <td class="py-3 px-4">{{ entityLabel(log.entityType) }}</td>
            <td class="py-3 px-4">{{ log.entityId ?? '—' }}</td>
            <td class="py-3 px-4">
              <span :class="actionClass(log.action)">{{ log.action }}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="logs.length === 0 && !loading" class="py-12 text-center text-gray-500">
        {{ t('audit.noRecords') }}
      </div>
      <div v-if="total > logs.length" class="py-2 text-sm text-gray-500">
        {{ t('audit.shown') }} {{ logs.length }} / {{ total }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { auditLogsAPI } from '../services/api'

const { t } = useI18n()
const loading = ref(false)
const error = ref(null)
const accessError = ref(null)
const logs = ref([])
const total = ref(0)
const filters = reactive({ entityType: '', action: '' })

function entityLabel(type) {
  const key = { metric: 'audit.metric', data_source: 'audit.source', department: 'audit.department', storage_location: 'audit.storage', metric_link: 'audit.link' }[type]
  return key ? t(key) : type
}

function actionClass(action) {
  const map = { CREATE: 'text-green-600 font-medium', UPDATE: 'text-blue-600 font-medium', DELETE: 'text-red-600 font-medium' }
  return map[action] || ''
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('ru-RU')
}

async function fetchLogs() {
  loading.value = true
  error.value = null
  accessError.value = null
  try {
    const params = {}
    if (filters.entityType) params.entityType = filters.entityType
    if (filters.action) params.action = filters.action
    const res = await auditLogsAPI.getLogs(params)
    logs.value = res.data.logs || []
    total.value = res.data.total ?? 0
  } catch (err) {
    if (err.response?.status === 403) accessError.value = 'Доступ только для администраторов.'
    else error.value = err.response?.data?.message || err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchLogs())
</script>
