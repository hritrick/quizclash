import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { GameEngine } from '../services/gameEngine.js';
import { registerRoomHandlers } from './roomHandlers.js';
import { registerGameHandlers } from './gameHandlers.js';
import { User } from '../models/User.js';

export const initSocketServer = (io) => {
  const gameEngine = new GameEngine(io);

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1] ||
        socket.handshake.query?.token;

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('username avatarSeed role');
      if (!user) return next(new Error('User no longer exists'));
      socket.user = { id: user.id, username: user.username, avatarSeed: user.avatarSeed, role: user.role };
      next();
    } catch (err) {
      logger.warn(`Socket authentication failed: ${err.message}`);
      next(new Error('Unauthorized socket connection'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`⚡ Socket connected: ${socket.id} (User: ${socket.user.username})`);

    // Register modular event handlers
    registerRoomHandlers(io, socket, gameEngine);
    registerGameHandlers(io, socket, gameEngine);

    socket.on('disconnect', async () => {
      logger.info(`🔌 Socket disconnected: ${socket.id} (${socket.user.username})`);
      await gameEngine.handlePlayerDisconnect(socket.id);
    });
  });

  return { io, gameEngine };
};
