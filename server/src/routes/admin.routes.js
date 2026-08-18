import { Router } from 'express';
import {
  getAdminOverview,
  getQuestionAnalytics,
  getQuizAnalytics,
} from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.js';
import { roleGuard } from '../middleware/roleGuard.js';

const router = Router();

router.use(authenticate, roleGuard(['admin']));

router.get('/overview', getAdminOverview);
router.get('/analytics/questions', getQuestionAnalytics);
router.get('/analytics/quizzes/:id', getQuizAnalytics);

export default router;
