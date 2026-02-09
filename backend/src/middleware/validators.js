import { body, param, query, validationResult } from 'express-validator';

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map((err) => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Auth Validators
export const registerValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  handleValidationErrors
];

export const loginValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

// Group Validators
export const createGroupValidator = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Group name must be 1-100 characters'),
  body('participants')
    .optional()
    .isArray({ max: 3 })
    .withMessage('Maximum 3 additional participants allowed'),
  body('participants.*.name')
    .if(body('participants').exists())
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Participant name must be 1-50 characters'),
  body('participants.*.color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex code'),
  handleValidationErrors
];

export const updateGroupValidator = [
  param('id').isMongoId().withMessage('Invalid group ID'),
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Group name must be 1-100 characters'),
  body('participants')
    .optional()
    .isArray({ max: 3 })
    .withMessage('Maximum 3 additional participants allowed'),
  body('participants.*.name')
    .if(body('participants').exists())
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Participant name must be 1-50 characters'),
  handleValidationErrors
];

export const deleteGroupValidator = [
  param('id').isMongoId().withMessage('Invalid group ID'),
  handleValidationErrors
];

// Expense Validators
export const createExpenseValidator = [
  body('groupId').isMongoId().withMessage('Valid group ID is required'),
  body('amount')
    .isFloat({ min: 0.01, max: 1000000 })
    .withMessage('Amount must be between 0.01 and 1,000,000'),
  body('description').trim().isLength({ min: 1, max: 200 }).withMessage('Description must be 1-200 characters'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('payerId').notEmpty().withMessage('Payer ID is required'),
  body('splitMode')
    .isIn(['equal', 'custom', 'percentage'])
    .withMessage('Split mode must be equal, custom, or percentage'),
  body('selectedParticipants')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one participant is required'),
  body('category')
    .optional()
    .isIn(['food', 'transport', 'entertainment', 'utilities', 'shopping', 'healthcare', 'other', 'uncategorized'])
    .withMessage('Invalid category'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
  handleValidationErrors
];

export const updateExpenseValidator = [
  param('id').isMongoId().withMessage('Invalid expense ID'),
  body('amount').optional().isFloat({ min: 0.01, max: 1000000 }).withMessage('Amount must be between 0.01 and 1,000,000'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Description must be 1-200 characters'),
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  body('splitMode')
    .optional()
    .isIn(['equal', 'custom', 'percentage'])
    .withMessage('Split mode must be equal, custom, or percentage'),
  handleValidationErrors
];

export const deleteExpenseValidator = [
  param('id').isMongoId().withMessage('Invalid expense ID'),
  handleValidationErrors
];

export const listExpensesValidator = [
  query('groupId').optional().isMongoId().withMessage('Invalid group ID'),
  query('minAmount').optional().isFloat({ min: 0 }).withMessage('Min amount must be positive'),
  query('maxAmount').optional().isFloat({ min: 0 }).withMessage('Max amount must be positive'),
  query('fromDate').optional().isISO8601().withMessage('Invalid from date'),
  query('toDate').optional().isISO8601().withMessage('Invalid to date'),
  handleValidationErrors
];

export const groupBalancesValidator = [
  param('groupId').isMongoId().withMessage('Invalid group ID'),
  handleValidationErrors
];

// AI Validators
export const parseExpenseValidator = [
  body('text').trim().isLength({ min: 1, max: 500 }).withMessage('Text must be 1-500 characters'),
  handleValidationErrors
];