import { Router } from 'express';
import { body } from 'express-validator';
import { parseExpense, generateSummary } from '../controllers/aiController.js';
import { parseExpenseValidator, handleValidationErrors } from '../middleware/validators.js';

const router = Router();

// Parse natural language expense
router.post('/parse-expense', parseExpenseValidator, parseExpense);

// Generate expense summary
router.post(
  '/generate-summary',
  [
    body('expenses').isArray({ min: 1 }).withMessage('At least one expense is required'),
    body('groupName').trim().isLength({ min: 1 }).withMessage('Group name is required'),
    handleValidationErrors
  ],
  generateSummary
);

export default router;