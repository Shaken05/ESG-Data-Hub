<template>
  <div class="space-y-6 max-w-4xl">
    <h1 class="text-3xl font-bold text-gray-900">{{ t('about.title') }}</h1>

    <div class="card">
      <h2 class="text-xl font-semibold text-gray-900 mb-3">{{ t('about.purpose') }}</h2>
      <p class="text-gray-700 leading-relaxed">
        {{ t('about.purposeText') }}
      </p>
      <p class="text-gray-700 leading-relaxed mt-3">
        {{ t('about.purposeText2') }}
      </p>
    </div>

    <div class="card">
      <h2 class="text-xl font-semibold text-gray-900 mb-3">{{ t('about.features') }}</h2>
      <ul class="list-disc list-inside text-gray-700 space-y-2">
        <li>{{ t('about.feature1') }}</li>
        <li>{{ t('about.feature2') }}</li>
        <li>{{ t('about.feature3') }}</li>
        <li>{{ t('about.feature4') }}</li>
        <li>{{ t('about.feature5') }}</li>
      </ul>
    </div>

    <div class="card">
      <h2 class="text-xl font-semibold text-gray-900 mb-3">{{ t('about.contacts') }}</h2>
      <p class="text-gray-700 mb-2">
        {{ t('about.contactsText') }}
      </p>
      <p class="text-sm text-gray-500">
        {{ t('about.contactsNote') }}
      </p>
    </div>

    <div class="card bg-gray-50 border border-gray-200">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p class="text-sm font-medium text-gray-700">{{ t('about.version') }}</p>
          <p class="text-2xl font-bold text-gray-900">{{ version }}</p>
        </div>
        <p class="text-sm text-gray-500">{{ t('about.appName') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const version = '1.0.0'
</script>
