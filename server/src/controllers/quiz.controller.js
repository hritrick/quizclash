import { Quiz } from '../models/Quiz.js';
import { Question } from '../models/Question.js';

export const getQuizzes = async (req, res, next) => {
  try {
    const { category, difficulty, search, page = 1, limit = 12 } = req.query;

    const filter = { isPublished: true };
    if (category && category !== 'All') filter.category = category;
    if (difficulty && difficulty !== 'All') filter.difficulty = difficulty;
    if (search) {
      filter.title = { $regex: String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Quiz.countDocuments(filter);
    const quizzes = await Quiz.find(filter)
      .populate('createdBy', 'username avatarSeed')
      .populate('questionIds', 'text points timeLimitSec')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: {
        quizzes,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getQuizById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id)
      .populate('createdBy', 'username avatarSeed')
      .populate('questionIds', '-correctIndex -explanation');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Quiz not found' },
      });
    }

    res.status(200).json({
      success: true,
      data: { quiz },
    });
  } catch (error) {
    next(error);
  }
};

export const createQuiz = async (req, res, next) => {
  try {
    const { title, description, category, difficulty, coverGradient, questions } = req.body;

    const quiz = await Quiz.create({
      title,
      description,
      category,
      difficulty,
      coverGradient,
      createdBy: req.user._id,
      questionIds: [],
    });

    if (questions && questions.length > 0) {
      const questionDocs = questions.map((q) => ({
        ...q,
        quizId: quiz._id,
      }));
      const createdQuestions = await Question.insertMany(questionDocs);
      quiz.questionIds = createdQuestions.map((q) => q._id);
      await quiz.save();
    }

    const fullQuiz = await Quiz.findById(quiz._id)
      .populate('createdBy', 'username avatarSeed')
      .populate('questionIds');

    res.status(201).json({
      success: true,
      data: { quiz: fullQuiz },
    });
  } catch (error) {
    next(error);
  }
};

export const updateQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Quiz not found' },
      });
    }

    // Role check: Admin or the creator
    if (req.user.role !== 'admin' && quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to edit this quiz' },
      });
    }

    const { title, description, category, difficulty, isPublished, coverGradient } = req.body;
    if (title !== undefined) quiz.title = title;
    if (description !== undefined) quiz.description = description;
    if (category !== undefined) quiz.category = category;
    if (difficulty !== undefined) quiz.difficulty = difficulty;
    if (isPublished !== undefined) quiz.isPublished = isPublished;
    if (coverGradient !== undefined) quiz.coverGradient = coverGradient;

    await quiz.save();

    const updated = await Quiz.findById(id)
      .populate('createdBy', 'username avatarSeed')
      .populate('questionIds');

    res.status(200).json({
      success: true,
      data: { quiz: updated },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Quiz not found' },
      });
    }

    if (req.user.role !== 'admin' && quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to delete this quiz' },
      });
    }

    await Question.deleteMany({ quizId: quiz._id });
    await Quiz.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const addQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Quiz not found' },
      });
    }

    if (req.user.role !== 'admin' && quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to modify this quiz' },
      });
    }

    const { text, options, correctIndex, timeLimitSec, points, explanation } = req.body;
    const question = await Question.create({
      quizId: quiz._id,
      text,
      options,
      correctIndex,
      timeLimitSec: timeLimitSec || 15,
      points: points || 1000,
      explanation: explanation || '',
    });

    quiz.questionIds.push(question._id);
    await quiz.save();

    res.status(201).json({
      success: true,
      data: { question },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (req, res, next) => {
  try {
    const { quizId, questionId } = req.params;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Quiz not found' },
      });
    }

    if (req.user.role !== 'admin' && quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to modify this quiz' },
      });
    }

    const question = await Question.findOneAndDelete({ _id: questionId, quizId: quiz._id });
    if (!question) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Question not found in this quiz' } });
    }
    quiz.questionIds = quiz.questionIds.filter((qid) => qid.toString() !== questionId);
    await quiz.save();

    res.status(200).json({
      success: true,
      message: 'Question removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
