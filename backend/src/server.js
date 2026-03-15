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
    // Allow no-origin requests (Postman, mobile apps, server-to-server)
    if (!origin) return callback(null, true);
    // Allow any Vercel preview / production URL
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    // Allow explicit list
    const whitelist = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      process.env.FRONTEND_URL,
    ].filter(Boolean);
    if (whitelist.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin "${origin}" not allowed`));
  },
  credentials: true,
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
  max: process.env.NODE_ENV === 'production' ? 300 : 100,
});

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors(corsOptions));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
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
