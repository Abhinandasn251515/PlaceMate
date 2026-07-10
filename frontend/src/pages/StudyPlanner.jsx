import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, 
  Plus, 
  Check, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  getTasks, 
  createTask, 
  toggleTask, 
  deleteTask 
} from '../api/backend';

const DAILY_ESSENTIALS = [
  { text: 'Solve the Problem of the Day 💻', priority: 'High' },
  { text: 'Complete 1 Aptitude Booster 🧠', priority: 'Medium' },
  { text: 'Run 1 AI Resume Analysis 📄', priority: 'Medium' },
  { text: 'Practice 1 AI Mock Interview Session 🎤', priority: 'High' }
];

const StudyPlanner = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [loading, setLoading] = useState(true);

  // Fetch tasks helper
  const fetchTasksList = async () => {
    try {
      const items = await getTasks();
      
      // Sort tasks: uncompleted first, then by priority (High -> Medium -> Low), then by creation date
      const priorityOrder = { High: 0, Medium: 1, Low: 2 };
      items.sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      setTasks(items);
    } catch (err) {
      console.error('Failed to fetch tasks:', err.message);
      toast.error('Failed to load tasks list.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasksList();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskText.trim()) return;

    try {
      const newTask = await createTask({
        text: taskText.trim(),
        priority
      });
      
      setTasks(prev => [newTask, ...prev]);
      setTaskText('');
      setPriority('Medium');
      toast.success('Task added successfully!');
      fetchTasksList(); // Refresh sorting
    } catch (err) {
      console.error(err);
      toast.error('Failed to add task.');
    }
  };

  const handleToggleTask = async (task) => {
    try {
      const data = await toggleTask(task._id);
      
      if (data.task.completed) {
        toast.success('Task completed! +15 XP earned!');
      } else {
        toast.info('Task marked as uncompleted.');
      }
      
      fetchTasksList(); // Refresh sorting and sync user state
    } catch (err) {
      console.error(err);
      toast.error('Failed to update task.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      toast.success('Task deleted.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete task.');
    }
  };

  // Seeding daily essentials templates
  const handleAddDailyEssentials = async () => {
    try {
      setLoading(true);
      const promises = DAILY_ESSENTIALS.map((task) => {
        // Prevent duplicate templates if they already exist in current tasks list
        const exists = tasks.some(t => t.text === task.text && !t.completed);
        if (!exists) {
          return createTask({
            text: task.text,
            priority: task.priority
          });
        }
        return Promise.resolve(null);
      });
      
      await Promise.all(promises);
      toast.success('Added Daily Essentials checklist to your planner!');
      fetchTasksList();
    } catch (err) {
      console.error(err);
      toast.error('Failed to load essentials checklist.');
      setLoading(false);
    }
  };

  const uncompletedTasksCount = tasks.filter(t => !t.completed).length;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-2.5">
            <ClipboardList className="text-indigo-500" size={32} />
            Study Planner
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Plan your preparation checklist, hit daily goals, and earn XP rewards.
          </p>
        </div>
        
        {/* Essentials Button */}
        <button
          onClick={handleAddDailyEssentials}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-black transition-all border border-indigo-100/50 dark:border-indigo-900/30 cursor-pointer animate-pulse"
        >
          <Sparkles size={14} /> Add Daily Essentials
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side: Task Form & Info */}
        <div className="space-y-6">
          {/* Add Task Form */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Create Task</h3>
            
            <form onSubmit={handleAddTask} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-405">Task Description</label>
                <input
                  type="text"
                  placeholder="e.g. Solve DFS algorithm questions..."
                  value={taskText}
                  onChange={(e) => setTaskText(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-850 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-405">Priority Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Low', 'Medium', 'High'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-2 rounded-xl text-[10px] font-black uppercase border transition-all cursor-pointer ${
                        priority === p
                          ? p === 'High' 
                            ? 'bg-red-500 border-red-500 text-white shadow-sm shadow-red-500/20'
                            : p === 'Medium'
                            ? 'bg-amber-500 border-amber-500 text-white shadow-sm shadow-amber-500/20'
                            : 'bg-blue-500 border-blue-500 text-white shadow-sm shadow-blue-500/20'
                          : 'bg-slate-50 dark:bg-slate-905 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!taskText.trim()}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-755 text-white font-black rounded-2xl text-xs tracking-wide transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 border-none"
              >
                <Plus size={14} /> Add Task
              </button>
            </form>
          </div>

          {/* Gamification reward stats card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white border border-indigo-950 rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="text-yellow-400" size={18} />
              <h4 className="text-xs font-black uppercase tracking-wider text-indigo-400">Task Rewards</h4>
            </div>
            <h3 className="text-lg font-black leading-tight">Every Checkoff Earns +15 XP!</h3>
            <p className="text-[11px] text-slate-300 font-semibold leading-relaxed">
              Completing checklist tasks grows your experience level and moves you up the leaderboard. Add "Daily Essentials" to quickly seed your daily placement challenges.
            </p>
          </div>
        </div>

        {/* Right Side: Task List View */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-750 pb-4 mb-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">My Checklist</h3>
              <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-500 text-[10px] font-black rounded-lg">
                {uncompletedTasksCount} Remaining
              </span>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center text-slate-450 dark:text-slate-500 font-semibold text-xs py-20">
                <RefreshCw className="animate-spin mr-2" size={16} /> Loading study tasks...
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
                <AlertCircle size={40} className="text-indigo-400/60" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No tasks active</p>
                <p className="text-[11px] font-semibold text-slate-400 max-w-xs text-center leading-normal">
                  Add tasks using the form or import "Daily Essentials" templates to bootstrap your prep roadmap!
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto max-h-[500px] space-y-2 pr-1">
                <AnimatePresence initial={false}>
                  {tasks.map(task => (
                    <motion.div
                      key={task._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        task.completed
                          ? 'bg-slate-50/50 dark:bg-slate-900/10 border-slate-100 dark:border-slate-800 opacity-60'
                          : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 flex-1 pr-4">
                        <button
                          onClick={() => handleToggleTask(task)}
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                            task.completed
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'bg-transparent border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                          }`}
                        >
                          {task.completed && <Check size={12} strokeWidth={3} />}
                        </button>

                        <span className={`text-xs font-semibold leading-relaxed ${
                          task.completed 
                            ? 'line-through text-slate-400 dark:text-slate-500' 
                            : 'text-slate-800 dark:text-slate-200'
                        }`}>
                          {task.text}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Priority Badge */}
                        <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase rounded-lg border ${
                          task.priority === 'High'
                            ? 'bg-red-50 dark:bg-red-950/20 text-red-500 border-red-100 dark:border-red-900/30'
                            : task.priority === 'Medium'
                            ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30'
                            : 'bg-blue-50 dark:bg-blue-950/20 text-blue-500 border-blue-100 dark:border-blue-900/30'
                        }`}>
                          {task.priority}
                        </span>

                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 rounded-xl transition-all cursor-pointer border-none bg-transparent"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyPlanner;
