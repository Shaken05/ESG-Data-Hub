<template>
  <div class="card">
    <h3 class="text-lg font-semibold mb-4">Filters</h3>
    
    <!-- Search -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
      <input 
        type="text"
        v-model="localFilters.search"
        placeholder="Search metrics..."
        class="input-field"
        @input="emitFilters"
      />
    </div>
    
    <!-- Category Filter -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
      <select 
        v-model="localFilters.category"
        class="input-field"
        @change="emitFilters"
      >
        <option value="">All Categories</option>
        <option value="E">Environmental (E)</option>
        <option value="S">Social (S)</option>
        <option value="G">Governance (G)</option>
      </select>
    </div>
    
    <!-- Status Filter -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
      <select 
        v-model="localFilters.status"
        class="input-field"
        @change="emitFilters"
      >
        <option value="">All Statuses</option>
        <option value="COLLECTED">Collected</option>
        <option value="PARTIAL">Partial</option>
        <option value="PLANNED">Planned</option>
      </select>
    </div>
    
    <!-- Clear Filters Button -->
    <button 
      @click="clearAllFilters"
      class="btn-secondary w-full"
    >
      Clear Filters
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

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
