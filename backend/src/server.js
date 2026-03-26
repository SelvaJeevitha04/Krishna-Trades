const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
// Load .env only in development — on Render, env vars come from the dashboard
// override:false means Render's env vars always take priority
require('dotenv').config({ override: false });

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const healthRoutes = require('./routes/health');
const cartRoutes = require('./routes/cart');
const reviewRoutes = require('./routes/reviews');
const bulkOrderRoutes = require('./routes/bulkOrders');
const paymentRoutes = require('./routes/payment');

const errorHandler = require('./middleware/errorHandler');
const { connectDB } = require('./config/database');

const app = express();
const server = http.createServer(app);

// ─── Dynamic CORS ────────────────────────────────────────────────────────────
// Allows localhost (dev), any *.vercel.app subdomain, and FRONTEND_URL (prod)
const corsOptions = {
  origin: (origin, callback) => {
    // Allow matching for localhost on any port during development
    const isLocalhost = origin && (
      origin.startsWith('http://localhost') || 
      origin.startsWith('http://127.0.0.1') ||
      origin.startsWith('http://192.168.') ||
      origin.startsWith('http://10.') ||
      origin.startsWith('http://172.')
    );

    // Allow no-origin requests (Postman, mobile apps, server-to-server)
    if (!origin || (process.env.NODE_ENV !== 'production' && isLocalhost)) {
      return callback(null, true);
    }
    
    // Allow any Vercel preview / production URL
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    
    // Allow explicit list
    const whitelist = [
      process.env.FRONTEND_URL,
    ].filter(Boolean);
    
    if (whitelist.some(item => origin === item)) return callback(null, true);
    callback(new Error(`CORS: origin "${origin}" not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// ─── Socket.io ───────────────────────────────────────────────────────────────
const io = socketIo(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (origin.endsWith('.vercel.app')) return callback(null, true);
      const whitelist = [
        'http://localhost:3000',
        'http://localhost:5173',
        process.env.FRONTEND_URL,
      ].filter(Boolean);
      if (whitelist.includes(origin)) return callback(null, true);
      callback(new Error('Socket CORS error'));
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.set('io', io);

// ─── Rate Limiting ───────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 300 : 1000,
});

// ─── Middleware ──────────────────────────────────────────────────────────────
// In development, we relax some helmet settings to avoid CORS/403 issues
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'unsafe-none' },
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
}));

app.use(cors(corsOptions));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Logger for debugging API calls
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin || 'No Origin'}`);
    next();
  });
}

app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/bulk-orders', bulkOrderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/health', healthRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Krishna Trades API is running',
    env: process.env.NODE_ENV || 'development',
  });
});

// ─── Error Handler ───────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8000;

// Catch listen errors explicitly so they appear in Render logs
server.on('error', (err) => {
  console.error('❌ Server error:', err.message);
  process.exit(1);
});

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = { app, io };
