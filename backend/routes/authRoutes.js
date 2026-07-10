import express from 'express';
import { registerUser, loginUser, getUserProfile, updateUserProgress, getLeaderboard } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/progress', protect, updateUserProgress);
router.get('/leaderboard', protect, getLeaderboard);

export default router;
