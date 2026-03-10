# 💡 Frequently Asked Questions (FAQ)

## General Questions

### What is ESG Data Inventory System?

ESG Data Inventory System is a **data catalog** for managing Environmental, Social, and Governance (ESG) metrics. It helps organizations track metadata about their ESG data, including sources, responsible departments, storage locations, and data quality.

**Important:** This is NOT an analytics platform. It's a catalog/inventory system to help you organize and find your ESG data.

---

### Who is this for?

- **Universities** managing campus sustainability data
- **Sustainability Officers** tracking ESG metrics
- **Compliance Teams** documenting data sources
- **Data Managers** organizing sustainability information
- Any organization needing to catalog ESG data

---

### What's the difference between a data catalog and analytics platform?

| Data Catalog (This System) | Analytics Platform |
|----------------------------|-------------------|
| Stores metadata about data | Stores actual data values |
| "Where is the energy data?" | "What is our energy usage?" |
| Data inventory & discovery | Data analysis & visualization |
| Reference system | Operational system |

---

## Technical Questions

### What tech stack is used?

**Frontend:**
- Vue 3 (JavaScript framework)
- Vite (build tool)
- TailwindCSS (styling)
- Pinia (state management)

**Backend:**
- Node.js + Express (API server)
- Prisma ORM (database toolkit)
- PostgreSQL (database)

---

### Why these technologies?

- **Vue 3:** Lightweight, easy to learn, excellent performance
- **PostgreSQL:** Robust, ACID-compliant, perfect for structured data
- **Prisma:** Type-safe queries, automatic migrations, great DX
- **Express:** Minimal, flexible, industry standard

All are popular, well-documented, and have strong communities.

---

### What are the system requirements?

**Development:**
- Node.js 18 or higher
- PostgreSQL 14 or higher
- 4GB RAM minimum
- Modern web browser (Chrome, Firefox, Edge)

**Production:**
- Same as development
- Recommend 8GB+ RAM for production
- SSL certificate for HTTPS

---

### Can I use MySQL instead of PostgreSQL?

Yes! Prisma supports multiple databases. To switch to MySQL:

1. Update `schema.prisma`:
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

2. Update your `.env`:
```
DATABASE_URL="mysql://user:password@localhost:3306/esg_inventory"
```

3. Run migrations:
```bash
npx prisma migrate dev
```

---

### Is this production-ready?

**Current state: MVP** - Good for internal use, demos, prototypes

**For production, you should add:**
- Authentication & authorization
- Input validation & sanitization
- HTTPS/SSL
- Error monitoring (Sentry)
- Database backups
- Rate limiting
- Security headers

See [ROADMAP.md](ROADMAP.md) for production checklist.

---

## Setup & Installation

### I'm getting "Cannot connect to database" error

**Checklist:**

1. **Is PostgreSQL running?**
```bash
# Windows
Get-Service postgresql*

# Mac/Linux
pg_isready
```

2. **Does the database exist?**
```bash
psql -U postgres -l
# Look for 'esg_inventory' in the list
```

3. **Are credentials correct?**
Check `backend/.env` file:
```
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/esg_inventory"
```

4. **Can you connect manually?**
```bash
psql -U postgres -d esg_inventory
```

---

### "Prisma Client not generated" error

Run this command:
```bash
cd backend
npx prisma generate
```

This generates the Prisma Client based on your schema.

---

### Port 3000 or 5173 already in use

**Find what's using the port:**
```powershell
# Windows
netstat -ano | findstr :3000

# Mac/Linux
lsof -i :3000
```

**Kill the process:**
```powershell
# Windows (replace PID)
taskkill /PID <PID> /F

# Mac/Linux
kill -9 <PID>
```

**Or change the port:**
- Backend: Edit `backend/.env` → `PORT=3001`
- Frontend: Edit `frontend/vite.config.js` → `server: { port: 5174 }`

---

### How do I reset the database?

```bash
cd backend
npx prisma migrate reset
```

⚠️ **Warning:** This will delete all data!

---

## Usage Questions

### How do I add a new metric?

1. Go to **Metrics** page
2. Click **"+ Add Metric"** button
3. Fill in the form:
   - Name (required)
   - Category: E, S, or G (required)
   - Description, unit, standard (optional)
4. Click **Create**

---

### How do I link a metric to a data source?

Currently, use the API or Prisma Studio:

```bash
cd backend
npx prisma studio
```

Then:
1. Open **metric_links** table
2. Click **Add record**
3. Select metric, source, department, storage
4. Save

*Note: UI for this will be added in a future version*

---

### Can I import existing data?

**Option 1: Use the sample data**
```bash
cd backend
psql -U postgres -d esg_inventory -f prisma/seed.sql
```

**Option 2: Use Prisma Studio**
```bash
cd backend
npx prisma studio
```
Copy/paste data into tables

**Option 3: Use the API**
Write a script to POST data via the API endpoints

*Note: Bulk import feature planned for future release*

---

### How do I export data?

Currently export is not available in the UI.

**Workaround:**

**Option 1: Use Prisma Studio**
```bash
cd backend
npx prisma studio
```
You can copy data from tables

**Option 2: Direct database query**
```bash
psql -U postgres -d esg_inventory -c "SELECT * FROM metrics" -o output.csv
```

**Option 3: Use the API**
```bash
curl http://localhost:3000/api/metrics > metrics.json
```

*Note: CSV/Excel export planned for Phase 1*

---

### Can multiple users use this system?

**Current MVP:** Single user (no authentication)

**To enable multi-user:**
1. Add authentication (see Phase 2 in [ROADMAP.md](ROADMAP.md))
2. Deploy to a server accessible to your team
3. Set up HTTPS
4. Configure user management

---

## Customization

### Can I change the colors/design?

Yes! Edit `frontend/tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: {
        500: '#YOUR_COLOR',
        600: '#DARKER_SHADE',
        // ... etc
      }
    }
  }
}
```

---

### Can I add custom fields to metrics?

Yes! Update the Prisma schema:

1. Edit `backend/prisma/schema.prisma`:
```prisma
model Metric {
  // ... existing fields
  customField String?  // Add your field
}
```

2. Create migration:
```bash
npx prisma migrate dev --name add_custom_field
```

3. Update frontend forms and display

---

### Can I add a new page?

1. Create `frontend/src/views/MyNewPage.vue`
2. Add route in `frontend/src/router/index.js`:
```js
{
  path: '/my-page',
  name: 'MyPage',
  component: MyNewPage
}
```
3. Add link in `Navigation.vue`

---

## Deployment

### How do I deploy this?

**Backend:**
- Railway
- Heroku
- DigitalOcean
- AWS EC2

**Frontend:**
- Netlify
- Vercel
- GitHub Pages (static build)

**Database:**
- Heroku Postgres
- AWS RDS
- Supabase
- Railway

See deployment guides for each platform.

---

### What environment variables do I need?

**Backend (.env):**
```
DATABASE_URL=postgresql://...
PORT=3000
NODE_ENV=production
```

**Frontend:**
Update API base URL in production build if needed.

---

### Do I need separate servers for frontend and backend?

**Development:** No, Vite proxy handles this

**Production:** Recommended
- Frontend: Static hosting (Netlify, Vercel)
- Backend: Node.js hosting (Railway, Heroku)

**Alternative:** Serve frontend from backend (Express static files)

---

## Data & Security

### Where is the data stored?

In your PostgreSQL database. By default:
- Development: localhost
- Production: wherever you deploy the database

---

### Is the data secure?

**MVP:** Basic security only
- Database connections are encrypted
- CORS is enabled

**For production:**
- Add HTTPS/SSL
- Add authentication
- Add input validation
- Enable security headers
- Regular backups

---

### How do I backup the database?

```bash
# Backup
pg_dump -U postgres esg_inventory > backup.sql

# Restore
psql -U postgres esg_inventory < backup.sql
```

Automate with cron jobs or use managed database backup features.

---

### Can I restrict access to certain metrics?

Not in the current MVP. This requires:
1. Authentication system
2. Role-based access control (RBAC)
3. Row-level security

Planned for Phase 2 (see [ROADMAP.md](ROADMAP.md))

---

## Troubleshooting

### Frontend shows blank page

1. Check browser console for errors (F12)
2. Ensure backend is running: `curl http://localhost:3000/api/health`
3. Check Vite dev server is running on port 5173
4. Clear browser cache
5. Try incognito/private mode

---

### API returns 404 for all routes

1. Ensure backend is running
2. Check backend logs for errors
3. Verify routes in `backend/server.js`
4. Test health endpoint: `curl http://localhost:3000/api/health`

---

### Changes not reflecting in UI

1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Check if Vite hot reload is working (try editing a file)
4. Restart frontend dev server

---

### Database migration failed

```bash
# Reset migrations (⚠️ deletes data)
npx prisma migrate reset

# Or manually fix
psql -U postgres -d esg_inventory
# Run SQL commands manually
```

---

## Performance

### The app is slow

**Check:**
1. Database query performance (add indexes)
2. Network latency (deploy closer to users)
3. Large datasets (implement pagination)
4. Too many API calls (batch requests)

**Quick fixes:**
```sql
-- Add indexes (in PostgreSQL)
CREATE INDEX idx_metrics_category ON metrics(category);
CREATE INDEX idx_metric_links_metric_id ON metric_links(metric_id);
```

---

### Database is getting too large

1. Archive old records
2. Implement soft deletes instead of hard deletes
3. Set up regular maintenance
4. Upgrade database plan (if managed service)

---

## Development

### How do I contribute?

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

See contribution guidelines (if available).

---

### How do I run tests?

Tests are not yet implemented. Planned for Phase 8.

To add tests:
```bash
# Frontend
cd frontend
npm install vitest @vue/test-utils -D

# Backend
cd backend
npm install jest supertest -D
```

---

### Can I use TypeScript?

Yes! The frontend is already configured for TypeScript.

To use it:
1. Rename `.vue` files to `.vue` with `<script setup lang="ts">`
2. Create `.ts` files instead of `.js`
3. Add type definitions

Backend TypeScript: Rename files to `.ts` and add `ts-node`.

---

## Getting Help

### Where can I get help?

1. Check this FAQ
2. Read [README.md](README.md)
3. Check [QUICKSTART.md](QUICKSTART.md)
4. Review [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
5. Search GitHub Issues (if open source)
6. Ask on Stack Overflow (tag: vue, express, prisma)

---

### How do I report a bug?

1. Check if it's already reported
2. Create detailed bug report with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Error messages
   - Your environment (OS, Node version, etc.)

---

### How do I request a feature?

1. Check the [ROADMAP.md](ROADMAP.md)
2. Create a feature request with:
   - Use case
   - Expected behavior
   - Why it's valuable
   - Proposed implementation (optional)

---

## License & Usage

### Can I use this for commercial purposes?

Check the LICENSE file. If MIT license, yes you can use it commercially.

---

### Do I need to credit the original authors?

Check the LICENSE file for attribution requirements.

---

### Can I modify the code?

Yes, this is designed to be customizable. Modify as needed for your use case.

---

**Still have questions?**

Create an issue in the repository or reach out to the maintainers!
