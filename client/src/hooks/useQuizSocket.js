import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { connectSocket, getSocket, disconnectSocket } from '../lib/socket';
import { useAuth } from './useAuth';
import {
  setRoomData,
  updatePlayers,
  setRoomStatus,
  setRoomError,
} from '../features/room/roomSlice';
import {
  questionStart,
  answerAck,
  questionEnd,
  gameFinished,
  applyPowerup,
  setFrozen,
  syncGameState,
} from '../features/game/gameSlice';
import { sounds } from '../lib/sound';

export const useQuizSocket = (roomCode, isSpectator = false) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const game = useSelector((state) => state.game);

  useEffect(() => {
    if (!roomCode || !user) return;

    const socket = connectSocket();

    // Join room when connected
    const handleConnect = () => {
      socket.emit(isSpectator ? 'spectate:join' : 'room:join', {
        code: roomCode,
        isSpectator,
      });
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.on('connect', handleConnect);
    }

    // Room Events
    socket.on('room:joined', (data) => {
      if (data.state) {
        dispatch(
          setRoomData({
            room: {
              code: data.roomCode,
              quizId: { title: data.state.quizTitle, category: data.state.category },
              hostId: data.state.hostId,
              status: data.state.status,
              mode: data.state.mode,
              players: data.state.scoreboard,
            },
            isSpectator: data.isSpectator,
          })
        );
        dispatch(syncGameState(data.state));
      }
    });

    socket.on('room:playerJoined', (data) => {
      dispatch(updatePlayers(data));
    });

    socket.on('room:playerLeft', (data) => {
      dispatch(updatePlayers(data));
    });

    // Game Events
    socket.on('game:questionStart', (data) => {
      dispatch(questionStart(data));
      dispatch(setRoomStatus('in_progress'));
    });

    socket.on('game:answerAck', (data) => {
      dispatch(answerAck(data));
      if (data.isCorrect) {
        sounds.playCorrect();
      } else {
        sounds.playWrong();
      }
    });

    socket.on('game:questionEnd', (data) => {
      dispatch(questionEnd(data));
      const myResult = data.perPlayerResult?.find((p) => p.userId === user.id);
      if (myResult && myResult.answered) {
        if (myResult.isCorrect) sounds.playCorrect();
        else sounds.playWrong();
      }
    });

    socket.on('game:finished', (data) => {
      dispatch(gameFinished(data));
      dispatch(setRoomStatus('finished'));
      sounds.playFanfare();
    });

    socket.on('powerup:applied', (data) => {
      dispatch(applyPowerup(data));

      if (data.type === 'freeze') {
        sounds.playFreeze();
        if (data.targetUserId === user.id) {
          dispatch(setFrozen(Date.now() + (data.durationMs || 4000)));
        }
      }
    });

    socket.on('error', (err) => {
      dispatch(setRoomError(err.message || 'Game error occurred'));
    });

    return () => {
      socket.off('connect', handleConnect);
      socket.off('room:joined');
      socket.off('room:playerJoined');
      socket.off('room:playerLeft');
      socket.off('game:questionStart');
      socket.off('game:answerAck');
      socket.off('game:questionEnd');
      socket.off('game:finished');
      socket.off('powerup:applied');
      socket.off('error');
      socket.emit('room:leave');
    };
  }, [roomCode, isSpectator, user, dispatch]);

  const startGame = useCallback(() => {
    const socket = getSocket();
    if (socket) {
      socket.emit('host:start', { code: roomCode });
    }
  }, [roomCode]);

  const submitAnswer = useCallback(
    (questionIndex, optionIndex) => {
      const socket = getSocket();
      if (socket) {
        sounds.playClick();
        socket.emit('answer:submit', {
          code: roomCode,
          questionIndex,
          optionIndex,
          clientTimestamp: Date.now(),
        });
      }
    },
    [roomCode]
  );

  const usePowerup = useCallback(
    (type, targetUserId = null) => {
      const socket = getSocket();
      if (socket) {
        sounds.playClick();
        socket.emit('powerup:use', {
          code: roomCode,
          type,
          targetUserId,
        });
      }
    },
    [roomCode]
  );

  return {
    startGame,
    submitAnswer,
    usePowerup,
  };
};
