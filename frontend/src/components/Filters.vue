<template>
  <div class="card">
    <h3 class="text-lg font-semibold mb-4">{{ t('filters.title') }}</h3>
    
    <!-- Search -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('filters.search') }}</label>
      <input 
        type="text"
        v-model="localFilters.search"
        :placeholder="t('filters.searchPlaceholder')"
        class="input-field"
        @input="emitFilters"
      />
    </div>
    
    <!-- Category Filter -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('common.category') }}</label>
      <select 
        v-model="localFilters.category"
        class="input-field"
        @change="emitFilters"
      >
        <option value="">{{ t('common.allCategories') }}</option>
        <option value="E">{{ t('common.environmental') }}</option>
        <option value="S">{{ t('common.social') }}</option>
        <option value="G">{{ t('common.governance') }}</option>
      </select>
    </div>
    
    <!-- Status Filter -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('common.status') }}</label>
      <select 
        v-model="localFilters.status"
        class="input-field"
        @change="emitFilters"
      >
        <option value="">{{ t('common.allStatuses') }}</option>
        <option value="COLLECTED">{{ t('common.collected') }}</option>
        <option value="PARTIAL">{{ t('common.partial') }}</option>
        <option value="PLANNED">{{ t('common.planned') }}</option>
      </select>
    </div>
    
    <!-- Clear Filters Button -->
    <button 
      @click="clearAllFilters"
      class="btn-secondary w-full"
    >
      {{ t('filters.clearFilters') }}
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  filters: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:filters', 'clear'])

const localFilters = ref({ ...props.filters })

watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })

function emitFilters() {
  emit('update:filters', { ...localFilters.value })
}

function clearAllFilters() {
  localFilters.value = {
    category: '',
    status: '',
    search: ''
  }
  emit('clear')
}
</script>
