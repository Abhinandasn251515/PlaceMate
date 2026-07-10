import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy, limit, doc, updateDoc, addDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Flame, 
  Code2, 
  BrainCircuit, 
  FileText, 
  Briefcase, 
  Trophy, 
  TrendingUp,
  Clock,
  Target,
  Award,
  User,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { toast } from 'react-toastify';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activities, setActivities] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [drives, setDrives] = useState([]);
  const [registering, setRegistering] = useState({});
  const [dailyCodeProblem, setDailyCodeProblem] = useState(null);
  const [dailyAptitude, setDailyAptitude] = useState(null);

  // 1. Live Feed (Activities)
  useEffect(() => {
    const q = query(collection(db, 'activities'), orderBy('timestamp', 'desc'), limit(6));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newActivities = snapshot.docs.map(doc => {
        const data = doc.data();
        let timeStr = 'Just now';
        if (data.timestamp) {
          const diff = Date.now() - new Date(data.timestamp).getTime();
          const mins = Math.floor(diff / 60000);
          if (mins > 0) {
            timeStr = mins < 60 ? `${mins}m ago` : `${Math.floor(mins / 60)}h ago`;
          }
        }
        return {
          id: doc.id,
          type: data.type || 'info',
          message: data.message || '',
          time: timeStr
        };
      });
      setActivities(newActivities);
    });
    return () => unsubscribe();
  }, []);

  // 2. Real-Time Progression Board (Leaderboard of all registered users)
  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('progress.overall', 'desc'), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const runners = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Anonymous Student',
          overall: data.progress?.overall || 0,
          solved: data.solvedProblems || 0,
          streak: data.dailyStreak || 0
        };
      });
      setLeaderboard(runners);
    });
    return () => unsubscribe();
  }, []);

  // 3. Real-Time Placement Drives Fetch
  useEffect(() => {
    const q = query(collection(db, 'placementDrives'), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const drivesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDrives(drivesList);
    });
    return () => unsubscribe();
  }, []);

  // 4. Fetch coding problems & select daily problem
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'codingProblems'), (snap) => {
      if (snap.empty) return;
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const day = new Date().getDate();
      const problem = list[day % list.length];
      setDailyCodeProblem(problem);
    });
    return () => unsub();
  }, []);

  // 5. Fetch aptitude questions & select daily booster
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'aptitudeQuestions'), (snap) => {
      if (snap.empty) return;
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const day = new Date().getDate();
      const question = list[(day * 7) % list.length];
      setDailyAptitude(question);
    });
    return () => unsub();
  }, []);

  const progressData = {
    coding: user?.progress?.coding || 0,
    aptitude: user?.progress?.aptitude || 0,
    mockTest: user?.progress?.mockTest || 0,
    resume: user?.progress?.resume || 0,
    overall: user?.progress?.overall || 0
  };

  const handleRegisterDrive = async (company) => {
    if (!user?.uid) {
      toast.error('You must be logged in to register.');
      return;
    }
    setRegistering(prev => ({ ...prev, [company]: true }));
    try {
      const userRef = doc(db, 'users', user.uid);
      const currentDrives = user.registeredDrives || [];
      if (currentDrives.includes(company)) return;

      await updateDoc(userRef, {
        registeredDrives: arrayUnion(company)
      });

      // Post activity live event
      await addDoc(collection(db, 'activities'), {
        type: 'drive',
        message: `${user.name || 'A student'} registered for ${company} recruitment drive! 🚀`,
        timestamp: new Date().toISOString()
      });

      toast.success(`Successfully registered for ${company} drive! Check email for details.`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to register. Please try again.');
    } finally {
      setRegistering(prev => ({ ...prev, [company]: false }));
    }
  };

  // Sparkline chart representing student's daily preparation intensity
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Prep intensity',
        data: [
          progressData.coding > 0 ? Math.min(10, Math.ceil(progressData.coding / 10)) : 1,
          progressData.aptitude > 0 ? Math.min(10, Math.ceil(progressData.aptitude / 10)) : 2,
          progressData.mockTest > 0 ? Math.min(10, Math.ceil(progressData.mockTest / 10)) : 1,
          Math.max(1, Math.min(10, Math.floor(progressData.overall / 8))),
          Math.max(2, Math.min(10, Math.floor((progressData.overall + 10) / 8))),
          Math.max(3, Math.min(10, Math.floor((progressData.overall + 25) / 8))),
          Math.max(4, Math.min(10, Math.floor((progressData.overall + 40) / 8)))
        ],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#6366f1',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    },
    scales: {
      y: { 
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#94a3b8', font: { size: 10 } },
        min: 0,
        max: 10
      },
      x: { 
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 10 } }
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
            Welcome back, <span className="text-indigo-600 dark:text-indigo-400">{user?.name?.split(' ')[0] || 'Student'}</span>! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Your customized placement preparation control center.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-5 py-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60">
             <div className="bg-orange-50 dark:bg-orange-950/40 p-2.5 rounded-xl shrink-0">
               <Flame className="text-orange-500 animate-pulse" size={24} />
             </div>
             <div>
               <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Daily Streak</p>
               <p className="text-lg font-black text-slate-800 dark:text-white">{user?.dailyStreak || 1} Days</p>
             </div>
          </div>
        </div>
      </header>

      {/* Real-time stats progression cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Coding Prep', value: progressData.coding, icon: Code2, color: 'text-blue-500', bg: 'bg-blue-500/10', glow: 'shadow-blue-500/5' },
          { title: 'Aptitude', value: progressData.aptitude, icon: BrainCircuit, color: 'text-indigo-500', bg: 'bg-indigo-500/10', glow: 'shadow-indigo-500/5' },
          { title: 'Mock Tests', value: progressData.mockTest, icon: Trophy, color: 'text-emerald-500', bg: 'bg-emerald-500/10', glow: 'shadow-emerald-500/5' },
          { title: 'Resume Strength', value: progressData.resume, icon: FileText, color: 'text-amber-500', bg: 'bg-amber-500/10', glow: 'shadow-amber-500/5' }
        ].map((stat, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            key={idx} 
            className={`bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/60 relative overflow-hidden group hover:shadow-lg transition-all duration-300 ${stat.glow}`}
          >
            {/* Progress bar accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-700/40">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stat.value}%` }}
                transition={{ duration: 1.2, delay: idx * 0.15 }}
                className={`h-full bg-gradient-to-r ${
                  stat.color.includes('blue') ? 'from-blue-500 to-cyan-400' :
                  stat.color.includes('indigo') ? 'from-indigo-500 to-purple-500' :
                  stat.color.includes('emerald') ? 'from-emerald-500 to-teal-400' :
                  'from-amber-500 to-orange-400'
                }`}
              />
            </div>

            <div className="flex justify-between items-start mb-4">
               <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                 <stat.icon size={22} />
               </div>
               <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                 <TrendingUp size={10} /> Live
               </span>
            </div>
            <h3 className="text-slate-400 dark:text-slate-500 font-semibold text-xs uppercase tracking-wider mb-1">{stat.title}</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{stat.value}%</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 📅 Daily Challenges (Dynamic date-rotating system) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Coding Challenge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[180px]"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Code2 size={120} />
          </div>
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full text-white">
                📅 Coding Challenge of the Day
              </span>
              {dailyCodeProblem && (
                <span className="text-[10px] font-black uppercase tracking-widest bg-slate-950/20 px-3 py-1 rounded-full text-blue-200">
                  {dailyCodeProblem.difficulty}
                </span>
              )}
            </div>
            <h3 className="text-xl font-black mb-1.5">{dailyCodeProblem?.title || 'Loading Daily Challenge...'}</h3>
            <p className="text-xs text-blue-100 line-clamp-2 leading-relaxed mb-4">{dailyCodeProblem?.description || 'Pick up today\'s challenge and increment your coding profile percentage!'}</p>
          </div>
          <button 
            onClick={() => navigate('/coding')}
            className="w-full sm:w-auto self-start bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-md active:scale-95"
          >
            Solve Problem Now →
          </button>
        </motion.div>

        {/* Daily Aptitude Booster */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-purple-600 to-pink-700 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[180px]"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <BrainCircuit size={120} />
          </div>
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full text-white">
                📅 Daily Aptitude Booster
              </span>
              {dailyAptitude && (
                <span className="text-[10px] font-black uppercase tracking-widest bg-slate-950/20 px-3 py-1 rounded-full text-pink-200">
                  {dailyAptitude.topic}
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold mb-3 leading-relaxed line-clamp-2">
              {dailyAptitude?.question || 'Loading Daily Teaser...'}
            </h3>
          </div>
          <button 
            onClick={() => navigate('/aptitude')}
            className="w-full sm:w-auto self-start bg-white text-pink-700 hover:bg-pink-50 font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-md active:scale-95 mt-auto"
          >
            Solve Quiz Now →
          </button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progression Overview Sparkline */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
             <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Weekly Activity Trend</h3>
                <p className="text-xs text-slate-400 mt-0.5">Prep intensity tracker (updated dynamically as you solve modules)</p>
             </div>
             <div className="text-right">
               <span className="text-xs text-slate-400">Overall Progress</span>
               <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{progressData.overall}%</p>
             </div>
          </div>
          <div className="flex-1 min-h-[220px]">
             <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Real-time Progression Board (Leaderboard) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-5">
             <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
               <Award className="text-indigo-500" size={20} /> Progression Board
             </h3>
             <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400 px-2.5 py-1 rounded-full">
               Live Rankings
             </span>
          </div>

          <div className="space-y-3.5 flex-1">
            {leaderboard.map((player, idx) => {
              const isCurrentUser = player.name === user?.name;
              return (
                <div 
                  key={player.id} 
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isCurrentUser 
                      ? 'bg-indigo-50/50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900/60' 
                      : 'bg-slate-50/30 border-slate-100 dark:bg-slate-900/10 dark:border-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                      idx === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' :
                      idx === 1 ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                      idx === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400' :
                      'bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className={`text-sm font-bold truncate ${isCurrentUser ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {player.name} {isCurrentUser && '(You)'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{player.solved} solved • {player.streak} day streak</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-slate-800 dark:text-white">{player.overall}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Feed Feed */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-base font-black text-slate-800 dark:text-white tracking-tight">Recent Live Actions</h3>
             <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-1 rounded-full shrink-0">
                <span className="relative flex h-1.5 w-1.5">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                Live Activity
             </span>
          </div>
          
          <div className="space-y-4 flex-1">
            {activities.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">No activity yet. Solve questions to start the live stream!</div>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="flex gap-3 group items-start text-xs">
                  <div className="h-8 w-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center shrink-0">
                    {act.type === 'coding' ? <Code2 size={14} /> : act.type === 'aptitude' ? <BrainCircuit size={14} /> : <Trophy size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-600 dark:text-slate-300 font-medium leading-normal break-words">
                       {act.message}
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-1">{act.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Placement Drive Registrar */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60 p-6">
          <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2 tracking-tight">
                 <Briefcase className="text-indigo-500" size={18} /> Campus Recruitment Drives
              </h3>
          </div>
          
          <div className="space-y-3.5">
            {drives.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">No recruitment drives posted.</div>
            ) : (
              drives.map((drive) => {
                const isRegistered = user?.registeredDrives?.includes(drive.company);
                const isLoading = registering[drive.company] === true;

                return (
                  <div key={drive.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60 hover:border-indigo-400/50 transition-all bg-slate-50/20 dark:bg-slate-900/10">
                      <div className="flex items-center gap-4 mb-3 sm:mb-0">
                          <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${
                            drive.company.toLowerCase().includes('google') ? 'from-blue-500 to-green-500' :
                            drive.company.toLowerCase().includes('microsoft') ? 'from-blue-600 to-cyan-500' :
                            drive.company.toLowerCase().includes('amazon') ? 'from-orange-500 to-amber-500' :
                            'from-indigo-500 to-purple-600'
                          } flex items-center justify-center font-black text-white text-lg shadow-md shrink-0`}>
                              {drive.company[0]}
                          </div>
                          <div>
                              <h4 className="font-bold text-slate-800 dark:text-white text-sm">{drive.company}</h4>
                              <p className="text-xs text-slate-400 mt-0.5">{drive.role} • <strong className="text-emerald-500">{drive.ctc}</strong></p>
                          </div>
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                          <span className="flex items-center text-xs text-slate-400">
                              <Clock size={14} className="mr-1 text-slate-400" /> {drive.date}
                          </span>
                          <button 
                            onClick={() => !isRegistered && !isLoading && handleRegisterDrive(drive.company)}
                            disabled={isRegistered || isLoading}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 min-w-[90px] ${
                              isRegistered 
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 cursor-default'
                                : isLoading 
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-600 dark:hover:text-white shadow-sm'
                            }`}
                          >
                            {isRegistered ? 'Registered ✓' : isLoading ? 'Registering...' : 'Register'}
                          </button>
                      </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
