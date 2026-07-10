import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Mail, Send, Globe, MessageSquare, Code, Users, Sparkles, AlertCircle, Terminal } from 'lucide-react';
import { collection, addDoc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const BuildTogether = () => {
  const { user } = useContext(AuthContext);
  
  // States for Suggestion Box
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionText, setSuggestionText] = useState('');
  const [suggestionCategory, setSuggestionCategory] = useState('Feature Request');

  // States for Contact form
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  // 1. Listen to Suggestions in real-time
  useEffect(() => {
    const q = query(collection(db, 'suggestions'), orderBy('timestamp', 'desc'), limit(20));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSuggestions(list);
    });
    return unsub;
  }, []);

  // Submit Suggestion
  const handleSuggestionSubmit = async (e) => {
    e.preventDefault();
    if (!suggestionText.trim()) return;

    try {
      await addDoc(collection(db, 'suggestions'), {
        userName: user?.name || 'Anonymous Student',
        email: user?.email || 'anonymous@gmail.com',
        category: suggestionCategory,
        text: suggestionText,
        timestamp: new Date().toISOString()
      });

      // Post activity log
      await addDoc(collection(db, 'activities'), {
        type: 'suggestion',
        message: `${user?.name || 'A student'} suggested: "${suggestionText.slice(0, 30)}..." 💡`,
        timestamp: new Date().toISOString()
      });

      setSuggestionText('');
      toast.success('Suggestion posted to the Live Board! Thank you for helping build PlaceMate. 💡');
    } catch (err) {
      console.error(err);
      toast.error('Failed to post suggestion.');
    }
  };

  // Submit Direct Message to Developer
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      toast.warning('Please fill in all fields.');
      return;
    }

    setSending(true);
    try {
      await addDoc(collection(db, 'developerMessages'), {
        senderName: user?.name || 'Anonymous Student',
        senderEmail: user?.email || 'anonymous@gmail.com',
        subject: contactForm.subject,
        message: contactForm.message,
        timestamp: new Date().toISOString()
      });

      toast.success('Your message was delivered straight to Abhinandan Ghosh! 🚀');
      setContactForm({ subject: '', message: '' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to deliver message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <header className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-8 relative overflow-hidden shadow-lg border border-indigo-700/30">
        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
          <Terminal size={140} />
        </div>
        <div className="max-w-2xl">
          <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-500/30 text-indigo-300 px-3.5 py-1.5 rounded-full border border-indigo-400/20">
            🤝 Collaboration Center
          </span>
          <h1 className="text-3xl font-black mt-4 tracking-tight leading-tight">Let's Build PlaceMate Together!</h1>
          <p className="text-sm text-indigo-200 mt-2 leading-relaxed font-medium">
            PlaceMate is open for collaborative development. Submit feature requests, write directly to the developer, and suggest coding problems or aptitude questions to grow the platform.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Contact Developer Form */}
        <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700/60 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2 mb-2">
              <Mail className="text-indigo-500" size={20} /> Contact Abhinandan Ghosh
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Have collaboration ideas, job offers, or feedback? Send a message directly to my inbox.
            </p>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-1.5">Subject</label>
                <input 
                  type="text" 
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  placeholder="e.g. Collaboration Proposal / Frontend Feedback"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-slate-200 text-sm focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-1.5">Your Message</label>
                <textarea 
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="Tell me your ideas or questions..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-slate-200 text-sm focus:border-indigo-500 resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={sending}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send size={14} /> {sending ? 'Delivering...' : 'Send Message to Developer'}
              </button>
            </form>
          </div>

          {/* Social Links */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Find me online:</span>
            <div className="flex gap-3">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 dark:bg-slate-900 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 dark:text-slate-400 rounded-xl transition-all border border-slate-200 dark:border-slate-700">
                <Globe size={16} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 dark:bg-slate-900 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 dark:text-slate-400 rounded-xl transition-all border border-slate-200 dark:border-slate-700">
                <Users size={16} />
              </a>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Real-Time Suggestion Box */}
        <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700/60 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col h-full">
            <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2 mb-2">
              <MessageSquare className="text-pink-500" size={20} /> Live Suggestion Board
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Post feature requests, questions, or ideas. Updates instantly for all students and recruiters live!
            </p>

            {/* Suggestions list scrollable */}
            <div className="flex-1 max-h-[220px] overflow-y-auto space-y-3 mb-6 pr-2">
              {suggestions.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">No suggestions posted yet. Post your idea below!</div>
              ) : (
                suggestions.map((s) => (
                  <div key={s.id} className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{s.userName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        s.category === 'Bug Report' ? 'bg-red-50 text-red-600 dark:bg-red-950/20' :
                        s.category === 'Content Request' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20' :
                        'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20'
                      }`}>
                        {s.category}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-1">{s.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Post suggestion Form */}
            <form onSubmit={handleSuggestionSubmit} className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700/60">
              <div className="flex gap-3">
                <select 
                  value={suggestionCategory}
                  onChange={(e) => setSuggestionCategory(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-300"
                >
                  <option value="Feature Request">💡 Feature Request</option>
                  <option value="Content Request">📚 Content Request</option>
                  <option value="Bug Report">🐛 Bug Report</option>
                </select>
                <input 
                  type="text" 
                  value={suggestionText}
                  onChange={(e) => setSuggestionText(e.target.value)}
                  placeholder="e.g. 'Add Python Compiler option for coding problems'"
                  className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-slate-200 text-xs focus:border-indigo-500"
                />
                <button 
                  type="submit"
                  disabled={!suggestionText.trim()}
                  className="bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white p-2.5 rounded-xl font-bold transition-all shadow-md shrink-0 flex items-center justify-center"
                >
                  <Send size={14} />
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>

      {/* Collaboration Board / Ideas */}
      <section className="bg-slate-50 dark:bg-slate-900/40 rounded-3xl p-6 border border-slate-100 dark:border-slate-700/60">
        <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-500" /> Collaboration Guidelines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center mb-3">
              <Code size={16} />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-white mb-1">Add Coding Problems</h4>
            <p className="text-slate-500 leading-relaxed">Submit LeetCode style problems along with test cases and starter codes to extend our compiler database.</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs">
            <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-pink-500 flex items-center justify-center mb-3">
              <MessageSquare size={16} />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-white mb-1">Report Bugs</h4>
            <p className="text-slate-500 leading-relaxed">Encountered an issue with compilation, compilers, layout, or timers? Post a Bug Report on the Live board instantly.</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center mb-3">
              <Users size={16} />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-white mb-1">Contribute Aptitude Questions</h4>
            <p className="text-slate-500 leading-relaxed">Suggest Quantitative, Logical or Verbal aptitude questions. Include options, correct answers and detailed explanations.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BuildTogether;
