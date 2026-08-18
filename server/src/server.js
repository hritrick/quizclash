import http from 'http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { initSocketServer } from './sockets/socketManager.js';

const startServer = async () => {
  try {
    await connectDB();

    const app = createApp();
    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: [
          env.CLIENT_URL,
          'http://localhost:5173',
          'http://localhost:3000',
          'http://127.0.0.1:5173',
        ],
        credentials: true,
      },
      pingTimeout: 30000,
      pingInterval: 10000,
    });

    const { gameEngine } = initSocketServer(io);

    const PORT = env.PORT || 5000;
    server.listen(PORT, () => {
      logger.info(`🚀 QuizClash Server running in ${env.NODE_ENV} mode on port ${PORT}`);
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error(`Fatal error starting server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
