import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Code2, 
  BrainCircuit, 
  Timer, 
  FileText, 
  Building2, 
  BookOpen, 
  GraduationCap,
  MessageSquare,
  Globe,
  User,
  Users
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Community Chat', path: '/community', icon: MessageSquare },
    { name: 'Coding Practice', path: '/coding', icon: Code2 },
    { name: 'Aptitude', path: '/aptitude', icon: BrainCircuit },
    { name: 'Mock Tests', path: '/mock-test', icon: Timer },
    { name: 'Resume Builder', path: '/resume-builder', icon: FileText },
    { name: 'Company Prep', path: '/company-prep', icon: Building2 },
    { name: 'Notes Library', path: '/notes', icon: BookOpen },
    { name: 'Online Resources', path: '/resources', icon: Globe },
    { name: 'Build Together', path: '/build-together', icon: Users },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 hidden md:flex transition-all duration-300">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
        <GraduationCap className="text-indigo-400 mr-2" size={28} />
        <h1 className="text-xl font-bold text-white tracking-wide">PlaceMate</h1>
      </div>
      
      <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 rounded-xl transition-all group ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                  : 'hover:bg-slate-800 hover:text-white text-slate-400'
              }`
            }
          >
            <item.icon className="w-4 h-4 mr-3 opacity-80 group-hover:opacity-100 transition-opacity shrink-0" />
            <span className="font-medium text-sm">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      {/* Bottom Profile Link */}
      <div className="p-3 border-t border-slate-800">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center px-3 py-2.5 rounded-xl transition-all group ${
              isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white text-slate-400'
            }`
          }
        >
          <User className="w-4 h-4 mr-3 opacity-80 group-hover:opacity-100 shrink-0" />
          <span className="font-medium text-sm">My Profile</span>
        </NavLink>
        <div className="mt-3 bg-gradient-to-r from-emerald-600 to-teal-600 p-3 rounded-xl text-white text-center mb-3">
          <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-0.5">✓ Full Access</p>
          <p className="text-xs opacity-70">All features unlocked & free</p>
        </div>
        <div className="text-center text-[10px] text-slate-500 font-bold tracking-wider py-1 border-t border-slate-800/60 uppercase">
          Developed by Abhinandan Ghosh
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
