// Simple working auth controller
const register = async (req, res) => {
  try {
    console.log('🔍 Registration request received');
    console.log('🔍 Request body:', req.body);
    
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
    
    // For now, just return success (we'll add database later)
    res.status(201).json({
      success: true,
      message: 'Registration successful! (Database temporarily disabled)',
      data: {
        user: {
          ownerName,
          email,
          phone,
          shopName,
          shopAddress,
          city,
          state,
          pincode
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
};

const login = async (req, res) => {
  res.json({ success: true, message: 'Login temporarily disabled' });
};

const refreshToken = async (req, res) => {
  res.json({ success: true, message: 'Refresh token temporarily disabled' });
};

const logout = async (req, res) => {
  res.json({ success: true, message: 'Logout temporarily disabled' });
};

const getCurrentUser = async (req, res) => {
  res.json({ success: true, message: 'Get user temporarily disabled' });
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser
};
