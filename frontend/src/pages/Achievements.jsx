import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';
import { 
  Award, 
  Trophy, 
  Flame, 
  Star, 
  Lock, 
  Unlock, 
  Code2, 
  BrainCircuit, 
  FileText, 
  ShieldAlert, 
  Medal, 
  Sparkles,
  Users,
  ChevronRight
} from 'lucide-react';

const BADGES = [
  {
    id: 'code_warrior',
    name: 'Code Warrior',
    description: 'Solve 5 coding problems in the practice portal.',
    requirement: (u) => (u.solvedProblems || 0) >= 5,
    progress: (u) => `${Math.min(5, u.solvedProblems || 0)}/5 problems`,
    icon: Code2,
    color: 'from-blue-500 to-indigo-500'
  },
  {
    id: 'aptitude_master',
    name: 'Aptitude Master',
    description: 'Complete 3 aptitude quizzes.',
    requirement: (u) => (u.quizzesCompleted || 0) >= 3,
    progress: (u) => `${Math.min(3, u.quizzesCompleted || 0)}/3 quizzes`,
    icon: BrainCircuit,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'test_conqueror',
    name: 'Test Conqueror',
    description: 'Complete 2 mock assessments.',
    requirement: (u) => (u.mockTestsTaken || 0) >= 2,
    progress: (u) => `${Math.min(2, u.mockTestsTaken || 0)}/2 tests`,
    icon: Trophy,
    color: 'from-amber-500 to-orange-500'
  },
  {
    id: 'streak_king',
    name: 'Streak King',
    description: 'Maintain a daily preparation streak of 5 days.',
    requirement: (u) => (u.dailyStreak || 0) >= 5,
    progress: (u) => `${Math.min(5, u.dailyStreak || 0)}/5 days`,
    icon: Flame,
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'elite_level',
    name: 'Elite Scholar',
    description: 'Reach Level 3 to unlock academic recognition.',
    requirement: (u) => (u.level || 1) >= 3,
    progress: (u) => `Level ${(u.level || 1)}/3`,
    icon: Medal,
    color: 'from-yellow-400 to-amber-600'
  },
  {
    id: 'resume_ready',
    name: 'Resume Wizard',
    description: 'Gain at least 250 XP total in the preparation portal.',
    requirement: (u) => (u.xp || 0) >= 250,
    progress: (u) => `${Math.min(250, u.xp || 0)}/250 XP`,
    icon: FileText,
    color: 'from-teal-500 to-emerald-500'
  }
];

const Achievements = () => {
  const { user } = useContext(AuthContext);
  const [leaderboard, setLeaderboard] = useState([]);

  // Fetch top 10 players sorted by XP from Firestore in real-time
  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map((doc, idx) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Anonymous Student',
          xp: data.xp || 0,
          level: data.level || 1,
          streak: data.dailyStreak || 1,
          rank: idx + 1
        };
      });
      setLeaderboard(entries);
    });
    return () => unsubscribe();
  }, []);

  if (!user) return null;

  // Level Progression Math
  const level = user.level || 1;
  const currentLevelXP = (level - 1) * (level - 1) * 100;
  const nextLevelXP = level * level * 100;
  const xpInCurrentLevel = user.xp - currentLevelXP;
  const xpNeededForNextLevel = nextLevelXP - currentLevelXP;
  const levelProgressPercent = Math.max(0, Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100)));

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-2.5">
            <Award className="text-indigo-500" size={32} />
            Achievements & Leaderboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Gain XP points, unlock badges, and rank up on the global placement prep leaderboard.
          </p>
        </div>
      </header>

      {/* Level Card & Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* RPG Leveling progress card */}
        <div className="md:col-span-2 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[220px] border border-indigo-950">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Star size={180} />
          </div>
          
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">Preparation Level</span>
              <h2 className="text-4xl font-black mt-1">Level {level}</h2>
            </div>
            <div className="flex items-center gap-1.5 bg-indigo-950 border border-indigo-900 px-3 py-1.5 rounded-2xl">
              <Star className="text-yellow-400 fill-yellow-400" size={16} />
              <span className="text-xs font-black">{user.xp || 0} Total XP</span>
            </div>
          </div>

          <div className="space-y-2 mt-6">
            <div className="flex justify-between text-xs font-bold text-slate-400">
              <span>Progress to Level {level + 1}</span>
              <span>{user.xp} / {nextLevelXP} XP</span>
            </div>
            <div className="w-full h-3 bg-indigo-950 border border-indigo-900/60 rounded-full overflow-hidden p-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${levelProgressPercent}%` }}
                transition={{ duration: 1.2, type: 'spring' }}
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Stats card */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase">Preparation Streak</span>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1">{user.dailyStreak || 1} Days</h3>
            </div>
            <div className="bg-orange-50 dark:bg-orange-950/40 p-3 rounded-2xl text-orange-500">
              <Flame className="animate-pulse" size={24} />
            </div>
          </div>
          
          <div className="border-t border-slate-100 dark:border-slate-750 pt-4 mt-4 text-xs font-bold text-slate-500 dark:text-slate-400 space-y-2">
            <div className="flex justify-between">
              <span>Problems Solved</span>
              <span className="text-slate-800 dark:text-white">{user.solvedProblems || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Quizzes Taken</span>
              <span className="text-slate-800 dark:text-white">{user.quizzesCompleted || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Mock Assessments</span>
              <span className="text-slate-800 dark:text-white">{user.mockTestsTaken || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Grid & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Badges Grid (Left) */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-black text-slate-850 dark:text-white">Unlockable Badges</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BADGES.map((badge) => {
              const isUnlocked = badge.requirement(user);
              return (
                <div
                  key={badge.id}
                  className={`border rounded-3xl p-5 shadow-sm transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[160px] ${
                    isUnlocked 
                      ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80 hover:shadow-md' 
                      : 'bg-slate-50/50 dark:bg-slate-900/35 border-slate-200 dark:border-slate-800 opacity-70'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-2xl text-white bg-gradient-to-br ${badge.color} shadow-md`}>
                      <badge.icon size={22} />
                    </div>
                    {isUnlocked ? (
                      <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase rounded-full flex items-center gap-1">
                        <Unlock size={10} /> Unlocked
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-slate-400 text-[9px] font-black uppercase rounded-full flex items-center gap-1">
                        <Lock size={10} /> Locked
                      </span>
                    )}
                  </div>

                  <div className="mt-4 space-y-1.5">
                    <h4 className="font-extrabold text-sm text-slate-850 dark:text-white">{badge.name}</h4>
                    <p className="text-[11px] font-medium text-slate-450 dark:text-slate-500 leading-normal">{badge.description}</p>
                    
                    {/* Progress tracking */}
                    <div className="pt-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider flex justify-between">
                      <span>Requirement:</span>
                      <span>{badge.progress(user)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Leaderboard (Right) */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-850 dark:text-white flex items-center gap-2">
            <Trophy className="text-yellow-500" size={20} />
            Global Rankings
          </h3>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-sm overflow-hidden p-4 space-y-3">
            {leaderboard.length > 0 ? (
              leaderboard.map((item) => {
                const isCurrentUser = item.id === user.uid;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      isCurrentUser 
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-150/45 dark:border-indigo-900/30' 
                        : 'border-slate-100 dark:border-slate-800/40 bg-slate-50/30 dark:bg-slate-900/5 hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank circle */}
                      <span className={`h-6.5 w-6.5 rounded-full text-xs font-black flex items-center justify-center ${
                        item.rank === 1 ? 'bg-yellow-400 text-slate-900 shadow-md shadow-yellow-400/20' :
                        item.rank === 2 ? 'bg-slate-300 text-slate-900' :
                        item.rank === 3 ? 'bg-amber-650 text-white' :
                        'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400'
                      }`}>
                        {item.rank}
                      </span>
                      
                      <div>
                        <h4 className={`text-xs font-black leading-tight flex items-center gap-1.5 ${
                          isCurrentUser ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-300'
                        }`}>
                          {item.name}
                          {isCurrentUser && <span className="text-[8px] font-black tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-950 px-1 py-0.2 rounded-md uppercase">You</span>}
                        </h4>
                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wider mt-0.5">
                          Level {item.level} Student • 🔥 {item.streak} day streak
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-black text-slate-700 dark:text-white">
                      {item.xp} XP
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500 font-semibold text-xs leading-relaxed flex flex-col items-center gap-1.5">
                <Users size={24} className="opacity-50" />
                Updating leaderboard...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Achievements;
