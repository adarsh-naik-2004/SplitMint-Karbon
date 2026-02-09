import logger from '../utils/logger.js';
import User from '../models/User.js';

/**
 * Middleware to require authentication
 */
export function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Please log in to access this resource'
    });
  }
  next();
}

/**
 * Middleware to attach user to request if authenticated
 */
export async function attachUser(req, res, next) {
  if (req.session?.userId) {
    try {
      const user = await User.findById(req.session.userId).select('-passwordHash');
      if (user && user.isActive) {
        req.user = user;
      } else {
        // User not found or inactive, clear session
        req.session.destroy();
      }
    } catch (error) {
      logger.error('Error attaching user:', error);
    }
  }
  next();
}

/**
 * Middleware to check if user is active
 */
export async function requireActiveUser(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Please log in to access this resource'
    });
  }

  try {
    const user = await User.findById(req.session.userId);

    if (!user) {
      req.session.destroy();
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Account is deactivated'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Error checking user status:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to verify user status'
    });
  }
}

/**
 * Middleware to validate session
 */
export function validateSession(req, res, next) {
  if (req.session && req.session.userId) {
    // Extend session on activity
    req.session.touch();
  }
  next();
}