import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  uid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Mock Interview', 'Mock Test Prep'],
    default: 'Mock Interview'
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Event = mongoose.model('Event', eventSchema);
export default Event;
