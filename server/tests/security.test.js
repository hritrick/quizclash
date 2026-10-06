import request from 'supertest';
import { createApp } from '../src/app.js';
import { setupTestDB } from './setup.js';
import { User } from '../src/models/User.js';
import { Question } from '../src/models/Question.js';

describe('REST security regressions', () => {
  setupTestDB();
  const app = createApp();
  const signup = (name, role = 'host') => request(app).post('/api/v1/auth/register').send({ username: name, email: `${name}@example.invalid`, password: 'Disposable123!', role });
  const createQuiz = (token, title) => request(app).post('/api/v1/quizzes').set('Authorization', `Bearer ${token}`).send({ title, category: 'General Knowledge', questions: [{ text: 'Which answer is correct?', options: ['One', 'Two', 'Three', 'Four'], correctIndex: 0, explanation: 'One is the answer' }] });

  test('public signup rejects admin and alternate malformed roles without creating users', async () => {
    for (const role of ['admin', 'ADMIN', { role: 'admin' }]) {
      const res = await signup('RejectedAdmin', role);
      expect(res.status).toBe(400);
    }
    expect(await User.countDocuments()).toBe(0);
    const player = await request(app).post('/api/v1/auth/register').send({ username: 'DefaultPlayer', email: 'player@example.invalid', password: 'Disposable123!' });
    expect(player.status).toBe(201);
    expect(player.body.data.user.role).toBe('player');
    const host = await signup('AllowedHost');
    expect(host.status).toBe(201);
    expect(host.body.data.user.role).toBe('host');
    expect((await request(app).get('/api/v1/admin/overview').set('Authorization', `Bearer ${host.body.data.accessToken}`)).status).toBe(403);
  });

  test('public details withhold answers while internal authoring retains them', async () => {
    const host = await signup('QuizAuthor');
    const created = await createQuiz(host.body.data.accessToken, 'Answer boundary');
    expect(created.body.data.quiz.questionIds[0].correctIndex).toBe(0);
    const detail = await request(app).get(`/api/v1/quizzes/${created.body.data.quiz._id}`);
    expect(detail.status).toBe(200);
    const question = detail.body.data.quiz.questionIds[0];
    expect(question.correctIndex).toBeUndefined();
    expect(question.explanation).toBeUndefined();
    expect(question.options).toHaveLength(4);
  });

  test('question deletion is scoped to its authorized parent quiz', async () => {
    const authorA = await signup('AuthorA');
    const authorB = await signup('AuthorB');
    const token = authorA.body.data.accessToken;
    const quizA = (await createQuiz(token, 'Quiz A')).body.data.quiz;
    const quizB = (await createQuiz(authorB.body.data.accessToken, 'Quiz B')).body.data.quiz;
    const victimQuestion = quizB.questionIds[0]._id;
    const denied = await request(app).delete(`/api/v1/quizzes/${quizA._id}/questions/${victimQuestion}`).set('Authorization', `Bearer ${token}`);
    expect(denied.status).toBe(404);
    expect(await Question.findById(victimQuestion)).not.toBeNull();
    const valid = await request(app).delete(`/api/v1/quizzes/${quizA._id}/questions/${quizA.questionIds[0]._id}`).set('Authorization', `Bearer ${token}`);
    expect(valid.status).toBe(200);
  });

  test('refresh rotation changes token even within one second and rejects reuse', async () => {
    const agent = request.agent(app);
    const registered = await agent.post('/api/v1/auth/register').send({ username: 'RefreshPlayer', email: 'refresh@example.invalid', password: 'Disposable123!' });
    const cookie = registered.headers['set-cookie'][0].split(';')[0];
    const first = await agent.post('/api/v1/auth/refresh').send({});
    expect(first.status).toBe(200);
    expect(first.headers['set-cookie'][0].split(';')[0]).not.toBe(cookie);
    const replay = await request(app).post('/api/v1/auth/refresh').set('Cookie', cookie).send({});
    expect(replay.status).toBe(403);
  });

  test('simultaneous refresh replay cannot rotate the same token twice', async () => {
    const registered = await signup('ConcurrentRefresh', 'player');
    const cookie = registered.headers['set-cookie'][0].split(';')[0];
    const responses = await Promise.all([0, 1].map(() => request(app).post('/api/v1/auth/refresh').set('Cookie', cookie).send({})));
    expect(responses.map((response) => response.status).sort()).toEqual([200, 403]);
  });
});
