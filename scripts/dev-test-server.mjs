// Disposable fixture server for browser and Postman verification. Never uses Atlas.
process.env.NODE_ENV = 'test';
const { MongoMemoryServer } = await import('mongodb-memory-server');
const { spawnSync } = await import('node:child_process');
const { default: http } = await import('node:http');
const { Server } = await import('socket.io');
const { createApp } = await import('../server/src/app.js');
const { connectDB, disconnectDB } = await import('../server/src/config/db.js');
const { initSocketServer } = await import('../server/src/sockets/socketManager.js');
const mongo = await MongoMemoryServer.create();
const seed = spawnSync(process.execPath, ['server/src/utils/seed.js'], { env: { ...process.env, MONGO_URI: mongo.getUri() }, encoding: 'utf8' });
if (seed.status !== 0) throw new Error(seed.stderr || 'Fixture seed failed');
await connectDB(mongo.getUri());
const server = http.createServer(createApp());
const io = new Server(server, { cors: { origin: 'http://localhost:5173', credentials: true } });
const { gameEngine } = initSocketServer(io);
server.listen(5000, '127.0.0.1', () => console.log('Disposable QuizClash test server ready on port 5000'));
const stop = async () => {
  for (const game of gameEngine.games.values()) {
    clearTimeout(game.questionTimer);
    clearTimeout(game.revealTimer);
    clearTimeout(game.cleanupTimer);
  }
  io.close();
  server.close();
  await disconnectDB();
  await mongo.stop();
  process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
