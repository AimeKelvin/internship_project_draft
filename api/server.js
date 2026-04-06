import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import tableRoutes from './routes/tableRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import kitchenRoutes from './routes/kitchenRoutes.js';

import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/kitchen', kitchenRoutes);

app.get('/', (req, res) => res.json({ message: 'Restaurant Backend is running' }));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});