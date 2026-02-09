import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

/**
 * Register a new user
 */
export const register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'Email already registered');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create user
  const user = await User.create({
    email,
    passwordHash,
    name
  });

  // Set session
  req.session.userId = user._id.toString();
  req.session.userName = user.name;

  logger.info(`New user registered: ${user.email}`);

  res.status(201).json({
    id: user._id,
    email: user.email,
    name: user.name
  });
});

/**
 * Login user
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new ApiError(403, 'Account is deactivated');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Set session
  req.session.userId = user._id.toString();
  req.session.userName = user.name;

  logger.info(`User logged in: ${user.email}`);

  res.json({
    id: user._id,
    email: user.email,
    name: user.name
  });
});

/**
 * Get current user
 */
export const me = asyncHandler(async (req, res) => {
  if (!req.session?.userId) {
    throw new ApiError(401, 'Not authenticated');
  }

  const user = await User.findById(req.session.userId).select('-passwordHash');

  if (!user) {
    // Clear invalid session
    req.session.destroy();
    throw new ApiError(401, 'User not found');
  }

  res.json({
    id: user._id,
    email: user.email,
    name: user.name,
    isActive: user.isActive,
    createdAt: user.createdAt
  });
});

/**
 * Logout user
 */
export const logout = asyncHandler(async (req, res) => {
  const userId = req.session?.userId;

  req.session.destroy((err) => {
    if (err) {
      logger.error('Session destruction error:', err);
      throw new ApiError(500, 'Logout failed');
    }

    if (userId) {
      logger.info(`User logged out: ${userId}`);
    }

    res.json({ message: 'Logged out successfully' });
  });
});

/**
 * Update user profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!req.session?.userId) {
    throw new ApiError(401, 'Not authenticated');
  }

  const user = await User.findById(req.session.userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (name) {
    user.name = name;
    req.session.userName = name;
  }

  await user.save();

  res.json({
    id: user._id,
    email: user.email,
    name: user.name
  });
});

/**
 * Change password
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!req.session?.userId) {
    throw new ApiError(401, 'Not authenticated');
  }

  const user = await User.findById(req.session.userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  // Hash new password
  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();

  logger.info(`Password changed for user: ${user.email}`);

  res.json({ message: 'Password changed successfully' });
});