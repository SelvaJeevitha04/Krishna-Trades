const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Simple auth routes
app.post('/api/auth/register', (req, res) => {
  console.log('🔍 Registration request received:', req.body);
  
  const { ownerName, email, password, phone, shopName, shopAddress, city, state, pincode } = req.body;
  
  // Basic validation
  if (!ownerName || !email || !password || !phone || !shopName || !shopAddress || !city || !state || !pincode) {
    return res.status(400).json({
      success: false,
      message: 'All required fields must be filled'
    });
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }
  
  // Phone validation
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
    return res.status(400).json({
      success: false,
      message: 'Invalid phone number format'
    });
  }
  
  // Password validation
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters'
    });
  }
  
  // Pincode validation
  const pincodeRegex = /^\d{6}$/;
  if (!pincodeRegex.test(pincode)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid pincode format'
    });
  }
  
  // Success response (without database for now)
  res.status(201).json({
    success: true,
    message: 'Registration successful! (Database temporarily disabled)',
    data: {
      user: {
        id: 'temp_' + Date.now(),
        ownerName,
        email,
        phone,
        shopName,
        shopAddress,
        city,
        state,
        pincode,
        role: 'user'
      },
      accessToken: 'temp_token_' + Date.now(),
      refreshToken: 'temp_refresh_' + Date.now()
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
  
  // Mock login success
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: 'temp_user',
        name: 'Test User',
        email,
        role: 'user'
      },
      accessToken: 'temp_token_' + Date.now(),
      refreshToken: 'temp_refresh_' + Date.now()
    }
  });
});

// Mock products endpoint
app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    data: {
      items: [
        {
          _id: '1',
          name: 'Sample Product',
          description: 'A sample product for testing',
          price: 99.99,
          stock: 100,
          category: { name: 'Electronics' },
          brand: 'Sample Brand'
        }
      ],
      pagination: {
        current: 1,
        pages: 1,
        total: 1
      }
    }
  });
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 Auth endpoints available`);
});
