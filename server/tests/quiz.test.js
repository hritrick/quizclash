import request from 'supertest';
import { createApp } from '../src/app.js';
import { setupTestDB } from './setup.js';

describe('Quiz & RoleGuard REST API Integration', () => {
  setupTestDB();
  const app = createApp();

  let playerToken;
  let hostToken;

  beforeEach(async () => {
    // Create player
    const pRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'NormalPlayer',
        email: 'player@quizclash.com',
        password: 'Password123!',
        role: 'player',
      });
    playerToken = pRes.body.data.accessToken;

    // Create host
    const hRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'QuizHost',
        email: 'host@quizclash.com',
        password: 'Password123!',
        role: 'host',
      });
    hostToken = hRes.body.data.accessToken;
  });

  test('POST /api/v1/quizzes rejects player role with 403 Forbidden', async () => {
    const res = await request(app)
      .post('/api/v1/quizzes')
      .set('Authorization', `Bearer ${playerToken}`)
      .send({
        title: 'Unauthorized Quiz',
        category: 'General Knowledge',
        difficulty: 'easy',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/v1/quizzes allows host role to create a quiz with questions', async () => {
    const res = await request(app)
      .post('/api/v1/quizzes')
      .set('Authorization', `Bearer ${hostToken}`)
      .send({
        title: 'Ancient Greek Gods Quiz',
        category: 'General Knowledge',
        difficulty: 'medium',
        questions: [
          {
            text: 'Who is the Greek god of the sea and earthquakes?',
            options: ['Zeus', 'Poseidon', 'Hades', 'Apollo'],
            correctIndex: 1,
            timeLimitSec: 15,
            points: 1000,
            explanation: 'Poseidon wields the trident and rules the seas.',
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.quiz.title).toBe('Ancient Greek Gods Quiz');
    expect(res.body.data.quiz.questionIds.length).toBe(1);
  });

  test('GET /api/v1/quizzes is publicly accessible', async () => {
    const res = await request(app).get('/api/v1/quizzes');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.quizzes)).toBe(true);
  });
});
