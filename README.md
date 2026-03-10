# ESG Data Inventory System

A comprehensive web-based **Data Catalog** for managing ESG (Environmental, Social, Governance) metrics in a university setting.

## 🎯 Project Overview

This system helps organizations catalog, track, and manage ESG data by storing metadata about ESG metrics, their data sources, responsible departments, and storage locations.

## ✨ Key Features

- **ESG Metrics Catalog**: Store and manage metrics with category (E/S/G), units, standards (GRI, STARS, SDG), and status
- **Data Sources Management**: Track data sources (Excel, API, Survey, ERP) with format and update frequency
- **Departments**: Manage responsible departments and data owners
- **Storage Locations**: Document where data is stored (Drive, Server, Cloud, SharePoint)
- **Advanced Search & Filters**: Filter by category, status, and search by keywords
- **Metric Links**: Connect metrics to their sources, departments, and storage
- **Quality Tracking**: Monitor data quality scores and last update times

## 🏗️ Architecture

```
Browser
   ↓
Frontend (Vue 3 + Vite + TailwindCSS)
   ↓
REST API
   ↓
Backend (Node.js + Express)
   ↓
Database (PostgreSQL + Prisma)
```

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- PostgreSQL
- Prisma ORM
- CORS enabled

### Frontend
- Vue 3 (Composition API)
- Vite
- Vue Router
- Pinia (State Management)
- Axios
- TailwindCSS

## 📁 Project Structure

```
esgproject/
├── backend/
│   ├── controllers/       # Route controllers
│   ├── routes/           # API routes
│   ├── prisma/           # Database schema
│   ├── server.js         # Express server
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/   # Vue components
    │   ├── views/        # Page components
    │   ├── stores/       # Pinia stores
    │   ├── services/     # API services
    │   ├── router/       # Vue Router
    │   └── assets/       # CSS & assets
    ├── index.html
    └── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:
```
DATABASE_URL="postgresql://username:password@localhost:5432/esg_inventory?schema=public"
PORT=3000
```

4. Generate Prisma Client:
```bash
npm run prisma:generate
```

5. Run database migrations:
```bash
npm run prisma:migrate
```

6. Start backend server:
```bash
npm run dev
```

Backend will run on http://localhost:3000

### Frontend Setup

1. Open a new terminal and navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend will run on http://localhost:5173

## 📊 Database Schema

### Tables

- **metrics** - ESG metrics catalog
- **data_sources** - Data source information
- **departments** - Responsible departments
- **storage_locations** - Storage location information
- **metric_links** - Relationships between all entities

### Key Enums

- **Category**: E (Environmental), S (Social), G (Governance)
- **Status**: COLLECTED, PARTIAL, PLANNED
- **SourceType**: EXCEL, API, SURVEY, ERP
- **StorageType**: DRIVE, SERVER, CLOUD, SHAREPOINT
- **Standard**: GRI, STARS, SDG

## 🔌 API Endpoints

### Metrics
- `GET /api/metrics` - Get all metrics (supports filters)
- `GET /api/metrics/stats` - Get statistics
- `GET /api/metrics/:id` - Get single metric
- `POST /api/metrics` - Create metric
- `PUT /api/metrics/:id` - Update metric
- `DELETE /api/metrics/:id` - Delete metric

### Data Sources
- `GET /api/sources` - Get all data sources
- `POST /api/sources` - Create data source
- `PUT /api/sources/:id` - Update data source
- `DELETE /api/sources/:id` - Delete data source

### Departments
- `GET /api/departments` - Get all departments
- `POST /api/departments` - Create department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

### Storage Locations
- `GET /api/storage` - Get all storage locations
- `POST /api/storage` - Create storage location
- `PUT /api/storage/:id` - Update storage location
- `DELETE /api/storage/:id` - Delete storage location

### Metric Links
- `GET /api/metric-links` - Get all metric links
- `POST /api/metric-links` - Create metric link
- `PUT /api/metric-links/:id` - Update metric link
- `DELETE /api/metric-links/:id` - Delete metric link

## 🎨 UI Pages

1. **Dashboard** - Overview with statistics and recent metrics
2. **Metrics List** - Searchable table with filters
3. **Metric Details** - Detailed view with all linked information
4. **Data Sources** - Manage data sources
5. **Departments** - Manage departments
6. **Storage Locations** - Manage storage locations

## 🔧 Development

### Adding Sample Data

You can use Prisma Studio to add sample data:
```bash
cd backend
npm run prisma:studio
```

Or use the API endpoints via the frontend UI.

### Running Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📦 Production Build

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
```

Built files will be in `frontend/dist/`

## 🤝 Contributing

This is an MVP project. To extend:

1. Add authentication/authorization
2. Implement role-based access control
3. Add data validation rules
4. Implement file upload for documents
5. Add data visualization/charts
6. Export functionality (Excel, PDF)
7. Audit logging
8. Email notifications

## 📄 License

MIT

## 👥 Authors

ESG Data Inventory System - University Data Catalog MVP

---

**For questions or issues, please create an issue in the repository.**
