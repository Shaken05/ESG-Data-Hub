<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-white rounded-lg shadow-lg mb-4">
          <span class="text-3xl font-bold text-primary-600">E</span>
        </div>
        <h1 class="text-3xl font-bold text-white">{{ t('login.title') }}</h1>
        <p class="text-primary-100 mt-2">{{ t('login.subtitle') }}</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white rounded-lg shadow-2xl p-8">
        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">{{ t('login.formTitle') }}</h2>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('login.email') }}</label>
            <input
              v-model="loginForm.email"
              type="email"
              :placeholder="t('login.emailPlaceholder')"
              class="input w-full"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('login.password') }}</label>
            <input
              v-model="loginForm.password"
              type="password"
              placeholder="••••••••"
              class="input w-full"
              required
            />
          </div>

          <div class="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
            <p class="font-medium mb-2">📋 {{ t('login.testCredentials') }}</p>
            <ul class="space-y-1">
              <li><strong>{{ t('login.admin') }}:</strong> admin@university.edu / admin123</li>
              <li><strong>{{ t('login.editor') }}:</strong> editor@university.edu / editor123</li>
              <li><strong>{{ t('login.viewer') }}:</strong> viewer@university.edu / viewer123</li>
            </ul>
          </div>

          <button
            type="submit"
            :disabled="authStore.loading"
            class="btn-primary w-full"
          >
            {{ authStore.loading ? t('login.loggingIn') : t('login.submit') }}
          </button>
        </form>

        <!-- Error Message -->
        <div v-if="authStore.error" class="mt-4 bg-red-50 border border-red-200 rounded p-3 text-red-800 text-sm">
          {{ authStore.error }}
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center mt-8 text-primary-100 text-sm">
        <p>{{ t('login.footer') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/authStore'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const loginForm = ref({
  email: 'admin@university.edu',
  password: 'admin123'
})

// Check if already logged in
onMounted(async () => {
  if (authStore.token) {
    const success = await authStore.fetchCurrentUser()
    if (success) {
      router.push('/')
    }
  }
})

async function handleLogin() {
  const success = await authStore.login(loginForm.value.email, loginForm.value.password)
  if (success) {
    router.push('/')
  }
}
</script>
