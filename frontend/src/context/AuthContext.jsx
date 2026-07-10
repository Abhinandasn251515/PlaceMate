import React, { createContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut 
} from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let userUnsub = null;

    const authUnsub = onAuthStateChanged(auth, (firebaseUser) => {
      // Clean up previous user listener
      if (userUnsub) { userUnsub(); userUnsub = null; }

      if (firebaseUser) {
        // ✅ REAL-TIME: Listen to user doc changes in Firestore
        const userRef = doc(db, 'users', firebaseUser.uid);
        userUnsub = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            setUser({ uid: firebaseUser.uid, ...snap.data() });
          } else {
            // First-time user (e.g. Google login before profile created)
            setUser({
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'Student',
              email: firebaseUser.email,
              role: 'student',
              dailyStreak: 0,
              solvedProblems: 0,
              quizzesCompleted: 0,
              mockTestsTaken: 0,
              progress: { coding: 0, aptitude: 0, mockTest: 0, resume: 0, overall: 0 }
            });
          }
          setLoading(false);
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      authUnsub();
      if (userUnsub) userUnsub();
    };
  }, []);

  const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (name, email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    const userProfile = {
      name,
      email,
      role: 'student',
      dailyStreak: 1,
      solvedProblems: 0,
      quizzesCompleted: 0,
      mockTestsTaken: 0,
      progress: { coding: 0, aptitude: 0, mockTest: 0, resume: 0, overall: 0 },
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
  };

  const googleLogin = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;
    const userRef = doc(db, 'users', firebaseUser.uid);

    // Only create profile if it doesn't exist (checked by onSnapshot above)
    // We use setDoc with merge:true to safely initialise without overwriting
    await setDoc(userRef, {
      name: firebaseUser.displayName || 'Google User',
      email: firebaseUser.email,
      role: 'student',
      dailyStreak: 1,
      solvedProblems: 0,
      quizzesCompleted: 0,
      mockTestsTaken: 0,
      progress: { coding: 0, aptitude: 0, mockTest: 0, resume: 0, overall: 0 },
      createdAt: new Date().toISOString()
    }, { merge: true });
  };

  // ✅ Called after solving a coding problem
  const updateCodingProgress = async () => {
    if (!user?.uid) return;
    const ref = doc(db, 'users', user.uid);
    const solved = (user.solvedProblems || 0) + 1;
    const newCoding = Math.min(100, Math.round((solved / 10) * 100));
    const newOverall = Math.min(100, Math.round(
      (newCoding + (user.progress?.aptitude || 0) + (user.progress?.mockTest || 0) + (user.progress?.resume || 0)) / 4
    ));
    await updateDoc(ref, {
      solvedProblems: solved,
      'progress.coding': newCoding,
      'progress.overall': newOverall
    });
  };

  // ✅ Called after completing an aptitude quiz
  const updateAptitudeProgress = async (score, total) => {
    if (!user?.uid) return;
    const ref = doc(db, 'users', user.uid);
    const completed = (user.quizzesCompleted || 0) + 1;
    const pct = Math.round((score / total) * 100);
    const current = user.progress?.aptitude || 0;
    const newAptitude = Math.min(100, Math.round((current + pct) / 2));
    const newOverall = Math.min(100, Math.round(
      ((user.progress?.coding || 0) + newAptitude + (user.progress?.mockTest || 0) + (user.progress?.resume || 0)) / 4
    ));
    await updateDoc(ref, {
      quizzesCompleted: completed,
      'progress.aptitude': newAptitude,
      'progress.overall': newOverall
    });
  };

  // ✅ Called after submitting a mock test
  const updateMockTestProgress = async (score, total) => {
    if (!user?.uid) return;
    const ref = doc(db, 'users', user.uid);
    const taken = (user.mockTestsTaken || 0) + 1;
    const pct = Math.round((score / total) * 100);
    const current = user.progress?.mockTest || 0;
    const newMock = Math.min(100, Math.round((current + pct) / 2));
    const newOverall = Math.min(100, Math.round(
      ((user.progress?.coding || 0) + (user.progress?.aptitude || 0) + newMock + (user.progress?.resume || 0)) / 4
    ));
    await updateDoc(ref, {
      mockTestsTaken: taken,
      'progress.mockTest': newMock,
      'progress.overall': newOverall
    });
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, loading, login, register, googleLogin, logout,
      updateCodingProgress, updateAptitudeProgress, updateMockTestProgress
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
