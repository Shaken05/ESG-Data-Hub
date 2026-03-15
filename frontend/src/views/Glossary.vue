<template>
  <div class="space-y-6 max-w-4xl">
    <h1 class="text-3xl font-bold text-gray-900">{{ t('glossary.title') }}</h1>
    <p class="text-gray-600">
      {{ t('glossary.intro') }}
    </p>

    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span class="w-8 h-8 rounded bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">E</span>
        {{ t('glossary.env') }}
      </h2>
      <p class="text-gray-700">{{ t('glossary.envDesc') }}</p>
    </div>

    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span class="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">S</span>
        {{ t('glossary.social') }}
      </h2>
      <p class="text-gray-700">{{ t('glossary.socialDesc') }}</p>
    </div>

    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span class="w-8 h-8 rounded bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold">G</span>
        {{ t('glossary.gov') }}
      </h2>
      <p class="text-gray-700">{{ t('glossary.govDesc') }}</p>
    </div>

    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900 mb-2">{{ t('glossary.scope') }}</h2>
      <ul class="text-gray-700 space-y-2 list-none">
        <li>{{ t('glossary.scope1') }}</li>
        <li>{{ t('glossary.scope2') }}</li>
        <li>{{ t('glossary.scope3') }}</li>
      </ul>
    </div>

    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900 mb-2">{{ t('glossary.gri') }}</h2>
      <p class="text-gray-700">{{ t('glossary.griDesc') }}</p>
    </div>

    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900 mb-2">{{ t('glossary.stars') }}</h2>
      <p class="text-gray-700">{{ t('glossary.starsDesc') }}</p>
    </div>

    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900 mb-2">{{ t('glossary.sdg') }}</h2>
      <p class="text-gray-700">{{ t('glossary.sdgDesc') }}</p>
    </div>

    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900 mb-2">{{ t('glossary.dataOwner') }}</h2>
      <p class="text-gray-700">{{ t('glossary.dataOwnerDesc') }}</p>
    </div>

    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900 mb-2">{{ t('glossary.dataSteward') }}</h2>
      <p class="text-gray-700">{{ t('glossary.dataStewardDesc') }}</p>
    </div>

    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900 mb-2">{{ t('glossary.metric') }}</h2>
      <p class="text-gray-700">{{ t('glossary.metricDesc') }}</p>
    </div>

    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900 mb-2">{{ t('glossary.dataSource') }}</h2>
      <p class="text-gray-700">{{ t('glossary.dataSourceDesc') }}</p>
    </div>

    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900 mb-2">{{ t('glossary.quality') }}</h2>
      <p class="text-gray-700">{{ t('glossary.qualityDesc') }}</p>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
