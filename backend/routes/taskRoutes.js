import express from 'express';
import { getTasks, createTask, toggleTask, deleteTask } from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getTasks)
  .post(protect, createTask);

router.put('/:id/toggle', protect, toggleTask);
router.delete('/:id', protect, deleteTask);

export default router;
