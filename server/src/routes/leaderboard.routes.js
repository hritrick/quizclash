import { Router } from 'express';
import {
  getGlobalLeaderboard,
  getQuizLeaderboard,
  getUserMatchHistory,
} from '../controllers/leaderboard.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/global', getGlobalLeaderboard);
router.get('/quiz/:quizId', getQuizLeaderboard);
router.get('/history', authenticate, getUserMatchHistory);
router.get('/user/:userId/history', authenticate, getUserMatchHistory);

export default router;
