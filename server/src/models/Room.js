import mongoose from 'mongoose';

const playerSubSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    avatarSeed: {
      type: String,
      default: 'default',
    },
    score: {
      type: Number,
      default: 0,
    },
    connected: {
      type: Boolean,
      default: true,
    },
    socketId: {
      type: String,
      default: null,
    },
    powerupsUsed: {
      fiftyFifty: { type: Boolean, default: false },
      doublePoints: { type: Boolean, default: false },
      freeze: { type: Boolean, default: false },
    },
    correctCount: { type: Number, default: 0 },
    frozenUntil: {
      type: Number,
      default: 0,
    },
    hasAnsweredCurrent: {
      type: Boolean,
      default: false,
    },
    lastAnswerCorrect: {
      type: Boolean,
      default: false,
    },
    lastAnswerPoints: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 6,
      maxlength: 6,
      index: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['lobby', 'in_progress', 'finished'],
      default: 'lobby',
    },
    mode: {
      type: String,
      enum: ['multiplayer', 'solo'],
      default: 'multiplayer',
    },
    players: [playerSubSchema],
    spectatorIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    currentQuestionIndex: {
      type: Number,
      default: -1,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    finishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Room = mongoose.model('Room', roomSchema);
