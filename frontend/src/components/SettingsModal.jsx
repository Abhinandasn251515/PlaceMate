import React, { useState, useEffect } from 'react';
import { X, Key, Info, Check, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SettingsModal = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(localStorage.getItem('placemate_gemini_api_key') || '');
      setSaved(false);
    }
  }, [isOpen]);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('placemate_gemini_api_key', apiKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    localStorage.removeItem('placemate_gemini_api_key');
    setApiKey('');
    setSaved(true);
    setTimeout(() => setSaved(false), 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-750">
              <div className="flex items-center gap-2">
                <Key className="text-indigo-500" size={20} />
                <h3 className="text-lg font-black text-slate-800 dark:text-white">API Settings</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Gemini API Key
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-850 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Key size={16} />
                  </div>
                </div>
              </div>

              {/* Info alert */}
              <div className="flex gap-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-150/40 dark:border-indigo-900/30 p-4 rounded-2xl text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                <Info className="text-indigo-500 shrink-0 mt-0.5" size={16} />
                <div>
                  Your key is saved **only** in your local browser storage. It never leaves your browser.
                  Get a free key instantly from{' '}
                  <a
                    href="https://aistudio.google.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 font-black underline hover:text-indigo-500"
                  >
                    Google AI Studio
                  </a>.
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                {apiKey && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-4 py-2.5 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                    title="Remove API Key"
                  >
                    <Trash2 size={14} /> Clear
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saved}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 disabled:bg-emerald-500 transition-all cursor-pointer"
                >
                  {saved ? (
                    <>
                      <Check size={14} /> Saved
                    </>
                  ) : (
                    'Save Settings'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;
