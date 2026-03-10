<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900">Data Sources</h1>
      <button v-if="authStore.isEditor" @click="showCreateModal = true" class="btn-primary">
        + Add Data Source
      </button>
    </div>
    
    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">Loading data sources...</p>
    </div>
    
    <div v-else-if="sources.length === 0" class="card text-center py-12">
      <p class="text-gray-500">No data sources found.</p>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="source in sources" :key="source.id" class="card hover:shadow-lg transition-shadow">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ source.name }}</h3>
            <span class="badge">{{ source.type }}</span>
          </div>
        </div>
        
        <div class="space-y-2 text-sm text-gray-600">
          <div v-if="source.format">
            <span class="font-medium">Format:</span> {{ source.format }}
          </div>
          <div v-if="source.updateFrequency">
            <span class="font-medium">Update Frequency:</span> {{ source.updateFrequency }}
          </div>
          <div v-if="source.metricLinks">
            <span class="font-medium">Metrics:</span> {{ source.metricLinks.length }}
          </div>
        </div>
        
        <div class="flex space-x-2 mt-4 pt-4 border-t border-gray-200">
          <button v-if="authStore.isEditor" @click="editSource(source)" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Edit
          </button>
          <button v-if="authStore.isEditor" @click="deleteSource(source.id)" class="text-red-600 hover:text-red-700 text-sm font-medium">
            Delete
          </button>
        </div>
      </div>
    </div>
    
    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-md w-full">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold">{{ showEditModal ? 'Edit' : 'Create' }} Data Source</h2>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input v-model="form.name" type="text" required class="input-field" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Type *</label>
              <select v-model="form.type" required class="input-field">
                <option value="">Select...</option>
                <option value="EXCEL">Excel</option>
                <option value="API">API</option>
                <option value="SURVEY">Survey</option>
                <option value="ERP">ERP</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Format</label>
              <input v-model="form.format" type="text" class="input-field" placeholder="e.g., .xlsx, JSON" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Update Frequency</label>
              <input v-model="form.updateFrequency" type="text" class="input-field" placeholder="e.g., Monthly, Weekly" />
            </div>
            
            <div class="flex space-x-3 pt-4">
              <button type="submit" class="btn-primary flex-1">
                {{ showEditModal ? 'Update' : 'Create' }}
              </button>
              <button type="button" @click="closeModal" class="btn-secondary flex-1">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { sourcesAPI } from '../services/api'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
const sources = ref([])
const loading = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const form = ref({
  name: '',
  type: '',
  format: '',
  updateFrequency: ''
})
const editingId = ref(null)

onMounted(() => {
  fetchSources()
})

async function fetchSources() {
  loading.value = true
  try {
    const response = await sourcesAPI.getAll()
    sources.value = response.data
  } catch (error) {
    console.error('Error fetching sources:', error)
  } finally {
    loading.value = false
  }
}

function editSource(source) {
  form.value = { ...source }
  editingId.value = source.id
  showEditModal.value = true
}

async function handleSubmit() {
  try {
    if (showEditModal.value) {
      await sourcesAPI.update(editingId.value, form.value)
    } else {
      await sourcesAPI.create(form.value)
    }
    await fetchSources()
    closeModal()
  } catch (error) {
    alert('Error: ' + error.message)
  }
}

async function deleteSource(id) {
  if (!confirm('Are you sure you want to delete this data source?')) return
  
  try {
    await sourcesAPI.delete(id)
    await fetchSources()
  } catch (error) {
    alert('Error deleting source: ' + error.message)
  }
}

function closeModal() {
  showCreateModal.value = false
  showEditModal.value = false
  editingId.value = null
  form.value = {
    name: '',
    type: '',
    format: '',
    updateFrequency: ''
  }
}
</script>
