import Expense from '../models/Expense.js';
import Group from '../models/Group.js';
import { computeBalances } from '../services/balanceService.js';
import { normalizeSplit } from '../utils/money.js';

export async function listExpenses(req, res) {
  const { groupId, q, participant, minAmount, maxAmount, fromDate, toDate } = req.query;
  const query = { ownerId: req.session.userId };
  if (groupId) query.groupId = groupId;
  if (q) query.description = { $regex: q, $options: 'i' };
  if (participant) query['splits.participantId'] = participant;
  if (minAmount || maxAmount) query.amount = { ...(minAmount && { $gte: Number(minAmount) }), ...(maxAmount && { $lte: Number(maxAmount) }) };
  if (fromDate || toDate) query.date = { ...(fromDate && { $gte: new Date(fromDate) }), ...(toDate && { $lte: new Date(toDate) }) };

  const expenses = await Expense.find(query).sort({ date: -1, createdAt: -1 });
  res.json(expenses);
}

export async function createExpense(req, res) {
  const { groupId, amount, description, date, payerId, splitMode, selectedParticipants, customValues, category } = req.body;
  const group = await Group.findOne({ _id: groupId, ownerId: req.session.userId });
  if (!group) return res.status(404).json({ error: 'Group not found' });

  const participantIds = selectedParticipants?.length
    ? selectedParticipants
    : group.participants.map((p) => p._id.toString());

  const splits = normalizeSplit({ amount, splitMode, participantIds, customValues });
  const expense = await Expense.create({ groupId, ownerId: req.session.userId, amount, description, date, payerId, splitMode, splits, category });
  res.status(201).json(expense);
}

export async function updateExpense(req, res) {
  const { id } = req.params;
  const expense = await Expense.findOne({ _id: id, ownerId: req.session.userId });
  if (!expense) return res.status(404).json({ error: 'Not found' });

  const { amount, splitMode, selectedParticipants, customValues } = req.body;
  if (amount !== undefined && splitMode && selectedParticipants?.length) {
    const splits = normalizeSplit({ amount, splitMode, participantIds: selectedParticipants, customValues });
    expense.splits = splits;
    expense.amount = Number(amount);
    expense.splitMode = splitMode;
  }

  Object.assign(expense, req.body);
  await expense.save();
  res.json(expense);
}

export async function deleteExpense(req, res) {
  const { id } = req.params;
  const expense = await Expense.findOneAndDelete({ _id: id, ownerId: req.session.userId });
  if (!expense) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
}

export async function groupBalances(req, res) {
  const { groupId } = req.params;
  const expenses = await Expense.find({ ownerId: req.session.userId, groupId });
  res.json(computeBalances(expenses));
}

