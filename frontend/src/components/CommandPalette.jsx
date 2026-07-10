import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Sparkles, 
  Mic, 
  Award, 
  ClipboardList, 
  Calendar, 
  LayoutDashboard, 
  Code2, 
  BrainCircuit, 
  Timer, 
  FileText, 
  Building2, 
  BookOpen, 
  Globe, 
  Users, 
  Sun, 
  Moon, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CommandPalette = ({ isOpen, onClose, onOpenSettings }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Command Palette Items
  const items = [
    { name: 'Go to Dashboard', type: 'nav', path: '/dashboard', icon: LayoutDashboard, keywords: 'home landing dashboard progress stats' },
    { name: 'AI Resume Analyzer', type: 'nav', path: '/resume-analyzer', icon: Sparkles, keywords: 'ai resume parser cv review feedback ats audit score' },
    { name: 'AI Mock Interview', type: 'nav', path: '/mock-interview', icon: Mic, keywords: 'ai interview speech voice practice prep evaluation feedback' },
    { name: 'Achievements & Leaderboard', type: 'nav', path: '/achievements', icon: Award, keywords: 'xp points level ranking badges score streak progression' },
    { name: 'Study Planner', type: 'nav', path: '/planner', icon: ClipboardList, keywords: 'todo planner tasks checklist daily routine scheduler focus' },
    { name: 'Placement Calendar', type: 'nav', path: '/calendar', icon: Calendar, keywords: 'calendar drives companies dates timeline schedule events' },
    { name: 'Coding Practice', type: 'nav', path: '/coding', icon: Code2, keywords: 'coding code monaco javascript python java algorithm ds' },
    { name: 'Aptitude Tests', type: 'nav', path: '/aptitude', icon: BrainCircuit, keywords: 'aptitude math reasoning logic verbal quiz test' },
    { name: 'Mock Tests', type: 'nav', path: '/mock-test', icon: Timer, keywords: 'mock tests timer quiz exam practice verbal quantitative logical' },
    { name: 'Resume Builder', type: 'nav', path: '/resume-builder', icon: FileText, keywords: 'resume builder cv maker template classic minimal modern' },
    { name: 'Company Preparation', type: 'nav', path: '/company-prep', icon: Building2, keywords: 'companies placement drive questions interviews' },
    { name: 'Notes Library', type: 'nav', path: '/notes', icon: BookOpen, keywords: 'notes library study materials pdf guides cheatsheets' },
    { name: 'Online Resources', type: 'nav', path: '/resources', icon: Globe, keywords: 'resources websites links study documentation coding' },
    { name: 'Build Together', type: 'nav', path: '/build-together', icon: Users, keywords: 'collab workspace group together team project' },
    
    // Quick Actions
    { 
      name: 'Toggle Theme (Light / Dark)', 
      type: 'action', 
      icon: Sun, 
      keywords: 'theme light dark mode toggle appearance color black white',
      action: () => {
        const currentTheme = localStorage.getItem('theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', newTheme);
        window.dispatchEvent(new Event('storage')); // trigger sync
      }
    },
    { 
      name: 'Configure Gemini API Key', 
      type: 'action', 
      icon: Settings, 
      keywords: 'api settings configuration key setup keys gemini credentials',
      action: () => {
        onOpenSettings();
      }
    }
  ];

  // Filter items by search text
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.keywords.toLowerCase().includes(search.toLowerCase())
  );

  // Keyboard navigation & global listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Listen for Ctrl + K or Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }

      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, filteredItems, selectedIndex]);

  // Global Ctrl + K listener to open palette
  // In our case, we can register it globally in App.jsx or Navbar.jsx. 
  // Let's add it to App.jsx later, but this key handler is specifically for inside the open palette.

  const handleSelect = (item) => {
    onClose();
    if (item.type === 'nav') {
      navigate(item.path);
    } else if (item.type === 'action') {
      item.action();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Palette Box */}
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: -10 }}
            transition={{ type: 'spring', duration: 0.35 }}
            className="bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden relative z-10 backdrop-blur-md flex flex-col max-h-[60vh]"
          >
            {/* Input Area */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-750">
              <Search className="text-slate-400 dark:text-slate-500 shrink-0" size={18} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search routes or actions... (e.g. 'resume', 'dark mode')"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedIndex(0);
                }}
                className="w-full bg-transparent border-none text-slate-800 dark:text-white placeholder-slate-450 focus:outline-none text-sm font-medium"
              />
              <button
                onClick={onClose}
                className="px-1.5 py-0.5 text-[10px] font-bold text-slate-400 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
              >
                ESC
              </button>
            </div>

            {/* List Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <button
                      key={index}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full text-left px-4 py-3 rounded-2xl flex items-center justify-between transition-all group ${
                        isSelected 
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30' 
                          : 'text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl shrink-0 transition-colors ${
                          isSelected 
                            ? 'bg-indigo-500 text-white' 
                            : 'bg-slate-100 dark:bg-slate-905 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                        }`}>
                          <item.icon size={16} />
                        </div>
                        <div>
                          <span className="font-bold text-sm leading-tight block">{item.name}</span>
                          <span className={`text-[10px] font-medium leading-none block mt-0.5 ${
                            isSelected ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-550'
                          }`}>
                            {item.type === 'nav' ? `Navigate to ${item.path}` : 'Quick Action'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Keyboard Action Indicator */}
                      {isSelected && (
                        <span className="text-[10px] font-black tracking-wider uppercase bg-indigo-500/50 text-indigo-100 px-2 py-0.5 rounded-md border border-indigo-400/20">
                          Enter
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="py-12 text-center text-slate-400 dark:text-slate-500 font-semibold text-sm">
                  No matching options found.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-150 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-900/25 flex items-center justify-between text-[10px] text-slate-400 font-bold tracking-wider">
              <div className="flex gap-4">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
              </div>
              <div>PlaceMate AI Command Center</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
