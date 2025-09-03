import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet()); // Security headers

// Configure CORS to use configured FRONTEND_URL or default to localhost:3000
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Weather API Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Database connection
const connectDB = async () => {
  if (!process.env.MONGODB_URI || process.env.MONGODB_URI === 'mongodb://localhost:27017/weather-app') {
    console.log('⚠️ Running in demo mode without MongoDB connection');
    return;
  }
  
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn('Database connection failed, running in demo mode:', error.message);
  }
};

// Routes
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to Weather API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      weather: '/api/weather',
      users: '/api/users'
    }
  });
});

// Import route handlers
import weatherRoutes from './routes/weather.js';
import userRoutes from './routes/users.js';

// Use routes
app.use('/api/weather', weatherRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 CORS enabled for: ${allowedOrigin}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
