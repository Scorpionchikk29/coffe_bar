import { Router } from 'express';
import { createOrder, getOrders, updateOrderStatus, cancelOrder } from '../controllers/orders.js';
import { verifyToken, requireAdmin } from '../middlewares/auth.js';

const router = Router();

router.post('/', verifyToken, createOrder);

router.get('/', verifyToken, getOrders);

router.patch('/:id/status', verifyToken, requireAdmin, updateOrderStatus);
router.patch('/:id/cancel', verifyToken, cancelOrder);

export default router;
