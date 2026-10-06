import { logger } from '../config/logger.js';

export const registerRoomHandlers = (io, socket, gameEngine) => {
  // Join a room lobby or game
  socket.on('room:join', async (payload) => {
    try {
      const { code, isSpectator = false } = payload || {};
      if (!code) {
        socket.emit('error', { code: 'INVALID_CODE', message: 'Room code is required' });
        return;
      }

      const roomCode = code.toUpperCase();
      const user = socket.user;
      if (socket.roomCode && socket.roomCode !== roomCode) {
        socket.leave(socket.roomCode);
        await gameEngine.handlePlayerDisconnect(socket.id);
      }
      const { isSpectator: spectatorStatus, state } = await gameEngine.handlePlayerConnect(
        roomCode,
        user.id,
        user.username,
        user.avatarSeed,
        socket.id,
        isSpectator
      );

      if (socket.roomCode && socket.roomCode !== roomCode) socket.leave(socket.roomCode);
      socket.join(roomCode);
      socket.roomCode = roomCode;

      socket.emit('room:joined', {
        roomCode,
        isSpectator: spectatorStatus,
        state,
      });

      if (state.mode === 'solo' && state.status === 'lobby' && user.id === state.hostId && !spectatorStatus) {
        await gameEngine.startGame(roomCode, user.id);
      }

      logger.info(`User ${user.username} (${user.id}) joined room ${roomCode} [Spectator: ${spectatorStatus}]`);
    } catch (err) {
      logger.error(`Error in room:join handler: ${err.message}`);
      socket.emit('error', { code: 'JOIN_ERROR', message: err.message });
    }
  });

  // Leave a room
  socket.on('room:leave', async () => {
    if (socket.roomCode) {
      const roomCode = socket.roomCode;
      socket.leave(roomCode);
      await gameEngine.handlePlayerDisconnect(socket.id);
      if (socket.roomCode === roomCode) socket.roomCode = null;
    }
  });

  // Join as spectator explicitly
  socket.on('spectate:join', async (payload) => {
    try {
      const { code } = payload || {};
      if (!code) return;
      const roomCode = code.toUpperCase();
      const user = socket.user;
      if (socket.roomCode && socket.roomCode !== roomCode) {
        socket.leave(socket.roomCode);
        await gameEngine.handlePlayerDisconnect(socket.id);
      }
      const { isSpectator, state } = await gameEngine.handlePlayerConnect(
        roomCode,
        user.id,
        user.username,
        user.avatarSeed,
        socket.id,
        true
      );

      socket.join(roomCode);
      socket.roomCode = roomCode;

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
