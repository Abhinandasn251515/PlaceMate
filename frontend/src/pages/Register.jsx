import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Register = () => {
  const { register, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, formData.role);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
    <div className="min-h-screen flex bg-white dark:bg-slate-900 flex-row-reverse">
      
      {/* Right Animated Visual Section */}
      <div className="hidden lg:flex w-1/2 bg-slate-50 dark:bg-slate-950 relative overflow-hidden items-center justify-center border-l border-slate-100 dark:border-slate-800">
        <motion.div 
           animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }} 
           transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
           className="absolute top-0 right-0 w-[700px] h-[700px] bg-indigo-500/20 rounded-full blur-[100px]" 
        />
        <motion.div 
           animate={{ scale: [1, 1.1, 1], y: [0, 50, 0] }} 
           transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
           className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[80px]" 
        />

        <div className="relative z-10 p-12 max-w-2xl text-center">
           <motion.div 
              initial={{ y: 50, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ duration: 0.8 }}
           >
              <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl inline-block mb-8 shadow-xl shadow-primary/10 border border-slate-100 dark:border-slate-800">
                 <Sparkles className="text-indigo-500 w-16 h-16" />
              </div>
              <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">Your Dream Job<br/>Awaits You.</h1>
              <p className="text-xl text-slate-500 dark:text-slate-400">Join a community of driven individuals. Code, practice, and prepare with the best resources.</p>
           </motion.div>
        </div>
      </div>

      {/* Left Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 xl:p-24 relative">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Create an account</h2>
            <p className="text-slate-500 dark:text-slate-400">Start your placement preparation journey today.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 mb-8">
            <motion.div whileFocus={{ scale: 1.02 }} className="relative group">
              <input 
                type="text" 
                required 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white font-medium placeholder:font-normal"
                placeholder="Full Name"
              />
            </motion.div>

            <motion.div whileFocus={{ scale: 1.02 }} className="relative group">
              <select 
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all dark:text-white font-medium cursor-pointer"
              >
                <option value="student">Apply as a Student / Candidate</option>
                <option value="recruiter">Join as a Corporate Recruiter</option>
              </select>
            </motion.div>
            
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
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white font-medium placeholder:font-normal"
                placeholder="Create a password (min. 6 characters)"
              />
            </motion.div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={isLoading}
              className="w-full py-4 bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-primary-dark text-white font-bold rounded-xl transition-all shadow-lg shadow-slate-900/20 dark:shadow-primary/20 flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up Free'} <ArrowRight size={18} />
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
            <span className="font-bold text-lg text-blue-500">G</span> Sign up with Google
          </motion.button>

          <p className="mt-10 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
            Already have an account? <Link to="/login" className="text-primary hover:underline font-bold">Log in here</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
