import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import stockRoutes from './routes/stock.js';
import transactionRoutes from './routes/transactions.js';
import userRoutes from './routes/users.js';
import newsRoutes from './routes/news.js';
import leaderboardRoutes from './routes/leaderboard.js';
import adminRoutes from './routes/admin.js';
import cronRoutes from './routes/cron.js';
import { startStockTracker } from './services/stockTracker.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isDevelopment = process.env.NODE_ENV !== 'production';

// Middleware
// In the Vercel deployment the frontend is served from the same origin as this
// API (/api/* is rewritten to the function), so requests are not cross-origin.
// We still enable CORS permissively so custom domains and preview URLs work;
// auth is a bearer token, not a cookie. Set CORS_ORIGIN (comma-separated) to
// lock it down to an explicit allowlist.
app.use(cors({
  origin: isDevelopment
    ? ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000']
    : (process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
        : true),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logging (only in development)
if (isDevelopment) {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cron', cronRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'E-Summit Stock Exchange API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'E-Summit Stock Exchange API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      stocks: '/api/stocks',
      transactions: '/api/transactions',
      users: '/api/users',
      news: '/api/news',
      leaderboard: '/api/leaderboard',
      admin: '/api/admin',
      cron: '/api/cron'
    }
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'E-Summit Stock Exchange API',
    version: '1.0.0',
    documentation: '/api'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: isDevelopment ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    path: req.path,
    message: 'The requested endpoint does not exist'
  });
});

// Start server (only in development)
if (isDevelopment) {
  app.listen(PORT, () => {
    console.log('');
    console.log('=================================');
    console.log('🚀 E-Summit Stock Exchange API');
    console.log('=================================');
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📡 API URL: http://localhost:${PORT}/api`);
    console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
    console.log('=================================');
    console.log('');
    
    startStockTracker();
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Export for Vercel serverless
export default app;