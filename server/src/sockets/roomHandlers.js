import { logger } from '../config/logger.js';

export const registerRoomHandlers = (io, socket, gameEngine) => {
  // Join a room lobby or game
  socket.on('room:join', async ({ code, isSpectator = false }) => {
    try {
      if (!code) {
        socket.emit('error', { code: 'INVALID_CODE', message: 'Room code is required' });
        return;
      }

      const roomCode = code.toUpperCase();
      socket.join(roomCode);
      socket.roomCode = roomCode;

      const user = socket.user;
      const { isSpectator: spectatorStatus, state } = await gameEngine.handlePlayerConnect(
        roomCode,
        user.id,
        user.username,
        user.avatarSeed,
        socket.id,
        isSpectator
      );

      socket.emit('room:joined', {
        roomCode,
        isSpectator: spectatorStatus,
        state,
      });

      logger.info(`User ${user.username} (${user.id}) joined room ${roomCode} [Spectator: ${spectatorStatus}]`);
    } catch (err) {
      logger.error(`Error in room:join handler: ${err.message}`);
      socket.emit('error', { code: 'JOIN_ERROR', message: err.message });
    }
  });

  // Leave a room
  socket.on('room:leave', async () => {
    if (socket.roomCode) {
      socket.leave(socket.roomCode);
      await gameEngine.handlePlayerDisconnect(socket.id);
      socket.roomCode = null;
    }
  });

  // Join as spectator explicitly
  socket.on('spectate:join', async ({ code }) => {
    try {
      if (!code) return;
      const roomCode = code.toUpperCase();
      socket.join(roomCode);
      socket.roomCode = roomCode;

      const user = socket.user;
      const { isSpectator, state } = await gameEngine.handlePlayerConnect(
        roomCode,
        user.id,
        user.username,
        user.avatarSeed,
        socket.id,
        true
      );

      socket.emit('room:joined', {
        roomCode,
        isSpectator: true,
        state,
      });
    } catch (err) {
      socket.emit('error', { code: 'SPECTATE_ERROR', message: err.message });
    }
  });
};
