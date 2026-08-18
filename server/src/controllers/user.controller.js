import { User } from '../models/User.js';
import { MatchHistory } from '../models/MatchHistory.js';

export const getUserStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('username avatarSeed role stats createdAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      });
    }

    const recentMatches = await MatchHistory.find({ 'players.userId': id })
      .sort({ playedAt: -1 })
      .limit(5);

    const winRate =
      user.stats.gamesPlayed > 0
        ? Math.round((user.stats.wins / user.stats.gamesPlayed) * 100)
        : 0;

    const accuracy =
      user.stats.totalAnswers > 0
        ? Math.round((user.stats.correctAnswers / user.stats.totalAnswers) * 100)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          avatarSeed: user.avatarSeed,
          role: user.role,
          createdAt: user.createdAt,
          stats: {
            ...user.stats.toObject(),
            winRate,
            accuracy,
          },
          recentMatches,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
