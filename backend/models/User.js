import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'recruiter'],
    default: 'student'
  },
  // Gamification fields (Student only)
  xp: {
    type: Number,
    default: 50 // Registration bonus
  },
  level: {
    type: Number,
    default: 1
  },
  dailyStreak: {
    type: Number,
    default: 1
  },
  lastActive: {
    type: String, // YYYY-MM-DD
    default: () => new Date().toISOString().split('T')[0]
  },
  solvedProblems: {
    type: Number,
    default: 0
  },
  quizzesCompleted: {
    type: Number,
    default: 0
  },
  mockTestsTaken: {
    type: Number,
    default: 0
  },
  resumeUrl: {
    type: String,
    default: ''
  },
  progress: {
    coding: { type: Number, default: 0 },
    aptitude: { type: Number, default: 0 },
    mockTest: { type: Number, default: 0 },
    resume: { type: Number, default: 0 },
    overall: { type: Number, default: 0 }
  },
  registeredDrives: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook: Hash password if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to verify passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
