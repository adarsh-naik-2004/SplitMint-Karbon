import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  listGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  addParticipant,
  removeParticipant
} from '../controllers/groupController.js';
import {
  createGroupValidator,
  updateGroupValidator,
  deleteGroupValidator,
  handleValidationErrors
} from '../middleware/validators.js';

const router = Router();

// List all groups
router.get('/', listGroups);

// Get single group
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid group ID'), handleValidationErrors],
  getGroup
);

// Create group
router.post('/', createGroupValidator, createGroup);

// Update group
router.put('/:id', updateGroupValidator, updateGroup);

// Delete group
router.delete('/:id', deleteGroupValidator, deleteGroup);

// Add participant to group
router.post(
  '/:id/participants',
  [
    param('id').isMongoId().withMessage('Invalid group ID'),
    body('name').trim().isLength({ min: 1, max: 50 }).withMessage('Participant name must be 1-50 characters'),
    body('color')
      .optional()
      .matches(/^#[0-9A-F]{6}$/i)
      .withMessage('Color must be a valid hex code'),
    handleValidationErrors
  ],
  addParticipant
);

// Remove participant from group
router.delete(
  '/:id/participants/:participantId',
  [
    param('id').isMongoId().withMessage('Invalid group ID'),
    param('participantId').notEmpty().withMessage('Participant ID is required'),
    handleValidationErrors
  ],
  removeParticipant
);

export default router;