# ESG Data Inventory - Frontend

Vue 3 frontend application for ESG Data Inventory System.

## Features

- 📊 Dashboard with statistics
- 🔍 Searchable metrics catalog with filters
- 📝 Detailed metric views
- 🗂️ Data sources management
- 🏢 Departments management
- 💾 Storage locations management
- ✨ Responsive UI with TailwindCSS

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **Vite** - Next generation frontend tooling
- **Vue Router** - Official router for Vue.js
- **Pinia** - State management
- **Axios** - HTTP client
- **TailwindCSS** - Utility-first CSS framework

## Prerequisites

- Node.js 18+
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The application will be available at http://localhost:5173

## Docker

The frontend can also be started via Docker together with the backend:

```bash
# From project root
docker-compose up --build
```

This will:
- build frontend image from `frontend/Dockerfile`
- start Vite dev server inside container on port 5173
- expose it at http://localhost:5173

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── assets/          # CSS and static assets
├── components/      # Reusable Vue components
│   ├── Navigation.vue
│   ├── MetricCard.vue
│   └── Filters.vue
├── views/          # Page components
│   ├── Dashboard.vue
│   ├── MetricsList.vue
│   ├── MetricDetails.vue
│   ├── DataSources.vue
│   ├── Departments.vue
│   └── StorageLocations.vue
├── stores/         # Pinia stores
│   └── metricsStore.js
├── services/       # API services
│   └── api.js
├── router/         # Vue Router configuration
│   └── index.js
├── App.vue         # Root component
└── main.js         # Application entry point
```

## Available Routes

- `/` - Dashboard
- `/metrics` - Metrics list with filters
- `/metrics/:id` - Metric details
- `/sources` - Data sources
- `/departments` - Departments
- `/storage` - Storage locations

## Configuration

The frontend is configured to proxy API requests to `http://localhost:3000` during development. This is set in `vite.config.js`.

To change the backend URL:
```js
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://your-backend-url',
      changeOrigin: true
    }
  }
}
```

## Development

### Adding a new page

1. Create component in `src/views/`
2. Add route in `src/router/index.js`
3. Add navigation link in `src/components/Navigation.vue`

### Adding a new API service

Add new API methods in `src/services/api.js`:
```js
export const myAPI = {
  getAll: () => api.get('/my-endpoint'),
  create: (data) => api.post('/my-endpoint', data)
}
```

### Using Pinia store

```js
import { useMetricsStore } from '@/stores/metricsStore'

const metricsStore = useMetricsStore()
await metricsStore.fetchMetrics()
```
