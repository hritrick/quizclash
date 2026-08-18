import { User } from '../models/User.js';
import { MatchHistory } from '../models/MatchHistory.js';

export const getGlobalLeaderboard = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;

    const topUsers = await User.find({ 'stats.gamesPlayed': { $gt: 0 } })
      .select('username avatarSeed role stats createdAt')
      .sort({ 'stats.totalScore': -1, 'stats.wins': -1 })
      .limit(Number(limit));

    const leaderboard = topUsers.map((user, index) => ({
      rank: index + 1,
      userId: user._id,
      username: user.username,
      avatarSeed: user.avatarSeed,
      role: user.role,
      gamesPlayed: user.stats.gamesPlayed,
      totalScore: user.stats.totalScore,
      wins: user.stats.wins,
      winRate:
        user.stats.gamesPlayed > 0
          ? Math.round((user.stats.wins / user.stats.gamesPlayed) * 100)
          : 0,
      accuracy:
        user.stats.totalAnswers > 0
          ? Math.round((user.stats.correctAnswers / user.stats.totalAnswers) * 100)
          : 0,
    }));

    res.status(200).json({
      success: true,
      data: { leaderboard },
    });
  } catch (error) {
    next(error);
  }
};

export const getQuizLeaderboard = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { limit = 10 } = req.query;

    // Aggregate match histories for this quiz
    const matches = await MatchHistory.find({ quizId })
      .sort({ playedAt: -1 })
      .limit(50);

    const playerHighScores = new Map();

    for (const match of matches) {
      for (const player of match.players) {
        const key = player.userId.toString();
        const existing = playerHighScores.get(key);
        if (!existing || player.score > existing.score) {
          playerHighScores.set(key, {
            userId: player.userId,
            username: player.username,
            avatarSeed: player.avatarSeed,
            score: player.score,
            rank: player.rank,
            playedAt: match.playedAt,
          });
        }
      }
    }

    const leaderboard = Array.from(playerHighScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, Number(limit))
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));

    res.status(200).json({
      success: true,
      data: { leaderboard },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserMatchHistory = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user._id;
    const matches = await MatchHistory.find({
      'players.userId': userId,
    })
      .sort({ playedAt: -1 })
      .limit(15);

    const formatted = matches.map((m) => {
      const playerRecord = m.players.find((p) => p.userId.toString() === userId.toString());
      return {
        id: m._id,
        roomCode: m.roomCode,
        quizTitle: m.quizTitle,
        category: m.category,
        mode: m.mode,
        score: playerRecord ? playerRecord.score : 0,
        rank: playerRecord ? playerRecord.rank : 1,
        totalPlayers: m.players.length,
        totalQuestions: m.totalQuestions,
        correctCount: playerRecord ? playerRecord.correctCount : 0,
        playedAt: m.playedAt,
      };
    });

    res.status(200).json({
      success: true,
      data: { matches: formatted },
    });
  } catch (error) {
    next(error);
  }
};
