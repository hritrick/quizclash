import { logger } from '../config/logger.js';

export const registerGameHandlers = (io, socket, gameEngine) => {
  // Host triggers game start
  socket.on('host:start', async ({ code }) => {
    try {
      const roomCode = (code || socket.roomCode)?.toUpperCase();
      if (!roomCode) {
        socket.emit('error', { code: 'INVALID_CODE', message: 'Room code missing' });
        return;
      }

      await gameEngine.startGame(roomCode, socket.user.id);
      logger.info(`Game started in room ${roomCode} by host ${socket.user.username}`);
    } catch (err) {
      logger.error(`Error in host:start handler: ${err.message}`);
      socket.emit('error', { code: 'START_ERROR', message: err.message });
    }
  });

  // Player submits answer to current question
  socket.on('answer:submit', async (payload) => {
    try {
      const roomCode = (payload.code || socket.roomCode)?.toUpperCase();
      if (!roomCode) {
        socket.emit('error', { code: 'INVALID_CODE', message: 'Room code missing' });
        return;
      }

      await gameEngine.submitAnswer(roomCode, socket.user.id, {
        questionIndex: payload.questionIndex,
        optionIndex: payload.optionIndex,
        clientTimestamp: payload.clientTimestamp || Date.now(),
      });
    } catch (err) {
      logger.error(`Error in answer:submit handler: ${err.message}`);
      socket.emit('error', { code: 'ANSWER_ERROR', message: err.message });
    }
  });

  // Player uses a power-up (fiftyFifty, doublePoints, freeze)
  socket.on('powerup:use', async ({ type, targetUserId, code }) => {
    try {
      const roomCode = (code || socket.roomCode)?.toUpperCase();
      if (!roomCode) {
        socket.emit('error', { code: 'INVALID_CODE', message: 'Room code missing' });
        return;
      }

      await gameEngine.usePowerup(roomCode, socket.user.id, {
        type,
        targetUserId,
      });

      logger.info(`Power-up ${type} used by ${socket.user.username} in room ${roomCode}`);
    } catch (err) {
      logger.error(`Error in powerup:use handler: ${err.message}`);
      socket.emit('error', { code: 'POWERUP_ERROR', message: err.message });
    }
  });
};
