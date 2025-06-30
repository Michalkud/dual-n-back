import { Router } from 'express';

const router = Router();

// Placeholder stats routes
router.get('/progress', (req, res) => {
  res.json({ message: 'Progress stats endpoint - coming soon' });
});

router.get('/export/csv', (req, res) => {
  res.json({ message: 'CSV export endpoint - coming soon' });
});

export { router as statsRoutes }; 