import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Login = () => {
  const { login, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
      toast.success('Successfully authenticated with Google!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Google Login failed');
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-900">
      
      {/* Left Animated Visual Section */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 relative overflow-hidden items-center justify-center">
        {/* Animated Background Blobs */}
        <motion.div 
           animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} 
           transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
           className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px]" 
        />
        <motion.div 
           animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }} 
           transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
           className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px]" 
        />

        <div className="relative z-10 p-12 max-w-2xl text-center">
           <motion.div 
              initial={{ y: 50, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ duration: 0.8 }}
           >
              <div className="bg-white/10 p-4 rounded-2xl inline-block mb-8 backdrop-blur-md border border-white/10 shadow-2xl">
                 <GraduationCap className="text-primary w-16 h-16" />
              </div>
              <h1 className="text-5xl font-black text-white mb-6 leading-tight">Master Your Placements<br/>with AI Precision.</h1>
              <p className="text-xl text-slate-400">Join thousands of students cracking top product companies using our intelligent preparation ecosystem.</p>
           </motion.div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 xl:p-24 relative">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Welcome back</h2>
            <p className="text-slate-500 dark:text-slate-400">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mb-8">
            <div className="space-y-4">
              <motion.div whileFocus={{ scale: 1.02 }} className="relative group">
                <input 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white font-medium placeholder:font-normal"
                  placeholder="Email address"
                />
              </motion.div>
              
              <motion.div whileFocus={{ scale: 1.02 }} className="relative group">
                <input 
                  type="password" 
                  required 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white font-medium placeholder:font-normal"
                  placeholder="Password"
                />
              </motion.div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Remember for 30 days</span>
              </label>
              <a href="#" className="text-sm font-bold text-primary hover:text-primary-dark transition-colors">Forgot password?</a>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={isLoading}
              className="w-full py-4 bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-primary-dark text-white font-bold rounded-xl transition-all shadow-lg shadow-slate-900/20 dark:shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={18} />
            </motion.button>
          </form>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700"></div></div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-slate-900 text-slate-500 font-medium">Or continue with</span>
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleLogin}
            className="w-full py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-all flex items-center justify-center gap-3 shadow-sm"
          >
            <span className="font-bold text-lg text-blue-500">G</span> Sign in with Google
          </motion.button>

          <p className="mt-10 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
            Don't have an account? <Link to="/register" className="text-primary hover:underline font-bold">Create one now</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
