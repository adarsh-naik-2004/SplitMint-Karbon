import { Router } from 'express';
import {
  listExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  groupBalances,
  groupStats
} from '../controllers/expenseController.js';
import {
  createExpenseValidator,
  updateExpenseValidator,
  deleteExpenseValidator,
  listExpensesValidator,
  groupBalancesValidator
} from '../middleware/validators.js';

const router = Router();

// List expenses with filtering
router.get('/', listExpensesValidator, listExpenses);

// Get single expense
router.get('/:id', deleteExpenseValidator, getExpense);

// Create expense
router.post('/', createExpenseValidator, createExpense);

// Update expense
router.put('/:id', updateExpenseValidator, updateExpense);

// Delete expense
router.delete('/:id', deleteExpenseValidator, deleteExpense);

// Get group balances
router.get('/balances/:groupId', groupBalancesValidator, groupBalances);

// Get group statistics
router.get('/stats/:groupId', groupBalancesValidator, groupStats);

export default router;