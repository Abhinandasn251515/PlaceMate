import express from 'express';
import { analyzeResume, evaluateInterview, generateQuestions } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/analyze-resume', protect, analyzeResume);
router.post('/interview-feedback', protect, evaluateInterview);
router.post('/generate-questions', protect, generateQuestions);

export default router;
