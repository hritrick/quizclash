import { createApp } from '../server/src/app.js';
import { connectDB } from '../server/src/config/db.js';

const app = createApp();
let databaseConnection;

// A catch-all Vercel Function lets Express retain its existing /api/v1 routes.
// The promise is cached for warm invocations so concurrent requests share one
// initial MongoDB connection.
const ensureDatabaseConnection = () => {
  if (!databaseConnection) {
    databaseConnection = connectDB().catch((error) => {
      databaseConnection = undefined;
      throw error;
    });
  }

  return databaseConnection;
};

export default async function handler(req, res) {
  try {
    await ensureDatabaseConnection();
    return app(req, res);
  } catch {
    return res.status(503).json({
      success: false,
      error: {
        code: 'DATABASE_UNAVAILABLE',
        message: 'The QuizClash database is temporarily unavailable.',
      },
    });
  }
}
