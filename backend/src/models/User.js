const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  phone: {
    type: String,
    trim: true
  },
  alternatePhone: {
    type: String,
    trim: true
  },
  shopName: {
    type: String,
    required: function() {
      // Make shopName required only for new users (created after shop-based system)
      return !this.createdAt || this.createdAt > new Date('2025-01-01');
    },
    trim: true,
    maxlength: [100, 'Shop name cannot exceed 100 characters']
  },
  shopType: {
    type: String,
    enum: ['retail', 'supermarket', 'medical', 'stationary', 'other'],
    default: 'retail'
  },
  shopPhoto: {
    type: String,
    default: ''
  },
  gstNumber: {
    type: String,
    trim: true,
    match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GST number']
  },
  shopAddress: {
    type: String,
    required: function() {
      // Make shopAddress required only for new users
      return !this.createdAt || this.createdAt > new Date('2025-01-01');
    },
    trim: true
  },
  city: {
    type: String,
    required: function() {
      // Make city required only for new users
      return !this.createdAt || this.createdAt > new Date('2025-01-01');
    },
    trim: true
  },
  state: {
    type: String,
    required: function() {
      // Make state required only for new users
      return !this.createdAt || this.createdAt > new Date('2025-01-01');
    },
    trim: true
  },
  pincode: {
    type: String,
    required: function() {
      // Make pincode required only for new users
      return !this.createdAt || this.createdAt > new Date('2025-01-01');
    },
    match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode']
  },
  landmark: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  refreshToken: {
    type: String,
    select: false
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for performance
userSchema.index({ role: 1 });

// Hash password before saving - TEMPORARILY DISABLED
// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   
//   try {
//     const salt = await bcrypt.genSalt(12);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
