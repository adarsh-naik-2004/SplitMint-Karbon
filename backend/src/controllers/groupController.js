import mongoose from 'mongoose';
import Group from '../models/Group.js';
import Expense from '../models/Expense.js';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

/**
 * Helper to normalize participants (owner first, max 4 total)
 */
function normalizeParticipants(owner, additionalParticipants = []) {
  const ownerParticipant = {
    _id: owner._id,
    name: owner.name,
    color: owner.color || '#2d6cdf',
    avatar: owner.avatar || 'owner',
    isOwner: true
  };

  return [ownerParticipant, ...additionalParticipants.slice(0, 3)];
}

/**
 * List all groups for the authenticated user
 */
export const listGroups = asyncHandler(async (req, res) => {
  const groups = await Group.find({
    ownerId: req.session.userId,
    isActive: true
  }).sort({ createdAt: -1 });

  res.json(groups);
});

/**
 * Get a single group by ID
 */
export const getGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const group = await Group.findOne({
    _id: id,
    ownerId: req.session.userId,
    isActive: true
  });

  if (!group) {
    throw new ApiError(404, 'Group not found');
  }

  res.json(group);
});

/**
 * Create a new group
 */
export const createGroup = asyncHandler(async (req, res) => {
  const { name, participants = [] } = req.body;

  if (participants.length > 3) {
    throw new ApiError(400, 'Maximum 3 additional participants allowed (4 total including owner)');
  }

  const owner = {
    name: req.session.userName,
    color: '#2d6cdf',
    avatar: 'owner'
  };

  const group = await Group.create({
    name,
    ownerId: req.session.userId,
    participants: normalizeParticipants(owner, participants)
  });

  logger.info(`Group created: ${group._id} by user ${req.session.userId}`);

  res.status(201).json(group);
});

/**
 * Update a group
 */
export const updateGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, participants } = req.body;

  const group = await Group.findOne({
    _id: id,
    ownerId: req.session.userId,
    isActive: true
  });

  if (!group) {
    throw new ApiError(404, 'Group not found');
  }

  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Update group name if provided
    if (name !== undefined) {
      group.name = name;
    }

    // Update participants if provided
    if (Array.isArray(participants)) {
      if (participants.length > 3) {
        throw new ApiError(400, 'Maximum 3 additional participants allowed');
      }

      const currentOwner = group.participants[0];
      const owner = {
        _id: currentOwner._id,
        name: req.session.userName,
        color: currentOwner.color || '#2d6cdf',
        avatar: currentOwner.avatar || 'owner',
        isOwner: true
      };

      const nextParticipants = normalizeParticipants(owner, participants);

      // Find removed participant IDs
      const removedIds = new Set(
        group.participants
          .map((p) => p._id.toString())
          .filter((id) => !nextParticipants.some((p) => p._id?.toString() === id))
      );

      group.participants = nextParticipants;
      await group.save({ session });

      // Handle expenses with removed participants
      if (removedIds.size > 0) {
        const expenses = await Expense.find({
          ownerId: req.session.userId,
          groupId: group._id,
          isDeleted: false
        }).session(session);

        for (const expense of expenses) {
          // Remove splits for removed participants
          const originalSplitCount = expense.splits.length;
          expense.splits = expense.splits.filter((s) => !removedIds.has(s.participantId));

          // If payer was removed, assign to owner
          if (removedIds.has(expense.payerId)) {
            expense.payerId = group.participants[0]._id.toString();
            logger.info(`Expense ${expense._id} payer reassigned to owner`);
          }

          // If no participants left, mark expense as deleted
          if (expense.splits.length === 0) {
            expense.isDeleted = true;
            logger.info(`Expense ${expense._id} marked as deleted (no participants)`);
          } else if (originalSplitCount !== expense.splits.length) {
            // Recalculate amount based on remaining splits
            expense.amount = expense.splits.reduce((sum, s) => sum + s.amount, 0);
          }

          await expense.save({ session });
        }

        logger.info(`Updated ${expenses.length} expenses after participant removal`);
      }
    }

    await session.commitTransaction();
    logger.info(`Group updated: ${group._id}`);

    res.json(group);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

/**
 * Delete a group (soft delete with cascade)
 */
export const deleteGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const group = await Group.findOne({
    _id: id,
    ownerId: req.session.userId,
    isActive: true
  });

  if (!group) {
    throw new ApiError(404, 'Group not found');
  }

  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Soft delete group
    group.isActive = false;
    await group.save({ session });

    // Soft delete all expenses in the group
    const result = await Expense.updateMany(
      {
        groupId: id,
        ownerId: req.session.userId,
        isDeleted: false
      },
      { isDeleted: true },
      { session }
    );

    await session.commitTransaction();

    logger.info(`Group deleted: ${group._id}, ${result.modifiedCount} expenses marked as deleted`);

    res.json({
      message: 'Group deleted successfully',
      deletedExpenses: result.modifiedCount
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

/**
 * Add participant to group
 */
export const addParticipant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, color, avatar } = req.body;

  const group = await Group.findOne({
    _id: id,
    ownerId: req.session.userId,
    isActive: true
  });

  if (!group) {
    throw new ApiError(404, 'Group not found');
  }

  if (group.participants.length >= 4) {
    throw new ApiError(400, 'Group is already at maximum capacity (4 participants)');
  }

  group.participants.push({
    name,
    color: color || '#6b7280',
    avatar: avatar || 'default',
    isOwner: false
  });

  await group.save();

  logger.info(`Participant added to group ${group._id}`);

  res.json(group);
});

/**
 * Remove participant from group
 */
export const removeParticipant = asyncHandler(async (req, res) => {
  const { id, participantId } = req.params;

  const group = await Group.findOne({
    _id: id,
    ownerId: req.session.userId,
    isActive: true
  });

  if (!group) {
    throw new ApiError(404, 'Group not found');
  }

  const participant = group.participants.id(participantId);

  if (!participant) {
    throw new ApiError(404, 'Participant not found');
  }

  if (participant.isOwner) {
    throw new ApiError(400, 'Cannot remove group owner');
  }

  // Start transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Remove participant
    group.participants.pull(participantId);
    await group.save({ session });

    // Handle expenses
    const expenses = await Expense.find({
      ownerId: req.session.userId,
      groupId: group._id,
      isDeleted: false
    }).session(session);

    for (const expense of expenses) {
      expense.splits = expense.splits.filter((s) => s.participantId !== participantId);

      if (expense.payerId === participantId) {
        expense.payerId = group.participants[0]._id.toString();
      }

      if (expense.splits.length === 0) {
        expense.isDeleted = true;
      } else {
        expense.amount = expense.splits.reduce((sum, s) => sum + s.amount, 0);
      }

      await expense.save({ session });
    }

    await session.commitTransaction();

    logger.info(`Participant ${participantId} removed from group ${group._id}`);

    res.json(group);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});