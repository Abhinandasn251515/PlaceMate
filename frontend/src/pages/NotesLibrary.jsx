import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Book, Download, FileText, Search, Filter, BookOpen } from 'lucide-react';
import { collection, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const SUBJECT_COLORS = {
  DSA: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  OS: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  DBMS: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  CN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  OOPs: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  'System Design': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
};

const NotesLibrary = () => {
  const { user } = useContext(AuthContext);
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'notes'), snap => {
      setNotes(snap.docs.map(d => ({ _id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const subjects = ['All', ...new Set(notes.map(n => n.subject))];

  const filtered = notes.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filter === 'All' || n.subject === filter;
    return matchSearch && matchFilter;
  });

  const handleDownload = async (note) => {
    toast.success(`Opening "${note.title}"...`);
    
    // Open in a new tab
    if (note.link && note.link !== '#') {
      window.open(note.link, '_blank');
    } else {
      window.open('https://cooap.github.io/assets/files/Cheatsheet-Data-Structures-and-Algorithms.pdf', '_blank');
    }

    // Increment downloads count in real-time in Firestore
    try {
      const noteRef = doc(db, 'notes', note._id);
      await updateDoc(noteRef, {
        downloads: increment(1)
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Notes Library</h1>
          <p className="text-slate-500 dark:text-slate-400">Curated study materials to ace your placements.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
          <BookOpen size={16} />
          <span><strong className="text-slate-700 dark:text-white">{notes.length}</strong> resources available</span>
        </div>
      </header>

      {/* Search + Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-slate-900"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {subjects.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                filter === s
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Book size={48} className="mx-auto mb-4 opacity-30" />
          <p>No notes found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((note, i) => (
            <motion.div
              key={note._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-indigo-400/50 hover:shadow-lg transition-all p-6 flex flex-col group"
            >
              {/* Icon */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                  <FileText size={24} className="text-indigo-500" />
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${SUBJECT_COLORS[note.subject] || 'bg-slate-100 text-slate-600'}`}>
                  {note.subject}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex-1">
                {note.title}
              </h3>

              <div className="flex items-center gap-3 text-xs text-slate-400 mt-3 mb-5">
                <span>{note.type}</span>
                <span>•</span>
                <span>{note.size}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Download size={11} /> {note.downloads?.toLocaleString()}</span>
              </div>

              <button
                onClick={() => handleDownload(note)}
                className="w-full py-2.5 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 hover:text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 group/btn border border-indigo-200 dark:border-indigo-800 hover:border-indigo-600"
              >
                <Download size={16} />
                Download PDF
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesLibrary;
