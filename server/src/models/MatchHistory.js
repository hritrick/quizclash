import mongoose from 'mongoose';

const matchPlayerSchema = new mongoose.Schema(
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
    avatarSeed: String,
    score: {
      type: Number,
      required: true,
      default: 0,
    },
    rank: {
      type: Number,
      required: true,
      default: 1,
    },
    correctCount: {
      type: Number,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    powerupsUsed: {
      fiftyFifty: Boolean,
      doublePoints: Boolean,
      freeze: Boolean,
    },
  },
  { _id: false }
);

const matchHistorySchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    roomCode: {
      type: String,
      required: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    quizTitle: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: 'General Knowledge',
    },
    mode: {
      type: String,
      enum: ['multiplayer', 'solo'],
      default: 'multiplayer',
    },
    players: [matchPlayerSchema],
    totalQuestions: {
      type: Number,
      default: 0,
    },
    playedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const MatchHistory = mongoose.model('MatchHistory', matchHistorySchema);
