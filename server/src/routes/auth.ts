import { Router } from 'express';
import { register, login } from '../controllers/auth.js';
import { verifyToken } from '../middlewares/auth.js';
import { updateProfile, changePassword, deleteAccount } from '../controllers/profile.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);

router.put('/profile', verifyToken, updateProfile);
router.patch('/change-password', verifyToken, changePassword);
router.delete('/account', verifyToken, deleteAccount);

export default router;
