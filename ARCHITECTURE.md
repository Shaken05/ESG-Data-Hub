# 🏗️ ESG Data Inventory - Technical Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Web Browser                           │
│                    (Port 5173 - Dev)                         │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST
┌──────────────────────▼──────────────────────────────────────┐
│                   Frontend - Vue 3                           │
│  ┌─────────────┬──────────────┬───────────────────────┐    │
│  │   Views     │  Components  │      Stores          │    │
│  │             │              │      (Pinia)          │    │
│  └─────────────┴──────────────┴───────────────────────┘    │
│                    Vue Router                                │
│                    Axios (API Client)                        │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API (/api/*)
┌──────────────────────▼──────────────────────────────────────┐
│                   Backend - Node.js                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    Express.js                         │  │
│  │  ┌────────────┬─────────────┬──────────────────┐    │  │
│  │  │  Routes    │ Controllers │    Middleware    │    │  │
│  │  └────────────┴─────────────┴──────────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
│                   Prisma ORM                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │ SQL
┌──────────────────────▼──────────────────────────────────────┐
│                   PostgreSQL Database                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  metrics  │  data_sources  │  departments            │  │
│  │  storage_locations  │  metric_links                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture (Vue 3)

### Layer Structure

```
presentation/
├── src/
│   ├── views/           # Page-level components (smart components)
│   ├── components/      # Reusable UI components (dumb components)
│   ├── stores/          # Pinia state management stores
│   ├── services/        # API communication layer
│   ├── router/          # Vue Router configuration
│   └── assets/          # Static assets (CSS, images)
```

### Component Hierarchy

```
App.vue
├── Navigation.vue
└── RouterView
    ├── Dashboard.vue
    │   └── MetricCard.vue (×N)
    ├── MetricsList.vue
    │   ├── Filters.vue
    │   └── MetricCard.vue (×N)
    ├── MetricDetails.vue
    ├── DataSources.vue
    ├── Departments.vue
    └── StorageLocations.vue
```

### State Management (Pinia)

```javascript
metricsStore
├── State
│   ├── metrics: Metric[]
│   ├── currentMetric: Metric | null
│   ├── filters: FilterObject
│   ├── loading: boolean
│   └── error: string | null
├── Getters
│   └── filteredMetrics: computed
└── Actions
    ├── fetchMetrics()
    ├── fetchMetricById(id)
    ├── createMetric(data)
    ├── updateMetric(id, data)
    ├── deleteMetric(id)
    └── setFilters(filters)
```

### API Service Layer

```javascript
services/api.js
├── axios instance (baseURL: /api)
├── metricsAPI
├── sourcesAPI
├── departmentsAPI
├── storageAPI
└── metricLinksAPI
```

---

## Backend Architecture (Node.js + Express)

### Layer Structure

```
backend/
├── server.js            # Express app entry point
├── routes/              # Route definitions
│   ├── metricsRoutes.js
│   ├── sourcesRoutes.js
│   ├── departmentsRoutes.js
│   └── storageRoutes.js
├── controllers/         # Business logic
│   ├── metricsController.js
│   ├── sourcesController.js
│   ├── departmentsController.js
│   └── storageController.js
└── prisma/
    └── schema.prisma    # Database schema
```

### Request Flow

```
HTTP Request
    ↓
Express Middleware (cors, json parser)
    ↓
Route Handler (/api/metrics)
    ↓
Controller Function (getMetrics)
    ↓
Prisma Client (Database Query)
    ↓
PostgreSQL
    ↓
Response (JSON)
```

### API Endpoint Structure

```
/api
├── /metrics
│   ├── GET    /           # List all metrics (with filters)
│   ├── GET    /stats      # Get statistics
│   ├── GET    /:id        # Get single metric
│   ├── POST   /           # Create metric
│   ├── PUT    /:id        # Update metric
│   └── DELETE /:id        # Delete metric
├── /sources               # Similar CRUD operations
├── /departments           # Similar CRUD operations
├── /storage              # Similar CRUD operations
└── /metric-links         # Similar CRUD operations
```

---

## Database Schema (PostgreSQL)

### Entity-Relationship Diagram

```
┌──────────────┐         ┌─────────────────┐
│   Metric     │         │  DataSource     │
│──────────────│         │─────────────────│
│ id (PK)      │         │ id (PK)         │
│ name         │         │ name            │
│ description  │         │ type            │
│ category     │         │ format          │
│ unit         │         │ updateFrequency │
│ standard     │         └─────────────────┘
│ status       │                  │
└──────────────┘                  │
        │                         │
        │    ┌───────────────────────┐
        └───→│    MetricLink         │←────┐
             │───────────────────────│     │
             │ id (PK)               │     │
             │ metricId (FK)         │     │
             │ sourceId (FK)         │     │
             │ departmentId (FK)     │     │
             │ storageId (FK)        │     │
             │ qualityScore          │     │
             │ lastUpdate            │     │
             │ issues                │     │
             └───────────────────────┘     │
                    │          │            │
                    │          └────────────┼──────┐
                    │                       │      │
         ┌──────────▼────────┐   ┌─────────▼──────▼──┐
         │   Department      │   │ StorageLocation    │
         │───────────────────│   │────────────────────│
         │ id (PK)           │   │ id (PK)            │
         │ name              │   │ locationName       │
         │ owner             │   │ type               │
         │ email             │   └────────────────────┘
         └───────────────────┘
```

### Table Relationships

```sql
metrics (1) ──→ (N) metric_links
data_sources (1) ──→ (N) metric_links
departments (1) ──→ (N) metric_links
storage_locations (1) ──→ (N) metric_links
```

**Relationship Type:** One-to-Many with optional foreign keys (nullable)

---

## Data Flow

### Creating a Metric (Example)

```
User clicks "Create Metric" button
    ↓
Frontend: MetricsList.vue opens modal
    ↓
User fills form and clicks "Create"
    ↓
Frontend: Form validation
    ↓
Frontend: metricsStore.createMetric(data)
    ↓
Frontend: metricsAPI.create(data) → axios.post('/api/metrics', data)
    ↓
Backend: POST /api/metrics → metricsRoutes
    ↓
Backend: createMetric() controller
    ↓
Backend: prisma.metric.create({ data })
    ↓
PostgreSQL: INSERT INTO metrics
    ↓
Backend: Returns created metric (JSON)
    ↓
Frontend: Updates store (metrics.push(newMetric))
    ↓
Frontend: Closes modal and shows success
    ↓
UI updates automatically (reactive)
```

### Filtering Metrics

```
User selects "Category: E" filter
    ↓
Frontend: Filters.vue emits update:filters
    ↓
Frontend: metricsStore.setFilters({ category: 'E' })
    ↓
Frontend: filteredMetrics computed property recalculates
    ↓
UI re-renders with filtered metrics (no API call)
```

---

## Security Considerations (Future)

### Current MVP State
- ❌ No authentication
- ❌ No authorization
- ❌ No input sanitization
- ❌ No rate limiting
- ✅ CORS enabled for development

### Production Recommendations
```
┌─────────────────┐
│  Add Auth Layer │
│  (JWT / OAuth)  │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Add Middleware  │
│ - Auth Check    │
│ - Role Check    │
│ - Rate Limit    │
│ - Input Valid.  │
└─────────────────┘
```

---

## Deployment Architecture (Future)

### Recommended Production Setup

```
┌──────────────────────────────────────────────┐
│              Load Balancer                    │
│            (Nginx / CloudFlare)               │
└──────────────┬───────────────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼──────────┐   ┌──────▼────────┐
│  Frontend    │   │   Backend     │
│  (Static)    │   │   (Node.js)   │
│  Netlify/    │   │   Railway/    │
│  Vercel      │   │   Heroku      │
└──────────────┘   └───────┬───────┘
                           │
                  ┌────────▼────────┐
                  │   PostgreSQL    │
                  │   (Managed DB)  │
                  │   AWS RDS /     │
                  │   Supabase      │
                  └─────────────────┘
```

---

## Performance Optimization (Future)

### Frontend
- Code splitting with Vue Router
- Lazy loading components
- Image optimization
- Minification and compression
- CDN for static assets

### Backend
- Database indexing on frequently queried fields
- Connection pooling
- Response caching (Redis)
- Query optimization
- Compression middleware

### Database
```sql
-- Recommended indexes
CREATE INDEX idx_metrics_category ON metrics(category);
CREATE INDEX idx_metrics_status ON metrics(status);
CREATE INDEX idx_metric_links_metric_id ON metric_links(metric_id);
```

---

## Monitoring & Logging (Future)

```
Frontend
├── Error tracking (Sentry)
├── Analytics (Google Analytics / Plausible)
└── Performance monitoring (Web Vitals)

Backend
├── Request logging (Morgan)
├── Error tracking (Sentry)
├── API monitoring (DataDog / New Relic)
└── Database monitoring (Prisma Pulse)
```

---

## Technology Decisions

### Why Vue 3?
- ✅ Lightweight and performant
- ✅ Excellent TypeScript support
- ✅ Composition API for better code organization
- ✅ Easy to learn and use

### Why Prisma ORM?
- ✅ Type-safe database queries
- ✅ Automatic migrations
- ✅ Excellent developer experience
- ✅ Database agnostic (easy to switch)

### Why PostgreSQL?
- ✅ Robust relational database
- ✅ ACID compliant
- ✅ Perfect for structured data
- ✅ Great ecosystem and tooling

### Why TailwindCSS?
- ✅ Utility-first approach
- ✅ Fast development
- ✅ Consistent design system
- ✅ Small production bundle

---

## Scaling Considerations

### Horizontal Scaling
```
Multiple Backend Instances
    ↓
Shared Database
    ↓
Session storage in Redis
```

### Vertical Scaling
```
Increase server resources
Database read replicas
Caching layer
```

---

## Testing Strategy (Future Implementation)

```
Frontend Testing
├── Unit Tests (Vitest)
│   └── Components, Stores, Utils
├── Integration Tests
│   └── API Communication
└── E2E Tests (Playwright)
    └── Critical User Flows

Backend Testing
├── Unit Tests (Jest)
│   └── Controllers, Utils
├── Integration Tests
│   └── API Endpoints
└── Database Tests
    └── Prisma Operations
```

---

This architecture is designed for **MVP simplicity** while maintaining **extensibility** for future growth.
