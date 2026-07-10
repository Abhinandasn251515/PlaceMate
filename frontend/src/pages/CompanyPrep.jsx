import React, { useState, useEffect } from 'react';
import { Search, MapPin, DollarSign, Briefcase, Users, ChevronRight, Building2 } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';

const TYPE_STYLE = {
  'Product Based': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Service Based': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

const COMPANY_GRADIENT = {
  Google: 'from-blue-500 to-green-400',
  Amazon: 'from-orange-500 to-amber-400',
  Microsoft: 'from-blue-600 to-cyan-500',
  Infosys: 'from-indigo-600 to-blue-500',
  TCS: 'from-teal-600 to-emerald-500',
  Wipro: 'from-violet-600 to-purple-500',
};

const CompanyPrep = () => {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'companies'), snap => {
      setCompanies(snap.docs.map(d => ({ _id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const filtered = companies.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filter === 'All' || c.type === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Company Prep</h1>
          <p className="text-slate-500 dark:text-slate-400">Targeted resources for top recruiters visiting your campus.</p>
        </div>
        <div className="flex items-center gap-3">
          {['All', 'Product Based', 'Service Based'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === f
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search companies or roles..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-slate-900 transition-all"
        />
      </div>

      {/* Company Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Building2 size={48} className="mx-auto mb-4 opacity-30" />
          <p>No companies found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((c, i) => (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => setSelected(selected?._id === c._id ? null : c)}
              className={`bg-white dark:bg-slate-800 rounded-2xl border overflow-hidden cursor-pointer transition-all hover:shadow-lg group ${
                selected?._id === c._id ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-slate-100 dark:border-slate-700 hover:border-indigo-400/50'
              }`}
            >
              {/* Top Gradient Banner */}
              <div className={`h-2 bg-gradient-to-r ${COMPANY_GRADIENT[c.name] || 'from-indigo-500 to-purple-500'}`} />

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${COMPANY_GRADIENT[c.name] || 'from-indigo-500 to-purple-500'} flex items-center justify-center text-white text-2xl font-black shadow-lg`}>
                    {c.name[0]}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${TYPE_STYLE[c.type]}`}>{c.type}</span>
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{c.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{c.role}</p>

                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <DollarSign size={14} className="text-emerald-500 shrink-0" />
                    <span className="font-semibold">{c.ctc}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <MapPin size={14} className="text-blue-500 shrink-0" />
                    <span className="truncate">{c.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 col-span-2">
                    <Users size={14} className="text-purple-500 shrink-0" />
                    <span>{c.openPositions} open positions</span>
                  </div>
                </div>

                {/* Requirements Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {c.requirements?.map(r => (
                    <span key={r} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300">{r}</span>
                  ))}
                </div>

                {/* Expanded Details */}
                {selected?._id === c._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-slate-100 dark:border-slate-700 pt-4 mt-2"
                  >
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{c.description}</p>
                    <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                      View Prep Guide <ChevronRight size={16} />
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyPrep;
