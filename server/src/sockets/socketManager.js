import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { GameEngine } from '../services/gameEngine.js';
import { registerRoomHandlers } from './roomHandlers.js';
import { registerGameHandlers } from './gameHandlers.js';

export const initSocketServer = (io) => {
  const gameEngine = new GameEngine(io);

  // Socket Authentication Middleware
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1] ||
        socket.handshake.query?.token;

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, env.JWT_SECRET);
      socket.user = decoded;
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
