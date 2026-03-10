# 📁 ESG Data Inventory - Project File Structure

Complete file tree of the project:

```
esgproject/
│
├── 📄 README.md                    # Main documentation
├── 📄 QUICKSTART.md                # Quick start guide
├── 📄 API_DOCUMENTATION.md         # API reference
├── 📄 ARCHITECTURE.md              # Technical architecture
├── 📄 ROADMAP.md                   # Product roadmap
├── 📄 FAQ.md                       # Frequently asked questions
├── 📄 package.json                 # Root workspace config
├── 📄 .gitignore                   # Git ignore rules
├── 📄 setup.ps1                    # Automated setup script
│
├── 📁 backend/
│   ├── 📄 package.json             # Backend dependencies
│   ├── 📄 server.js                # Express server entry point
│   ├── 📄 .env                     # Environment variables (not in git)
│   ├── 📄 .env.example             # Environment template
│   ├── 📄 .gitignore               # Backend git ignore
│   ├── 📄 README.md                # Backend documentation
│   │
│   ├── 📁 controllers/             # Business logic
│   │   ├── metricsController.js
│   │   ├── sourcesController.js
│   │   ├── departmentsController.js
│   │   ├── storageController.js
│   │   └── metricLinksController.js
│   │
│   ├── 📁 routes/                  # API routes
│   │   ├── metricsRoutes.js
│   │   ├── sourcesRoutes.js
│   │   ├── departmentsRoutes.js
│   │   ├── storageRoutes.js
│   │   └── metricLinksRoutes.js
│   │
│   └── 📁 prisma/                  # Database
│       ├── schema.prisma           # Database schema
│       └── seed.sql                # Sample data
│
└── 📁 frontend/
    ├── 📄 package.json             # Frontend dependencies
    ├── 📄 vite.config.js           # Vite configuration
    ├── 📄 tailwind.config.js       # TailwindCSS config
    ├── 📄 postcss.config.cjs       # PostCSS config
    ├── 📄 index.html               # HTML entry point
    ├── 📄 .gitignore               # Frontend git ignore
    ├── 📄 README.md                # Frontend documentation
    │
    └── 📁 src/
        ├── 📄 main.js              # Vue app entry point
        ├── 📄 App.vue              # Root component
        │
        ├── 📁 assets/
        │   └── main.css            # Global styles + Tailwind
        │
        ├── 📁 components/          # Reusable components
        │   ├── Navigation.vue
        │   ├── MetricCard.vue
        │   └── Filters.vue
        │
        ├── 📁 views/               # Page components
        │   ├── Dashboard.vue
        │   ├── MetricsList.vue
        │   ├── MetricDetails.vue
        │   ├── DataSources.vue
        │   ├── Departments.vue
        │   └── StorageLocations.vue
        │
        ├── 📁 stores/              # Pinia state management
        │   └── metricsStore.js
        │
        ├── 📁 services/            # API communication
        │   └── api.js
        │
        └── 📁 router/              # Vue Router
            └── index.js
```

---

## 📊 Project Statistics

### Lines of Code (Approximate)

| Component | Files | Lines |
|-----------|-------|-------|
| Backend   | 11    | ~1,200 |
| Frontend  | 14    | ~2,500 |
| Documentation | 7 | ~3,000 |
| **Total** | **32** | **~6,700** |

---

## 🗂️ File Categories

### Configuration Files (7)
- package.json files (3)
- .env files (2)
- vite.config.js
- tailwind.config.js
- postcss.config.cjs

### Documentation (7)
- README.md (main)
- QUICKSTART.md
- API_DOCUMENTATION.md
- ARCHITECTURE.md
- ROADMAP.md
- FAQ.md
- Backend/Frontend READMEs

### Backend Files (11)
- Server: 1 file (server.js)
- Controllers: 5 files
- Routes: 5 files
- Database: 2 files (schema.prisma, seed.sql)

### Frontend Files (14)
- Entry: 2 files (main.js, App.vue, index.html)
- Components: 3 files
- Views: 6 files
- Store: 1 file
- Services: 1 file
- Router: 1 file
- Styles: 1 file

---

## 🔍 Key Files Description

### Root Level

**README.md**
- Project overview
- Features list
- Getting started guide
- Architecture diagram
- Full documentation

**QUICKSTART.md**
- Step-by-step setup guide
- Troubleshooting tips
- Testing instructions

**API_DOCUMENTATION.md**
- Complete API reference
- Request/response examples
- Error codes
- cURL examples

**ARCHITECTURE.md**
- System architecture diagrams
- Technology decisions
- Data flow
- Deployment recommendations

**ROADMAP.md**
- Development phases
- Feature priorities
- Timeline estimates
- Success metrics

**FAQ.md**
- Common questions
- Troubleshooting
- Customization guide
- Performance tips

**setup.ps1**
- Automated setup script for Windows
- Checks prerequisites
- Installs dependencies
- Runs migrations

---

### Backend

**server.js** (Main entry point)
- Express app initialization
- Middleware configuration
- Route registration
- Error handling

**controllers/** (Business logic)
- Handle HTTP requests
- Database operations via Prisma
- Response formatting
- Error handling

**routes/** (API endpoints)
- Define REST endpoints
- Route to controllers
- HTTP method handlers

**prisma/schema.prisma** (Database schema)
- Data models (Metric, DataSource, etc.)
- Relationships
- Enums
- Database configuration

**prisma/seed.sql** (Sample data)
- Pre-populated test data
- 12 sample metrics
- 5 departments
- 5 data sources
- 4 storage locations

---

### Frontend

**main.js** (Entry point)
- Vue app initialization
- Pinia setup
- Router setup
- Global styles

**App.vue** (Root component)
- Layout structure
- Navigation
- Router view

**components/** (Reusable UI)
- **Navigation.vue**: Top navigation bar
- **MetricCard.vue**: Metric display card
- **Filters.vue**: Search and filter controls

**views/** (Pages)
- **Dashboard.vue**: Overview with stats
- **MetricsList.vue**: Searchable metrics table
- **MetricDetails.vue**: Detailed metric view
- **DataSources.vue**: Manage data sources
- **Departments.vue**: Manage departments
- **StorageLocations.vue**: Manage storage

**stores/metricsStore.js** (State management)
- Metrics state
- API calls
- Filters
- Computed properties

**services/api.js** (API client)
- Axios configuration
- API endpoints
- Request/response handling

**router/index.js** (Routing)
- Route definitions
- Navigation guards (future)
- Page components mapping

---

## 📦 Dependencies

### Backend Dependencies

**Production:**
- express: Web framework
- @prisma/client: Database client
- cors: Enable CORS
- dotenv: Environment variables

**Development:**
- prisma: Database toolkit

### Frontend Dependencies

**Production:**
- vue: JavaScript framework
- vue-router: Routing
- pinia: State management
- axios: HTTP client

**Development:**
- @vitejs/plugin-vue: Vue plugin for Vite
- vite: Build tool
- tailwindcss: CSS framework
- autoprefixer: CSS post-processor
- postcss: CSS transformer

---

## 🎨 Design System

### Colors (TailwindCSS)

**Primary (Green):**
- 50-900 shades for various uses
- Used for: buttons, links, accents

**Category Colors:**
- Environmental (E): Green
- Social (S): Blue
- Governance (G): Purple

**Status Colors:**
- Collected: Green
- Partial: Yellow
- Planned: Gray

### Typography
- Font: System fonts (SF Pro, Segoe UI, etc.)
- Headings: Bold, various sizes
- Body: Regular weight

### Spacing
- Consistent 4px grid system
- Component padding: 24px (p-6)
- Section gaps: 24px (gap-6)

---

## 🔧 Configuration Files

### .env (Backend)
```
DATABASE_URL=postgresql://...
PORT=3000
NODE_ENV=development
```

### vite.config.js (Frontend)
- Vue plugin
- Path aliases (@)
- Proxy to backend API

### tailwind.config.js (Frontend)
- Custom color palette
- Additional utilities
- Content paths

---

## 🚀 npm Scripts

### Root (package.json)
- `install:all`: Install all dependencies
- `dev`: Run both frontend and backend
- `dev:backend`: Run backend only
- `dev:frontend`: Run frontend only

### Backend
- `dev`: Start with auto-reload
- `start`: Production start
- `prisma:generate`: Generate Prisma Client
- `prisma:migrate`: Run migrations
- `prisma:studio`: Open database GUI

### Frontend
- `dev`: Start dev server
- `build`: Production build
- `preview`: Preview build

---

## 📊 Database Tables

1. **metrics**: ESG metrics catalog (12 columns)
2. **data_sources**: Data source information (7 columns)
3. **departments**: Responsible departments (6 columns)
4. **storage_locations**: Storage information (5 columns)
5. **metric_links**: Relationships (10 columns)

**Total: 5 tables, ~40 columns**

---

## 🎯 Feature Completeness

### ✅ Implemented (MVP)
- Full CRUD for all entities
- Search and filtering
- Relationships between entities
- Dashboard with statistics
- Responsive UI
- REST API
- Database migrations
- Sample data

### 🚧 Not Yet Implemented
- Authentication/Authorization
- File uploads
- Data export
- Bulk operations
- Real-time updates
- Email notifications
- Advanced analytics
- API rate limiting

See [ROADMAP.md](ROADMAP.md) for planned features.

---

## 🔄 Data Flow Example

**Creating a Metric:**

```
User Input (Frontend)
    ↓
MetricsList.vue
    ↓
metricsStore.createMetric()
    ↓
api.js → POST /api/metrics
    ↓
metricsRoutes.js
    ↓
metricsController.createMetric()
    ↓
prisma.metric.create()
    ↓
PostgreSQL INSERT
    ↓
Return new metric
    ↓
Update store
    ↓
UI re-renders
```

---

## 📝 Code Style

### Backend (JavaScript ES Modules)
- Arrow functions
- Async/await
- Try/catch error handling
- Descriptive variable names

### Frontend (Vue 3 Composition API)
- `<script setup>` syntax
- Composables for reusability
- Reactive references
- Computed properties

### CSS (TailwindCSS)
- Utility-first approach
- Custom components in @layer
- Consistent spacing
- Responsive modifiers

---

## 🏆 Best Practices Used

1. **Separation of Concerns**: Routes → Controllers → Database
2. **DRY Principle**: Reusable components
3. **RESTful API**: Standard HTTP methods
4. **Error Handling**: Try/catch everywhere
5. **Environment Variables**: Sensitive data in .env
6. **Documentation**: Comprehensive docs
7. **Git Ignore**: Exclude node_modules, .env
8. **Modular Code**: Small, focused files
9. **Consistent Naming**: camelCase, PascalCase
10. **Comments**: Explain complex logic

---

## 🎓 Learning Resources

**If you're new to these technologies:**

- **Vue 3**: [vuejs.org](https://vuejs.org)
- **Express**: [expressjs.com](https://expressjs.com)
- **Prisma**: [prisma.io/docs](https://www.prisma.io/docs)
- **PostgreSQL**: [postgresql.org/docs](https://www.postgresql.org/docs)
- **TailwindCSS**: [tailwindcss.com](https://tailwindcss.com)

---

**This project structure is designed for:**
- ✅ Easy navigation
- ✅ Maintainability
- ✅ Scalability
- ✅ Team collaboration
- ✅ Quick onboarding
