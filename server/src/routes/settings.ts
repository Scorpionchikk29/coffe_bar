import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.js';
import { verifyToken, requireAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/', getSettings);
router.post('/', verifyToken, requireAdmin, updateSettings);

export default router;
