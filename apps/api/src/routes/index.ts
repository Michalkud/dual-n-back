import { Router } from 'express';
import { authRoutes } from './auth';
import { sessionRoutes } from './sessions';
import { statsRoutes } from './stats';

const router = Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/sessions', sessionRoutes);
router.use('/stats', statsRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'Dual N-Back API',
    version: '1.0.0',
    description: 'API for Dual N-Back cognitive training application',
    endpoints: {
      auth: '/api/v1/auth',
      sessions: '/api/v1/sessions',
      stats: '/api/v1/stats'
    }
  });
});

export { router as apiRoutes }; 