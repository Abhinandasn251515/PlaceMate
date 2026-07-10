import express from 'express';
import { getMessagesByChannel, createMessage } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createMessage);

router.get('/:channel', protect, getMessagesByChannel);

export default router;
