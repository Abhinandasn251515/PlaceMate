import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import Message from './models/Message.js';

// Load env variables
dotenv.config();

// Connect to MongoDB database
connectDB();

const app = express();
const server = http.createServer(app);

// Configure Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts/styles for development
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// Rate Limiting to prevent API abuse (especially on AI routes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' }
});

const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30, // limit each IP to 30 generation requests per 10 minutes
  message: { message: 'AI generation limit reached. Please wait a few minutes before trying again.' }
});

// Apply rate limiters
app.use('/api/', apiLimiter);
app.use('/api/ai/', aiLimiter);

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/events', eventRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to PlaceMate AI API Server' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({ message: err.message || 'Something went wrong on the server!' });
});

// Real-Time Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log(`🔌 Socket Connected: ${socket.id}`);

  // User joins a chat channel
  socket.on('joinChannel', (channel) => {
    socket.join(channel);
    console.log(`👤 Socket ${socket.id} joined channel: ${channel}`);
  });

  // User sends a chat message
  socket.on('sendMessage', async (data) => {
    const { sender, text, channel } = data;
    if (!text || !sender) return;

    try {
      // Save message in MongoDB for persistent history
      const savedMsg = await Message.create({
        sender,
        text,
        channel: channel || '#general'
      });

      // Broadcast message to everyone in the channel
      io.to(channel).emit('message', savedMsg);
    } catch (err) {
      console.error('Error saving chat message:', err.message);
    }
  });

  // User typing indicators
  socket.on('typing', (data) => {
    const { sender, channel, isTyping } = data;
    socket.to(channel).emit('typing', { sender, isTyping });
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket Disconnected: ${socket.id}`);
  });
});

// Start listening
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 PlaceMate AI server running on port ${PORT}`);
});
