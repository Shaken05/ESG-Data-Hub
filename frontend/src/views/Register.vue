<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-white rounded-lg shadow-lg mb-4">
          <span class="text-3xl font-bold text-primary-600">E</span>
        </div>
        <h1 class="text-3xl font-bold text-white">ESG Inventory</h1>
        <p class="text-primary-100 mt-2">Register with KBTU account</p>
      </div>

      <div class="bg-white rounded-lg shadow-2xl p-8">
        <form @submit.prevent="handleRegister" class="space-y-4">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">Register</h2>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input v-model="form.name" type="text" placeholder="Full Name" class="input-field" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email (kbtu.kz)</label>
            <input v-model="form.email" type="email" placeholder="name@kbtu.kz" class="input-field" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input v-model="form.password" type="password" placeholder="••••••••" class="input-field" required />
          </div>

          <div v-if="localError" class="text-red-600 text-sm">{{ localError }}</div>
          <div v-if="registerResult" class="text-green-700 text-sm">{{ registerResult }}</div>

          <button type="submit" :disabled="authStore.loading" class="btn-primary w-full">
            {{ authStore.loading ? 'Registering...' : 'Register' }}
          </button>
        </form>

        <div class="mt-4 text-sm text-center">
          <router-link to="/login" class="text-primary-600 hover:underline">Already have an account? Login</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({ name: '', email: '', password: '' })
const localError = ref('')
const registerResult = ref('')

const checkKbtu = (email) => {
  const pattern = /^[^\s@]+@kbtu\.kz$/i
  return pattern.test(email)
}

async function handleRegister() {
  localError.value = ''
  registerResult.value = ''

  const { name, email, password } = form.value

  if (!name || !email || !password) {
    localError.value = 'Please complete all fields.'
    return
  }

  if (!checkKbtu(email)) {
    localError.value = 'Email must be a valid @kbtu.kz address.'
    return
  }

  const result = await authStore.register(name, email, password)

  if (!result) {
    localError.value = authStore.error || 'Registration failed. Please check data.'
    return
  }

  registerResult.value = 'Registration successful. Please login using your credentials.'
  form.value = { name: '', email: '', password: '' }

  setTimeout(() => {
    router.push('/login')
  }, 1500)
}
</script>
