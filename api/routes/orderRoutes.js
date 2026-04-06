import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import {
  createOrder,
  getAllOrders,
  getMyOrders,
  updateOrder,
  deleteOrder
} from '../controllers/orderController.js';

const router = express.Router();

router.post('/', authenticateToken, authorizeRole('waiter'), createOrder);
router.get('/', authenticateToken, authorizeRole('manager'), getAllOrders);
router.get('/my', authenticateToken, authorizeRole('waiter'), getMyOrders);
router.put('/:id', authenticateToken, authorizeRole('manager'), updateOrder);
router.delete('/:id', authenticateToken, authorizeRole('manager'), deleteOrder);

export default router;