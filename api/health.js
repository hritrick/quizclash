export default function handler(_req, res) {
  res.status(200).json({
    status: 'ok',
    service: 'QuizClash Backend API',
    timestamp: new Date().toISOString(),
  });
}
