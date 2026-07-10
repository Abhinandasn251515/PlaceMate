import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Send, Users, MessageSquare, Hash } from 'lucide-react';
import { collection, addDoc, onSnapshot, query, orderBy, limit, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-toastify';

const CHANNELS = ['#general', '#coding-talk', '#interview-prep'];

const CommunityChat = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [activeChannel, setActiveChannel] = useState('#general');
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // 1. Fetch messages in real-time
  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'), limit(150));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch typing status in real-time
  useEffect(() => {
    const q = collection(db, 'typing');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeTyping = [];
      const now = Date.now();
      snapshot.docs.forEach(d => {
        const data = d.data();
        // Don't show ourselves, and filter by current channel and within last 3 seconds
        if (d.id !== user?.uid && data.channel === activeChannel && data.isTyping && (now - data.lastActive < 4000)) {
          activeTyping.push(data.name);
        }
      });
      setTypingUsers(activeTyping);
    });
    return () => unsubscribe();
  }, [activeChannel, user?.uid]);

  // Auto-scroll to bottom when new messages or typing events occur
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  // Handle typing input changes
  const handleInputChange = (e) => {
    setInput(e.target.value);

    if (!user?.uid) return;

    // Set typing = true
    const typingRef = doc(db, 'typing', user.uid);
    setDoc(typingRef, {
      name: user.name || 'Anonymous Student',
      isTyping: true,
      channel: activeChannel,
      lastActive: Date.now()
    }, { merge: true }).catch(console.error);

    // Clear previous timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Set timeout to clear typing state after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      setDoc(typingRef, { isTyping: false }, { merge: true }).catch(console.error);
    }, 2000);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (input.trim()) {
      const messageData = {
        sender: user?.name || 'Anonymous',
        text: input,
        channel: activeChannel,
        timestamp: new Date().toISOString(),
        timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      // Stop typing status instantly on submit
      if (user?.uid) {
        const typingRef = doc(db, 'typing', user.uid);
        setDoc(typingRef, { isTyping: false }, { merge: true }).catch(console.error);
      }
      
      await addDoc(collection(db, 'messages'), messageData);
      setInput('');
    }
  };

  // Filter messages in-memory by channel
  const filteredMessages = messages.filter(msg => {
    if (activeChannel === '#general') {
      return msg.channel === '#general' || !msg.channel;
    }
    return msg.channel === activeChannel;
  });

  return (
    <div className="flex h-[calc(100vh-6.5rem)] bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60 overflow-hidden">
      {/* Sidebar for Channels */}
      <div className="w-56 bg-slate-50 dark:bg-slate-900/40 border-r border-slate-200 dark:border-slate-700/60 p-4 hidden md:flex flex-col">
        <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Chat Rooms</h3>
        <div className="space-y-1">
          {CHANNELS.map(ch => (
            <button
              key={ch}
              onClick={() => setActiveChannel(ch)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeChannel === ch
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Hash size={14} />
              {ch.replace('#', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Panel */}
      <div className="flex-1 flex flex-col h-full bg-slate-50/20 dark:bg-slate-900/5">
        {/* Chat Header */}
        <div className="p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center shadow-sm z-10">
          <div>
             <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Hash className="text-indigo-500" size={18} /> {activeChannel.replace('#', '')} Room
             </h2>
             <p className="text-xs text-slate-400 mt-0.5">Real-time collaboration panel with live typing indicator.</p>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-black shrink-0">
             <span className="relative flex h-1.5 w-1.5">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
             </span>
             Online
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {filteredMessages.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <MessageSquare size={48} className="mb-4 opacity-30 text-indigo-500" />
                <p className="text-sm font-semibold">Welcome to {activeChannel}!</p>
                <p className="text-xs mt-1 text-slate-400">Be the first to start the conversation.</p>
             </div>
          ) : (
            filteredMessages.map((msg) => {
              const isMe = msg.sender === user?.name;
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-slate-400 mb-1 ml-1">{msg.sender}</span>
                  <div className={`px-4 py-2.5 rounded-2xl max-w-[70%] shadow-sm text-sm ${
                    isMe 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-bl-none border border-slate-200 dark:border-slate-600'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 mr-1">{msg.timeFormatted || 'Just now'}</span>
                </div>
              );
            })
          )}

          {/* Typing Indicator Bubble */}
          {typingUsers.length > 0 && (
            <div className="flex flex-col items-start mt-2">
              <span className="text-[10px] text-slate-400 mb-1 ml-1">
                {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
              </span>
              <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
          <form onSubmit={sendMessage} className="flex gap-3">
            <input 
              type="text" 
              value={input}
              onChange={handleInputChange}
              placeholder={`Send message to ${activeChannel}...`}
              className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-sm"
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 rounded-2xl font-bold transition-all disabled:opacity-50 flex items-center justify-center shrink-0"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommunityChat;
