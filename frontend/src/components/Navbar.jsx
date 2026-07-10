import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Bell, User as UserIcon, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [partnerCount, setPartnerCount] = useState(1);

  useEffect(() => {
    // Real-time counter of total users in database
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      setPartnerCount(snap.size || 1);
    });
    return () => unsub();
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 sticky top-0 z-10 transition-colors duration-200">
      <div className="flex items-center gap-4">
        {/* Real-time online counter for recruiters */}
        <span className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-black">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Users size={12} className="inline shrink-0" />
          {partnerCount} Prep Partners Online Live
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
          <Bell size={20} />
        </button>
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{user?.name || 'Student'}</p>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">Free Full Access</p>
          </div>
          <Link to="/profile" className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
             <UserIcon size={18} />
          </Link>
          <button 
            onClick={logout}
            className="p-2 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
