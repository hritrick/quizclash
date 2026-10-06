import http from 'node:http';
import { Server } from 'socket.io';
import { io as connectClient } from 'socket.io-client';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { initSocketServer } from '../src/sockets/socketManager.js';
import { setupTestDB } from './setup.js';
import { MatchHistory } from '../src/models/MatchHistory.js';

const event = (socket, name, timeout = 12000) => new Promise((resolve, reject) => {
  const timer = setTimeout(() => { socket.off(name, handler); reject(new Error(`Timed out: ${name}`)); }, timeout);
  const handler = (data) => { clearTimeout(timer); resolve(data); };
  socket.once(name, handler);
});

describe('Socket.IO gameplay regressions', () => {
  setupTestDB();
  const app = createApp();
  let server, io, engine, url;
  let clients = [];
  beforeAll(async () => {
    server = http.createServer(app);
    io = new Server(server);
    engine = initSocketServer(io).gameEngine;
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    url = `http://127.0.0.1:${server.address().port}`;
  });
  afterEach(() => {
    clients.forEach((client) => client.disconnect());
    clients = [];
    for (const game of engine.games.values()) {
      clearTimeout(game.questionTimer);
      clearTimeout(game.revealTimer);
      clearTimeout(game.cleanupTimer);
    }
    engine.games.clear();
  });
  afterAll(async () => { await new Promise((resolve) => io.close(resolve)); });
  const signup = async (name, role = 'player') => {
    const response = await request(app).post('/api/v1/auth/register').send({ username: name, email: `${name}@example.invalid`, password: 'Disposable123!', role });
    return response.body.data;
  };
  const socketFor = async (user) => {
    const socket = connectClient(url, { autoConnect: false, auth: { token: user.accessToken }, transports: ['websocket'], reconnection: false });
    clients.push(socket);
    const connected = event(socket, 'connect');
    socket.connect();
    await connected;
    return socket;
  };
  const createRoom = async (host, mode) => {
    const quiz = await request(app).post('/api/v1/quizzes').set('Authorization', `Bearer ${host.accessToken}`).send({ title: 'Socket Test Quiz', category: 'General Knowledge', questions: [{ text: 'Which answer is one?', options: ['One', 'Two', 'Three', 'Four'], correctIndex: 0, timeLimitSec: 5, points: 1000 }] });
    const response = await request(app).post('/api/v1/rooms').set('Authorization', `Bearer ${host.accessToken}`).send({ quizId: quiz.body.data.quiz._id, mode });
    return response.body.data.room;
  };
  const join = async (socket, code, spectator = false) => {
    const joined = event(socket, 'room:joined');
    socket.emit(spectator ? 'spectate:join' : 'room:join', { code });
    return joined;
  };

  test('solo join starts automatically and completed results remain available on reconnect', async () => {
    const host = await signup('SoloHost', 'host');
    const room = await createRoom(host, 'solo');
    const outsider = await signup('SoloOutsider');
    const deniedJoin = await request(app).post(`/api/v1/rooms/${room.code}/join`).set('Authorization', `Bearer ${outsider.accessToken}`);
    expect(deniedJoin.status).toBe(403);
    const socket = await socketFor(host);
    const invalidJoin = event(socket, 'error');
    socket.emit('room:join', null);
    expect((await invalidJoin).code).toBe('INVALID_CODE');
    const invalidPowerup = event(socket, 'error');
    socket.emit('powerup:use', null);
    expect((await invalidPowerup).code).toBe('INVALID_CODE');
    const question = event(socket, 'game:questionStart');
    await join(socket, room.code);
    expect((await question).question.correctIndex).toBeUndefined();
    const finished = event(socket, 'game:finished');
    socket.emit('answer:submit', { code: room.code, questionIndex: 0, optionIndex: 0 });
    const result = await finished;
    expect(result.finalScoreboard[0].correctCount).toBe(1);
    expect(await MatchHistory.countDocuments({ roomCode: room.code })).toBe(1);
    clearTimeout(engine.games.get(room.code).cleanupTimer);
    engine.games.delete(room.code);
    const state = (await join(socket, room.code)).state;
    expect(state.finalScoreboard[0].correctCount).toBe(1);
    expect(state.status).toBe('finished');
    expect(state.finalScoreboard[0].score).toBeGreaterThan(0);
    const rejected = event(socket, 'error');
    socket.emit('host:start', { code: room.code });
    expect((await rejected).code).toBe('START_ERROR');
  });

  test('multiplayer power-ups, spectators, answer privacy, and reveal rejection', async () => {
    const host = await signup('MultiHost', 'host');
    const player = await signup('MultiPlayer');
    const viewer = await signup('MultiViewer');
    const room = await createRoom(host, 'multiplayer');
    const h = await socketFor(host), p = await socketFor(player), v = await socketFor(viewer);
    await Promise.all([join(h, room.code), join(p, room.code)]);
    const started = event(h, 'game:questionStart');
    h.emit('host:start', { code: room.code });
    await started;
    const spectatorJoin = await join(v, room.code, true);
    expect(spectatorJoin.isSpectator).toBe(true);
    expect(spectatorJoin.state.spectatorsCount).toBe(1);
    let applied = event(h, 'powerup:applied');
    h.emit('powerup:use', { code: room.code, type: 'fiftyFifty' });
    const removed = (await applied).removedOptions;
    expect(removed).toHaveLength(2);
    expect(removed).not.toContain(0);
    applied = event(h, 'powerup:applied');
    h.emit('powerup:use', { code: room.code, type: 'doublePoints' });
    expect((await applied).multiplier).toBe(2);
    applied = event(p, 'powerup:applied');
    h.emit('powerup:use', { code: room.code, type: 'freeze' });
    expect((await applied).targetUserId).toBe(player.user.id);
    const frozen = event(p, 'error');
    p.emit('answer:submit', { code: room.code, questionIndex: 0, optionIndex: 0 });
    expect((await frozen).message).toMatch(/frozen/);
    const ack = event(h, 'game:answerAck');
    h.emit('answer:submit', { code: room.code, questionIndex: 0, optionIndex: 0 });
    expect((await ack).pointsEarned).toBeGreaterThan(1000);
    const state = (await join(h, room.code)).state;
    expect(state.myPlayer.removedOptions).toEqual(removed);
    expect(state.myPlayer.currentAnswer.optionIndex).toBe(0);
    expect(state.scoreboard.every((entry) => entry.currentAnswer === undefined)).toBe(true);
    const reveal = await event(v, 'game:questionEnd');
    expect(reveal.correctIndex).toBe(0);
    const rejected = event(p, 'error');
    p.emit('answer:submit', { code: room.code, questionIndex: 0, optionIndex: 0 });
    expect((await rejected).message).toMatch(/closed/);
    await event(h, 'game:finished');
    expect(await MatchHistory.countDocuments({ roomCode: room.code })).toBe(1);
  });
});
