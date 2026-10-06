import { customAlphabet } from 'nanoid';
import { Room } from '../models/Room.js';
import { Quiz } from '../models/Quiz.js';

const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);

export const createRoom = async (req, res, next) => {
  try {
    const { quizId, mode = 'multiplayer' } = req.body;

    const quiz = await Quiz.findById(quizId).populate('questionIds');
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Quiz not found' },
      });
    }

    if (!quiz.questionIds || quiz.questionIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'EMPTY_QUIZ', message: 'Quiz has no questions' },
      });
    }

    // Generate unique 6-character room code
    let code = nanoid();
    let existing = await Room.findOne({ code });
    while (existing) {
      code = nanoid();
      existing = await Room.findOne({ code });
    }

    const room = await Room.create({
      code,
      quizId: quiz._id,
      hostId: req.user._id,
      mode,
      status: 'lobby',
      players: [
        {
          userId: req.user._id,
          username: req.user.username,
          avatarSeed: req.user.avatarSeed,
          score: 0,
          connected: true,
          powerupsUsed: { fiftyFifty: false, doublePoints: false, freeze: false },
        },
      ],
      spectatorIds: [],
      currentQuestionIndex: -1,
    });

    const populatedRoom = await Room.findById(room._id)
      .populate('hostId', 'username avatarSeed')
      .populate('quizId', 'title category difficulty coverGradient questionIds');

    res.status(201).json({
      success: true,
      data: {
        room: populatedRoom,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRoomByCode = async (req, res, next) => {
  try {
    const { code } = req.params;
    const room = await Room.findOne({ code: code.toUpperCase() })
      .populate('hostId', 'username avatarSeed')
      .populate('quizId', 'title category difficulty coverGradient questionIds');

    if (!room) {
      return res.status(404).json({
        success: false,
        error: { code: 'ROOM_NOT_FOUND', message: 'Room not found' },
      });
    }

    res.status(200).json({
      success: true,
      data: { room },
    });
  } catch (error) {
    next(error);
  }
};

export const joinRoom = async (req, res, next) => {
  try {
    const { code } = req.params;
    const room = await Room.findOne({ code: code.toUpperCase() })
      .populate('hostId', 'username avatarSeed')
      .populate('quizId', 'title category difficulty coverGradient questionIds');

    if (!room) {
      return res.status(404).json({
        success: false,
        error: { code: 'ROOM_NOT_FOUND', message: 'Room not found' },
      });
    }

    if (room.mode === 'solo' && room.hostId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: { code: 'PRIVATE_ROOM', message: 'Solo rooms are private' } });
    }

    if (room.status === 'finished') {
      return res.status(400).json({
        success: false,
        error: { code: 'ROOM_FINISHED', message: 'This game has already ended' },
      });
    }

    const existingPlayerIndex = room.players.findIndex(
      (p) => p.userId.toString() === req.user._id.toString()
    );

    if (existingPlayerIndex === -1) {
      if (room.status === 'in_progress') {
        // Can join as spectator
        if (!room.spectatorIds.some((id) => id.toString() === req.user._id.toString())) {
          room.spectatorIds.push(req.user._id);
          await room.save();
        }
        return res.status(200).json({
          success: true,
          data: {
            room,
            isSpectator: true,
          },
        });
      }

      room.players.push({
        userId: req.user._id,
        username: req.user.username,
        avatarSeed: req.user.avatarSeed,
        score: 0,
        connected: true,
        powerupsUsed: { fiftyFifty: false, doublePoints: false, freeze: false },
      });
      await room.save();
    } else {
      room.players[existingPlayerIndex].connected = true;
      await room.save();
    }

    res.status(200).json({
      success: true,
      data: {
        room,
        isSpectator: false,
      },
    });
  } catch (error) {
    next(error);
  }
};
