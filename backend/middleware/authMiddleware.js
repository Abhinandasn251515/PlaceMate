import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  // Check authorization header starting with Bearer
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token, exclude password
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'User not found, authorization denied' });
      }

      next();
    } catch (err) {
      console.error('JWT verification error:', err.message);
      res.status(401).json({ message: 'Token is not valid, authorization denied' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'No token provided, authorization denied' });
  }
};

// Middleware to check if user is a recruiter
export const recruiter = (req, res, next) => {
  if (req.user && req.user.role === 'recruiter') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Recruiters only' });
  }
};
