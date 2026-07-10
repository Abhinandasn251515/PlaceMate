import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Code2, BrainCircuit, Trophy, ArrowRight, Star, Sparkles, ShieldCheck, Terminal } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden mesh-bg">
      
      {/* Background Decorative Glowing Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none animate-float-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-pink-600/10 blur-[120px] pointer-events-none animate-float-reverse" />

      {/* Navigation Header */}
      <nav className="glass-nav sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <GraduationCap className="text-white h-6 w-6" />
            </div>
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
              PlaceMate <span className="text-[10px] font-black tracking-widest text-indigo-400 bg-indigo-950 border border-indigo-900 px-1.5 py-0.5 rounded-md uppercase">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-indigo-500/20 active:scale-95"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-7xl mx-auto w-full z-10 py-16 lg:py-24">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl space-y-6"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-widest mx-auto shadow-sm">
            <Sparkles size={10} className="text-indigo-400" /> Your Complete AI-Powered Placement Preparation Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-none">
            Launch Your Tech Career <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              With PlaceMate AI
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Optimize your placement prep path with AI-driven Resume Analysis, Conversational Mock Interviews, Monaco Code Compilers, Gamified Streaks, Achievements, and Live Leaderboards.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link 
              to="/register" 
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0 animate-pulse-glow flex items-center justify-center gap-2 text-sm"
            >
              Start Preparing Now <ArrowRight size={16} />
            </Link>
            <Link 
              to="/login" 
              className="px-8 py-4 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white font-black rounded-2xl transition-all border border-slate-800 flex items-center justify-center gap-2 text-sm"
            >
              Enter Dashboard
            </Link>
          </div>
        </motion.div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full">
           {[
             { 
               title: 'Coding Practice', 
               desc: 'Master DSA with company-specific templates, live Monaco compiler, and real-time execution statistics.', 
               icon: Code2, 
               color: 'from-blue-500 to-cyan-500', 
               bg: 'bg-blue-500/10',
               delay: 0.1 
             },
             { 
               title: 'Aptitude & Reasoning', 
               desc: 'Sharpen your quantitative, logical, and verbal reasoning skills using timed quizzes with difficulty levels.', 
               icon: BrainCircuit, 
               color: 'from-purple-500 to-pink-500', 
               bg: 'bg-purple-500/10',
               delay: 0.2 
             },
             { 
               title: 'Interactive Mock Tests', 
               desc: 'Simulate company assessments with full-length exams. Track scores dynamically on the live Progression board.', 
               icon: Trophy, 
               color: 'from-emerald-500 to-teal-500', 
               bg: 'bg-emerald-500/10',
               delay: 0.3 
             }
           ].map((feature, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.6, delay: feature.delay }}
               className="glass-card p-8 rounded-3xl flex flex-col items-center text-center group hover:border-indigo-500/40 hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300"
             >
                <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-md transition-transform group-hover:scale-110 duration-300`}>
                   <feature.icon className="text-white h-6 w-6" />
                </div>
                <h3 className="text-lg font-black text-white mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">{feature.desc}</p>
             </motion.div>
           ))}
        </div>

        {/* Dynamic Builder Quote Panel */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="mt-32 w-full p-8 rounded-3xl bg-indigo-950/30 border border-indigo-500/20 flex flex-col md:flex-row items-center justify-between gap-6 text-left"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
              <Terminal size={22} />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm">Join the Collaborative Prep Space</h4>
              <p className="text-xs text-slate-400 mt-0.5">Let's build this application together. Developed with 💻 by Abhinandan Ghosh.</p>
            </div>
          </div>
          <Link 
            to="/register" 
            className="px-6 py-3 bg-white text-indigo-950 font-black rounded-xl text-xs hover:bg-indigo-50 transition-colors shadow-md shrink-0 w-full md:w-auto text-center"
          >
            Create Your Free Account
          </Link>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-[10px] text-slate-600 font-bold uppercase tracking-wider border-t border-slate-900">
        © {new Date().getFullYear()} PlaceMate · Developed by Abhinandan Ghosh
      </footer>
    </div>
  );
};

export default Landing;
