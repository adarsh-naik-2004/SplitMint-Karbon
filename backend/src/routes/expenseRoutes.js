import { Router } from 'express';
import { createExpense, deleteExpense, groupBalances, listExpenses, updateExpense } from '../controllers/expenseController.js';

const router = Router();
router.get('/', listExpenses);
router.post('/', createExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);
router.get('/balances/:groupId', groupBalances);

export default router;
