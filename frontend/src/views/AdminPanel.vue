<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Admin Panel</h1>

    <div class="mb-4">
      <h2 class="text-lg font-medium">User management</h2>
      <p class="text-sm text-slate-500">Admin can add users, edit role, deactivate/delete accounts.</p>
    </div>

    <div class="bg-white border rounded-lg p-4 mb-4">
      <h3 class="font-semibold mb-3">Create new user</h3>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div>
          <label class="block text-sm text-gray-700">Name</label>
          <input v-model="newUser.name" type="text" placeholder="Full Name" class="input-field" />
        </div>
        <div>
          <label class="block text-sm text-gray-700">Email</label>
          <input v-model="newUser.email" type="email" placeholder="name@kbtu.kz" class="input-field" />
        </div>
        <div>
          <label class="block text-sm text-gray-700">Password</label>
          <input v-model="newUser.password" type="password" placeholder="Password" class="input-field" />
        </div>
        <div>
          <label class="block text-sm text-gray-700">Role</label>
          <select v-model="newUser.role" class="input-field">
            <option value="viewer">viewer</option>
            <option value="editor">editor</option>
            <option value="admin">admin</option>
          </select>
        </div>
      </div>
      <div class="mt-3">
        <button @click="createUser" class="btn-primary">Create user</button>
        <span v-if="adminMessage" class="ml-3 text-green-700">{{ adminMessage }}</span>
        <span v-if="adminError" class="ml-3 text-red-700">{{ adminError }}</span>
      </div>
    </div>

    <table class="w-full text-left border-collapse">
      <thead>
        <tr class="bg-slate-100">
          <th class="px-3 py-2 border">ID</th>
          <th class="px-3 py-2 border">Name</th>
          <th class="px-3 py-2 border">Email</th>
          <th class="px-3 py-2 border">Role</th>
          <th class="px-3 py-2 border">Active</th>
          <th class="px-3 py-2 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id" class="hover:bg-slate-50">
          <td class="px-3 py-2 border">{{ user.id }}</td>
          <td class="px-3 py-2 border">{{ user.name }}</td>
          <td class="px-3 py-2 border">{{ user.email }}</td>
          <td class="px-3 py-2 border">
            <select v-model="rolesMap[user.id]" @change="changeRole(user.id)">
              <option value="viewer">viewer</option>
              <option value="editor">editor</option>
              <option value="admin">admin</option>
            </select>
          </td>
          <td class="px-3 py-2 border">{{ user.active ? 'Yes' : 'No' }}</td>
          <td class="px-3 py-2 border flex items-center gap-2">
            <button
              class="btn-secondary btn-sm"
              :disabled="(!user.active && user.id !== authStore.user.id) || user.email === authStore.user.email"
              @click="deactivateUser(user.id)"
            >
              Deactivate
            </button>
            <button
              class="btn-danger btn-sm"
              :disabled="user.email === authStore.user.email"
              @click="deleteUser(user.id)"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="adminMessage" class="mt-4 text-sm text-green-700">{{ adminMessage }}</div>
    <div v-if="adminError" class="mt-4 text-sm text-red-600">{{ adminError }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { authAPI } from '../services/api'

const authStore = useAuthStore()
const users = ref([])
const rolesMap = ref({})
const adminMessage = ref('')
const adminError = ref('')
const newUser = ref({ name: '', email: '', password: '', role: 'viewer' })

const loadUsers = async () => {
  try {
    const res = await authAPI.getUsers()
    users.value = res.data
    rolesMap.value = users.value.reduce((acc, u) => ({ ...acc, [u.id]: u.role }), {})
  } catch (err) {
    adminError.value = err.response?.data?.error || err.message
  }
}

const createUser = async () => {
  adminError.value = ''
  adminMessage.value = ''

  if (!newUser.value.name || !newUser.value.email || !newUser.value.password) {
    adminError.value = 'Please fill name, email and password'
    return
  }

  if (!newUser.value.email.toLowerCase().endsWith('@kbtu.kz')) {
    adminError.value = 'Email must be @kbtu.kz'
    return
  }

  try {
    await authAPI.createUser({
      name: newUser.value.name,
      email: newUser.value.email,
      password: newUser.value.password,
      role: newUser.value.role
    })
    adminMessage.value = 'User created successfully'
    newUser.value = { name: '', email: '', password: '', role: 'viewer' }
    await loadUsers()
  } catch (err) {
    adminError.value = err.response?.data?.error || err.message
  }
}

const changeRole = async (userId) => {
  adminError.value = ''
  adminMessage.value = ''
  const newRole = rolesMap.value[userId]
  try {
    await authAPI.updateUserRole(userId, newRole)
    adminMessage.value = 'Role updated successfully'
    await loadUsers()
  } catch (err) {
    adminError.value = err.response?.data?.error || err.message
  }
}

const deactivateUser = async (userId) => {
  adminError.value = ''
  adminMessage.value = ''
  try {
    await authAPI.deactivateUser(userId)
    adminMessage.value = 'User deactivated successfully'
    await loadUsers()
  } catch (err) {
    adminError.value = err.response?.data?.error || err.message
  }
}

const deleteUser = async (userId) => {
  adminError.value = ''
  adminMessage.value = ''
  try {
    await authAPI.deleteUser(userId)
    adminMessage.value = 'User deleted successfully'
    await loadUsers()
  } catch (err) {
    adminError.value = err.response?.data?.error || err.message
  }
}

onMounted(loadUsers)
</script>
