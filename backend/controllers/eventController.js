import Event from '../models/Event.js';
import User from '../models/User.js';

// @desc    Get user's events
// @route   GET /api/events
// @access  Private
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ uid: req.user._id });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create a custom prep event
// @route   POST /api/events
// @access  Private
export const createEvent = async (req, res) => {
  const { title, type, date } = req.body;

  if (!title || !date) {
    return res.status(400).json({ message: 'Title and date are required' });
  }

  try {
    const event = await Event.create({
      uid: req.user._id,
      title,
      type: type || 'Mock Interview',
      date
    });

    // Reward user with +10 XP for scheduling a prep session
    const user = await User.findById(req.user._id);
    if (user) {
      user.xp = (user.xp || 0) + 10;
      user.level = Math.floor(Math.sqrt(user.xp / 100)) + 1;
      
      // Update overall progress
      user.progress.overall = Math.round(
        (user.progress.coding + user.progress.aptitude + user.progress.mockTest + user.progress.resume) / 4
      );
      await user.save();
    }

    res.status(201).json({ event, xp: user ? user.xp : 0, level: user ? user.level : 1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.uid.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
