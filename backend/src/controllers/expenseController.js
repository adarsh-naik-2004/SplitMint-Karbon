import Expense from '../models/Expense.js';
import Group from '../models/Group.js';
import { computeBalances, getParticipantStats } from '../services/balanceService.js';
import { normalizeSplit } from '../utils/money.js';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

/**
 * List expenses with advanced filtering
 */
export const listExpenses = asyncHandler(async (req, res) => {
  const { groupId, q, participant, minAmount, maxAmount, fromDate, toDate, category, limit = 100, skip = 0 } = req.query;

  const query = {
    ownerId: req.session.userId,
    isDeleted: false
  };

  // Filter by group
  if (groupId) {
    query.groupId = groupId;
  }

  // Search by description
  if (q) {
    query.description = { $regex: q, $options: 'i' };
  }

  // Filter by participant
  if (participant) {
    query.$or = [{ payerId: participant }, { 'splits.participantId': participant }];
  }

  // Filter by amount range
  if (minAmount || maxAmount) {
    query.amount = {};
    if (minAmount) query.amount.$gte = Number(minAmount);
    if (maxAmount) query.amount.$lte = Number(maxAmount);
  }

  // Filter by date range
  if (fromDate || toDate) {
    query.date = {};
    if (fromDate) query.date.$gte = new Date(fromDate);
    if (toDate) query.date.$lte = new Date(toDate);
  }

  // Filter by category
  if (category) {
    query.category = category;
  }

  const expenses = await Expense.find(query)
    .sort({ date: -1, createdAt: -1 })
    .limit(Number(limit))
    .skip(Number(skip));

  const total = await Expense.countDocuments(query);

  res.json({
    expenses,
    pagination: {
      total,
      limit: Number(limit),
      skip: Number(skip),
      hasMore: total > Number(skip) + expenses.length
    }
  });
});

/**
 * Get a single expense by ID
 */
export const getExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const expense = await Expense.findOne({
    _id: id,
    ownerId: req.session.userId,
    isDeleted: false
  });

  if (!expense) {
    throw new ApiError(404, 'Expense not found');
  }

  res.json(expense);
});

/**
 * Create a new expense
 */
export const createExpense = asyncHandler(async (req, res) => {
  const { groupId, amount, description, date, payerId, splitMode, selectedParticipants, customValues, category, notes } =
    req.body;

  // Verify group ownership
  const group = await Group.findOne({
    _id: groupId,
    ownerId: req.session.userId,
    isActive: true
  });

  if (!group) {
    throw new ApiError(404, 'Group not found');
  }

  // Determine participants
  const participantIds = selectedParticipants?.length
    ? selectedParticipants
    : group.participants.map((p) => p._id.toString());

  // Verify payer is a participant
  if (!participantIds.includes(payerId) && payerId !== group.participants[0]._id.toString()) {
    throw new ApiError(400, 'Payer must be a participant in the group');
  }

  // Validate participants exist in group
  const validParticipantIds = group.participants.map((p) => p._id.toString());
  const invalidParticipants = participantIds.filter((id) => !validParticipantIds.includes(id));

  if (invalidParticipants.length > 0) {
    throw new ApiError(400, `Invalid participant IDs: ${invalidParticipants.join(', ')}`);
  }

  // Calculate splits
  let splits;
  try {
    splits = normalizeSplit({
      amount,
      splitMode,
      participantIds,
      customValues
    });
  } catch (error) {
    throw new ApiError(400, error.message);
  }

  // Create expense
  const expense = await Expense.create({
    groupId,
    ownerId: req.session.userId,
    amount: Number(amount),
    description: description.trim(),
    date: new Date(date),
    payerId,
    splitMode,
    splits,
    category: category || 'uncategorized',
    notes: notes?.trim()
  });

  logger.info(`Expense created: ${expense._id} in group ${groupId}`);

  res.status(201).json(expense);
});

/**
 * Update an expense
 */
export const updateExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const expense = await Expense.findOne({
    _id: id,
    ownerId: req.session.userId,
    isDeleted: false
  });

  if (!expense) {
    throw new ApiError(404, 'Expense not found');
  }

  // Get group to validate participants
  const group = await Group.findOne({
    _id: expense.groupId,
    isActive: true
  });

  if (!group) {
    throw new ApiError(404, 'Associated group not found');
  }

  const { amount, description, date, payerId, splitMode, selectedParticipants, customValues, category, notes } = req.body;

  // Update basic fields
  if (description !== undefined) expense.description = description.trim();
  if (date !== undefined) expense.date = new Date(date);
  if (category !== undefined) expense.category = category;
  if (notes !== undefined) expense.notes = notes?.trim();

  // Update splits if amount or split configuration changed
  if (amount !== undefined || splitMode !== undefined || selectedParticipants !== undefined || customValues !== undefined) {
    const newAmount = amount !== undefined ? Number(amount) : expense.amount;
    const newSplitMode = splitMode || expense.splitMode;
    const newParticipants = selectedParticipants || expense.splits.map((s) => s.participantId);

    // Validate participants
    const validParticipantIds = group.participants.map((p) => p._id.toString());
    const invalidParticipants = newParticipants.filter((id) => !validParticipantIds.includes(id));

    if (invalidParticipants.length > 0) {
      throw new ApiError(400, `Invalid participant IDs: ${invalidParticipants.join(', ')}`);
    }

    try {
      const splits = normalizeSplit({
        amount: newAmount,
        splitMode: newSplitMode,
        participantIds: newParticipants,
        customValues
      });

      expense.amount = newAmount;
      expense.splitMode = newSplitMode;
      expense.splits = splits;
    } catch (error) {
      throw new ApiError(400, error.message);
    }
  }

  // Update payer
  if (payerId !== undefined) {
    const validParticipantIds = group.participants.map((p) => p._id.toString());
    if (!validParticipantIds.includes(payerId)) {
      throw new ApiError(400, 'Payer must be a participant in the group');
    }
    expense.payerId = payerId;
  }

  await expense.save();

  logger.info(`Expense updated: ${expense._id}`);

  res.json(expense);
});

/**
 * Delete an expense (soft delete)
 */
export const deleteExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const expense = await Expense.findOne({
    _id: id,
    ownerId: req.session.userId,
    isDeleted: false
  });

  if (!expense) {
    throw new ApiError(404, 'Expense not found');
  }

  expense.isDeleted = true;
  await expense.save();

  logger.info(`Expense deleted: ${expense._id}`);

  res.json({ message: 'Expense deleted successfully' });
});

/**
 * Get balances for a specific group
 */
export const groupBalances = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  // Verify group ownership
  const group = await Group.findOne({
    _id: groupId,
    ownerId: req.session.userId,
    isActive: true
  });

  if (!group) {
    throw new ApiError(404, 'Group not found');
  }

  // Get all expenses for the group
  const expenses = await Expense.find({
    ownerId: req.session.userId,
    groupId,
    isDeleted: false
  });

  // Compute balances
  const balances = computeBalances(expenses);

  // Enrich with participant names
  const enrichedBalances = balances.netBalances.map((balance) => {
    const participant = group.participants.id(balance.participantId);
    return {
      ...balance,
      participantName: participant?.name || 'Unknown',
      participantColor: participant?.color
    };
  });

  const enrichedSettlements = balances.settlements.map((settlement) => {
    const fromParticipant = group.participants.id(settlement.from);
    const toParticipant = group.participants.id(settlement.to);
    return {
      ...settlement,
      fromName: fromParticipant?.name || 'Unknown',
      toName: toParticipant?.name || 'Unknown'
    };
  });

  res.json({
    groupId,
    groupName: group.name,
    netBalances: enrichedBalances,
    settlements: enrichedSettlements,
    summary: balances.summary
  });
});

/**
 * Get expense statistics for a group
 */
export const groupStats = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  // Verify group ownership
  const group = await Group.findOne({
    _id: groupId,
    ownerId: req.session.userId,
    isActive: true
  });

  if (!group) {
    throw new ApiError(404, 'Group not found');
  }

  const expenses = await Expense.find({
    ownerId: req.session.userId,
    groupId,
    isDeleted: false
  });

  // Calculate statistics
  const totalExpenses = expenses.length;
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const averageExpense = totalExpenses > 0 ? totalAmount / totalExpenses : 0;

  // Category breakdown
  const categoryBreakdown = expenses.reduce((acc, exp) => {
    const category = exp.category || 'uncategorized';
    if (!acc[category]) {
      acc[category] = { count: 0, total: 0 };
    }
    acc[category].count++;
    acc[category].total += exp.amount;
    return acc;
  }, {});

  // Participant stats
  const participantStats = group.participants.map((participant) => {
    return getParticipantStats(expenses, participant._id.toString());
  });

  res.json({
    groupId,
    groupName: group.name,
    totalExpenses,
    totalAmount: Math.round(totalAmount * 100) / 100,
    averageExpense: Math.round(averageExpense * 100) / 100,
    categoryBreakdown,
    participantStats
  });
});