<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <h1 class="text-3xl font-bold text-gray-900">{{ t('departments.title') }}</h1>
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
            class="absolute right-0 mt-1 w-48 py-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          >
            <button @click="doExport('xlsx'); exportDropdownOpen = false" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Excel (.xlsx)</button>
            <button @click="doExport('csv'); exportDropdownOpen = false" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">CSV</button>
          </div>
        </div>
        <button v-if="authStore.isEditor" @click="showCreateModal = true" class="btn-primary">
          + {{ t('departments.addDepartment') }}
        </button>
      </div>
    </div>
    
    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">{{ t('departments.loading') }}</p>
    </div>
    
    <div v-else-if="departments.length === 0" class="card text-center py-12">
      <p class="text-gray-500">{{ t('departments.noDepartments') }}</p>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="dept in departments" :key="dept.id" class="card hover:shadow-lg transition-shadow">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ dept.name }}</h3>
          </div>
          <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
        </div>
        
        <div class="space-y-2 text-sm text-gray-600">
          <div v-if="dept.owner">
            <span class="font-medium">{{ t('departments.owner') }}:</span> {{ dept.owner }}
          </div>
          <div v-if="dept.dataSteward">
            <span class="font-medium">{{ t('departments.dataSteward') }}:</span> {{ dept.dataSteward }}
          </div>
          <div v-if="dept.email">
            <span class="font-medium">{{ t('departments.email') }}:</span> 
            <a :href="`mailto:${dept.email}`" class="text-primary-600 hover:underline">{{ dept.email }}</a>
          </div>
          <div v-if="dept.phone">
            <span class="font-medium">{{ t('departments.phone') }}:</span> {{ dept.phone }}
          </div>
          <div v-if="dept.contactChannel">
            <span class="font-medium">{{ t('departments.contactChannel') }}:</span> {{ dept.contactChannel }}
          </div>
          <div v-if="dept.accessLevel">
            <span class="font-medium">{{ t('departments.accessLevel') }}:</span> {{ dept.accessLevel }}
          </div>
          <div v-if="dept.metricLinks">
            <span class="font-medium">{{ t('nav.metrics') }}:</span> {{ dept.metricLinks.length }}
          </div>
        </div>
        
        <div class="flex space-x-2 mt-4 pt-4 border-t border-gray-200">
          <button v-if="authStore.isEditor" @click="editDepartment(dept)" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
            {{ t('common.edit') }}
          </button>
          <button v-if="authStore.isEditor" @click="deleteDepartment(dept.id)" class="text-red-600 hover:text-red-700 text-sm font-medium">
            {{ t('common.delete') }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-md w-full">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold">{{ showEditModal ? t('departments.editDepartment') : t('departments.createDepartment') }}</h2>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('departments.departmentName') }} *</label>
              <input v-model="form.name" type="text" required class="input-field" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('departments.owner') }}</label>
              <input v-model="form.owner" type="text" class="input-field" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('departments.dataSteward') }}</label>
              <input v-model="form.dataSteward" type="text" class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('departments.email') }}</label>
              <input v-model="form.email" type="email" class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('departments.phone') }}</label>
              <input v-model="form.phone" type="text" class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('departments.contactChannel') }}</label>
              <select v-model="form.contactChannel" class="input-field">
                <option value="">—</option>
                <option value="Teams">{{ t('departments.teams') }}</option>
                <option value="Telegram">{{ t('departments.telegram') }}</option>
                <option value="Email">{{ t('departments.email') }}</option>
                <option value="Other">{{ t('departments.other') }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('departments.accessLevel') }}</label>
              <select v-model="form.accessLevel" class="input-field">
                <option value="">—</option>
                <option value="PUBLIC">{{ t('departments.public') }}</option>
                <option value="INTERNAL">{{ t('departments.internal') }}</option>
                <option value="SENSITIVE">{{ t('departments.sensitive') }}</option>
              </select>
            </div>
            
            <div class="flex space-x-3 pt-4">
              <button type="submit" class="btn-primary flex-1">
                {{ showEditModal ? t('common.save') : t('common.create') }}
              </button>
              <button type="button" @click="closeModal" class="btn-secondary flex-1">{{ t('common.cancel') }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/authStore'
import { departmentsAPI, exportAPI } from '../services/api'

const { t } = useI18n()
const authStore = useAuthStore()

const departments = ref([])
const loading = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const exportDropdownOpen = ref(false)
const exportLoading = ref(false)
const form = ref({
  name: '',
  owner: '',
  dataSteward: '',
  email: '',
  phone: '',
  contactChannel: '',
  accessLevel: ''
})
const editingId = ref(null)

onMounted(() => {
  fetchDepartments()
})

async function fetchDepartments() {
  loading.value = true
  try {
    const response = await departmentsAPI.getAll()
    departments.value = response.data
  } catch (error) {
    console.error('Error fetching departments:', error)
  } finally {
    loading.value = false
  }
}

function editDepartment(dept) {
  form.value = { ...dept }
  editingId.value = dept.id
  showEditModal.value = true
}

async function handleSubmit() {
  try {
    if (showEditModal.value) {
      await departmentsAPI.update(editingId.value, form.value)
    } else {
      await departmentsAPI.create(form.value)
    }
    await fetchDepartments()
    closeModal()
  } catch (error) {
    alert('Error: ' + error.message)
  }
}

async function deleteDepartment(id) {
  if (!confirm('Are you sure you want to delete this department?')) return
  
  try {
    await departmentsAPI.delete(id)
    await fetchDepartments()
  } catch (error) {
    alert('Error deleting department: ' + error.message)
  }
}

async function doExport(format) {
  exportLoading.value = true
  try {
    await exportAPI.downloadDepartments(format)
  } catch (err) {
    alert('Export failed: ' + (err.response?.data?.message || err.message))
  } finally {
    exportLoading.value = false
  }
}

function closeModal() {
  showCreateModal.value = false
  showEditModal.value = false
  editingId.value = null
  form.value = {
    name: '',
    owner: '',
    dataSteward: '',
    email: '',
    phone: '',
    contactChannel: '',
    accessLevel: ''
  }
}
</script>
