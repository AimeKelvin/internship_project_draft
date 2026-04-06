import express from 'express';
import { login, signup, createStaff, getAllUsers } from '../controllers/authController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Manager only routes
router.post('/staff', authenticateToken, authorizeRole('manager'), createStaff);
router.get('/staff', authenticateToken, authorizeRole('manager'), getAllUsers);   // ← New endpoint

export default router;