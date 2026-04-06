import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} from '../controllers/menuController.js';

const router = express.Router();

// Categories
router.get('/categories', authenticateToken, getAllCategories);
router.post('/categories', authenticateToken, authorizeRole('manager'), createCategory);
router.put('/categories/:id', authenticateToken, authorizeRole('manager'), updateCategory);
router.delete('/categories/:id', authenticateToken, authorizeRole('manager'), deleteCategory);

// Menu Items
router.get('/items', authenticateToken, getAllMenuItems);
router.post('/items', authenticateToken, authorizeRole('manager'), createMenuItem);
router.put('/items/:id', authenticateToken, authorizeRole('manager'), updateMenuItem);
router.delete('/items/:id', authenticateToken, authorizeRole('manager'), deleteMenuItem);

export default router;