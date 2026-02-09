import { Router } from 'express';
import { body } from 'express-validator';
import { login, logout, me, register, updateProfile, changePassword } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { registerValidator, loginValidator, handleValidationErrors } from '../middleware/validators.js';

const router = Router();

// Public routes
router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);

// Protected routes
router.get('/me', requireAuth, me);
router.post('/logout', requireAuth, logout);

router.put(
  '/profile',
  requireAuth,
  [body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'), handleValidationErrors],
  updateProfile
);

router.put(
  '/password',
  requireAuth,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
    handleValidationErrors
  ],
  changePassword
);

export default router;