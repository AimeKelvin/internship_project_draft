import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from '../config/db.js';

dotenv.config();

// ======================
// PUBLIC SIGNUP - Only for Manager
// ======================
export const signup = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    const [existing] = await db.query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await db.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, "manager")',
      [username, hashedPassword]
    );

    res.status(201).json({
      message: 'Manager account created successfully',
      user: { id: result.insertId, username, role: 'manager' }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create account' });
  }
};

// ======================
// CREATE STAFF - Manager Only
// ======================
export const createStaff = async (req, res) => {
  const { username, password, role, full_name } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Username, password and role are required' });
  }

  if (!['waiter', 'kitchen'].includes(role)) {
    return res.status(400).json({ message: 'Role must be either "waiter" or "kitchen"' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    const [existing] = await db.query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await db.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, role]
    );

    res.status(201).json({
      message: `Staff account (${role}) created successfully`,
      user: {
        id: result.insertId,
        username,
        role,
        full_name: full_name || username
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create staff account' });
  }
};

// ======================
// LOGIN
// ======================
export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const [users] = await db.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    const user = users[0];
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed' });
  }
};

// ======================
// NEW: GET ALL USERS - Manager Only
// ======================
export const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT 
        id, 
        username, 
        role, 
        full_name,
        created_at 
      FROM users 
      ORDER BY role, username
    `);

    // Do not return passwords
    const safeUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      role: user.role,
      full_name: user.full_name || user.username,
      created_at: user.created_at
    }));

    res.json(safeUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};