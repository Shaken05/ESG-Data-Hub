import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import metricsRoutes from './routes/metricsRoutes.js';
import sourcesRoutes from './routes/sourcesRoutes.js';
import departmentsRoutes from './routes/departmentsRoutes.js';
import storageRoutes from './routes/storageRoutes.js';
import metricLinksRoutes from './routes/metricLinksRoutes.js';
import importRoutes from './routes/importRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import gapsRoutes from './routes/gapsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import authMiddleware from './middleware/authMiddleware.js';

dotenv.config();

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
app.use('/api/export', authMiddleware, exportRoutes);
app.use('/api/audit-logs', authMiddleware, auditRoutes);
app.use('/api/gaps', authMiddleware, gapsRoutes);

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

app.listen(PORT, () => {
  console.log(`🚀 ESG Data Inventory API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
