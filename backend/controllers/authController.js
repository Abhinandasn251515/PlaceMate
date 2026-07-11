import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      xp: role === 'recruiter' ? 0 : 50, // Registration bonus for students
      level: 1,
      dailyStreak: 1
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        xp: user.xp,
        level: user.level,
        dailyStreak: user.dailyStreak,
        progress: user.progress,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      // Check/Update daily streak for students on login
      if (user.role === 'student') {
        const todayStr = new Date().toISOString().split('T')[0];
        if (user.lastActive !== todayStr) {
          let newStreak = user.dailyStreak || 0;
          let xpBonus = 10;

          if (user.lastActive) {
            const lastActiveDate = new Date(user.lastActive);
            const today = new Date(todayStr);
            const diffTime = Math.abs(today - lastActiveDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
              newStreak += 1;
            } else if (diffDays > 1) {
              newStreak = 1;
            }
          } else {
            newStreak = 1;
          }

          user.dailyStreak = newStreak;
          user.lastActive = todayStr;
          user.xp = (user.xp || 0) + xpBonus;
          user.level = Math.floor(Math.sqrt(user.xp / 100)) + 1;
          await user.save();
        }
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        xp: user.xp,
        level: user.level,
        dailyStreak: user.dailyStreak,
        progress: user.progress,
        resumeUrl: user.resumeUrl,
        registeredDrives: user.registeredDrives,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      xp: user.xp,
      level: user.level,
      dailyStreak: user.dailyStreak,
      progress: user.progress,
      resumeUrl: user.resumeUrl,
      registeredDrives: user.registeredDrives
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user progress/XP
// @route   PUT /api/auth/progress
// @access  Private
export const updateUserProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { xpToAdd, coding, aptitude, mockTest, resume, resolvedProblem, quizScore, mockScore } = req.body;

    if (xpToAdd) user.xp = (user.xp || 0) + xpToAdd;
    if (resolvedProblem) user.solvedProblems = (user.solvedProblems || 0) + 1;
    if (quizScore) user.quizzesCompleted = (user.quizzesCompleted || 0) + 1;
    if (mockScore) user.mockTestsTaken = (user.mockTestsTaken || 0) + 1;

    // Update level
    user.level = Math.floor(Math.sqrt(user.xp / 100)) + 1;

    // Update specific progress sub-fields
    if (coding !== undefined) user.progress.coding = coding;
    if (aptitude !== undefined) user.progress.aptitude = aptitude;
    if (mockTest !== undefined) user.progress.mockTest = mockTest;
    if (resume !== undefined) user.progress.resume = resume;

    // Recalculate overall
    user.progress.overall = Math.round(
      (user.progress.coding + user.progress.aptitude + user.progress.mockTest + user.progress.resume) / 4
    );

    await user.save();

    res.json({
      _id: user._id,
      xp: user.xp,
      level: user.level,
      dailyStreak: user.dailyStreak,
      progress: user.progress,
      solvedProblems: user.solvedProblems,
      quizzesCompleted: user.quizzesCompleted,
      mockTestsTaken: user.mockTestsTaken
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get top users by XP for leaderboard
// @route   GET /api/auth/leaderboard
// @access  Private
export const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ role: 'student' })
      .select('name xp level dailyStreak progress solvedProblems')
      .sort({ xp: -1 })
      .limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Authenticate user with Google ID Token from Firebase
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: 'Google ID Token is required.' });
  }

  try {
    // Verify token using Google OAuth2 TokenInfo API
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    const tokenInfo = await response.json();

    if (tokenInfo.error_description) {
      return res.status(401).json({ message: 'Invalid Google ID Token: ' + tokenInfo.error_description });
    }

    const { email, name } = tokenInfo;

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create a new candidate profile if first time logging in
      user = await User.create({
        name: name || 'Google User',
        email,
        password: Math.random().toString(36).slice(-8), // random dummy password
        role: 'student'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      xp: user.xp,
      level: user.level,
      dailyStreak: user.dailyStreak,
      progress: user.progress,
      token
    });
  } catch (err) {
    console.error('Google Auth Error:', err.message);
    res.status(500).json({ message: `Google Sign-in failed: ${err.message}` });
  }
};
