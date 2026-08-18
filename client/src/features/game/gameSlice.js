import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentQuestion: null,
  questionIndex: -1,
  totalQuestions: 0,
  endsAt: null,
  timeLimitSec: 15,
  selectedOptionIndex: null,
  answerAcknowledged: false,
  answerResult: null, // { isCorrect, pointsEarned }
  removedOptionIndices: [],
  activeMultiplier: 1,
  frozenUntil: 0,
  freezeNotice: null,
  powerupsUsed: {
    fiftyFifty: false,
    doublePoints: false,
    freeze: false,
  },
  revealState: null, // { correctIndex, explanation, perPlayerResult, scoreboard }
  scoreboard: [],
  isFinished: false,
  finalScoreboard: [],
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    questionStart: (state, action) => {
      const { question, index, totalQuestions, endsAt, timeLimitSec, scoreboard } = action.payload;
      state.currentQuestion = question;
      state.questionIndex = index;
      state.totalQuestions = totalQuestions;
      state.endsAt = endsAt;
      state.timeLimitSec = timeLimitSec;
      state.selectedOptionIndex = null;
      state.answerAcknowledged = false;
      state.answerResult = null;
      state.removedOptionIndices = [];
      state.revealState = null;
      if (scoreboard) state.scoreboard = scoreboard;
      state.isFinished = false;
    },
    selectOption: (state, action) => {
      if (state.selectedOptionIndex === null) {
        state.selectedOptionIndex = action.payload;
      }
    },
    answerAck: (state, action) => {
      state.answerAcknowledged = true;
      state.answerResult = {
        isCorrect: action.payload.isCorrect,
        pointsEarned: action.payload.pointsEarned,
      };
    },
    questionEnd: (state, action) => {
      state.revealState = action.payload;
      state.scoreboard = action.payload.scoreboard;
    },
    gameFinished: (state, action) => {
      state.isFinished = true;
      state.finalScoreboard = action.payload.finalScoreboard;
    },
    applyPowerup: (state, action) => {
      const { type, removedOptions, multiplier, targetUserId, byUsername, targetUsername, durationMs } =
        action.payload;
      if (type === 'fiftyFifty') {
        state.powerupsUsed.fiftyFifty = true;
        state.removedOptionIndices = removedOptions || [];
      } else if (type === 'doublePoints') {
        state.powerupsUsed.doublePoints = true;
        state.activeMultiplier = multiplier || 2;
      } else if (type === 'freeze') {
        state.powerupsUsed.freeze = true;
        state.freezeNotice = {
          byUsername,
          targetUsername,
          durationMs,
        };
      }
    },
    setFrozen: (state, action) => {
      state.frozenUntil = action.payload;
    },
    clearFreezeNotice: (state) => {
      state.freezeNotice = null;
    },
    syncGameState: (state, action) => {
      const { currentQuestionIndex, totalQuestions, activeQuestion, endsAt, scoreboard, myPlayer } =
        action.payload;
      state.questionIndex = currentQuestionIndex;
      state.totalQuestions = totalQuestions;
      state.currentQuestion = activeQuestion;
      state.endsAt = endsAt;
      state.scoreboard = scoreboard || [];
      if (myPlayer?.powerupsUsed) {
        state.powerupsUsed = myPlayer.powerupsUsed;
      }
    },
    resetGame: () => initialState,
  },
});

export const {
  questionStart,
  selectOption,
  answerAck,
  questionEnd,
  gameFinished,
  applyPowerup,
  setFrozen,
  clearFreezeNotice,
  syncGameState,
  resetGame,
} = gameSlice.actions;

export default gameSlice.reducer;
