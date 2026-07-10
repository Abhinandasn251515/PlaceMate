import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeUrl: {
    type: String,
    required: true
  },
  atsScore: {
    type: Number,
    default: 0
  },
  interviewScore: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Applied', 'Under Review', 'Shortlisted', 'Rejected'],
    default: 'Applied'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Application = mongoose.model('Application', applicationSchema);
export default Application;
