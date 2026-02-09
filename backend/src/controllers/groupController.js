import Group from '../models/Group.js';
import Expense from '../models/Expense.js';

function withOwnerParticipant(userName, participants = []) {
  return [{ name: userName, color: '#2d6cdf', avatar: 'owner' }, ...participants].slice(0, 4);
}

export async function listGroups(req, res) {
  const groups = await Group.find({ ownerId: req.session.userId }).sort({ createdAt: -1 });
  res.json(groups);
}

export async function createGroup(req, res) {
  const { name, participants = [] } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  if (participants.length > 3) return res.status(400).json({ error: 'Max 3 additional participants' });

  const group = await Group.create({
    name,
    ownerId: req.session.userId,
    participants: withOwnerParticipant(req.session.userName, participants)
  });
  res.status(201).json(group);
}

export async function updateGroup(req, res) {
  const { id } = req.params;
  const { name, participants = [] } = req.body;
  const group = await Group.findOne({ _id: id, ownerId: req.session.userId });
  if (!group) return res.status(404).json({ error: 'Not found' });

  group.name = name ?? group.name;
  if (participants.length > 0) group.participants = withOwnerParticipant(req.session.userName, participants);
  await group.save();
  res.json(group);
}

export async function deleteGroup(req, res) {
  const { id } = req.params;
  const group = await Group.findOneAndDelete({ _id: id, ownerId: req.session.userId });
  if (!group) return res.status(404).json({ error: 'Not found' });
  await Expense.deleteMany({ groupId: id, ownerId: req.session.userId });
  res.json({ ok: true });
}
