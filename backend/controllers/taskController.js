import Task from '../models/Task.js';
import User from '../models/User.js';

// @desc    Get user's tasks
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ uid: req.user._id });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res) => {
  const { text, priority } = req.body;

  if (!text) {
    return res.status(400).json({ message: 'Task text is required' });
  }

  try {
    const task = await Task.create({
      uid: req.user._id,
      text,
      priority: priority || 'Medium',
      completed: false
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Toggle task completion (awards/removes XP)
// @route   PUT /api/tasks/:id/toggle
// @access  Private
export const toggleTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.uid.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const wasCompleted = task.completed;
    task.completed = !task.completed;
    await task.save();

    // Trigger XP modification (+15 XP for completing, -15 XP for undoing)
    const xpChange = wasCompleted ? -15 : 15;
    const user = await User.findById(req.user._id);
    if (user) {
      user.xp = Math.max(0, (user.xp || 0) + xpChange);
      user.level = Math.floor(Math.sqrt(user.xp / 100)) + 1;
      
      // Update overall progress
      user.progress.overall = Math.round(
        (user.progress.coding + user.progress.aptitude + user.progress.mockTest + user.progress.resume) / 4
      );
      await user.save();
    }

    res.json({ task, xp: user ? user.xp : 0, level: user ? user.level : 1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.uid.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
