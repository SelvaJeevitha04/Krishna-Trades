const User = require('../models/User');
const { verifyAccessToken } = require('../utils/jwtUtils');

// Authenticate user
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    
    // --- DEVELOPMENT ADMIN INTERCEPT ---
    if (decoded.id === '000000000000000000000000') {
      req.user = {
        id: '000000000000000000000000',
        _id: '000000000000000000000000',
        name: 'System Admin',
        email: 'admin@gmail.com',
        role: 'admin',
        isActive: true
      };
      return next();
    }
    // --- END ADMIN INTERCEPT ---
    
    const user = await User.findById(decoded.id).select('-password -refreshToken');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Authorize by role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    
    // --- DEVELOPMENT ADMIN INTERCEPT ---
    if (decoded.id === '000000000000000000000000') {
      req.user = {
        id: '000000000000000000000000',
        _id: '000000000000000000000000',
        name: 'System Admin',
        email: 'admin@gmail.com',
        role: 'admin',
        isActive: true
      };
      return next();
    }
    // --- END ADMIN INTERCEPT ---
    
    const user = await User.findById(decoded.id).select('-password -refreshToken');
    if (user && user.isActive) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Ignore authentication errors for optional auth
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth
};
