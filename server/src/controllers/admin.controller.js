import { Question } from '../models/Question.js';
import { Quiz } from '../models/Quiz.js';
import { MatchHistory } from '../models/MatchHistory.js';
import { User } from '../models/User.js';

export const getAdminOverview = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalQuizzes = await Quiz.countDocuments();
    const totalMatches = await MatchHistory.countDocuments();
    const totalQuestions = await Question.countDocuments();

    const aggregateScores = await MatchHistory.aggregate([
      { $unwind: '$players' },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$players.score' },
          totalPointsAwarded: { $sum: '$players.score' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalQuizzes,
        totalMatches,
        totalQuestions,
        averageScore: aggregateScores[0] ? Math.round(aggregateScores[0].avgScore) : 0,
        totalPointsAwarded: aggregateScores[0] ? aggregateScores[0].totalPointsAwarded : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getQuestionAnalytics = async (req, res, next) => {
  try {
    const { sortBy = 'accuracy', order = 'asc', limit = 50 } = req.query;

    const questions = await Question.find()
      .populate('quizId', 'title category difficulty')
      .lean();

    const formatted = questions.map((q) => {
      const accuracy =
        q.timesAnswered > 0
          ? Math.round((q.timesCorrect / q.timesAnswered) * 100)
          : 0;
      const avgAnswerTime =
        q.timesAnswered > 0
          ? Number((q.totalAnswerTimeMs / q.timesAnswered / 1000).toFixed(2))
          : 0;

      let difficultyRating = 'Unrated';
      if (q.timesAnswered >= 3) {
        if (accuracy > 75) difficultyRating = 'Easy';
        else if (accuracy >= 40) difficultyRating = 'Balanced';
        else difficultyRating = 'Hard / Brutal';
      }

      return {
        id: q._id,
        text: q.text,
        quizTitle: q.quizId?.title || 'Unknown Quiz',
        category: q.quizId?.category || 'General Knowledge',
        timesAnswered: q.timesAnswered,
        timesCorrect: q.timesCorrect,
        accuracy,
        avgAnswerTimeSec: avgAnswerTime,
        difficultyRating,
      };
    });

    formatted.sort((a, b) => {
      if (sortBy === 'accuracy') {
        return order === 'asc' ? a.accuracy - b.accuracy : b.accuracy - a.accuracy;
      }
      if (sortBy === 'timesAnswered') {
        return order === 'asc' ? a.timesAnswered - b.timesAnswered : b.timesAnswered - a.timesAnswered;
      }
      if (sortBy === 'avgTime') {
        return order === 'asc' ? a.avgAnswerTimeSec - b.avgAnswerTimeSec : b.avgAnswerTimeSec - a.avgAnswerTimeSec;
      }
      return 0;
    });

    res.status(200).json({
      success: true,
      data: {
        questions: formatted.slice(0, Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getQuizAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id).populate('questionIds');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Quiz not found' },
      });
    }

    const matches = await MatchHistory.find({ quizId: id });
    const totalMatches = matches.length;

    let totalScore = 0;
    let totalPlayers = 0;
    matches.forEach((m) => {
      m.players.forEach((p) => {
        totalScore += p.score;
        totalPlayers += 1;
      });
    });

    const averagePlayerScore = totalPlayers > 0 ? Math.round(totalScore / totalPlayers) : 0;

    // Find most-missed and easiest question
    const questionStats = quiz.questionIds.map((q) => {
      const accuracy =
        q.timesAnswered > 0
          ? Math.round((q.timesCorrect / q.timesAnswered) * 100)
          : null;
      return {
        id: q._id,
        text: q.text,
        accuracy,
        timesAnswered: q.timesAnswered,
      };
    });

    const answeredQuestions = questionStats.filter((q) => q.timesAnswered > 0);
    answeredQuestions.sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0));

    const mostMissed = answeredQuestions[0] || null;
    const easiest = answeredQuestions[answeredQuestions.length - 1] || null;

    res.status(200).json({
      success: true,
      data: {
        quiz: {
          id: quiz._id,
          title: quiz.title,
          category: quiz.category,
          difficulty: quiz.difficulty,
          totalQuestions: quiz.questionIds.length,
          playsCount: quiz.playsCount,
        },
        analytics: {
          totalMatches,
          totalPlayersCount: totalPlayers,
          averagePlayerScore,
          mostMissedQuestion: mostMissed,
          easiestQuestion: easiest,
          questions: questionStats,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
