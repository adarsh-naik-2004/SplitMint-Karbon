import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { requireAuth } from './middleware/auth.js';

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
  })
);

app.get('/health', (_, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/groups', requireAuth, groupRoutes);
app.use('/api/expenses', requireAuth, expenseRoutes);
app.use('/api/ai', requireAuth, aiRoutes);

export default app;
