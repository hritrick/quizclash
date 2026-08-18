import { Router } from 'express';
import {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  addQuestion,
  deleteQuestion,
} from '../controllers/quiz.controller.js';
import { authenticate } from '../middleware/auth.js';
import { roleGuard } from '../middleware/roleGuard.js';
import { validate } from '../middleware/validate.js';
import { createQuizSchema, updateQuizSchema, questionSchema } from '../validators/quiz.validator.js';

const router = Router();

router.get('/', getQuizzes);
router.get('/:id', getQuizById);

// Host & Admin protected routes
router.post('/', authenticate, roleGuard(['host', 'admin']), validate(createQuizSchema), createQuiz);
router.put('/:id', authenticate, roleGuard(['host', 'admin']), validate(updateQuizSchema), updateQuiz);
router.delete('/:id', authenticate, roleGuard(['host', 'admin']), deleteQuiz);

// Question routes
router.post('/:id/questions', authenticate, roleGuard(['host', 'admin']), validate(questionSchema), addQuestion);
router.delete('/:quizId/questions/:questionId', authenticate, roleGuard(['host', 'admin']), deleteQuestion);

export default router;
