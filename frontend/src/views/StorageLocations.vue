<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900">Storage Locations</h1>
      <button v-if="authStore.isEditor" @click="showCreateModal = true" class="btn-primary">
        + Add Storage Location
      </button>
    </div>
    
    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">Loading storage locations...</p>
    </div>
    
    <div v-else-if="locations.length === 0" class="card text-center py-12">
      <p class="text-gray-500">No storage locations found.</p>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="location in locations" :key="location.id" class="card hover:shadow-lg transition-shadow">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ location.locationName }}</h3>
            <span class="badge">{{ location.type }}</span>
          </div>
          <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
            </svg>
          </div>
        </div>
        
        <div class="text-sm text-gray-600">
          <div v-if="location.metricLinks">
            <span class="font-medium">Metrics stored:</span> {{ location.metricLinks.length }}
          </div>
        </div>
        
        <div class="flex space-x-2 mt-4 pt-4 border-t border-gray-200">
          <button v-if="authStore.isEditor" @click="editLocation(location)" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Edit
          </button>
          <button v-if="authStore.isEditor" @click="deleteLocation(location.id)" class="text-red-600 hover:text-red-700 text-sm font-medium">
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
            <h2 class="text-2xl font-bold">{{ showEditModal ? 'Edit' : 'Create' }} Storage Location</h2>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Location Name *</label>
              <input v-model="form.locationName" type="text" required class="input-field" placeholder="e.g., Google Drive - ESG Folder" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Type *</label>
              <select v-model="form.type" required class="input-field">
                <option value="">Select...</option>
                <option value="DRIVE">Drive</option>
                <option value="SERVER">Server</option>
                <option value="CLOUD">Cloud</option>
                <option value="SHAREPOINT">SharePoint</option>
              </select>
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
import { useAuthStore } from '../stores/authStore'
import { storageAPI } from '../services/api'

const authStore = useAuthStore()

const locations = ref([])
const loading = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const form = ref({
  locationName: '',
  type: ''
})
const editingId = ref(null)

onMounted(() => {
  fetchLocations()
})

async function fetchLocations() {
  loading.value = true
  try {
    const response = await storageAPI.getAll()
    locations.value = response.data
  } catch (error) {
    console.error('Error fetching storage locations:', error)
  } finally {
    loading.value = false
  }
}

function editLocation(location) {
  form.value = { ...location }
  editingId.value = location.id
  showEditModal.value = true
}

async function handleSubmit() {
  try {
    if (showEditModal.value) {
      await storageAPI.update(editingId.value, form.value)
    } else {
      await storageAPI.create(form.value)
    }
    await fetchLocations()
    closeModal()
  } catch (error) {
    alert('Error: ' + error.message)
  }
}

async function deleteLocation(id) {
  if (!confirm('Are you sure you want to delete this storage location?')) return
  
  try {
    await storageAPI.delete(id)
    await fetchLocations()
  } catch (error) {
    alert('Error deleting location: ' + error.message)
  }
}

function closeModal() {
  showCreateModal.value = false
  showEditModal.value = false
  editingId.value = null
  form.value = {
    locationName: '',
    type: ''
  }
}
</script>
