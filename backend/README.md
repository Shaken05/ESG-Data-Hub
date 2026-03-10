# ESG Data Inventory - Backend

Backend API for ESG Data Inventory System built with Node.js, Express, and PostgreSQL.

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set your PostgreSQL connection string:
```
DATABASE_URL="postgresql://username:password@localhost:5432/esg_inventory?schema=public"
```

3. Generate Prisma Client:
```bash
npm run prisma:generate
```

4. Run database migrations:
```bash
npm run prisma:migrate
```

5. (Optional) Open Prisma Studio to view/edit data:
```bash
npm run prisma:studio
```

## Development

Start the development server:
```bash
npm run dev
```

Server will run on http://localhost:3000

## API Endpoints

### Metrics
- `GET /api/metrics` - Get all metrics (supports filters: category, status, search)
- `GET /api/metrics/stats` - Get metrics statistics
- `GET /api/metrics/:id` - Get single metric
- `POST /api/metrics` - Create new metric
- `PUT /api/metrics/:id` - Update metric
- `DELETE /api/metrics/:id` - Delete metric

### Data Sources
- `GET /api/sources` - Get all data sources
- `GET /api/sources/:id` - Get single data source
- `POST /api/sources` - Create new data source
- `PUT /api/sources/:id` - Update data source
- `DELETE /api/sources/:id` - Delete data source

### Departments
- `GET /api/departments` - Get all departments
- `GET /api/departments/:id` - Get single department
- `POST /api/departments` - Create new department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

### Storage Locations
- `GET /api/storage` - Get all storage locations
- `GET /api/storage/:id` - Get single storage location
- `POST /api/storage` - Create new storage location
- `PUT /api/storage/:id` - Update storage location
- `DELETE /api/storage/:id` - Delete storage location

### Metric Links
- `GET /api/metric-links` - Get all metric links
- `GET /api/metric-links/:id` - Get single metric link
- `POST /api/metric-links` - Create new metric link
- `PUT /api/metric-links/:id` - Update metric link
- `DELETE /api/metric-links/:id` - Delete metric link

## Database Schema

- **metrics** - ESG metrics catalog
- **data_sources** - Data source information
- **departments** - Responsible departments
- **storage_locations** - Storage location information
- **metric_links** - Links between metrics, sources, departments, and storage

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- CORS enabled for frontend integration
