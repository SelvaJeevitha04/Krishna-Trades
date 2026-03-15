const User = require('../models/User');
const { generateTokens, verifyRefreshToken } = require('../utils/jwtUtils');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');

// Register user with database integration
const register = async (req, res) => {
  try {
    console.log('🔍 Registration request received');
    console.log('🔍 Request body:', req.body);
    
    const { 
      ownerName, 
      email, 
      password, 
      phone, 
      alternatePhone,
      shopName, 
      shopType, 
      gstNumber, 
      shopAddress, 
      city, 
      state, 
      pincode, 
      landmark,
      role 
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Validate required fields for new users
    if (!ownerName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Owner name, email, password, and phone are required'
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
        message: 'Invalid phone number format. Must be 10 digits starting with 6, 7, 8, or 9'
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Validate shop fields if provided
    if (shopName && shopName.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Shop name must be at least 3 characters'
      });
    }

    if (pincode && !/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pincode format'
      });
    }

    if (gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid GST number format'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user object with conditional shop fields
    const userObject = {
      name: ownerName,
      email,
      password: hashedPassword,
      phone,
      alternatePhone: alternatePhone || '',
      role: role || 'user'
    };

    // Add shop fields if provided (new user format)
    if (shopName) {
      userObject.shopName = shopName;
      userObject.shopType = shopType || 'retail';
      userObject.gstNumber = gstNumber || '';
      userObject.shopAddress = shopAddress || '';
      userObject.city = city || '';
      userObject.state = state || '';
      userObject.pincode = pincode || '';
      userObject.landmark = landmark || '';
      
      // Create address object for new users
      userObject.address = {
        street: shopAddress || '',
        city: city || '',
        state: state || '',
        zipCode: pincode || '',
        country: 'India'
      };
    } else {
      // Create address object for old users
      userObject.address = {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
      };
    }

    console.log('🔍 About to save user:', userObject);

    // Create and save user
    const user = new User(userObject);
    await user.save();
    
    console.log('✅ User saved successfully to database');

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens({ id: user._id });

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    // Create welcome notification
    try {
      await Notification.create({
        title: 'Welcome to Krishna Trades!',
        message: 'Your account has been created successfully. Start browsing our products.',
        type: 'success',
        user: user._id
      });
      console.log('✅ Welcome notification created');
    } catch (notificationError) {
      console.log('⚠️ Notification creation failed:', notificationError.message);
    }

    // Prepare response data
    const responseData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      alternatePhone: user.alternatePhone,
      createdAt: user.createdAt
    };

    // Add shop fields if they exist
    if (user.shopName) {
      responseData.shopName = user.shopName;
      responseData.shopType = user.shopType;
      responseData.gstNumber = user.gstNumber;
      responseData.shopAddress = user.shopAddress;
      responseData.city = user.city;
      responseData.state = user.state;
      responseData.pincode = user.pincode;
      responseData.landmark = user.landmark;
      responseData.address = user.address;
    }

    res.status(201).json({
      success: true,
      message: shopName ? 'Shop registered successfully!' : 'Registration successful!',
      data: {
        user: responseData,
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
};

// Login user with backward compatibility
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // --- DEVELOPMENT ADMIN INTERCEPT ---
    // If the credentials match the hardcoded admin dev account, bypass the database
    if (email === 'admin@gmail.com' && password === 'admin123') {
      const mockAdminId = '000000000000000000000000'; // 24 char hex
      const { accessToken, refreshToken } = generateTokens({ id: mockAdminId });
      
      return res.json({
        success: true,
        message: 'Admin login successful',
        data: {
          user: {
            id: mockAdminId,
            name: 'System Admin',
            email: 'admin@gmail.com',
            role: 'admin',
            phone: 'Not Provided',
            address: 'Headquarters',
            lastLogin: new Date()
          },
          accessToken,
          refreshToken
        }
      });
    }
    // --- END ADMIN INTERCEPT ---

    // Find user with password
    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    let isPasswordValid = false;
    try {
      isPasswordValid = await user.comparePassword(password);
    } catch (error) {
      console.error('Password comparison error:', error);
      // Fallback: direct bcrypt comparison
      isPasswordValid = await bcrypt.compare(password, user.password);
    }
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken } = generateTokens({ id: user._id });

    // Update refresh token and last login
    await User.updateOne(
      { _id: user._id },
      { 
        $set: { 
          refreshToken, 
          lastLogin: new Date() 
        } 
      }
    );

    // Prepare response data
    const responseData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      lastLogin: user.lastLogin
    };

    // Add shop fields if they exist
    if (user.shopName) {
      responseData.shopName = user.shopName;
      responseData.shopType = user.shopType;
      responseData.gstNumber = user.gstNumber;
      responseData.shopAddress = user.shopAddress;
      responseData.city = user.city;
      responseData.state = user.state;
      responseData.pincode = user.pincode;
      responseData.landmark = user.landmark;
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: responseData,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const mockAdminId = '000000000000000000000000'; // 24 char hex
    
    // --- DEVELOPMENT ADMIN INTERCEPT ---
    if (req.user.id === mockAdminId) {
      return res.json({
        success: true,
        data: {
          user: {
            id: mockAdminId,
            name: 'System Admin',
            email: 'admin@gmail.com',
            role: 'admin',
            phone: 'Not Provided',
            address: 'Headquarters',
            createdAt: new Date(),
            lastLogin: new Date()
          }
        }
      });
    }
    // --- END ADMIN INTERCEPT ---

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prepare response data
    const responseData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      alternatePhone: user.alternatePhone,
      address: user.address,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    };

    // Add shop fields if they exist
    if (user.shopName) {
      responseData.shopName = user.shopName;
      responseData.shopType = user.shopType;
      responseData.gstNumber = user.gstNumber;
      responseData.shopAddress = user.shopAddress;
      responseData.city = user.city;
      responseData.state = user.state;
      responseData.pincode = user.pincode;
      responseData.landmark = user.landmark;
    }

    res.json({
      success: true,
      data: {
        user: responseData
      }
    });
  } catch (error) {
    console.error('❌ Get current user error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Other functions
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id).select('+refreshToken');
    
    if (!user || user.refreshToken !== refreshToken || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens({ id: user._id });
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser
};
