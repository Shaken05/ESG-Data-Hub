<template>
  <div class="min-h-screen">
    <Navigation v-if="authStore.isAuthenticated" />
    <main :class="{ 'container mx-auto px-4 py-8': authStore.isAuthenticated }">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useAuthStore } from './stores/authStore'
import Navigation from './components/Navigation.vue'

const authStore = useAuthStore()

// Initialize auth on app load
onMounted(async () => {
  if (authStore.token && !authStore.user) {
    await authStore.fetchCurrentUser()
  }
})
</script>
