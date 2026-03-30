<template>
  <header ref="topbarRef" class="topbar">
    <div class="topbar-inner">
      <!-- Logo -->
      <RouterLink to="/" class="topbar-logo">
        <div class="topbar-logo-icon">
          <span>E</span>
        </div>
        <span class="topbar-logo-text">ESG Inventory</span>
      </RouterLink>

      <!-- Global search -->
      <div class="topbar-search-wrap">
        <svg class="topbar-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <form @submit.prevent="onSearch" class="topbar-search-form">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('nav.searchPlaceholder')"
            class="topbar-search-input"
          />
        </form>
      </div>

      <!-- Nav links -->
      <nav class="topbar-nav">
        <RouterLink to="/" class="topbar-link" active-class="topbar-link-active">{{ t('nav.dashboard') }}</RouterLink>
        <RouterLink to="/metrics" class="topbar-link" active-class="topbar-link-active">{{ t('nav.metrics') }}</RouterLink>

        <!-- Catalog dropdown: Data Sources, Departments, Storage, Gaps -->
        <div class="relative">
          <button
            type="button"
            @click.stop="catalogOpen = !catalogOpen"
            :class="['topbar-link topbar-link-dropdown', (catalogOpen || isCatalogActive) && 'topbar-link-active']"
          >
            {{ t('nav.catalog') }}
            <svg class="w-4 h-4 transition-transform" :class="catalogOpen && 'rotate-180'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-if="catalogOpen" class="topbar-dropdown topbar-dropdown-left">
            <RouterLink to="/sources" @click="catalogOpen = false" class="topbar-dropdown-item">{{ t('nav.dataSources') }}</RouterLink>
            <RouterLink to="/departments" @click="catalogOpen = false" class="topbar-dropdown-item">{{ t('nav.departments') }}</RouterLink>
            <RouterLink to="/storage" @click="catalogOpen = false" class="topbar-dropdown-item">{{ t('nav.storage') }}</RouterLink>
            <RouterLink to="/gaps" @click="catalogOpen = false" class="topbar-dropdown-item">{{ t('nav.gaps') }}</RouterLink>
          </div>
        </div>

        <RouterLink v-if="authStore.isAdmin" to="/admin" class="topbar-link" active-class="topbar-link-active">{{ t('nav.adminPanel') }}</RouterLink>
        <RouterLink v-if="authStore.isAdmin" to="/audit-log" class="topbar-link" active-class="topbar-link-active">{{ t('nav.audit') }}</RouterLink>
        <RouterLink v-if="authStore.isEditor" to="/import" class="topbar-link" active-class="topbar-link-active">{{ t('nav.import') }}</RouterLink>

        <!-- Help dropdown (desktop) -->
        <div class="relative hidden lg:block">
          <button
            type="button"
            @click.stop="helpOpen = !helpOpen"
            :class="['topbar-link topbar-link-dropdown', (helpOpen || isHelpActive) && 'topbar-link-active']"
          >
            {{ t('nav.help') }}
            <svg class="w-4 h-4 transition-transform" :class="helpOpen && 'rotate-180'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-if="helpOpen" class="topbar-dropdown topbar-dropdown-left">
            <RouterLink to="/about" @click="helpOpen = false" class="topbar-dropdown-item">{{ t('nav.about') }}</RouterLink>
            <RouterLink to="/glossary" @click="helpOpen = false" class="topbar-dropdown-item">{{ t('nav.glossary') }}</RouterLink>
            <RouterLink to="/methodology" @click="helpOpen = false" class="topbar-dropdown-item">{{ t('nav.methodology') }}</RouterLink>
          </div>
        </div>
      </nav>

      <!-- Mobile menu button (outside nav so it's visible when nav is hidden on small screens) -->
      <button type="button" @click.stop="mobileOpen = !mobileOpen" class="lg:hidden topbar-icon-btn p-2 ml-2" aria-label="Menu">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path v-if="!mobileOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Right: Lang, Notifications, User -->
      <div class="topbar-right">
        <!-- Language switcher -->
        <div class="relative">
          <button
            type="button"
            @click.stop="langOpen = !langOpen"
            class="topbar-icon-btn"
            :title="t('lang.' + locale)"
          >
            <span class="topbar-lang-label">{{ langShort }}</span>
            <svg class="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-if="langOpen" class="topbar-dropdown topbar-dropdown-right">
            <button v-for="l in locales" :key="l.code" @click="setLocale(l.code)" :class="['topbar-dropdown-item w-full text-left', locale === l.code && 'bg-surface-50 font-medium']">
              {{ l.label }}
            </button>
          </div>
        </div>

        <!-- User menu -->
        <div class="relative">
          <button type="button" @click.stop="userOpen = !userOpen" class="topbar-user-btn">
            <div class="topbar-user-avatar">
              {{ userInitial }}
            </div>
            <div class="topbar-user-info">
              <span class="topbar-user-name">{{ authStore.user?.name }}</span>
              <span class="topbar-user-role">{{ roleLabel }}</span>
            </div>
            <svg class="w-4 h-4 text-surface-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-if="userOpen" class="topbar-dropdown topbar-dropdown-right topbar-dropdown-user">
            <div class="px-4 py-3 border-b border-surface-100">
              <p class="text-sm font-medium text-surface-900">{{ authStore.user?.name }}</p>
              <p class="text-xs text-surface-500">{{ authStore.user?.email }}</p>
            </div>
            <button @click="handleLogout" class="topbar-dropdown-item w-full text-left text-red-600 hover:bg-red-50">
              {{ t('nav.logout') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile nav overlay + menu (outside nav so visible when nav is hidden) -->
    <template v-if="mobileOpen">
      <div class="lg:hidden fixed inset-0 top-14 bg-black/20 z-30" @click="mobileOpen = false" aria-hidden="true" />
      <div class="lg:hidden absolute left-0 right-0 top-full py-2 bg-white border-b border-surface-200 shadow-soft-lg z-40 max-h-[70vh] overflow-y-auto">
        <RouterLink to="/" @click="mobileOpen = false" class="topbar-dropdown-item block">{{ t('nav.dashboard') }}</RouterLink>
        <RouterLink to="/metrics" @click="mobileOpen = false" class="topbar-dropdown-item block">{{ t('nav.metrics') }}</RouterLink>
        <RouterLink to="/sources" @click="mobileOpen = false" class="topbar-dropdown-item block">{{ t('nav.dataSources') }}</RouterLink>
        <RouterLink to="/departments" @click="mobileOpen = false" class="topbar-dropdown-item block">{{ t('nav.departments') }}</RouterLink>
        <RouterLink to="/storage" @click="mobileOpen = false" class="topbar-dropdown-item block">{{ t('nav.storage') }}</RouterLink>
        <RouterLink to="/gaps" @click="mobileOpen = false" class="topbar-dropdown-item block">{{ t('nav.gaps') }}</RouterLink>
        <RouterLink v-if="authStore.isAdmin" to="/audit-log" @click="mobileOpen = false" class="topbar-dropdown-item block">{{ t('nav.audit') }}</RouterLink>
        <RouterLink v-if="authStore.isEditor" to="/import" @click="mobileOpen = false" class="topbar-dropdown-item block">{{ t('nav.import') }}</RouterLink>
        <RouterLink to="/about" @click="mobileOpen = false" class="topbar-dropdown-item block">{{ t('nav.about') }}</RouterLink>
        <RouterLink to="/glossary" @click="mobileOpen = false" class="topbar-dropdown-item block">{{ t('nav.glossary') }}</RouterLink>
        <RouterLink to="/methodology" @click="mobileOpen = false" class="topbar-dropdown-item block">{{ t('nav.methodology') }}</RouterLink>
      </div>
    </template>
  </header>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/authStore'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const topbarRef = ref(null)
const searchQuery = ref('')
const mobileOpen = ref(false)
const catalogOpen = ref(false)
const helpOpen = ref(false)
const langOpen = ref(false)
const userOpen = ref(false)

const locales = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
  { code: 'kk', label: 'Қазақша' },
]

const langShort = computed(() => (locale.value === 'en' ? 'EN' : locale.value === 'ru' ? 'RU' : 'KZ'))

const isCatalogActive = computed(() => ['DataSources', 'Departments', 'StorageLocations', 'Gaps'].includes(route.name))
const isHelpActive = computed(() => ['About', 'Glossary', 'Methodology'].includes(route.name))

const roleLabel = computed(() => {
  const role = authStore.user?.role || 'viewer'
  return t('nav.role' + role.charAt(0).toUpperCase() + role.slice(1))
})

const userInitial = computed(() => {
  const name = authStore.user?.name || '?'
  return name.charAt(0).toUpperCase()
})

function setLocale(code) {
  locale.value = code
  localStorage.setItem('esg-locale', code)
  document.documentElement.lang = code === 'kk' ? 'kk' : code
  langOpen.value = false
}

function onSearch() {
  const q = searchQuery.value?.trim()
  if (q) router.push({ path: '/metrics', query: { search: q } })
  else router.push('/metrics')
  searchQuery.value = ''
}

function handleLogout() {
  userOpen.value = false
  authStore.logout()
  router.push('/login')
}

watch(route.name, () => {
  helpOpen.value = false
})

function closeAllDropdowns() {
  mobileOpen.value = false
  catalogOpen.value = false
  helpOpen.value = false
  langOpen.value = false
  userOpen.value = false
}

function onDocumentClick(e) {
  nextTick(() => {
    if (!topbarRef.value) return
    if (topbarRef.value.contains(e.target)) return
    closeAllDropdowns()
  })
}

onMounted(() => {
  document.documentElement.lang = locale.value === 'kk' ? 'kk' : locale.value
  document.addEventListener('click', onDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
})

</script>

<style scoped>
.topbar {
  @apply relative h-14 bg-white border-b border-surface-100 shadow-soft sticky top-0 z-40;
}

.topbar-inner {
  @apply h-full w-full max-w-[90%] mx-auto px-4 flex items-center gap-6;
}

.topbar-logo {
  @apply flex items-center gap-2.5 shrink-0 no-underline text-surface-900 hover:opacity-90 transition-opacity;
}

.topbar-logo-icon {
  @apply w-9 h-9 rounded-lg bg-primary-600 text-white font-semibold text-lg flex items-center justify-center shadow-soft;
}

.topbar-logo-text {
  @apply font-semibold text-lg text-surface-900 hidden sm:inline;
}

.topbar-search-wrap {
  @apply relative flex-1 max-w-md hidden md:flex items-center;
}

.topbar-search-icon {
  @apply absolute left-3 w-4 h-4 text-surface-400 pointer-events-none;
}

.topbar-search-form {
  @apply w-full;
}

.topbar-search-input {
  @apply w-full h-9 pl-9 pr-4 rounded-lg border border-surface-200 bg-surface-50 text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all;
}

.topbar-nav {
  @apply hidden lg:flex items-center gap-0.5 shrink-0;
}

.topbar-link {
  @apply flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-surface-600 hover:text-surface-900 hover:bg-surface-100 transition-colors duration-150;
}

.topbar-link-dropdown {
  @apply gap-1;
}

.topbar-link-active {
  @apply text-primary-600 bg-primary-50 hover:bg-primary-50 hover:text-primary-700;
}

.topbar-right {
  @apply flex items-center gap-1 ml-auto shrink-0;
}

.topbar-icon-btn {
  @apply flex items-center gap-1.5 h-9 px-2.5 rounded-lg text-surface-600 hover:bg-surface-100 hover:text-surface-900 transition-colors duration-150;
}

.topbar-lang-label {
  @apply text-xs font-medium text-surface-600 uppercase tracking-wide;
}

.topbar-user-btn {
  @apply flex items-center gap-2.5 h-9 pl-2 pr-2.5 rounded-lg hover:bg-surface-100 transition-colors duration-150;
}

.topbar-user-avatar {
  @apply w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm flex items-center justify-center shrink-0;
}

.topbar-user-info {
  @apply hidden sm:block text-left;
}

.topbar-user-name {
  @apply block text-sm font-medium text-surface-900 truncate max-w-[120px];
}

.topbar-user-role {
  @apply block text-xs text-surface-500;
}

.topbar-dropdown {
  @apply absolute py-1 min-w-[160px] bg-white rounded-xl border border-surface-200 shadow-soft-lg mt-1.5 z-50;
}

.topbar-dropdown-left {
  @apply left-0;
}

.topbar-dropdown-right {
  @apply right-0;
}

.topbar-dropdown-user {
  min-width: 220px;
}

.topbar-dropdown-item {
  @apply block px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50 transition-colors rounded-lg mx-1;
}
</style>
