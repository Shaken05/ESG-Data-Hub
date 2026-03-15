<template>
  <div class="space-y-6">
    <!-- Permission Check -->
    <div v-if="!authStore.isEditor" class="card bg-red-50 border border-red-200">
      <p class="text-red-800 font-semibold">
        🔒 {{ t('import.accessDenied') }}
      </p>
      <p class="text-red-600 text-sm mt-2">{{ t('import.yourRole') }} <strong>{{ authStore.user?.role }}</strong></p>
    </div>

    <template v-else>
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-gray-900">{{ t('import.importTitle') }}</h1>
      </div>

      <!-- Instructions Card -->
      <div class="card bg-blue-50 border border-blue-200">
        <h2 class="text-lg font-semibold text-blue-900 mb-2">📋 {{ t('import.howToImport') }}</h2>
        <ol class="list-decimal list-inside space-y-2 text-sm text-blue-800">
          <li>{{ t('import.step1') }}</li>
          <li>{{ t('import.step2') }}</li>
          <li>{{ t('import.step3') }}</li>
          <li>{{ t('import.step4') }}</li>
          <li>{{ t('import.step5') }}</li>
        </ol>
      </div>

      <!-- Import Form -->
      <div class="card">
        <h2 class="text-xl font-semibold mb-4">{{ t('import.formTitle') }}</h2>
        
        <div class="space-y-4">
          <!-- Data Type Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('import.whatToImport') }}
            </label>
            <div class="flex gap-4">
              <label class="flex items-center">
                <input 
                  type="radio" 
                  v-model="importType" 
                  value="metrics" 
                  class="mr-2"
                />
                <span>📊 {{ t('import.metricsOption') }}</span>
              </label>
              <label class="flex items-center">
                <input 
                  type="radio" 
                  v-model="importType" 
                  value="sources" 
                  class="mr-2"
                />
                <span>📁 {{ t('import.sourcesOption') }}</span>
              </label>
            </div>
          </div>

          <!-- Google Sheets URL Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('import.sheetsUrl') }}
            </label>
            <input
              v-model="sheetsUrl"
              type="url"
              :placeholder="t('import.sheetsUrlPlaceholder')"
              class="input w-full"
            />
            <p class="text-xs text-gray-500 mt-1">
              {{ t('import.sheetsNote') }}
            </p>
          </div>

          <!-- Import Button -->
          <div class="flex gap-3">
            <button
              @click="handleImport"
              :disabled="!sheetsUrl || !importType || loading"
              class="btn-primary"
            >
              {{ loading ? t('import.importing') : '📥 ' + t('import.importButton') }}
            </button>
            <button
              @click="showTemplate"
              class="btn-secondary"
            >
              📋 {{ t('import.viewTemplate') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Template Info -->
      <div v-if="templateVisible" class="card bg-gray-50">
        <h3 class="text-lg font-semibold mb-3">{{ t('import.templateFormat') }}</h3>
        
        <div v-if="importType === 'metrics'">
          <p class="text-sm text-gray-600 mb-2">Your Google Sheet should have these columns:</p>
          <div class="bg-white p-3 rounded border font-mono text-sm">
            name | description | category | unit | standard | status
          </div>
          <div class="mt-3 text-sm">
            <p class="font-medium">Valid values:</p>
            <ul class="list-disc list-inside ml-2 text-gray-600">
              <li><strong>category:</strong> E (Environmental), S (Social), G (Governance)</li>
              <li><strong>standard:</strong> GRI, STARS, SDG (optional)</li>
              <li><strong>status:</strong> COLLECTED, PARTIAL, PLANNED</li>
            </ul>
          </div>
        </div>

        <div v-if="importType === 'sources'">
          <p class="text-sm text-gray-600 mb-2">Your Google Sheet should have these columns:</p>
          <div class="bg-white p-3 rounded border font-mono text-sm">
            name | type | format | update_frequency
          </div>
          <div class="mt-3 text-sm">
            <p class="font-medium">Valid values:</p>
            <ul class="list-disc list-inside ml-2 text-gray-600">
              <li><strong>type:</strong> EXCEL, API, SURVEY, ERP</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Results -->
      <div v-if="importResult" class="card" :class="importResult.success ? 'bg-green-50' : 'bg-red-50'">
        <h3 class="text-lg font-semibold mb-2" :class="importResult.success ? 'text-green-900' : 'text-red-900'">
          {{ importResult.success ? '✅ ' + t('import.importSuccess') : '❌ ' + t('import.importFailed') }}
        </h3>
        <div class="text-sm" :class="importResult.success ? 'text-green-800' : 'text-red-800'">
          <p v-if="importResult.imported">{{ t('import.importedCount', { count: importResult.imported }) }}</p>
          <p v-if="importResult.errors > 0" class="text-orange-600">
            {{ t('import.failedCount', { count: importResult.errors }) }}
          </p>
          <div v-if="importResult.errorDetails && importResult.errorDetails.length > 0" class="mt-3">
            <p class="font-medium">Errors:</p>
            <ul class="list-disc list-inside ml-2">
              <li v-for="(error, index) in importResult.errorDetails" :key="index">
                {{ error.error }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="card bg-red-50 border border-red-200">
        <p class="text-red-800">{{ errorMessage }}</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const { t } = useI18n();
const authStore = useAuthStore();
const API_URL = 'http://localhost:3000/api';

const importType = ref('metrics');
const sheetsUrl = ref('');
const loading = ref(false);
const templateVisible = ref(false);
const importResult = ref(null);
const errorMessage = ref('');

const handleImport = async () => {
  if (!sheetsUrl.value || !importType.value) return;
  
  loading.value = true;
  errorMessage.value = '';
  importResult.value = null;
  
  try {
    const response = await axios.post(
      `${API_URL}/import/${importType.value}`,
      { url: sheetsUrl.value },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    );
    
    importResult.value = response.data;
    
    if (response.data.success) {
      setTimeout(() => {
        window.location.href = '/metrics';
      }, 2000);
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to import data';
  } finally {
    loading.value = false;
  }
};

const showTemplate = () => {
  templateVisible.value = !templateVisible.value;
};
</script>
