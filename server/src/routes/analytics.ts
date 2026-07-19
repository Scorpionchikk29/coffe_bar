import { Router } from 'express';
import { getRevenueStats } from '../controllers/analytics.js';
import { verifyToken, requireAdmin } from '../middlewares/auth.js';

const router = Router();
router.get('/revenue', verifyToken, requireAdmin, getRevenueStats);
export default router;
