import { Router } from 'express';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/products.js';
import { verifyToken, requireAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/', getProducts);

router.post('/', verifyToken, requireAdmin, createProduct);
router.put('/:id', verifyToken, requireAdmin, updateProduct);
router.delete('/:id', verifyToken, requireAdmin, deleteProduct);

export default router;
