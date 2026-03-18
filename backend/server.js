import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  next();
});

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    // Continue running even if MongoDB is not available
    console.log('⚠️  Server will run without database connection');
  }
};

connectDB();

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import deepseekRoutes from './routes/deepseek.js';
import geminiRoutes from './routes/gemini.js';
import sessionRoutes from './routes/session.js';
import analyticsRoutes from './routes/analytics.js';
import roleplayRoutes from './routes/roleplay.js';
import audioRoutes from './routes/audio.js';

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/deepseek', deepseekRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/roleplay', roleplayRoutes);
app.use('/api/audio', audioRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start Server
import http from 'http';
import { initSocket } from './services/socketService.js';

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
