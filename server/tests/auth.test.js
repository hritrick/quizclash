import request from 'supertest';
import { createApp } from '../src/app.js';
import { setupTestDB } from './setup.js';

describe('Auth REST API Integration', () => {
  setupTestDB();
  const app = createApp();

  test('POST /api/v1/auth/register creates user and returns tokens', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'TriviaTestKing',
        email: 'test@quizclash.com',
        password: 'Password123!',
        role: 'player',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.username).toBe('TriviaTestKing');
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  test('POST /api/v1/auth/login succeeds with correct password and rejects invalid credentials', async () => {
    // 1. Register
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'LoginUser',
        email: 'login@quizclash.com',
        password: 'Password123!',
      });

    // 2. Wrong password
    const failRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'login@quizclash.com',
        password: 'WrongPassword',
      });
    expect(failRes.status).toBe(401);
    expect(failRes.body.success).toBe(false);

    // 3. Right password
    const successRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'login@quizclash.com',
        password: 'Password123!',
      });
    expect(successRes.status).toBe(200);
    expect(successRes.body.data.accessToken).toBeDefined();
  });

  test('GET /api/v1/auth/me returns 401 without token and 200 with valid Bearer token', async () => {
    const unauth = await request(app).get('/api/v1/auth/me');
    expect(unauth.status).toBe(401);

    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'MeUser',
        email: 'me@quizclash.com',
        password: 'Password123!',
      });

    const token = reg.body.data.accessToken;

    const authRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(authRes.status).toBe(200);
    expect(authRes.body.data.user.username).toBe('MeUser');
  });
});
