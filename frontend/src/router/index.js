import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import Dashboard from '../views/Dashboard.vue'
import MetricsList from '../views/MetricsList.vue'
import MetricDetails from '../views/MetricDetails.vue'
import DataSources from '../views/DataSources.vue'
import Departments from '../views/Departments.vue'
import StorageLocations from '../views/StorageLocations.vue'
import ImportData from '../views/ImportData.vue'
import Login from '../views/Login.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/metrics',
    name: 'MetricsList',
    component: MetricsList,
    meta: { requiresAuth: true }
  },
  {
    path: '/metrics/:id',
    name: 'MetricDetails',
    component: MetricDetails,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/sources',
    name: 'DataSources',
    component: DataSources,
    meta: { requiresAuth: true }
  },
  {
    path: '/departments',
    name: 'Departments',
    component: Departments,
    meta: { requiresAuth: true }
  },
  {
    path: '/storage',
    name: 'StorageLocations',
    component: StorageLocations,
    meta: { requiresAuth: true }
  },
  {
    path: '/import',
    name: 'ImportData',
    component: ImportData,
    meta: { requiresAuth: true, requiredRole: 'editor' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // If token exists, try to fetch current user
      if (authStore.token) {
        await authStore.fetchCurrentUser()
        if (authStore.isAuthenticated) {
          // Check role requirement
          if (to.meta.requiredRole && !checkUserRole(authStore.user.role, to.meta.requiredRole)) {
            next({ name: 'Dashboard' })
            return
          }
          next()
          return
        }
      }
      // Not authenticated, redirect to login
      next({ name: 'Login', query: { redirect: to.fullPath } })
    } else {
      // Check role requirement
      if (to.meta.requiredRole && !checkUserRole(authStore.user.role, to.meta.requiredRole)) {
        next({ name: 'Dashboard' })
        return
      }
      next()
    }
  } else {
    next()
  }
})

// Helper to check if user has required role
function checkUserRole(userRole, requiredRole) {
  const roles = ['viewer', 'editor', 'admin']
  const userRoleIndex = roles.indexOf(userRole)
  const requiredRoleIndex = roles.indexOf(requiredRole)
  return userRoleIndex >= requiredRoleIndex
}

export default router
