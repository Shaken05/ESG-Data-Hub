<template>
  <nav class="bg-white shadow-md">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center space-x-8">
          <RouterLink to="/" class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-xl">E</span>
            </div>
            <span class="text-xl font-bold text-gray-900">ESG Inventory</span>
          </RouterLink>
          
          <div class="hidden md:flex space-x-4">
            <RouterLink 
              to="/" 
              class="nav-link"
              active-class="nav-link-active"
            >
              Dashboard
            </RouterLink>
            <RouterLink 
              to="/metrics" 
              class="nav-link"
              active-class="nav-link-active"
            >
              Metrics
            </RouterLink>
            <RouterLink 
              to="/sources" 
              class="nav-link"
              active-class="nav-link-active"
            >
              Data Sources
            </RouterLink>
            <RouterLink 
              to="/departments" 
              class="nav-link"
              active-class="nav-link-active"
            >
              Departments
            </RouterLink>
            <RouterLink 
              to="/storage" 
              class="nav-link"
              active-class="nav-link-active"
            >
              Storage
            </RouterLink>
            <RouterLink 
              v-if="authStore.isEditor"
              to="/import" 
              class="nav-link"
              active-class="nav-link-active"
            >
              📥 Import
            </RouterLink>
          </div>
        </div>
        
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-3">
            <div class="text-right">
              <p class="text-sm font-medium text-gray-900">{{ authStore.user?.name }}</p>
              <p class="text-xs text-gray-500">{{ roleLabel }}</p>
            </div>
            <button
              @click="handleLogout"
              class="btn-secondary text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { computed } from 'vue'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const roleLabel = computed(() => {
  const role = authStore.user?.role || 'unknown'
  const labels = {
    admin: '👑 Administrator',
    editor: '✏️ Editor',
    viewer: '👁️ Viewer'
  }
  return labels[role] || role
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.nav-link {
  @apply text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors;
}

.nav-link-active {
  @apply text-primary-600 bg-primary-50;
}
</style>
