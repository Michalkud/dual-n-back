import { Router } from 'express';

const router = Router();

// Placeholder auth routes
router.post('/register', (req, res) => {
  res.json({ message: 'Register endpoint - coming soon' });
});

router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint - coming soon' });
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logout endpoint - coming soon' });
});

export { router as authRoutes }; 