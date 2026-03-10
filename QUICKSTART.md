# 🚀 Quick Start Guide - ESG Data Inventory System

This guide will help you set up and run the ESG Data Inventory System in **under 10 minutes**.

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ **Node.js 18+** - [Download here](https://nodejs.org/)
- ✅ **PostgreSQL 14+** - [Download here](https://www.postgresql.org/download/)
- ✅ **Git** (optional) - [Download here](https://git-scm.com/)

## 🗄️ Step 1: Setup PostgreSQL Database

### Windows (PowerShell)

1. Start PostgreSQL service:
```powershell
# Check if PostgreSQL is running
Get-Service postgresql*

# If not running, start it
Start-Service postgresql-x64-14  # Adjust version as needed
```

2. Connect to PostgreSQL and create database:
```powershell
# Connect to PostgreSQL (default user: postgres)
psql -U postgres

# In psql prompt, create database:
CREATE DATABASE esg_inventory;

# Exit psql
\q
```

### macOS/Linux

```bash
# Start PostgreSQL
sudo service postgresql start

# Create database
createdb esg_inventory

# Or use psql
psql -U postgres
CREATE DATABASE esg_inventory;
\q
```

## ⚙️ Step 2: Setup Backend

1. **Navigate to backend folder:**
```powershell
cd backend
```

2. **Install dependencies:**
```powershell
npm install
```

3. **Configure environment variables:**
```powershell
# Copy example env file
cp .env.example .env
```

4. **Edit `.env` file** with your database credentials:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/esg_inventory?schema=public"
PORT=3000
NODE_ENV=development
```

Replace `YOUR_PASSWORD` with your PostgreSQL password.

5. **Generate Prisma Client:**
```powershell
npx prisma generate
```

6. **Run database migrations:**
```powershell
npx prisma migrate dev --name init
```

7. **(Optional) Add sample data:**
```powershell
# Using psql
psql -U postgres -d esg_inventory -f prisma/seed.sql

# Or connect and run it manually
psql -U postgres -d esg_inventory
# Then paste contents of seed.sql
```

8. **Start backend server:**
```powershell
npm run dev
```

✅ Backend should now be running on **http://localhost:3000**

Test it: Open http://localhost:3000/api/health in your browser.

---

## 🎨 Step 3: Setup Frontend

**Open a NEW terminal window/tab** (keep backend running!)

1. **Navigate to frontend folder:**
```powershell
cd frontend
```

2. **Install dependencies:**
```powershell
npm install
```

3. **Start development server:**
```powershell
npm run dev
```

✅ Frontend should now be running on **http://localhost:5173**

---

## 🎉 Step 4: Access the Application

Open your browser and go to:

**http://localhost:5173**

You should see the ESG Data Inventory dashboard!

---

## 🧪 Testing the Setup

### Test Backend API

```powershell
# Get health status
curl http://localhost:3000/api/health

# Get all metrics
curl http://localhost:3000/api/metrics

# Get statistics
curl http://localhost:3000/api/metrics/stats
```

### Using the Frontend

1. **Dashboard** - View overview of all metrics
2. **Metrics** - Browse, search, and filter metrics
3. **Add Metric** - Click "+ Add Metric" button
4. **Data Sources** - Manage data sources
5. **Departments** - Manage departments
6. **Storage** - Manage storage locations

---

## 🛠️ Common Issues & Solutions

### Backend won't start

**Error: "Can't connect to database"**
```powershell
# Check PostgreSQL is running
Get-Service postgresql*

# Check database exists
psql -U postgres -l
```

**Error: "Prisma client not generated"**
```powershell
cd backend
npx prisma generate
```

### Frontend won't start

**Error: "Cannot connect to backend"**
- Ensure backend is running on port 3000
- Check backend terminal for errors

**Error: "Module not found"**
```powershell
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Port already in use

**Backend (port 3000):**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=3001
```

**Frontend (port 5173):**
```powershell
# Change port in frontend/vite.config.js
server: {
  port: 5174
}
```

---

## 📊 Database Management Tools

### Prisma Studio (Visual Database Editor)

```powershell
cd backend
npx prisma studio
```

Opens on http://localhost:5555 - Allows you to view and edit database records visually.

### Direct Database Access

```powershell
# Connect to database
psql -U postgres -d esg_inventory

# Useful commands:
\dt              # List all tables
\d metrics       # Describe metrics table
SELECT * FROM metrics LIMIT 5;
```

---

## 🔄 Reset Database

If you need to start fresh:

```powershell
cd backend

# Reset database and apply migrations
npx prisma migrate reset

# Regenerate Prisma Client
npx prisma generate

# Add sample data again (optional)
psql -U postgres -d esg_inventory -f prisma/seed.sql
```

---

## 📦 What's Next?

### Add More Data

1. Use the frontend UI to add metrics, sources, departments
2. Use Prisma Studio for bulk edits
3. Import data via API endpoints

### Customize

- Edit TailwindCSS theme in `frontend/tailwind.config.js`
- Modify database schema in `backend/prisma/schema.prisma`
- Add new pages in `frontend/src/views/`

### Deploy

- Backend: Deploy to Heroku, Railway, or DigitalOcean
- Frontend: Deploy to Netlify, Vercel, or GitHub Pages
- Database: Use managed PostgreSQL (AWS RDS, Supabase, etc.)

---

## 📞 Need Help?

- Check the main README.md for detailed documentation
- Review API endpoints in backend/README.md
- Check frontend/README.md for component structure

---

**Congratulations! 🎊 Your ESG Data Inventory System is now running!**
