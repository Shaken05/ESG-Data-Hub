<template>
  <div class="space-y-6 max-w-4xl">
    <h1 class="text-3xl font-bold text-gray-900">{{ t('methodology.title') }}</h1>
    <p class="text-gray-600">
      {{ t('methodology.intro') }}
    </p>

    <div class="card">
      <h2 class="text-xl font-semibold text-gray-900 mb-3">{{ t('methodology.sec1') }}</h2>
      <ul class="space-y-2 text-gray-700">
        <li><strong>{{ t('methodology.sec1Name') }}</strong> — {{ t('methodology.sec1NameDesc') }}</li>
        <li><strong>{{ t('methodology.sec1Desc') }}</strong> — {{ t('methodology.sec1DescDesc') }}</li>
        <li><strong>{{ t('methodology.sec1Cat') }}</strong> — {{ t('methodology.sec1CatDesc') }}</li>
        <li><strong>{{ t('methodology.sec1Unit') }}</strong> — {{ t('methodology.sec1UnitDesc') }}</li>
        <li><strong>{{ t('methodology.sec1Standard') }}</strong> — {{ t('methodology.sec1StandardDesc') }}</li>
        <li><strong>{{ t('methodology.sec1Status') }}</strong> — {{ t('methodology.sec1StatusDesc') }}</li>
      </ul>
    </div>

    <div class="card">
      <h2 class="text-xl font-semibold text-gray-900 mb-3">{{ t('methodology.sec2') }}</h2>
      <p class="text-gray-700 mb-3">{{ t('methodology.sec2Intro') }}</p>
      <ul class="space-y-2 text-gray-700">
        <li>{{ t('methodology.sec2Type') }}</li>
        <li>{{ t('methodology.sec2Format') }}</li>
        <li>{{ t('methodology.sec2Freq') }}</li>
      </ul>
      <p class="text-gray-600 text-sm mt-3">{{ t('methodology.sec2Note') }}</p>
    </div>

    <div class="card">
      <h2 class="text-xl font-semibold text-gray-900 mb-3">{{ t('methodology.sec3') }}</h2>
      <p class="text-gray-700 mb-2">{{ t('methodology.sec3Intro') }}</p>
      <ul class="space-y-2 text-gray-700">
        <li>{{ t('methodology.sec3Items') }}</li>
      </ul>
    </div>

    <div class="card border-l-4 border-primary-500">
      <h2 class="text-xl font-semibold text-gray-900 mb-3">{{ t('methodology.sec4') }}</h2>
      <p class="text-gray-700 mb-4">{{ t('methodology.sec4Intro') }}</p>
      <dl class="space-y-3 text-gray-700">
        <div>
          <dt class="font-semibold flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-green-500"></span>
            {{ t('methodology.collected') }}
          </dt>
          <dd class="ml-5 mt-1">{{ t('methodology.collectedDesc') }}</dd>
        </div>
        <div>
          <dt class="font-semibold flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
            {{ t('methodology.partial') }}
          </dt>
          <dd class="ml-5 mt-1">{{ t('methodology.partialDesc') }}</dd>
        </div>
        <div>
          <dt class="font-semibold flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-gray-500"></span>
            {{ t('methodology.planned') }}
          </dt>
          <dd class="ml-5 mt-1">{{ t('methodology.plannedDesc') }}</dd>
        </div>
      </dl>
    </div>

    <div class="card border-l-4 border-primary-500">
      <h2 class="text-xl font-semibold text-gray-900 mb-3">{{ t('methodology.sec5') }}</h2>
      <p class="text-gray-700 mb-3">{{ t('methodology.sec5Intro') }}</p>
      <ul class="space-y-2 text-gray-700 list-disc list-inside">
        <li>{{ t('methodology.sec5Completeness') }}</li>
        <li>{{ t('methodology.sec5Accuracy') }}</li>
        <li>{{ t('methodology.sec5Timeliness') }}</li>
      </ul>
      <p class="text-gray-600 text-sm mt-3">{{ t('methodology.sec5Note') }}</p>
    </div>

    <div class="card bg-gray-50">
      <h2 class="text-lg font-semibold text-gray-900 mb-2">{{ t('methodology.whoEdit') }}</h2>
      <p class="text-gray-700">{{ t('methodology.whoEditDesc') }}</p>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
