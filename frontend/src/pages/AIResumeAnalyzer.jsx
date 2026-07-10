import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { analyzeResume } from '../api/backend';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  TrendingUp, 
  Award,
  ChevronRight,
  Info,
  Clock,
  History
} from 'lucide-react';
import { toast } from 'react-toastify';

const ROLES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Engineer',
  'Data Scientist',
  'Data Analyst',
  'Product Manager',
  'UI/UX Designer',
  'DevOps Engineer'
];

const AIResumeAnalyzer = () => {
  const { syncProfile } = useContext(AuthContext);
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState(ROLES[0]);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingStep, setLoadingStep] = useState(0);

  // Load analysis history from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('placemate_resume_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  // Micro-interaction loading steps
  useEffect(() => {
    let interval;
    if (analyzing) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev < 3 ? prev + 1 : prev));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [analyzing]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'text/plain') {
      toast.error('Currently only plain text (.txt) files are supported for direct upload. Otherwise, please copy and paste your resume text.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setResumeText(event.target.result);
      toast.success('Resume file loaded successfully!');
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!resumeText.trim()) {
      toast.warning('Please paste or upload your resume text first.');
      return;
    }

    setAnalyzing(true);
    setResults(null);
    try {
      const evaluation = await analyzeResume(resumeText, targetRole);
      setResults(evaluation);
      
      // Save to local history
      const newEntry = {
        role: targetRole,
        score: evaluation.atsScore,
        date: new Date().toLocaleDateString(),
        id: Date.now()
      };
      const updatedHistory = [newEntry, ...history.slice(0, 4)];
      setHistory(updatedHistory);
      localStorage.setItem('placemate_resume_history', JSON.stringify(updatedHistory));

      // Sync profile with server-awarded XP
      await syncProfile();
      toast.success('Analysis complete! +40 XP awarded!');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to analyze resume.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-2.5">
            <Sparkles className="text-indigo-500" size={32} />
            AI Resume Analyzer
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Optimize your resume against ATS algorithms using real-time generative feedback.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Controls & Input */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {!analyzing && !results && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm space-y-6"
              >
                <h3 className="text-lg font-black text-slate-800 dark:text-white">Analyze Your Resume</h3>
                
                <form onSubmit={handleAnalyze} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Target Job Role
                      </label>
                      <select
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-850 dark:text-white focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                      >
                        {ROLES.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Quick Upload (.txt)
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".txt"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="resume-file-input"
                        />
                        <label
                          htmlFor="resume-file-input"
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 border-dashed rounded-2xl text-sm font-semibold text-slate-500 dark:text-slate-400 focus:outline-none transition-all cursor-pointer"
                        >
                          <Upload size={16} /> Upload text file
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Resume Text (Copy & Paste CV content)
                    </label>
                    <textarea
                      rows={10}
                      placeholder="Paste the full text of your resume here..."
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-850 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-755 hover:shadow-indigo-500/25 hover:shadow-lg text-white rounded-2xl font-black text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles size={16} /> Run ATS Analysis
                  </button>
                </form>
              </motion.div>
            )}

            {analyzing && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-12 shadow-sm flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]"
              >
                <div className="relative">
                  {/* Outer spinning ring */}
                  <div className="w-20 h-20 rounded-full border-[3px] border-indigo-100 dark:border-indigo-950/65 animate-pulse" />
                  <div className="absolute inset-0 w-20 h-20 rounded-full border-t-[3px] border-indigo-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-indigo-500">
                    <FileText size={30} className="animate-bounce" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-800 dark:text-white">Analyzing Your Resume...</h3>
                  <div className="text-sm font-medium text-slate-400 h-6">
                    {loadingStep === 0 && 'Reading resume format structure...'}
                    {loadingStep === 1 && 'Matching skills against industry benchmarks...'}
                    {loadingStep === 2 && 'Scanning formatting and font guidelines...'}
                    {loadingStep === 3 && 'Compiling line-by-line recommendations...'}
                  </div>
                </div>
              </motion.div>
            )}

            {results && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Scorecards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* ATS Score Card */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute top-3 right-3 text-indigo-500"><TrendingUp size={16} /></div>
                    <div className="relative flex items-center justify-center w-24 h-24 mb-4">
                      {/* SVG Circle Gauge */}
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="6" fill="transparent" />
                        <motion.circle 
                          cx="48" 
                          cy="48" 
                          r="40" 
                          stroke="#6366f1" 
                          strokeWidth="6" 
                          fill="transparent" 
                          strokeDasharray={2 * Math.PI * 40}
                          initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - results.atsScore / 100) }}
                          transition={{ duration: 1.5, type: 'tween' }}
                        />
                      </svg>
                      <span className="absolute text-2xl font-black text-slate-850 dark:text-white">{results.atsScore}%</span>
                    </div>
                    <h4 className="text-sm font-black text-slate-700 dark:text-slate-350">ATS Score</h4>
                  </div>

                  {/* Formatting Card */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm flex flex-col justify-center">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-xs font-black uppercase text-slate-400 dark:text-slate-500">Formatting</span>
                      <span className="text-lg font-black text-indigo-500">{results.formattingScore}/100</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${results.formattingScore}%` }}
                        transition={{ duration: 1.2 }}
                        className="h-full bg-indigo-500 rounded-full"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-3 leading-relaxed font-semibold">
                      Layout, margins, font consistency, and clean section breaks.
                    </p>
                  </div>

                  {/* Skills Match Card */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm flex flex-col justify-center">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-xs font-black uppercase text-slate-400 dark:text-slate-500">Skills Match</span>
                      <span className="text-lg font-black text-indigo-500">{results.skillsScore}/100</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${results.skillsScore}%` }}
                        transition={{ duration: 1.2 }}
                        className="h-full bg-indigo-500 rounded-full"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-3 leading-relaxed font-semibold">
                      Target keyword matches and tech stack overlap.
                    </p>
                  </div>
                </div>

                {/* Gaps and Strengths */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                      <CheckCircle className="text-emerald-500" size={16} /> Key Strengths
                    </h3>
                    <ul className="space-y-2.5">
                      {results.strengths?.map((str, idx) => (
                        <li key={idx} className="flex gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                          <ChevronRight className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                          {str}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Gaps */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                      <AlertTriangle className="text-amber-500" size={16} /> Critical Gaps
                    </h3>
                    <ul className="space-y-2.5">
                      {results.gaps?.map((gap, idx) => (
                        <li key={idx} className="flex gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                          <ChevronRight className="text-amber-500 shrink-0 mt-0.5" size={16} />
                          {gap}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Keywords comparison */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Keyword Analytics</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Matched Keywords</span>
                      <div className="flex flex-wrap gap-2">
                        {results.keywords?.matched?.map(kw => (
                          <span key={kw} className="px-2.5 py-1 bg-emerald-55 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Missing Keywords</span>
                      <div className="flex flex-wrap gap-2">
                        {results.keywords?.missing?.map(kw => (
                          <span key={kw} className="px-2.5 py-1 bg-amber-55 border border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-lg">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Recommendations */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm space-y-5">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Action Plan (Recommendations)</h3>
                  
                  <div className="space-y-4">
                    {results.recommendations?.map((rec, idx) => (
                      <div key={idx} className="border border-slate-100 dark:border-slate-700/60 p-4.5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/10 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 text-indigo-500 dark:text-indigo-400 text-[10px] font-black uppercase rounded-full">
                            {rec.section}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">Fix #{idx + 1}</span>
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-850 dark:text-white leading-relaxed">{rec.suggestion}</h4>
                        <div className="flex gap-2 text-xs font-bold text-slate-400 leading-normal">
                          <span className="text-indigo-500 shrink-0 uppercase tracking-wider text-[9px] mt-0.5">Recommended Edit:</span>
                          <span className="text-slate-500 dark:text-slate-400 font-semibold italic">"{rec.action}"</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setResults(null)}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-700 dark:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Start New Analysis
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Instructions & History */}
        <div className="space-y-6">
          {/* AI Info Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-755 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Sparkles size={80} />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles size={20} />
                <h4 className="text-sm font-black uppercase tracking-wider">AI Optimizer</h4>
              </div>
              <h3 className="text-xl font-black leading-tight">Optimize for Modern Applicant Tracking Systems</h3>
              <p className="text-xs text-indigo-100 font-semibold leading-relaxed">
                Many companies screen applications using ATS filters. By matching keywords, formatting correctly, and highlighting impact achievements, you can double your invitation rates.
              </p>
            </div>
          </div>

          {/* History Panel */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <History size={16} /> Recent Scans
            </h3>
            
            {history.length > 0 ? (
              <div className="space-y-3.5">
                {history.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-750/50 last:border-b-0">
                    <div>
                      <h4 className="text-xs font-black text-slate-700 dark:text-slate-350">{item.role}</h4>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold mt-0.5">{item.date}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 text-indigo-500 dark:text-indigo-400 text-xs font-black rounded-lg">
                      {item.score}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 dark:text-slate-550 font-semibold text-xs leading-relaxed flex flex-col items-center gap-1.5">
                <Clock size={20} className="opacity-50" />
                No previous scans found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIResumeAnalyzer;
