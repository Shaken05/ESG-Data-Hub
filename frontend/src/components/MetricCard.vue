<template>
  <div class="card hover:shadow-lg transition-shadow cursor-pointer" @click="$emit('click')">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <div class="flex items-center space-x-2 mb-2">
          <span :class="`badge badge-${metric.category.toLowerCase()}`">
            {{ metric.category }}
          </span>
          <span :class="`badge badge-${metric.status.toLowerCase()}`">
            {{ metric.status }}
          </span>
        </div>
        
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          {{ metric.name }}
        </h3>
        
        <p v-if="metric.description" class="text-gray-600 text-sm mb-4 line-clamp-2">
          {{ metric.description }}
        </p>
        
        <div class="flex flex-wrap gap-4 text-sm text-gray-500">
          <div v-if="metric.unit" class="flex items-center">
            <span class="font-medium">Unit:</span>
            <span class="ml-1">{{ metric.unit }}</span>
          </div>
          <div v-if="metric.standard" class="flex items-center">
            <span class="font-medium">Standard:</span>
            <span class="ml-1">{{ metric.standard }}</span>
          </div>
        </div>
        
        <!-- Metric Links Info -->
        <div v-if="metric.metricLinks && metric.metricLinks.length > 0" class="mt-4 pt-4 border-t border-gray-200">
          <div class="flex flex-wrap gap-3 text-sm">
            <div v-if="metric.metricLinks[0].department" class="flex items-center text-gray-600">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
              {{ metric.metricLinks[0].department.name }}
            </div>
            <div v-if="metric.metricLinks[0].source" class="flex items-center text-gray-600">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              {{ metric.metricLinks[0].source.type }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  metric: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
