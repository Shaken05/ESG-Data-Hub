import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import metricsRoutes from './routes/metricsRoutes.js';
import sourcesRoutes from './routes/sourcesRoutes.js';
import departmentsRoutes from './routes/departmentsRoutes.js';
import storageRoutes from './routes/storageRoutes.js';
import metricLinksRoutes from './routes/metricLinksRoutes.js';
import importRoutes from './routes/importRoutes.js';
import authRoutes from './routes/authRoutes.js';
import standardsRoutes from './routes/standardsRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import authMiddleware from './middleware/authMiddleware.js';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

async function ensureKbtuAdmin() {
  const email = 's_shynggyssuly@kbtu.kz';
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.warn(`⚠️ User ${email} not found. Admin promotion skipped.`);
      return;
    }
    if (user.role === 'admin') {
      console.log(`✅ User ${email} already admin.`);
      return;
    }
    await prisma.user.update({ where: { email }, data: { role: 'admin' } });
    console.log(`✅ User ${email} promoted to admin.`);
  } catch (error) {
    console.error(`❌ Failed to promote ${email} to admin:`, error);
  }
}


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Auth routes (public)
app.use('/api/auth', authRoutes);

// Protected routes (require authentication)
app.use('/api/metrics', authMiddleware, metricsRoutes);
app.use('/api/sources', authMiddleware, sourcesRoutes);
app.use('/api/departments', authMiddleware, departmentsRoutes);
app.use('/api/storage', authMiddleware, storageRoutes);
app.use('/api/metric-links', authMiddleware, metricLinksRoutes);
app.use('/api/import', authMiddleware, importRoutes);
app.use('/api/standards', standardsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/export', exportRoutes);

// Root route (non-API) redirect to health check or frontend
app.get('/', (req, res) => {
  // If you are hosting frontend separately, this route can be changed to serve index.html instead
  res.redirect('/api/health');
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ESG Data Inventory API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, async () => {
  console.log(`🚀 ESG Data Inventory API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  await ensureKbtuAdmin();
});
