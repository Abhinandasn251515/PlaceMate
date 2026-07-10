import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Award, Flame, Code2, BrainCircuit, FileText, Trophy, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.info('Logged out successfully.');
    navigate('/login');
  };

  const progress = [
    { label: 'Coding Practice', value: user?.progress?.coding || 0, color: 'bg-blue-500', icon: Code2, iconColor: 'text-blue-500' },
    { label: 'Aptitude', value: user?.progress?.aptitude || 0, color: 'bg-indigo-500', icon: BrainCircuit, iconColor: 'text-indigo-500' },
    { label: 'Mock Tests', value: user?.progress?.mockTest || 0, color: 'bg-emerald-500', icon: Trophy, iconColor: 'text-emerald-500' },
    { label: 'Resume', value: user?.progress?.resume || 0, color: 'bg-amber-500', icon: FileText, iconColor: 'text-amber-500' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="h-36 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 relative">
          <div className="absolute inset-0 opacity-30"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
          />
        </div>
        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 mb-6 gap-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="h-24 w-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 border-4 border-white dark:border-slate-800 flex items-center justify-center text-4xl font-black text-white shadow-xl"
            >
              {user?.name?.[0]?.toUpperCase() || 'S'}
            </motion.div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 font-semibold rounded-xl transition-colors text-sm self-start sm:self-auto"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>

          <h2 className="text-3xl font-black text-slate-900 dark:text-white">{user?.name || 'Student'}</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{user?.email}</p>

          {/* Stats Row */}
          <div className="flex items-center gap-6 mt-5 flex-wrap">
            <div className="flex items-center gap-2 text-orange-500">
              <Flame size={20} />
              <span className="font-black text-slate-800 dark:text-white text-lg">{user?.dailyStreak || 0}</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">Day Streak</span>
            </div>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              <Award size={20} className="text-emerald-500" />
              <span className="font-black text-slate-800 dark:text-white text-lg">Free</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">Full Access</span>
            </div>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              <Code2 size={20} className="text-blue-500" />
              <span className="font-black text-slate-800 dark:text-white text-lg">0</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">Problems Solved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-8 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Preparation Progress</h3>
        <div className="space-y-5">
          {progress.map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <p.icon size={16} className={p.iconColor} />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{p.label}</span>
                </div>
                <span className="text-sm font-black text-slate-900 dark:text-white">{p.value}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${p.value}%` }}
                  transition={{ duration: 1, delay: i * 0.15, ease: 'easeOut' }}
                  className={`h-2.5 rounded-full ${p.color}`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Account Info Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-8 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Account Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <User size={18} className="text-indigo-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Full Name</p>
              <p className="font-bold text-slate-900 dark:text-white">{user?.name || 'Not set'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Mail size={18} className="text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Email Address</p>
              <p className="font-bold text-slate-900 dark:text-white">{user?.email || 'Not set'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Award size={18} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Plan</p>
              <p className="font-bold text-emerald-600 dark:text-emerald-400">✓ Free Full Access</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Flame size={18} className="text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Daily Streak</p>
              <p className="font-bold text-slate-900 dark:text-white">{user?.dailyStreak || 0} Days 🔥</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
