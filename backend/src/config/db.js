import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const options = {
  maxPoolSize: 10,
  minPoolSize: 5,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
  family: 4
};

export async function connectDB(uri) {
  if (!uri) {
    throw new Error('MONGODB_URI is required');
  }

  try {
    await mongoose.connect(uri, options);
    logger.info('MongoDB connected successfully');

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    throw error;
  }
}

export function isConnected() {
  return mongoose.connection.readyState === 1;
}