import React, { createContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { 
  loginUser, 
  registerUser, 
  getUserProfile, 
  updateUserProgress,
  googleLogin as googleLoginApi
} from '../api/backend';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to calculate Level based on XP
  const calculateLevel = (xp) => {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  };

  // Load user profile on startup if JWT token exists
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('placemate_jwt_token');
      if (token) {
        try {
          const profile = await getUserProfile();
          setUser(profile);
        } catch (err) {
          console.error('Failed to load user profile:', err.message);
          localStorage.removeItem('placemate_jwt_token');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await loginUser({ email, password });
      localStorage.setItem('placemate_jwt_token', data.token);
      
      const profile = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        xp: data.xp,
        level: data.level,
        dailyStreak: data.dailyStreak,
        progress: data.progress,
        resumeUrl: data.resumeUrl,
        registeredDrives: data.registeredDrives
      };
      
      setUser(profile);
      toast.success(`Welcome back, ${data.name}! 👋`);
      
      if (data.dailyStreak > 1) {
        toast.success(`🔥 Streak active! ${data.dailyStreak} days strong!`);
      }
      return profile;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Please verify credentials.';
      toast.error(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role = 'student') => {
    setLoading(true);
    try {
      const data = await registerUser({ name, email, password, role });
      localStorage.setItem('placemate_jwt_token', data.token);
      
      const profile = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        xp: data.xp,
        level: data.level,
        dailyStreak: data.dailyStreak,
        progress: data.progress,
        resumeUrl: '',
        registeredDrives: []
      };
      
      setUser(profile);
      toast.success('Registration successful! Welcome to PlaceMate AI! 🎉');
      return profile;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed. Try again.';
      toast.error(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const idToken = credential?.idToken;
      
      if (!idToken) {
        throw new Error('Google OAuth credentials could not be retrieved.');
      }
      
      const data = await googleLoginApi(idToken);
      localStorage.setItem('placemate_jwt_token', data.token);

      const profile = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        xp: data.xp,
        level: data.level,
        dailyStreak: data.dailyStreak,
        progress: data.progress,
        resumeUrl: data.resumeUrl || '',
        registeredDrives: data.registeredDrives || []
      };

      setUser(profile);
      toast.success(`Welcome back, ${data.name}! 👋`);
      return profile;
    } catch (err) {
      console.error('Google Login Error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Google Login failed.';
      toast.error(`${errMsg} | Stack: ${err.stack || 'No Stack'}`);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('placemate_jwt_token');
    setUser(null);
    toast.info('Logged out successfully.');
  };

  const passwordReset = async (email) => {
    toast.info('Password reset is coming soon. Please contact your administrator.');
  };

  const addXP = async (amount) => {
    if (!user) return;
    try {
      const updated = await updateUserProgress({ xpToAdd: amount });
      
      setUser(prev => ({
        ...prev,
        xp: updated.xp,
        level: updated.level,
        progress: {
          ...prev.progress,
          ...updated.progress
        }
      }));

      toast.success(`+${amount} XP Earned!`);
      if (updated.level > user.level) {
        toast.success(`🎉 LEVEL UP! You reached Level ${updated.level}!`);
      }
    } catch (err) {
      console.error('Failed to add XP:', err.message);
    }
  };

  // Called after solving a coding problem
  const updateCodingProgress = async () => {
    if (!user) return;
    try {
      const solved = (user.solvedProblems || 0) + 1;
      const newCoding = Math.min(100, Math.round((solved / 10) * 100));
      
      const updated = await updateUserProgress({
        xpToAdd: 50,
        coding: newCoding,
        resolvedProblem: true
      });

      setUser(prev => ({
        ...prev,
        xp: updated.xp,
        level: updated.level,
        solvedProblems: updated.solvedProblems,
        progress: updated.progress
      }));

      toast.success(`+50 XP Earned!`);
      if (updated.level > user.level) {
        toast.success(`🎉 LEVEL UP! You reached Level ${updated.level}!`);
      }
    } catch (err) {
      console.error('Failed to update coding progress:', err.message);
    }
  };

  // Called after completing an aptitude quiz
  const updateAptitudeProgress = async (score, total) => {
    if (!user) return;
    try {
      const pct = Math.round((score / total) * 100);
      const current = user.progress?.aptitude || 0;
      const newAptitude = Math.min(100, Math.round((current + pct) / 2));

      const updated = await updateUserProgress({
        xpToAdd: 30,
        aptitude: newAptitude,
        quizScore: true
      });

      setUser(prev => ({
        ...prev,
        xp: updated.xp,
        level: updated.level,
        quizzesCompleted: updated.quizzesCompleted,
        progress: updated.progress
      }));

      toast.success(`+30 XP Earned!`);
      if (updated.level > user.level) {
        toast.success(`🎉 LEVEL UP! You reached Level ${updated.level}!`);
      }
    } catch (err) {
      console.error('Failed to update aptitude progress:', err.message);
    }
  };

  // Called after submitting a mock test
  const updateMockTestProgress = async (score, total) => {
    if (!user) return;
    try {
      const pct = Math.round((score / total) * 100);
      const current = user.progress?.mockTest || 0;
      const newMock = Math.min(100, Math.round((current + pct) / 2));

      const updated = await updateUserProgress({
        xpToAdd: 100,
        mockTest: newMock,
        mockScore: true
      });

      setUser(prev => ({
        ...prev,
        xp: updated.xp,
        level: updated.level,
        mockTestsTaken: updated.mockTestsTaken,
        progress: updated.progress
      }));

      toast.success(`+100 XP Earned!`);
      if (updated.level > user.level) {
        toast.success(`🎉 LEVEL UP! You reached Level ${updated.level}!`);
      }
    } catch (err) {
      console.error('Failed to update mock test progress:', err.message);
    }
  };

  const syncProfile = async () => {
    try {
      const profile = await getUserProfile();
      setUser(profile);
    } catch (err) {
      console.error('Failed to sync profile:', err.message);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      googleLogin,
      logout,
      passwordReset, 
      addXP,
      syncProfile,
      updateCodingProgress, 
      updateAptitudeProgress, 
      updateMockTestProgress
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
