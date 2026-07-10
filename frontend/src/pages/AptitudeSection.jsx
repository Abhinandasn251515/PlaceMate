import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { BrainCircuit, Clock, ChevronRight, CheckCircle2, Trophy, RotateCcw, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';

const TOPIC_COLORS = {
  Quantitative: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Logical: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Verbal: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

const DIFFICULTY_COLORS = {
  Easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const AptitudeSection = () => {
  const { user, updateAptitudeProgress } = useContext(AuthContext);
  const [allQuestions, setAllQuestions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600);
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  // Real-time fetch from Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'aptitudeQuestions'), (snap) => {
      const data = snap.docs.map(d => ({ _id: d.id, ...d.data() }));
      setAllQuestions(data);
      setQuestions(data);
    });
    return () => unsub();
  }, []);

  // Filter by topic + difficulty
  useEffect(() => {
    let filtered = allQuestions;
    if (selectedTopic !== 'All') filtered = filtered.filter(q => q.topic === selectedTopic);
    if (selectedDifficulty !== 'All') filtered = filtered.filter(q => q.difficulty === selectedDifficulty);
    setQuestions(filtered);
  }, [selectedTopic, selectedDifficulty, allQuestions]);

  // Countdown timer
  useEffect(() => {
    let timer;
    if (quizStarted && !showResults && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && quizStarted && !showResults) {
      handleSubmitQuiz();
    }
    return () => clearInterval(timer);
  }, [quizStarted, showResults, timeLeft]);

  const handleSelectOption = (option) => {
    setSelectedAnswers({ ...selectedAnswers, [currentIdx]: option });
  };

  const handleSubmitQuiz = () => {
    let calc = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) calc += 1;
    });
    setScore(calc);
    setShowResults(true);

    // ✅ Update real-time progress in Firestore
    updateAptitudeProgress(calc, questions.length);

    // Log to Firestore activity feed
    addDoc(collection(db, 'activities'), {
      type: 'aptitude',
      message: `${user?.name || 'A student'} scored ${calc}/${questions.length} in Aptitude Quiz`,
      timestamp: new Date().toISOString(),
    }).catch(console.error);

    toast.info(`Quiz done! Score: ${calc}/${questions.length}`);
  };

  const handleReset = () => {
    setQuizStarted(false);
    setCurrentIdx(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
    setTimeLeft(600);
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // Landing Screen
  if (!quizStarted) {
    return (
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Aptitude & Reasoning</h1>
          <p className="text-slate-500 dark:text-slate-400">Sharpen your cognitive skills with timed quizzes.</p>
        </header>

        {/* Topic Filter */}
        <div className="flex gap-3 flex-wrap">
          {['All', 'Quantitative', 'Logical', 'Verbal'].map(t => (
            <button
              key={t}
              onClick={() => setSelectedTopic(t)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                selectedTopic === t
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400'
              }`}
            >
              <Filter size={14} /> {t}
            </button>
          ))}
        </div>

        {/* Difficulty Filter */}
        <div className="flex gap-3 flex-wrap">
          {['All', 'Easy', 'Medium', 'Hard'].map(d => (
            <button
              key={d}
              onClick={() => setSelectedDifficulty(d)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                selectedDifficulty === d
                  ? d === 'Easy' ? 'bg-emerald-500 text-white shadow-md'
                    : d === 'Medium' ? 'bg-amber-500 text-white shadow-md'
                    : d === 'Hard' ? 'bg-red-500 text-white shadow-md'
                    : 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-400'
              }`}
            >
              {d === 'All' ? `All (${allQuestions.length})` : d}
            </button>
          ))}
        </div>

        {/* Questions Preview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions.slice(0, 8).map((q, i) => (
            <div key={q._id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 hover:border-indigo-400/50 transition-all">
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="text-slate-700 dark:text-slate-200 text-sm font-medium leading-relaxed line-clamp-2">{q.question}</p>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${TOPIC_COLORS[q.topic]}`}>{q.topic}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${DIFFICULTY_COLORS[q.difficulty] || 'bg-slate-100 text-slate-500'}`}>{q.difficulty || 'Medium'}</span>
                <span className="text-xs text-slate-400">{q.options.length} options</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-slate-400">Showing {Math.min(8, questions.length)} of <strong className="text-slate-600 dark:text-white">{questions.length}</strong> questions — all will appear in the quiz</p>

        {/* Start Button */}
        <div className="flex flex-col items-center gap-4 py-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/40">
          <BrainCircuit size={48} className="text-indigo-500" />
          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{questions.length} Questions Ready</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Topic: <strong>{selectedTopic}</strong> · Time Limit: 10 minutes</p>
          </div>
          <button
            onClick={() => { if (questions.length === 0) { toast.warning('No questions available for this topic'); return; } setQuizStarted(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/30 transition-all transform hover:-translate-y-1"
          >
            Start Quiz →
          </button>
        </div>
      </div>
    );
  }

  // Results Screen
  if (showResults) {
    const percent = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-3xl mx-auto space-y-6 py-4">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-3xl text-center text-white shadow-2xl">
          <Trophy size={56} className="mx-auto mb-4 text-yellow-300" />
          <h2 className="text-4xl font-black mb-1">Quiz Completed!</h2>
          <div className="text-7xl font-black my-4">{percent}%</div>
          <p className="text-indigo-200">{score} correct out of {questions.length} questions</p>
          <button
            onClick={handleReset}
            className="mt-6 bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2 mx-auto"
          >
            <RotateCcw size={18} /> Try Again
          </button>
        </div>

        <div className="space-y-4">
          {questions.map((q, idx) => {
            const isCorrect = selectedAnswers[idx] === q.correctAnswer;
            return (
              <div key={idx} className={`p-6 rounded-2xl border ${isCorrect ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800' : 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800'}`}>
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle2 size={20} className={isCorrect ? 'text-emerald-500 shrink-0 mt-1' : 'text-red-400 shrink-0 mt-1'} />
                  <h4 className="font-bold text-slate-900 dark:text-white">Q{idx + 1}. {q.question}</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4 ml-8">
                  {q.options.map(opt => (
                    <div key={opt} className={`p-3 rounded-xl border text-sm ${
                      opt === q.correctAnswer ? 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-800/40 dark:border-emerald-700 dark:text-emerald-100 font-semibold' :
                      opt === selectedAnswers[idx] && !isCorrect ? 'bg-red-100 border-red-300 text-red-800 dark:bg-red-800/40 dark:border-red-700 dark:text-red-100' :
                      'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {opt}
                    </div>
                  ))}
                </div>
                <div className="ml-8 text-sm bg-white/60 dark:bg-black/20 p-3 rounded-xl">
                  <span className="font-bold text-slate-700 dark:text-slate-300">💡 Explanation: </span>
                  <span className="text-slate-600 dark:text-slate-400">{q.explanation}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Active Quiz
  const currentQ = questions[currentIdx];
  return (
    <div className="max-w-3xl mx-auto space-y-5 flex flex-col" style={{ minHeight: 'calc(100vh - 10rem)' }}>
      {/* Progress Bar + Timer */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Question {currentIdx + 1} of {questions.length}</span>
          <div className={`flex items-center gap-2 font-bold px-4 py-1.5 rounded-lg text-sm ${timeLeft < 60 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
            <Clock size={16} /> {formatTime(timeLeft)}
          </div>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
          className="flex-1 bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${TOPIC_COLORS[currentQ.topic]}`}>{currentQ.topic}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8 leading-relaxed">{currentQ.question}</h2>

          <div className="space-y-3 flex-1">
            {currentQ.options.map((opt, i) => (
              <button
                key={opt}
                onClick={() => handleSelectOption(opt)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                  selectedAnswers[currentIdx] === opt
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  selectedAnswers[currentIdx] === opt ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                }`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="font-medium">{opt}</span>
                {selectedAnswers[currentIdx] === opt && <CheckCircle2 size={20} className="ml-auto text-indigo-500" />}
              </button>
            ))}
          </div>

          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={() => currentIdx > 0 && setCurrentIdx(currentIdx - 1)}
              disabled={currentIdx === 0}
              className="px-6 py-2.5 rounded-xl font-semibold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-400 disabled:opacity-30 transition-all"
            >
              ← Previous
            </button>
            {currentIdx === questions.length - 1 ? (
              <button
                onClick={handleSubmitQuiz}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/30"
              >
                Submit Quiz <Trophy size={18} />
              </button>
            ) : (
              <button
                onClick={() => setCurrentIdx(currentIdx + 1)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all"
              >
                Next <ChevronRight size={18} />
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AptitudeSection;
