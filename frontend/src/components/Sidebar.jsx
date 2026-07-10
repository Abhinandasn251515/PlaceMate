import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Code2, 
  BrainCircuit, 
  Timer, 
  FileText, 
  Building2, 
  BookOpen, 
  GraduationCap,
  Globe,
  User,
  Users,
  Sparkles,
  Mic,
  Award,
  ClipboardList,
  Calendar,
  Briefcase
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  const studentItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'SDE Job Board', path: '/jobs', icon: Briefcase },
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

  const recruiterItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Recruiter Admin', path: '/recruiter', icon: Building2 },
    { name: 'Online Resources', path: '/resources', icon: Globe },
    { name: 'Build Together', path: '/build-together', icon: Users },
  ];

  const navItems = user?.role === 'recruiter' ? recruiterItems : studentItems;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 hidden md:flex transition-all duration-300 shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
        <GraduationCap className="text-indigo-400 mr-2" size={28} />
        <h1 className="text-xl font-black text-white tracking-wide flex items-center gap-1.5">
          PlaceMate <span className="text-[10px] font-black tracking-widest text-indigo-400 bg-indigo-950 border border-indigo-900 px-1.5 py-0.5 rounded-md uppercase">AI</span>
        </h1>
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
            <item.icon className="w-4 h-4 mr-3 opacity-85 group-hover:opacity-100 transition-opacity shrink-0 text-indigo-400 group-[.active]:text-white" />
            <span className="font-bold text-sm">{item.name}</span>
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
          <span className="font-bold text-sm">My Profile</span>
        </NavLink>
        <div className="mt-3 bg-gradient-to-r from-indigo-600 to-indigo-755 p-3 rounded-xl text-white text-center mb-3 border border-indigo-500/20 shadow-lg shadow-indigo-950/40">
          <p className="text-xs font-black uppercase tracking-wider opacity-90 mb-0.5">✓ AI Premium Access</p>
          <p className="text-[10px] opacity-75">All flagship modules unlocked</p>
        </div>
        <div className="text-center text-[10px] text-slate-500 font-black tracking-widest py-1 border-t border-slate-800/60 uppercase">
          Developed by Abhinandan Ghosh
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
