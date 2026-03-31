# ESG Data Inventory (University ESG Catalog)

## 1. Project Overview
- Full-stack application for university ESG data management.
- Tracks metrics (E/S/G), data sources, departments, storage, and gaps.
- Supports imports from Google Sheets, CSV, JSON, manual entry.
- Role-based access: `admin`, `editor`, `viewer`.
- Uses JWT authentication, password reset via email with 6-digit code.

## 2. Architecture
### Backend
- Node.js + Express
- Prisma ORM + PostgreSQL
- Email via Nodemailer (SMTP)
- Audit logging for create/update/delete actions
- Import batches track file ingestion state (PENDING, COMPLETED, PARTIAL)

### Frontend
- Vue 3 + Vite
- Pinia store for auth state
- i18n in `frontend/src/i18n` with `en`, `ru`, `kk`
- Import interface: Sheets, CSV, Single Metric, JSON Batch
- No hardcoded localhost in production; uses `VITE_API_BASE_URL`

## 3. Key models
- `User` (roles, email verification, active state, token, password reset)
- `Metric` (name, category, definition, unit, status, createdBy, importBatchId)
- `ImportBatch` (source type, fileName, rowCount, status, userId)
- `DataSource`, `Department`, `StorageLocation`, `Standard`, `MetricStandard`, `AuditLog`.

## 4. Import behavior
- Import now stores entire file as one metric (no row splitting).
- Google Sheets and CSV parsed to row data, with first 20 rows saved as summary in `definition`, but no per-row separate metrics.
- Manual JSON batch imports create a single metric with raw JSON in `definition`.
- `ImportBatch` status is updated to `COMPLETED` or `PARTIAL`.

## 5. Internationalization
- All UI text in `frontend/src/views/ImportData.vue` switched to `vue-i18n` calls.
- Translations in:
  - `frontend/src/i18n/locales/en.js`
  - `frontend/src/i18n/locales/ru.js`
  - `frontend/src/i18n/locales/kk.js`
- Supports language switching with persisted locale in localStorage (`esg-locale`).

## 6. Setup & run
### Backend
1. `cd backend`
2. `npm install`
3. `cp .env.example .env` and fill vars (DATABASE_URL, JWT_SECRET, SMTP settings)
4. `npm run migrate` (or Prisma migrate dev)
5. `npm run dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. `cp .env.example .env` and set `VITE_API_BASE_URL` to backend API URL.
4. `npm run dev`

## 7. Tests
- Backend: `npm test` (Jest + coverage, 22 tests currently passing)
- Frontend: `npm run build` to verify production compile.

## 8. Deployment
- Backend: Dockerfile + docker-compose + Render auto-deploy using Git.
- Frontend: Netlify with `npm run build` on deploy and `VITE_API_BASE_URL` env.

## 9. Notes
- Import settings now enforce required metadata to avoid malformed file names.
- `cleanFileName` ensures CSV names are sanitized from encoding artifacts.
- Existing metrics keep full import batch traceability.
