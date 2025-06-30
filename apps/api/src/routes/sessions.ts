import { Router } from 'express';

const router = Router();

// Placeholder session routes
router.get('/', (req, res) => {
  res.json({ message: 'Get sessions endpoint - coming soon' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create session endpoint - coming soon' });
});

router.patch('/:id/end', (req, res) => {
  res.json({ message: 'End session endpoint - coming soon' });
});

export { router as sessionRoutes }; 