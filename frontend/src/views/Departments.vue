<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900">Departments</h1>
      <button v-if="authStore.isEditor" @click="showCreateModal = true" class="btn-primary">
        + Add Department
      </button>
    </div>
    
    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">Loading departments...</p>
    </div>
    
    <div v-else-if="departments.length === 0" class="card text-center py-12">
      <p class="text-gray-500">No departments found.</p>
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
            <span class="font-medium">Owner:</span> {{ dept.owner }}
          </div>
          <div v-if="dept.email">
            <span class="font-medium">Email:</span> 
            <a :href="`mailto:${dept.email}`" class="text-primary-600 hover:underline">{{ dept.email }}</a>
          </div>
          <div v-if="dept.metricLinks">
            <span class="font-medium">Metrics:</span> {{ dept.metricLinks.length }}
          </div>
        </div>
        
        <div class="flex space-x-2 mt-4 pt-4 border-t border-gray-200">
          <button v-if="authStore.isEditor" @click="editDepartment(dept)" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Edit
          </button>
          <button v-if="authStore.isEditor" @click="deleteDepartment(dept.id)" class="text-red-600 hover:text-red-700 text-sm font-medium">
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
            <h2 class="text-2xl font-bold">{{ showEditModal ? 'Edit' : 'Create' }} Department</h2>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Department Name *</label>
              <input v-model="form.name" type="text" required class="input-field" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Owner</label>
              <input v-model="form.owner" type="text" class="input-field" placeholder="Person responsible" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input v-model="form.email" type="email" class="input-field" placeholder="contact@example.com" />
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
import { departmentsAPI } from '../services/api'

const authStore = useAuthStore()

const departments = ref([])
const loading = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const form = ref({
  name: '',
  owner: '',
  email: ''
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

function closeModal() {
  showCreateModal.value = false
  showEditModal.value = false
  editingId.value = null
  form.value = {
    name: '',
    owner: '',
    email: ''
  }
}
</script>
