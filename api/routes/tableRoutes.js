import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import {
  getAllTables,
  createTable,
  updateTable,
  deleteTable
} from '../controllers/tableController.js';

const router = express.Router();

router.get('/', authenticateToken, getAllTables);
router.post('/', authenticateToken, authorizeRole('manager'), createTable);
router.put('/:id', authenticateToken, authorizeRole('manager'), updateTable);
router.delete('/:id', authenticateToken, authorizeRole('manager'), deleteTable);

export default router;