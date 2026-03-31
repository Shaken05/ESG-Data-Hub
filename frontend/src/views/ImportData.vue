<template>
  <div class="space-y-6">
    <!-- Permission Check -->
    <div v-if="!authStore.isEditor" class="card bg-red-50 border border-red-200">
      <p class="text-red-800 font-semibold">
        🔒 Access Denied: Only Editors and Administrators can import data.
      </p>
      <p class="text-red-600 text-sm mt-2">Your current role: <strong>{{ authStore.user?.role }}</strong></p>
    </div>

    <template v-else>
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-gray-900">Import ESG Metrics</h1>
      </div>

      <!-- Tabs Navigation -->
      <div class="card">
        <div class="flex border-b border-gray-200 overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="px-6 py-3 font-medium border-b-2 transition whitespace-nowrap"
            :class="activeTab === tab.id 
              ? 'border-primary-600 text-primary-600' 
              : 'border-transparent text-gray-600 hover:text-gray-900'"
          >
            {{ tab.icon }} {{ tab.title }}
          </button>
        </div>
      </div>

      <!-- TAB 1: Google Sheets Import -->
      <div v-show="activeTab === 'sheets'" class="space-y-4">
        <div class="card bg-primary-50 border border-primary-200">
          <h2 class="text-lg font-semibold text-primary-900 mb-2">📋 How to Import from Google Sheets</h2>
          <ol class="list-decimal list-inside space-y-2 text-sm text-primary-800">
            <li>Open your Google Sheet with ESG data</li>
            <li>Click <strong>File → Share → Publish to web</strong></li>
            <li>Choose "Link" and "Entire Document" or specific sheet</li>
            <li>Copy the URL and paste it below</li>
            <li>Click Import</li>
          </ol>
        </div>

        <div class="card">
          <h2 class="text-xl font-semibold mb-4">📊 Google Sheets URL</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Google Sheets URL
              </label>
              <input
                v-model="sheetsUrl"
                type="url"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                class="input-field"
              />
            </div>

            <button
              @click="handleImport('sheets')"
              :disabled="!sheetsUrl || loading"
              class="btn-primary disabled:opacity-50"
            >
              {{ loading === 'sheets' ? 'Importing...' : '📥 Import from Google Sheets' }}
            </button>
          </div>
        </div>
      </div>

      <!-- TAB 2: CSV File Upload -->
      <div v-show="activeTab === 'csv'" class="space-y-4">
        <div class="card">
          <h2 class="text-xl font-semibold mb-4">📄 Upload CSV File</h2>
          <div class="space-y-4">
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition cursor-pointer"
              @click="$refs.csvInput.click()">
              <p class="text-2xl">📁</p>
              <p class="text-gray-700 font-medium">Click to upload CSV file or drag and drop</p>
              <p class="text-gray-500 text-sm">Maximum 10MB</p>
              <input
                ref="csvInput"
                @change="handleFileSelect"
                type="file"
                accept=".csv"
                class="hidden"
              />
            </div>

            <div v-if="selectedFile" class="flex items-center gap-3 p-3 bg-green-50 rounded border border-green-200">
              <span class="text-2xl">✅</span>
              <div class="flex-1">
                <p class="font-medium text-green-900">{{ selectedFile.name }}</p>
                <p class="text-sm text-green-700">{{ formatFileSize(selectedFile.size) }}</p>
              </div>
              <button
                @click="selectedFile = null; csvSingleMetric.value = false; $refs.csvInput.value = ''"
                class="text-red-600 hover:text-red-900"
              >
                ✕
              </button>
            </div>

            <label class="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" v-model="csvSingleMetric" class="checkbox" />
              <span>Create one metric from entire file (single metric mode)</span>
            </label>

            <button
              @click="handleImport('csv')"
              :disabled="!selectedFile || loading"
              class="btn-primary w-full disabled:opacity-50"
            >
              {{ loading === 'csv' ? 'Uploading...' : '📤 Upload CSV' }}
            </button>
          </div>
        </div>
      </div>

      <!-- TAB 3: Add Single Metric -->
      <div v-show="activeTab === 'single'" class="space-y-4">
        <div class="card">
          <h2 class="text-xl font-semibold mb-4">➕ Add Single Metric</h2>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Metric Name *
                </label>
                <input
                  v-model="singleMetric.name"
                  type="text"
                  placeholder="e.g., Energy Consumption"
                  class="input-field"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select v-model="singleMetric.category" class="input-field">
                  <option value="E">E - Environmental</option>
                  <option value="S">S - Social</option>
                  <option value="G">G - Governance</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                v-model="singleMetric.description"
                placeholder="Brief description of this metric"
                rows="3"
                class="input-field"
              ></textarea>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory
                </label>
                <input
                  v-model="singleMetric.subcategory"
                  type="text"
                  placeholder="e.g., Energy"
                  class="input-field"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </label>
                <input
                  v-model="singleMetric.unit"
                  type="text"
                  placeholder="e.g., kWh"
                  class="input-field"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select v-model="singleMetric.status" class="input-field">
                  <option value="COLLECTED">✅ Collected</option>
                  <option value="PARTIAL">⚠️ Partial</option>
                  <option value="PLANNED">📋 Planned</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Definition
              </label>
              <textarea
                v-model="singleMetric.definition"
                placeholder="Detailed definition of the metric"
                rows="2"
                class="input-field"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Standards (comma-separated)
              </label>
              <input
                v-model="singleMetric.standards"
                type="text"
                placeholder="e.g., GRI, SASB, TCFD"
                class="input-field"
              />
              <p class="text-xs text-gray-500 mt-1">Available: GRI, SASB, TCFD, SDG, STARS</p>
            </div>

            <button
              @click="handleImport('single')"
              :disabled="!singleMetric.name || loading"
              class="btn-primary w-full disabled:opacity-50"
            >
              {{ loading === 'single' ? 'Adding...' : '➕ Add Metric' }}
            </button>
          </div>
        </div>
      </div>

      <!-- TAB 4: Batch JSON Upload -->
      <div v-show="activeTab === 'json'" class="space-y-4">
        <div class="card bg-purple-50 border border-purple-200">
          <h2 class="text-lg font-semibold text-purple-900 mb-2">📝 JSON Format</h2>
          <pre class="bg-white p-3 rounded text-xs overflow-x-auto"><code>
[
  {
    "name": "Energy Consumption",
    "description": "Total electricity usage",
    "category": "E",
    "subcategory": "Energy",
    "unit": "kWh",
    "status": "COLLECTED",
    "standards": "GRI,SASB"
  },
  {
    "name": "Water Usage",
    "category": "E",
    "unit": "m³",
    "status": "PARTIAL"
  }
]
          </code></pre>
        </div>

        <div class="card">
          <h2 class="text-xl font-semibold mb-4">📋 Paste JSON Array</h2>
          <div class="space-y-4">
            <div>
              <textarea
                v-model="jsonInput"
                placeholder="Paste your JSON array here..."
                rows="10"
                class="input-field font-mono"
              ></textarea>
            </div>

            <button
              @click="handleImport('json')"
              :disabled="!jsonInput.trim() || loading"
              class="btn-primary w-full disabled:opacity-50"
            >
              {{ loading === 'json' ? 'Importing...' : '📤 Import JSON' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Results -->
      <div v-if="importResult" class="card" :class="importResult.success ? 'bg-green-50' : 'bg-red-50'">
        <h3 class="text-lg font-semibold mb-2" :class="importResult.success ? 'text-green-900' : 'text-red-900'">
          {{ importResult.success ? '✅ Import Successful' : '❌ Import Failed' }}
        </h3>
        <div class="text-sm" :class="importResult.success ? 'text-green-800' : 'text-red-800'">
          <p v-if="importResult.imported">Imported {{ importResult.imported }} items successfully</p>
          <p v-if="importResult.errors > 0" class="text-orange-600">
            {{ importResult.errors }} items failed to import
          </p>
          <div v-if="importResult.errorDetails && importResult.errorDetails.length > 0" class="mt-3">
            <p class="font-medium">Errors:</p>
            <ul class="list-disc list-inside ml-2">
              <li v-for="(error, index) in importResult.errorDetails.slice(0, 5)" :key="index">
                {{ error.error }}
              </li>
              <li v-if="importResult.errorDetails.length > 5" class="font-medium">
                ... and {{ importResult.errorDetails.length - 5 }} more errors
              </li>
            </ul>
          </div>
          <button
            @click="goToMetrics"
            class="btn-primary mt-4 disabled:opacity-50"
          >
            ✅ View Metrics
          </button>
        </div>
      </div>

      <!-- Import Batch History -->
      <div class="card mt-6">
        <h3 class="text-lg font-semibold mb-3">📦 Recent Import Batches</h3>

        <template v-if="batchesLoading">
          <p>Loading batch history...</p>
        </template>

        <template v-else-if="batchesError">
          <p class="text-red-700">Error loading batches: {{ batchesError }}</p>
        </template>

        <template v-else-if="importBatches.length === 0">
          <p class="text-gray-600">No import batches yet. Start importing data above.</p>
        </template>

        <template v-else>
          <ul class="space-y-2">
            <li v-for="batch in importBatches.slice(0,5)" :key="batch.id" class="p-2 bg-gray-50 border rounded">
              <p class="font-medium">Batch #{{ batch.id }} — {{ batch.source }} — {{ batch.status }}</p>
              <p class="text-sm text-gray-600">Rows: {{ batch.rowCount }} | Uploaded by: {{ batch.user?.email || 'unknown' }} | {{ new Date(batch.createdAt).toLocaleString() }}</p>
              <p class="text-xs text-gray-500">Metrics in batch: {{ batch.metrics.length }}</p>
            </li>
          </ul>
        </template>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="card bg-red-50 border border-red-200">
        <p class="text-red-800">{{ errorMessage }}</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { importAPI } from '../services/api';

const authStore = useAuthStore();
const API_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:3000/api' : '');
if (!import.meta.env.VITE_API_BASE_URL && import.meta.env.PROD) {
  throw new Error('[ESG] VITE_API_BASE_URL is required in production. Set the variable in Netlify/Render environment and redeploy.');
}

const tabs = [
  { id: 'sheets', title: 'Google Sheets', icon: '📊' },
  { id: 'csv', title: 'CSV File', icon: '📄' },
  { id: 'single', title: 'Single Metric', icon: '➕' },
  { id: 'json', title: 'JSON Batch', icon: '📝' }
];

const activeTab = ref('sheets');
const loading = ref(false);
const sheetsUrl = ref('');
const selectedFile = ref(null);
const jsonInput = ref('');
const importResult = ref(null);
const errorMessage = ref('');

const importBatches = ref([]);
const batchesLoading = ref(false);
const batchesError = ref('');

const singleMetric = ref({
  name: '',
  description: '',
  category: 'E',
  subcategory: '',
  unit: '',
  definition: '',
  standards: '',
  status: 'PLANNED'
});

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      errorMessage.value = 'File size must be less than 10MB';
      return;
    }
    selectedFile.value = file;
    errorMessage.value = '';
  }
};

const handleImport = async (type) => {
  importResult.value = null;
  errorMessage.value = '';
  loading.value = type;

  try {
    let response;

    if (type === 'sheets') {
      if (!sheetsUrl.value) {
        errorMessage.value = 'Please enter a Google Sheets URL';
        loading.value = false;
        return;
      }
      response = await axios.post(
        `${API_URL}/import/metrics`,
        { url: sheetsUrl.value },
        { headers: { Authorization: `Bearer ${authStore.token}` } }
      );
    } else if (type === 'csv') {
      if (!selectedFile.value) {
        errorMessage.value = 'Please select a CSV file';
        loading.value = false;
        return;
      }
      const formData = new FormData();
      formData.append('file', selectedFile.value);
      if (csvSingleMetric.value) {
        formData.append('single', 'true');
      }
      response = await axios.post(
        `${API_URL}/import/csv/metrics`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${authStore.token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );
    } else if (type === 'single') {
      if (!singleMetric.value.name) {
        errorMessage.value = 'Metric name is required';
        loading.value = false;
        return;
      }
      response = await axios.post(
        `${API_URL}/import/single`,
        singleMetric.value,
        { headers: { Authorization: `Bearer ${authStore.token}` } }
      );
    } else if (type === 'json') {
      if (!jsonInput.value.trim()) {
        errorMessage.value = 'Please paste a JSON array';
        loading.value = false;
        return;
      }
      try {
        const metrics = JSON.parse(jsonInput.value);
        if (!Array.isArray(metrics)) {
          errorMessage.value = 'JSON must be an array of metrics';
          loading.value = false;
          return;
        }
        response = await axios.post(
          `${API_URL}/import/manual/metrics`,
          { metrics },
          { headers: { Authorization: `Bearer ${authStore.token}` } }
        );
      } catch (e) {
        errorMessage.value = 'Invalid JSON format: ' + e.message;
        loading.value = false;
        return;
      }
    }

    importResult.value = response.data;
    
    // Reset form if successful
    if (response.data.success) {
      if (type === 'sheets') sheetsUrl.value = '';
      if (type === 'csv') {
        selectedFile.value = null;        csvSingleMetric.value = false;        if (this.$refs?.csvInput) this.$refs.csvInput.value = '';
      }
      if (type === 'single') {
        singleMetric.value = {
          name: '', description: '', category: 'E',
          subcategory: '', unit: '', definition: '', standards: '', status: 'PLANNED'
        };
      }
      if (type === 'json') jsonInput.value = '';
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || error.response?.data?.error || error.message;
  } finally {
    loading.value = false;
  }
};

const loadImportBatches = async () => {
  batchesLoading.value = true;
  batchesError.value = '';

  try {
    const response = await importAPI.getBatches();
    importBatches.value = response.data;
  } catch (error) {
    batchesError.value = error.response?.data?.message || error.response?.data?.error || error.message;
  } finally {
    batchesLoading.value = false;
  }
};

onMounted(() => {
  loadImportBatches();
});

const goToMetrics = () => {
  window.location.href = '/metrics';
};
</script>


