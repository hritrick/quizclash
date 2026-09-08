import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

export const connectDB = async (customUri = null) => {
  const uri = customUri || env.MONGO_URI;

  // Serverless functions can handle multiple requests in a warm instance. Reuse
  // its existing Mongoose connection instead of opening one for every request.
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(uri);
    logger.info(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
};
