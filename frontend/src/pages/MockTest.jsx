import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Timer, CheckCircle, Trophy, Clock, ChevronRight, RotateCcw, Play } from 'lucide-react';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const DIFFICULTY_STYLE = {
  Easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const COMPANY_COLORS = {
  TCS: 'from-blue-600 to-cyan-500',
  Infosys: 'from-indigo-600 to-blue-500',
  Amazon: 'from-orange-500 to-amber-400',
  Google: 'from-red-500 via-yellow-500 to-green-500',
  Microsoft: 'from-blue-500 via-teal-500 to-indigo-500',
  Cognizant: 'from-teal-600 to-emerald-500',
  Wipro: 'from-purple-500 to-indigo-500',
  Accenture: 'from-purple-600 to-pink-500',
};

const MockTest = () => {
  const { user, updateMockTestProgress } = useContext(AuthContext);
  const [tests, setTests] = useState([]);
  const [activeTest, setActiveTest] = useState(null);
  const [phase, setPhase] = useState('list'); // list | quiz | results
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  // Fetch mock tests from Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'mockTests'), snap => {
      setTests(snap.docs.map(d => ({ _id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (phase !== 'quiz') return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [phase, timeLeft]);

  const startTest = (test) => {
    setActiveTest(test);
    setCurrentIdx(0);
    setSelectedAnswers({});
    setTimeLeft(test.duration * 60);
    setPhase('quiz');
  };

  const handleSubmit = () => {
    let calc = 0;
    activeTest.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) calc++;
    });
    setScore(calc);
    setPhase('results');

    // ✅ Update real-time progress in Firestore
    updateMockTestProgress(calc, activeTest.questions.length);

    addDoc(collection(db, 'activities'), {
      type: 'mock',
      message: `${user?.name || 'A student'} scored ${calc}/${activeTest.questions.length} in ${activeTest.title}`,
      timestamp: new Date().toISOString(),
    }).catch(console.error);
  };

  const handleReset = () => {
    setPhase('list');
    setActiveTest(null);
    setCurrentIdx(0);
    setSelectedAnswers({});
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  if (phase === 'list') {
    const filteredTests = tests.filter(test => {
      const matchCompany = selectedCompany === 'All' || test.company === selectedCompany;
      const matchDifficulty = selectedDifficulty === 'All' || test.difficulty === selectedDifficulty;
      return matchCompany && matchDifficulty;
    });

    const companiesList = ['All', ...new Set(tests.map(t => t.company))];
    const difficultiesList = ['All', 'Easy', 'Medium', 'Hard'];

    return (
      <div className="space-y-6">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Mock Tests</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Simulate real placement exams. Track your performance.</p>
          </div>
        </header>

        {/* Filters Panel */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm space-y-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-2">Filter by Company</span>
            <div className="flex gap-2 flex-wrap">
              {companiesList.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCompany(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCompany === c
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-2">Filter by Difficulty</span>
            <div className="flex gap-2 flex-wrap">
              {difficultiesList.map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDifficulty(d)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedDifficulty === d
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredTests.length === 0 ? (
          <div className="text-center py-20 text-slate-400 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl shadow-sm">
            <Timer size={48} className="mx-auto mb-4 opacity-30 text-indigo-500" />
            <p className="font-semibold text-sm">No mock tests found matching these filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTests.map((test, i) => (
              <motion.div
                key={test._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border shadow-sm hover:shadow-lg transition-all group border-slate-100 dark:border-slate-700/60 hover:border-indigo-400/50"
              >
                {/* Company Banner */}
                <div className={`h-2 w-full bg-gradient-to-r ${COMPANY_COLORS[test.company] || 'from-indigo-600 to-purple-500'}`} />

                <div className="p-6 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${DIFFICULTY_STYLE[test.difficulty]}`}>
                      {test.difficulty}
                    </span>
                    <CheckCircle size={18} className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{test.title}</h3>
                  <p className="text-xs text-slate-400 font-semibold mb-4">{test.company}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-6">
                    <span className="flex items-center gap-1.5"><Timer size={14} /> {test.duration} mins</span>
                    <span className="flex items-center gap-1.5">• {test.totalQuestions} Questions</span>
                  </div>

                  <div className="mt-auto">
                    <button
                      onClick={() => startTest(test)}
                      className="w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/20 transform hover:-translate-y-0.5 active:translate-y-0 text-xs"
                    >
                      <Play size={14} fill="currentColor" /> Start Test
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── QUIZ VIEW ──────────────────────────────────────────────────────────────
  if (phase === 'quiz') {
    const q = activeTest.questions[currentIdx];
    const timePercent = (timeLeft / (activeTest.duration * 60)) * 100;

    return (
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-black text-slate-900 dark:text-white text-sm">{activeTest.title}</h2>
              <p className="text-xs text-slate-400">Question {currentIdx + 1} of {activeTest.questions.length}</p>
            </div>
            <div className={`flex items-center gap-2 font-black text-lg px-4 py-2 rounded-xl ${
              timeLeft < 60 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
            }`}>
              <Clock size={18} /> {formatTime(timeLeft)}
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ${timeLeft < 60 ? 'bg-red-500' : 'bg-indigo-500'}`}
              style={{ width: `${timePercent}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700"
          >
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8 leading-relaxed">{q.question}</h3>
            <div className="space-y-3">
              {q.options.map((opt, i) => (
                <button
                  key={opt}
                  onClick={() => setSelectedAnswers({ ...selectedAnswers, [currentIdx]: opt })}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                    selectedAnswers[currentIdx] === opt
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    selectedAnswers[currentIdx] === opt ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="font-medium">{opt}</span>
                </button>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => currentIdx > 0 && setCurrentIdx(currentIdx - 1)}
                disabled={currentIdx === 0}
                className="px-6 py-2.5 rounded-xl font-semibold text-slate-500 border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:border-slate-400 transition-all"
              >
                ← Prev
              </button>
              {currentIdx === activeTest.questions.length - 1 ? (
                <button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30">
                  Submit <Trophy size={18} />
                </button>
              ) : (
                <button onClick={() => setCurrentIdx(currentIdx + 1)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2">
                  Next <ChevronRight size={18} />
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // ── RESULTS VIEW ───────────────────────────────────────────────────────────
  const percent = Math.round((score / activeTest.questions.length) * 100);
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`p-8 rounded-3xl text-center text-white shadow-2xl bg-gradient-to-br ${
          percent >= 80 ? 'from-emerald-600 to-teal-500' :
          percent >= 50 ? 'from-amber-500 to-orange-500' :
          'from-red-600 to-pink-600'
        }`}
      >
        <Trophy size={56} className="mx-auto mb-4 text-yellow-300" />
        <h2 className="text-3xl font-black mb-1">{percent >= 80 ? 'Excellent!' : percent >= 50 ? 'Good Effort!' : 'Keep Practising!'}</h2>
        <div className="text-7xl font-black my-4">{percent}%</div>
        <p className="opacity-80">{score} correct of {activeTest.questions.length} · {activeTest.title}</p>
        <button onClick={handleReset} className="mt-6 bg-white/20 hover:bg-white/30 backdrop-blur px-8 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto transition-all">
          <RotateCcw size={18} /> Back to Tests
        </button>
      </motion.div>

      <div className="space-y-4">
        {activeTest.questions.map((q, idx) => {
          const isCorrect = selectedAnswers[idx] === q.correctAnswer;
          return (
            <div key={idx} className={`p-5 rounded-2xl border ${isCorrect ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800' : 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800'}`}>
              <div className="flex items-start gap-3 mb-3">
                <CheckCircle size={18} className={`${isCorrect ? 'text-emerald-500' : 'text-red-400'} shrink-0 mt-0.5`} />
                <p className="font-bold text-slate-900 dark:text-white text-sm">Q{idx + 1}. {q.question}</p>
              </div>
              <div className="ml-6 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <span className="text-slate-500 dark:text-slate-400">Your answer: <span className={isCorrect ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'}>{selectedAnswers[idx] || 'Not answered'}</span></span>
                {!isCorrect && <span className="text-slate-500 dark:text-slate-400">Correct: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{q.correctAnswer}</span></span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MockTest;
