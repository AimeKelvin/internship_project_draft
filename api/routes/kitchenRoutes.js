import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import {
  getKitchenOrders,
  updateOrderStatusInKitchen
} from '../controllers/kitchenController.js';

const router = express.Router();

router.get('/orders', getKitchenOrders);
router.patch('/order-status', updateOrderStatusInKitchen);

export default router;