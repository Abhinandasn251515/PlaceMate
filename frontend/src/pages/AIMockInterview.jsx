import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { generateQuestions as generateInterviewQuestions, evaluateInterview as evaluateInterviewAnswer } from '../api/backend';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { 
  Mic, 
  MicOff, 
  Send, 
  Play, 
  CheckCircle, 
  Award, 
  RefreshCw, 
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  User,
  Bot
} from 'lucide-react';
import { toast } from 'react-toastify';

const ROLES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Engineer',
  'Data Scientist',
  'Data Analyst',
  'Product Manager'
];

const CATEGORIES = ['Technical', 'Behavioral', 'System Design'];

const AIMockInterview = () => {
  const { user, updateMockTestProgress } = useContext(AuthContext);
  
  const socketRef = useRef(null);

  // Initialize Socket.io client connection
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : (import.meta.env.PROD ? 'https://placemate-pb59.onrender.com' : 'http://localhost:5000');

    socketRef.current = io(socketUrl);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);
  
  // Selection States
  const [role, setRole] = useState(ROLES[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  
  // Interview Lifecycle States
  const [stage, setStage] = useState('welcome'); // welcome | loading | active | feedback | finished
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluations, setEvaluations] = useState([]); // Array of evaluations
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  
  // Loading & Action States
  const [loadingText, setLoadingText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  
  // Speech Recognition reference
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition on Mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (e) => {
        const text = e.results[e.results.length - 1][0].transcript;
        setUserAnswer(prev => prev + (prev ? ' ' : '') + text);
      };

      rec.onerror = (e) => {
        console.error('Speech Recognition Error:', e);
        setIsRecording(false);
        toast.error('Voice recording failed. Please type your answer.');
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.warning('Web Speech API is not supported in this browser. Please type your answer instead.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      toast.info('Voice recording stopped.');
    } else {
      setUserAnswer('');
      recognitionRef.current.start();
      setIsRecording(true);
      toast.success('Voice recording started. Speak now...');
    }
  };

  const handleStartInterview = async () => {
    setStage('loading');
    setLoadingText('Assembling expert interview panel...');
    try {
      const qList = await generateInterviewQuestions(role, category);
      if (qList && qList.length > 0) {
        setQuestions(qList);
        setCurrentQuestionIndex(0);
        setEvaluations([]);
        setCurrentEvaluation(null);
        setUserAnswer('');
        setStage('active');
        toast.success('Interview started! Answer each question to proceed.');
      } else {
        throw new Error('Failed to generate interview questions.');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to start interview. Check your Gemini API key in settings.');
      setStage('welcome');
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      toast.warning('Please type or record an answer before submitting.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    setEvaluating(true);
    try {
      const qText = questions[currentQuestionIndex];
      const feedback = await evaluateInterviewAnswer(qText, userAnswer);
      
      setCurrentEvaluation(feedback);
      const newEvaluations = [...evaluations, {
        question: qText,
        answer: userAnswer,
        ...feedback
      }];
      setEvaluations(newEvaluations);
      setStage('feedback');
    } catch (err) {
      console.error(err);
      toast.error('Failed to evaluate answer. Please try again.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserAnswer('');
      setCurrentEvaluation(null);
      setStage('active');
    } else {
      // Completed last question
      setStage('finished');
      // Calculate average score
      const avg = evaluations.length > 0 
        ? Math.round(evaluations.reduce((sum, item) => sum + item.score, 0) / evaluations.length)
        : 75;
      // Award XP & save mock test stats to database
      updateMockTestProgress(avg, 100);
      toast.success('🎉 Mock Interview Completed! +100 XP awarded!');
      
      // Broadcast mock interview activity to all users in real-time!
      if (socketRef.current && user) {
        socketRef.current.emit('newActivity', {
          type: 'interview',
          message: `${user.name || 'A student'} completed the ${role} Mock Interview with an average score of ${avg}%! 🎤`
        });
      }
    }
  };

  const handleRestart = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setEvaluations([]);
    setCurrentEvaluation(null);
    setUserAnswer('');
    setStage('welcome');
  };

  const averageScore = evaluations.length > 0 
    ? Math.round(evaluations.reduce((sum, item) => sum + item.score, 0) / evaluations.length)
    : 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-2.5">
            <Mic className="text-indigo-500" size={32} />
            AI Mock Interview
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Practice real-time technical and behavioral interviews with custom AI feedback.
          </p>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {/* Welcome Stage */}
        {stage === 'welcome' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-8 shadow-sm space-y-6 max-w-2xl mx-auto"
          >
            <div className="text-center space-y-3">
              <div className="h-16 w-16 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                <Mic size={30} />
              </div>
              <h3 className="text-xl font-black text-slate-850 dark:text-white">Configure Your Interview</h3>
              <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 max-w-md mx-auto">
                Choose your target role and question focus to generate customized, realistic questions.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Target Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-805 dark:text-white focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Question Focus
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-805 dark:text-white focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleStartInterview}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-755 hover:shadow-indigo-500/25 hover:shadow-lg text-white font-black rounded-2xl text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <Play size={16} /> Start Session
              </button>
            </div>
          </motion.div>
        )}

        {/* Loading Stage */}
        {stage === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-12 shadow-sm flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-[3px] border-indigo-100 dark:border-indigo-950/65 animate-pulse" />
              <div className="absolute inset-0 w-20 h-20 rounded-full border-t-[3px] border-indigo-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-indigo-500">
                <Bot size={30} className="animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-800 dark:text-white">{loadingText}</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">Please wait while the AI generates realistic questions.</p>
            </div>
          </motion.div>
        )}

        {/* Active Stage (Typing or Speaking answer) */}
        {stage === 'active' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            {/* Sidebar navigation status */}
            <div className="md:col-span-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-5 shadow-sm space-y-4">
              <span className="text-xs font-black uppercase text-indigo-500 tracking-wider">Interview Status</span>
              <div className="space-y-2.5">
                {questions.map((_, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <div className={`h-6 w-6 rounded-full text-xs font-black flex items-center justify-center border transition-all ${
                      idx === currentQuestionIndex 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-600/30' 
                        : idx < currentQuestionIndex 
                        ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 text-emerald-500'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 text-slate-400'
                    }`}>
                      {idx + 1}
                    </div>
                    <span className={`text-xs font-bold ${
                      idx === currentQuestionIndex ? 'text-slate-800 dark:text-white font-extrabold' : 'text-slate-400'
                    }`}>
                      Question {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Conversation Window */}
            <div className="md:col-span-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[400px]">
              {/* Question bubble */}
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="h-9 w-9 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 text-indigo-500 rounded-xl flex items-center justify-center shrink-0">
                    <Bot size={18} />
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-750 p-4.5 rounded-2xl text-sm font-semibold text-slate-800 dark:text-slate-250 leading-relaxed shadow-sm w-full">
                    {questions[currentQuestionIndex]}
                  </div>
                </div>
              </div>

              {/* Answer input */}
              <div className="mt-8 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex justify-between">
                    <span>Your Answer</span>
                    {isRecording && <span className="text-emerald-500 animate-pulse flex items-center gap-1"><Mic size={10} /> Listening...</span>}
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Type your response here or click the mic button to record voice answer..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    disabled={evaluating}
                    className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-805 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all resize-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={toggleRecording}
                    disabled={evaluating}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-center ${
                      isRecording 
                        ? 'bg-red-500 border-red-500 text-white animate-pulse shadow-lg shadow-red-500/25' 
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-750 hover:text-slate-700 dark:hover:text-white'
                    }`}
                    title={isRecording ? 'Stop Recording' : 'Start Voice Recording'}
                  >
                    {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>

                  <button
                    onClick={handleSubmitAnswer}
                    disabled={evaluating || !userAnswer.trim()}
                    className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-755 text-white font-black rounded-2xl text-xs tracking-wide transition-all shadow-md shadow-indigo-600/10 flex items-center gap-2 cursor-pointer disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 border-none"
                  >
                    {evaluating ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" /> Evaluating...
                      </>
                    ) : (
                      <>
                        Submit Answer <Send size={14} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Feedback Stage (Shows scores after submitting single answer) */}
        {stage === 'feedback' && currentEvaluation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm space-y-6"
          >
            {/* Score Summary Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-750 rounded-2xl">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Evaluation Score</span>
                <h3 className="text-xl font-black text-slate-800 dark:text-white">Question {currentQuestionIndex + 1} Assessment</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className={`h-12 w-12 rounded-xl flex items-center justify-center text-lg font-black ${
                  currentEvaluation.score >= 80 ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/30' :
                  currentEvaluation.score >= 50 ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-450 border border-amber-100 dark:border-amber-900/30' :
                  'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-450 border border-red-100 dark:border-red-900/30'
                }`}>
                  {currentEvaluation.score}%
                </span>
              </div>
            </div>

            {/* Critique Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Key Strengths in Answer</span>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-350 bg-slate-50 dark:bg-slate-900/50 p-4.5 rounded-2xl border border-slate-100 dark:border-slate-750 leading-relaxed shadow-inner">
                  {currentEvaluation.strengths}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Critical Gaps / Suggestions</span>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-350 bg-slate-50 dark:bg-slate-900/50 p-4.5 rounded-2xl border border-slate-100 dark:border-slate-750 leading-relaxed shadow-inner">
                  {currentEvaluation.missing}
                </p>
              </div>
            </div>

            {/* Model Response */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Model Perfect Answer</span>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-indigo-50/20 dark:bg-indigo-950/10 border border-indigo-100/40 dark:border-indigo-900/20 p-5 rounded-2xl leading-relaxed">
                {currentEvaluation.modelAnswer}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleNextQuestion}
                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-755 text-white font-black rounded-2xl text-xs tracking-wide transition-all shadow-md shadow-indigo-600/10 flex items-center gap-2 cursor-pointer border-none"
              >
                {currentQuestionIndex < questions.length - 1 ? (
                  <>
                    Next Question <ArrowRight size={14} />
                  </>
                ) : (
                  <>
                    Finish Interview <Award size={14} />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Finished Stage (Summary) */}
        {stage === 'finished' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Overall Score Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-755 text-white rounded-3xl p-8 shadow-xl text-center space-y-4 max-w-xl mx-auto">
              <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center mx-auto text-yellow-300">
                <Award size={36} />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black">Interview Session Complete!</h3>
                <p className="text-xs text-indigo-100 font-semibold">Congratulations, you've successfully completed the mock panel.</p>
              </div>
              <div className="text-4xl font-black">{averageScore}%</div>
              <p className="text-[10px] uppercase font-black tracking-widest text-indigo-200">+75 XP Awarded and Saved to Profile</p>
            </div>

            {/* Line-by-line Review */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-slate-800 dark:text-white">Session Transcript Review</h3>
              {evaluations.map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 text-indigo-500 dark:text-indigo-400 text-[10px] font-black uppercase rounded-full">
                      Question {idx + 1}
                    </span>
                    <span className="text-xs font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-lg">{item.score}% Score</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-850 dark:text-white leading-relaxed">{item.question}</h4>
                  
                  <div className="space-y-2 border-t border-slate-100 dark:border-slate-750 pt-3 text-xs leading-normal">
                    <div>
                      <span className="font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide mr-1.5 block sm:inline">Your Answer:</span>
                      <span className="text-slate-650 dark:text-slate-350 font-semibold">"{item.answer}"</span>
                    </div>
                    <div className="pt-2">
                      <span className="font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide mr-1.5 block sm:inline">Strengths:</span>
                      <span className="text-slate-650 dark:text-slate-350 font-semibold">{item.strengths}</span>
                    </div>
                    <div className="pt-2">
                      <span className="font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide mr-1.5 block sm:inline">Gaps:</span>
                      <span className="text-slate-650 dark:text-slate-350 font-semibold">{item.missing}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={handleRestart}
                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-755 text-white font-black rounded-2xl text-xs tracking-wide transition-all shadow-md shadow-indigo-600/10 flex items-center gap-2 cursor-pointer border-none"
              >
                <RefreshCw size={14} /> Start New Session
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIMockInterview;
