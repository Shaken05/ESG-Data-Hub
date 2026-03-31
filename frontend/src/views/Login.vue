<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-white rounded-lg shadow-lg mb-4">
          <span class="text-3xl font-bold text-primary-600">E</span>
        </div>
        <h1 class="text-3xl font-bold text-white">ESG Inventory</h1>
        <p class="text-primary-100 mt-2">Environmental, Social, Governance Data Management</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white rounded-lg shadow-2xl p-8">
        <!-- Login Form -->
        <form v-if="!showResetForm" @submit.prevent="handleLogin" class="space-y-4">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">Login</h2>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="loginForm.email"
              type="email"
              placeholder="your@email.com"
              class="input-field"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              v-model="loginForm.password"
              type="password"
              placeholder="••••••••"
              class="input-field"
              required
            />
          </div>

          <button
            type="submit"
            :disabled="authStore.loading"
            class="btn-primary w-full"
          >
            {{ authStore.loading ? 'Logging in...' : 'Login' }}
          </button>

          <div class="mt-4 text-sm text-center space-y-2">
            <div>
              <router-link to="/register" class="text-primary-600 hover:underline">Don't have an account? Register with @kbtu.kz</router-link>
            </div>
            <div>
              <button 
                type="button" 
                @click="showResetForm = true"
                class="text-primary-600 hover:underline text-sm"
              >
                Forgot password?
              </button>
            </div>
          </div>
        </form>

        <!-- Password Reset Form -->
        <form v-else @submit.prevent="handleResetPassword" class="space-y-4">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">Reset Password</h2>
          
          <template v-if="resetStep === 1">
            <p class="text-gray-700 text-sm mb-4">Enter your email address and we'll send you a reset code.</p>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                v-model="resetForm.email"
                type="email"
                placeholder="your@email.com"
                class="input-field"
                required
              />
            </div>
            <button
              type="submit"
              :disabled="resetLoading"
              class="btn-primary w-full"
            >
              {{ resetLoading ? 'Sending...' : 'Send Reset Code' }}
            </button>
          </template>

          <template v-else>
            <p class="text-gray-700 text-sm mb-4">Enter the reset code sent to your email and your new password.</p>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Reset Code</label>
              <input
                v-model="resetForm.code"
                type="text"
                placeholder="000000"
                class="input-field"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                v-model="resetForm.newPassword"
                type="password"
                placeholder="••••••••"
                class="input-field"
                required
              />
            </div>
            <button
              type="submit"
              :disabled="resetLoading"
              class="btn-primary w-full"
            >
              {{ resetLoading ? 'Resetting...' : 'Reset Password' }}
            </button>
          </template>

          <div class="text-center">
            <button 
              type="button" 
              @click="showResetForm = false; resetStep = 1; resetForm = { email: '', code: '', newPassword: '' }"
              class="text-gray-600 hover:underline text-sm"
            >
              Back to Login
            </button>
          </div>
        </form>

        <!-- Error Message -->
        <div v-if="authStore.error || resetError" class="mt-4 bg-red-50 border border-red-200 rounded p-3 text-red-800 text-sm">
          {{ authStore.error || resetError }}
        </div>

        <!-- Success Message -->
        <div v-if="resetSuccess" class="mt-4 bg-green-50 border border-green-200 rounded p-3 text-green-800 text-sm">
          {{ resetSuccess }}
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center mt-8 text-primary-100 text-sm">
        <p>ESG Data Inventory System © 2026</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { authAPI } from '../services/api'

const router = useRouter()
const authStore = useAuthStore()

const loginForm = ref({
  email: 'admin@university.edu',
  password: 'admin123'
})

const showResetForm = ref(false)
const resetStep = ref(1) // 1: email, 2: code + password
const resetForm = ref({
  email: '',
  code: '',
  newPassword: ''
})
const resetLoading = ref(false)
const resetError = ref('')
const resetSuccess = ref('')

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

async function handleResetPassword() {
  resetError.value = ''
  resetSuccess.value = ''
  resetLoading.value = true

  try {
    if (resetStep.value === 1) {
      // Request password reset
      const response = await authAPI.requestPasswordReset(resetForm.value.email)
      resetSuccess.value = response.data.message
      resetStep.value = 2
    } else {
      // Complete password reset
      const response = await authAPI.resetPassword(
        resetForm.value.email,
        resetForm.value.code,
        resetForm.value.newPassword
      )
      resetSuccess.value = response.data.message + ' Redirecting to login...'
      setTimeout(() => {
        showResetForm.value = false
        resetStep.value = 1
        resetForm.value = { email: '', code: '', newPassword: '' }
      }, 2000)
    }
  } catch (error) {
    resetError.value = error.response?.data?.error || error.message
  } finally {
    resetLoading.value = false
  }
}
</script>
