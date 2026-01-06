import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import departmentsRoutes from './routes/departments.js';
import equipmentRoutes from './routes/equipment.js';
import brandsRoutes from './routes/brands.js';
import usersRoutes from './routes/users.js';
import publicRoutes from './routes/public.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/brands', brandsRoutes);
app.use('/api/users', usersRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API server running at http://localhost:${PORT}`);
});

export default app;
