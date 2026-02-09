import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export async function register(req, res) {
  const { email, password, name } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' });

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: 'Email already in use' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, name });
  req.session.userId = user._id.toString();
  req.session.userName = user.name;

  res.status(201).json({ id: user._id, email: user.email, name: user.name });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  req.session.userId = user._id.toString();
  req.session.userName = user.name;
  res.json({ id: user._id, email: user.email, name: user.name });
}

export function me(req, res) {
  if (!req.session?.userId) return res.status(401).json({ error: 'Unauthorized' });
  res.json({ id: req.session.userId, name: req.session.userName });
}

export function logout(req, res) {
  req.session.destroy(() => res.json({ ok: true }));
}
