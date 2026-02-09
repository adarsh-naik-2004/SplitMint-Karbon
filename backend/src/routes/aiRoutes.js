import { Router } from 'express';
import { parseExpense } from '../controllers/aiController.js';

const router = Router();
router.post('/parse-expense', parseExpense);

export default router;
