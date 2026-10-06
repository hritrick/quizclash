import { Room } from '../models/Room.js';
import { Quiz } from '../models/Quiz.js';
import { Question } from '../models/Question.js';
import { MatchHistory } from '../models/MatchHistory.js';
import { User } from '../models/User.js';
import { logger } from '../config/logger.js';

export class GameEngine {
  constructor(io) {
    this.io = io;
    // In-memory active game state keyed by room code
    this.games = new Map();
    this.loadingGames = new Map();
  }

  // Calculate score based on response time and multipliers
  static calculateScore(basePoints, answerTimeMs, timeLimitMs, isDouble = false) {
    if (answerTimeMs > timeLimitMs) return 0;
    const clampedTime = Math.max(0, Math.min(answerTimeMs, timeLimitMs));
    const timeFactor = Math.max(0, 1 - (clampedTime / timeLimitMs) * 0.5);
    const calculated = Math.round(basePoints * timeFactor);
    return isDouble ? calculated * 2 : calculated;
  }

  // Helper to get or load active room state into memory
  async getOrLoadGame(roomCode) {
    if (this.games.has(roomCode)) {
      return this.games.get(roomCode);
    }

    if (this.loadingGames.has(roomCode)) return this.loadingGames.get(roomCode);
    const loading = this.loadGame(roomCode);
    this.loadingGames.set(roomCode, loading);
    try { return await loading; }
    finally { this.loadingGames.delete(roomCode); }
  }

  async loadGame(roomCode) {
    const room = await Room.findOne({ code: roomCode }).populate({
      path: 'quizId',
      populate: { path: 'questionIds' },
    });

    if (!room) return null;

    const gameData = {
      code: room.code,
      roomId: room._id,
      quiz: room.quizId,
      hostId: room.hostId.toString(),
      status: room.status,
      mode: room.mode,
      questions: room.quizId.questionIds || [],
      currentQuestionIndex: room.currentQuestionIndex,
      players: new Map(
        room.players.map((p) => [
          p.userId.toString(),
          {
            userId: p.userId.toString(),
            username: p.username,
            avatarSeed: p.avatarSeed,
            score: p.score || 0,
            connected: p.connected,
            socketId: p.socketId,
            powerupsUsed: {
              fiftyFifty: p.powerupsUsed?.fiftyFifty || false,
              doublePoints: p.powerupsUsed?.doublePoints || false,
              freeze: p.powerupsUsed?.freeze || false,
            },
            currentAnswer: null, // { optionIndex, answerTimeMs, isCorrect, pointsEarned }
            activeMultiplier: 1,
            frozenUntil: 0,
            correctCount: p.correctCount || 0,
          },
        ])
      ),
      spectators: new Set(room.spectatorIds.map((id) => id.toString())),
      spectatorSockets: new Map(),
      questionTimer: null,
      revealTimer: null,
      questionStartTime: 0,
      questionEndsAt: 0,
      acceptingAnswers: false,
      revealState: null,
    };

    this.games.set(roomCode, gameData);
    return gameData;
  }

  // Start the game
  async startGame(roomCode, userId) {
    const game = await this.getOrLoadGame(roomCode);
    if (!game) throw new Error('Game room not found');

    if (game.hostId !== userId) {
      throw new Error('Only the host can start the game');
    }

    if (game.questions.length === 0) {
      throw new Error('Quiz has no questions');
    }

    if (game.status !== 'lobby') {
      throw new Error('Only a lobby game can be started');
    }

    game.status = 'in_progress';
    game.currentQuestionIndex = -1;

    await Room.updateOne(
      { code: roomCode },
      { status: 'in_progress', startedAt: new Date(), currentQuestionIndex: -1 }
    );

    await Quiz.findByIdAndUpdate(game.quiz._id, { $inc: { playsCount: 1 } });

    // Send question 0
    await this.sendNextQuestion(roomCode);
  }

  // Send next question or finalize game
  async sendNextQuestion(roomCode) {
    const game = this.games.get(roomCode);
    if (!game) return;

    // Clear any timers
    if (game.questionTimer) clearTimeout(game.questionTimer);
    if (game.revealTimer) clearTimeout(game.revealTimer);

    game.currentQuestionIndex += 1;

    // Check if game finished
    if (game.currentQuestionIndex >= game.questions.length) {
      await this.finishGame(roomCode);
      return;
    }

    const currentQ = game.questions[game.currentQuestionIndex];
    const timeLimitMs = (currentQ.timeLimitSec || 15) * 1000;
    const now = Date.now();

    game.questionStartTime = now;
    game.questionEndsAt = now + timeLimitMs;
    game.acceptingAnswers = true;
    game.revealState = null;

    // Reset per-question round answers and multipliers
    for (const [, player] of game.players) {
      player.currentAnswer = null;
      player.activeMultiplier = 1;
      player.removedOptions = [];
    }

    // Prepare client-safe question (omit correctIndex & explanation)
    const sanitizedQuestion = {
      id: currentQ._id,
      text: currentQ.text,
      options: currentQ.options,
      timeLimitSec: currentQ.timeLimitSec || 15,
      points: currentQ.points || 1000,
    };

    this.io.to(roomCode).emit('game:questionStart', {
      question: sanitizedQuestion,
      index: game.currentQuestionIndex,
      totalQuestions: game.questions.length,
      endsAt: game.questionEndsAt,
      timeLimitSec: currentQ.timeLimitSec || 15,
      scoreboard: this.getRankedScoreboard(game),
    });

    // Schedule auto end of question
    game.questionTimer = setTimeout(() => {
      this.endCurrentQuestion(roomCode);
    }, timeLimitMs);
  }

  // Handle player answer submission
  async submitAnswer(roomCode, userId, { questionIndex, optionIndex, clientTimestamp }) {
    const game = this.games.get(roomCode);
    if (!game) throw new Error('Game not found');

    if (game.status !== 'in_progress') {
      throw new Error('Game is not currently active');
    }

    if (!game.acceptingAnswers || Date.now() >= game.questionEndsAt) throw new Error('This question is closed');
    if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex > 3) throw new Error('Invalid answer option');

    if (game.currentQuestionIndex !== questionIndex) {
      throw new Error('Invalid question index');
    }

    const player = game.players.get(userId);
    if (!player) {
      throw new Error('Player not in room');
    }

    if (player.currentAnswer) {
      throw new Error('Answer already submitted');
    }

    const now = Date.now();

    // Check if player is frozen
    if (player.frozenUntil && player.frozenUntil > now) {
      const remainingSec = Math.ceil((player.frozenUntil - now) / 1000);
      throw new Error(`You are frozen for ${remainingSec} more second(s)!`);
    }

    const currentQ = game.questions[game.currentQuestionIndex];
    const timeLimitMs = (currentQ.timeLimitSec || 15) * 1000;
    const answerTimeMs = Math.max(0, now - game.questionStartTime);

    const isCorrect = Number(optionIndex) === currentQ.correctIndex;
    const pointsEarned = isCorrect
      ? GameEngine.calculateScore(
          currentQ.points || 1000,
          answerTimeMs,
          timeLimitMs,
          player.activeMultiplier === 2
        )
      : 0;

    player.score += pointsEarned;
    if (isCorrect) player.correctCount += 1;

    player.currentAnswer = {
      optionIndex: Number(optionIndex),
      answerTimeMs,
      isCorrect,
      pointsEarned,
      multiplier: player.activeMultiplier,
    };

    // Update question running statistics
    try {
      await Question.findByIdAndUpdate(currentQ._id, {
        $inc: {
          timesAnswered: 1,
          timesCorrect: isCorrect ? 1 : 0,
          totalAnswerTimeMs: Math.min(answerTimeMs, timeLimitMs),
        },
      });
    } catch (err) {
      logger.error(`Error updating question analytics: ${err.message}`);
    }

    // Emit acknowledgment to the submitter
    if (player.socketId) {
      this.io.to(player.socketId).emit('game:answerAck', {
        questionIndex,
        optionIndex,
        pointsEarned,
        isCorrect,
      });
    }

    // Check if all connected non-spectator players have answered
    const activePlayers = Array.from(game.players.values()).filter((p) => p.connected);
    const allAnswered = activePlayers.every((p) => p.currentAnswer !== null);

    if (allAnswered) {
      if (game.questionTimer) clearTimeout(game.questionTimer);
      game.acceptingAnswers = false;
      // Give a tiny 400ms beat so UI feels responsive before revealing
      game.questionTimer = setTimeout(() => {
        this.endCurrentQuestion(roomCode);
      }, 400);
    }
  }

  // Use a Power-up
  async usePowerup(roomCode, userId, { type, targetUserId }) {
    const game = this.games.get(roomCode);
    if (!game) throw new Error('Game not found');

    if (game.status !== 'in_progress') {
      throw new Error('Game is not currently active');
    }

    if (!['fiftyFifty', 'doublePoints', 'freeze'].includes(type)) throw new Error('Unknown power-up type');
    if (!game.acceptingAnswers || Date.now() >= game.questionEndsAt) throw new Error('This question is closed');
    const player = game.players.get(userId);
    if (!player) throw new Error('Player not found');
    if (player.currentAnswer) throw new Error('Answer already submitted');

    if (player.powerupsUsed[type]) {
      throw new Error(`Power-up '${type}' has already been used in this match`);
    }

    const currentQ = game.questions[game.currentQuestionIndex];
    if (!currentQ) throw new Error('No active question');

    if (type === 'fiftyFifty') {
      // Pick 2 wrong option indices to remove
      const correctIdx = currentQ.correctIndex;
      const wrongIndices = [0, 1, 2, 3].filter((idx) => idx !== correctIdx);
      // Shuffle wrong indices and take 2
      const shuffledWrong = wrongIndices.sort(() => Math.random() - 0.5);
      const removedOptions = [shuffledWrong[0], shuffledWrong[1]];
      player.powerupsUsed[type] = true;
      player.removedOptions = removedOptions;

      // Send to the player only
      if (player.socketId) {
        this.io.to(player.socketId).emit('powerup:applied', {
          type: 'fiftyFifty',
          byUserId: userId,
          removedOptions,
        });
      }
      return { type: 'fiftyFifty', removedOptions };
    }

    if (type === 'doublePoints') {
      player.powerupsUsed[type] = true;
      player.activeMultiplier = 2;
      if (player.socketId) {
        this.io.to(player.socketId).emit('powerup:applied', {
          type: 'doublePoints',
          byUserId: userId,
          multiplier: 2,
        });
      }
      return { type: 'doublePoints' };
    }

    if (type === 'freeze') {
      if (!targetUserId) {
        // In solo or if no target passed, target next highest scoring player
        const opponents = Array.from(game.players.values()).filter(
          (p) => p.userId !== userId && p.connected
        );
        if (opponents.length > 0) {
          opponents.sort((a, b) => b.score - a.score);
          targetUserId = opponents[0].userId;
        }
      }

      if (!targetUserId || targetUserId === userId || !game.players.get(targetUserId)?.connected) throw new Error('No connected rival to freeze');
      player.powerupsUsed[type] = true;
      if (targetUserId) {
        const targetPlayer = game.players.get(targetUserId);
        if (targetPlayer) {
          const freezeDurationMs = 4000; // 4 seconds freeze
          targetPlayer.frozenUntil = Date.now() + freezeDurationMs;

          // Broadcast freeze effect to the entire room so UI animates
          this.io.to(roomCode).emit('powerup:applied', {
            type: 'freeze',
            byUserId: userId,
            byUsername: player.username,
            targetUserId: targetPlayer.userId,
            targetUsername: targetPlayer.username,
            durationMs: freezeDurationMs,
          });
        }
      }
      return { type: 'freeze', targetUserId };
    }

    throw new Error('Unknown power-up type');
  }

  // End current question and reveal answers + scoreboard
  async endCurrentQuestion(roomCode) {
    const game = this.games.get(roomCode);
    if (!game || game.status !== 'in_progress' || game.revealState) return;
    game.acceptingAnswers = false;

    if (game.questionTimer) clearTimeout(game.questionTimer);

    const currentQ = game.questions[game.currentQuestionIndex];
    const correctIndex = currentQ.correctIndex;
    const scoreboard = this.getRankedScoreboard(game);

    const perPlayerResult = Array.from(game.players.values()).map((p) => ({
      userId: p.userId,
      username: p.username,
      avatarSeed: p.avatarSeed,
      answered: p.currentAnswer !== null,
      optionIndex: p.currentAnswer ? p.currentAnswer.optionIndex : null,
      isCorrect: p.currentAnswer ? p.currentAnswer.isCorrect : false,
      pointsAwarded: p.currentAnswer ? p.currentAnswer.pointsEarned : 0,
      totalScore: p.score,
    }));

    // Broadcast results
    game.revealState = {
      questionIndex: game.currentQuestionIndex,
      correctIndex,
      explanation: currentQ.explanation || '',
      perPlayerResult,
      scoreboard,
    };
    this.io.to(roomCode).emit('game:questionEnd', game.revealState);

    // Update Room DB state
    await Room.updateOne(
      { code: roomCode },
      {
        currentQuestionIndex: game.currentQuestionIndex,
        players: Array.from(game.players.values()).map((p) => ({
          userId: p.userId,
          username: p.username,
          avatarSeed: p.avatarSeed,
          score: p.score,
          connected: p.connected,
          socketId: p.socketId,
          powerupsUsed: p.powerupsUsed,
          correctCount: p.correctCount,
          hasAnsweredCurrent: p.currentAnswer !== null,
          lastAnswerCorrect: p.currentAnswer ? p.currentAnswer.isCorrect : false,
          lastAnswerPoints: p.currentAnswer ? p.currentAnswer.pointsEarned : 0,
        })),
      }
    );

    // Wait 4.5 seconds for scoreboard / explanation review, then advance
    game.revealTimer = setTimeout(() => {
      this.sendNextQuestion(roomCode);
    }, 4500);
  }

  // Finish game, record match history, update user stats
  async finishGame(roomCode) {
    const game = this.games.get(roomCode);
    if (!game || game.status === 'finished') return;

    game.status = 'finished';
    game.acceptingAnswers = false;
    const finalScoreboard = this.getRankedScoreboard(game);


    try {
      // Save MatchHistory
      const matchHistory = await MatchHistory.create({
        roomId: game.roomId,
        roomCode: game.code,
        quizId: game.quiz._id,
        quizTitle: game.quiz.title,
        category: game.quiz.category,
        mode: game.mode,
        totalQuestions: game.questions.length,
        players: finalScoreboard.map((p) => ({
          userId: p.userId,
          username: p.username,
          avatarSeed: p.avatarSeed,
          score: p.score,
          rank: p.rank,
          correctCount: p.correctCount,
          totalQuestions: game.questions.length,
          powerupsUsed: p.powerupsUsed,
        })),
      });

      // Update room in DB
      await Room.updateOne(
        { code: roomCode },
        { status: 'finished', finishedAt: new Date() }
      );

      // Update player user stats
      for (const p of finalScoreboard) {
        const isWinner = p.rank === 1;
        await User.findByIdAndUpdate(p.userId, {
          $inc: {
            'stats.gamesPlayed': 1,
            'stats.totalScore': p.score,
            'stats.wins': isWinner ? 1 : 0,
            'stats.correctAnswers': p.correctCount,
            'stats.totalAnswers': game.questions.length,
          },
        });
      }

      logger.info(`Match ${roomCode} finished and recorded (Match ID: ${matchHistory._id})`);
    } catch (err) {
      logger.error(`Error saving match history: ${err.message}`);
    }

    this.io.to(roomCode).emit('game:finished', {
      finalScoreboard,
      totalQuestions: game.questions.length,
    });

    // Clean up memory after 10 minutes
    game.cleanupTimer = setTimeout(() => {
      this.games.delete(roomCode);
    }, 10 * 60 * 1000);
    game.cleanupTimer.unref?.();
  }

  // Get ranked scoreboard
  getRankedScoreboard(game) {
    const playersList = Array.from(game.players.values());
    playersList.sort((a, b) => b.score - a.score);

    return playersList.map((p, idx) => ({
      rank: idx + 1,
      userId: p.userId,
      username: p.username,
      avatarSeed: p.avatarSeed,
      score: p.score,
      connected: p.connected,
      correctCount: p.correctCount,
      powerupsUsed: p.powerupsUsed,
    }));
  }

  // Handle player connect/reconnect
  async handlePlayerConnect(roomCode, userId, username, avatarSeed, socketId, isSpectator = false) {
    const game = await this.getOrLoadGame(roomCode);
    if (!game) throw new Error('Game not found');
    if (game.mode === 'solo' && userId !== game.hostId && !isSpectator) throw new Error('Solo rooms are private');

    if (isSpectator) {
      game.spectators.add(userId);
      game.spectatorSockets.set(socketId, userId);
      this.broadcastPlayers(game);
      return { isSpectator: true, state: this.getGameStateForClient(game, userId) };
    }

    let player = game.players.get(userId);
    if (!player) {
      if (game.status !== 'lobby') {
        // Auto convert to spectator
        game.spectators.add(userId);
        game.spectatorSockets.set(socketId, userId);
        this.broadcastPlayers(game);
        return { isSpectator: true, state: this.getGameStateForClient(game, userId) };
      }
      player = {
        userId,
        username,
        avatarSeed,
        score: 0,
        connected: true,
        socketId,
        powerupsUsed: { fiftyFifty: false, doublePoints: false, freeze: false },
        currentAnswer: null,
        activeMultiplier: 1,
        frozenUntil: 0,
        correctCount: 0,
      };
      game.players.set(userId, player);
    } else {
      player.connected = true;
      player.socketId = socketId;
    }
    game.spectators.delete(userId);
    game.spectatorSockets.delete(socketId);
    if (game.status === 'lobby') {
      await Room.updateOne({ code: roomCode }, { players: Array.from(game.players.values()) });
    }

    // Broadcast updated player list
    this.broadcastPlayers(game);

    return { isSpectator: false, state: this.getGameStateForClient(game, userId) };
  }

  broadcastPlayers(game) {
    this.io.to(game.code).emit('room:playerJoined', { players: this.getRankedScoreboard(game), spectatorsCount: game.spectators.size });
  }

  // Handle player disconnect
  async handlePlayerDisconnect(socketId) {
    for (const [code, game] of this.games.entries()) {
      const spectatorId = game.spectatorSockets.get(socketId);
      if (spectatorId) {
        game.spectatorSockets.delete(socketId);
        if (![...game.spectatorSockets.values()].includes(spectatorId)) game.spectators.delete(spectatorId);
        this.broadcastPlayers(game);
      }
      for (const [userId, player] of game.players.entries()) {
        if (player.socketId === socketId) {
          player.connected = false;
          player.socketId = null;

          this.io.to(code).emit('room:playerLeft', {
            userId,
            username: player.username,
            players: this.getRankedScoreboard(game),
          });
          break;
        }
      }
    }
  }

  // Helper to package state for connecting client
  getGameStateForClient(game, userId) {
    const isSpectator = game.spectators.has(userId);
    const player = game.players.get(userId);

    let activeQuestion = null;
    if (game.status === 'in_progress' && game.currentQuestionIndex >= 0) {
      const q = game.questions[game.currentQuestionIndex];
      if (q) {
        activeQuestion = {
          id: q._id,
          text: q.text,
          options: q.options,
          timeLimitSec: q.timeLimitSec || 15,
          points: q.points || 1000,
        };
      }
    }

    return {
      code: game.code,
      quizTitle: game.quiz?.title,
      category: game.quiz?.category,
      difficulty: game.quiz?.difficulty,
      hostId: game.hostId,
      status: game.status,
      mode: game.mode,
      currentQuestionIndex: game.currentQuestionIndex,
      totalQuestions: game.questions.length,
      activeQuestion,
      endsAt: game.questionEndsAt,
      isSpectator,
      spectatorsCount: game.spectators.size,
      scoreboard: this.getRankedScoreboard(game),
      revealState: game.revealState,
      finalScoreboard: game.status === 'finished' ? this.getRankedScoreboard(game) : [],
      myPlayer: player ? {
        powerupsUsed: player.powerupsUsed,
        activeMultiplier: player.activeMultiplier,
        frozenUntil: player.frozenUntil,
        removedOptions: player.removedOptions || [],
        currentAnswer: player.currentAnswer,
      } : null,
    };
  }
}
