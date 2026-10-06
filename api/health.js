import { connectDB } from '../server/src/config/db.js';

export default async function handler(_req, res) {
  try {
    await connectDB();
    res.status(200).json({ status: 'ok', database: 'connected', revision: process.env.VERCEL_GIT_COMMIT_SHA || null, service: 'QuizClash Backend API', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'unavailable', database: 'disconnected' });
  }
}
