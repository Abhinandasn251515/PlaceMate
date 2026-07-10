import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  LogOut, 
  Bell, 
  User as UserIcon, 
  Users, 
  Menu, 
  X,
  LayoutDashboard,
  MessageSquare,
  Code2,
  BrainCircuit,
  Timer,
  FileText,
  Building2,
  BookOpen,
  Globe,
  GraduationCap,
  Sun,
  Moon,
  Settings,
  Search,
  Sparkles,
  Mic,
  Award,
  ClipboardList,
  Calendar
} from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import SettingsModal from './SettingsModal';
import CommandPalette from './CommandPalette';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [partnerCount, setPartnerCount] = useState(1);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  
  // Theme state initialized from localStorage or system preference
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Sync theme changes from other components (like Command Palette)
  useEffect(() => {
    const handleStorageChange = () => {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme) setTheme(storedTheme);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen for Ctrl+K globally
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        e.stopPropagation();
        setIsPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown, true);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown, true);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Resume Analyzer', path: '/resume-analyzer', icon: Sparkles },
    { name: 'AI Mock Interview', path: '/mock-interview', icon: Mic },
    { name: 'Achievements', path: '/achievements', icon: Award },
    { name: 'Study Planner', path: '/planner', icon: ClipboardList },
    { name: 'Placement Calendar', path: '/calendar', icon: Calendar },
    { name: 'Coding Practice', path: '/coding', icon: Code2 },
    { name: 'Aptitude', path: '/aptitude', icon: BrainCircuit },
    { name: 'Mock Tests', path: '/mock-test', icon: Timer },
    { name: 'Resume Builder', path: '/resume-builder', icon: FileText },
    { name: 'Company Prep', path: '/company-prep', icon: Building2 },
    { name: 'Notes Library', path: '/notes', icon: BookOpen },
    { name: 'Online Resources', path: '/resources', icon: Globe },
    { name: 'Build Together', path: '/build-together', icon: Users },
  ];

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      setPartnerCount(snap.size || 1);
    });
    return () => unsub();
  }, []);

  return (
    <>
      <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-205 dark:border-slate-700/80 flex items-center justify-between px-6 sticky top-0 z-40 transition-colors duration-200">
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger menu */}
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 md:hidden transition-colors cursor-pointer"
          >
            <Menu size={22} />
          </button>

          {/* Global Search Bar (opens Command Palette) */}
          <button 
            onClick={() => setIsPaletteOpen(true)}
            className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-slate-400 hover:text-slate-650 dark:hover:text-slate-350 rounded-2xl text-xs font-bold transition-all shadow-inner w-44 md:w-56 cursor-pointer"
          >
            <Search size={14} className="shrink-0" />
            <span className="text-left flex-1 opacity-70">Search...</span>
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[9px] font-black rounded-md shadow-sm">Ctrl K</kbd>
          </button>

          {/* Real-time online counter */}
          <span className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] sm:text-xs font-black">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Users size={12} className="inline shrink-0" />
            {partnerCount} Live
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search trigger on mobile */}
          <button 
            onClick={() => setIsPaletteOpen(true)}
            className="p-2 text-slate-500 hover:text-indigo-650 dark:text-slate-400 dark:hover:text-indigo-400 sm:hidden transition-colors cursor-pointer"
            title="Search"
          >
            <Search size={20} />
          </button>

          {/* Light/Dark Mode Switcher */}
          <button 
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-indigo-650 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Settings Trigger */}
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-slate-500 hover:text-indigo-650 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            title="API Settings"
          >
            <Settings size={20} />
          </button>

          <button className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors cursor-pointer">
            <Bell size={20} />
          </button>
          
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1 sm:mx-2"></div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{user?.name || 'Student'}</p>
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">Level {user?.level || 1} Student</p>
            </div>
            <Link to="/profile" className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
               <UserIcon size={18} />
            </Link>
            <button 
              onClick={logout}
              className="p-2 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out Mobile Navigation Drawer overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Dark Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black z-50 md:hidden"
            />

            {/* Sidebar drawer content */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 w-72 bg-slate-900 text-slate-300 z-50 p-6 flex flex-col justify-between shadow-2xl md:hidden"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="text-indigo-400" size={28} />
                    <span className="text-lg font-black text-white">PlaceMate AI</span>
                  </div>
                  <button 
                    onClick={() => setIsMobileOpen(false)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <nav className="py-6 space-y-1 overflow-y-auto max-h-[70vh]">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center px-4 py-3 rounded-xl transition-all group ${
                          isActive 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                            : 'hover:bg-slate-800 hover:text-white text-slate-400'
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5 mr-3 shrink-0 text-indigo-405 group-[.active]:text-white" />
                      <span className="font-bold text-sm">{item.name}</span>
                    </NavLink>
                  ))}
                </nav>
              </div>

              {/* Drawer footer developer credits */}
              <div className="pt-6 border-t border-slate-800 text-center">
                <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase">
                  Developed by Abhinandan Ghosh
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Command Palette */}
      <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} onOpenSettings={() => setIsSettingsOpen(true)} />
    </>
  );
};

export default Navbar;
