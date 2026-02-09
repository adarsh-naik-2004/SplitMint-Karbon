import Group from '../models/Group.js';
import Expense from '../models/Expense.js';

function normalizeParticipants(owner, participants = []) {
  return [owner, ...participants].slice(0, 4);
}

export async function listGroups(req, res) {
  const groups = await Group.find({ ownerId: req.session.userId }).sort({ createdAt: -1 });
  res.json(groups);
}

export async function createGroup(req, res) {
  const { name, participants = [] } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  if (participants.length > 3) return res.status(400).json({ error: 'Max 3 additional participants' });

  const owner = { name: req.session.userName, color: '#2d6cdf', avatar: 'owner' };
  const group = await Group.create({
    name,
    ownerId: req.session.userId,
    participants: normalizeParticipants(owner, participants)
  });
  res.status(201).json(group);
}

export async function updateGroup(req, res) {
  const { id } = req.params;
  const { name, participants } = req.body;
  const group = await Group.findOne({ _id: id, ownerId: req.session.userId });
  if (!group) return res.status(404).json({ error: 'Not found' });

  group.name = name ?? group.name;

  if (Array.isArray(participants)) {
    if (participants.length > 3) return res.status(400).json({ error: 'Max 3 additional participants' });

    const currentOwner = group.participants[0];
    const owner = {
      _id: currentOwner?._id,
      name: req.session.userName,
      color: currentOwner?.color || '#2d6cdf',
      avatar: currentOwner?.avatar || 'owner'
    };

    const nextParticipants = normalizeParticipants(owner, participants);
    const removedIds = new Set(
      group.participants
        .map((p) => p._id.toString())
        .filter((idValue) => !nextParticipants.some((p) => p._id?.toString() === idValue))
    );

    group.participants = nextParticipants;
    await group.save();

    if (removedIds.size > 0) {
      const expenses = await Expense.find({ ownerId: req.session.userId, groupId: group._id });
      for (const exp of expenses) {
        exp.splits = exp.splits.filter((s) => !removedIds.has(s.participantId));
        if (removedIds.has(exp.payerId)) {
          exp.payerId = group.participants[0]._id.toString();
        }
        if (exp.splits.length === 0) {
          await Expense.deleteOne({ _id: exp._id });
          continue;
        }
        exp.amount = exp.splits.reduce((acc, s) => acc + s.amount, 0);
        await exp.save();
      }
    }
  } else {
    await group.save();
  }

  res.json(group);
}

export async function deleteGroup(req, res) {
  const { id } = req.params;
  const group = await Group.findOneAndDelete({ _id: id, ownerId: req.session.userId });
  if (!group) return res.status(404).json({ error: 'Not found' });
  await Expense.deleteMany({ groupId: id, ownerId: req.session.userId });
  res.json({ ok: true });
}
