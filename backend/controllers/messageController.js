import Message from '../models/Message.js';

// @desc    Get channel message history
// @route   GET /api/messages/:channel
// @access  Private
export const getMessagesByChannel = async (req, res) => {
  const channel = req.params.channel || '#general';

  try {
    const messages = await Message.find({ channel })
      .sort({ createdAt: -1 })
      .limit(50);

    // Return in chronological order
    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Save new message (REST fallback)
// @route   POST /api/messages
// @access  Private
export const createMessage = async (req, res) => {
  const { text, channel } = req.body;

  if (!text) {
    return res.status(400).json({ message: 'Message text is required' });
  }

  try {
    const message = await Message.create({
      sender: req.user.name,
      text,
      channel: channel || '#general'
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
