const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
    uppercase: true
  },

  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true,
    maxlength: [50, 'Brand name cannot exceed 50 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  minOrderQuantity: {
    type: Number,
    required: [true, 'Minimum order quantity is required'],
    min: [1, 'Minimum order quantity must be at least 1'],
    default: 5
  },
  availabilityStatus: {
    type: String,
    enum: ['In Stock', 'Low Stock', 'Out of Stock'],
    default: 'Out of Stock'
  },
  minStock: {
    type: Number,
    default: 20,
    min: [0, 'Minimum stock cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['pieces', 'kg', 'liters', 'meters', 'boxes', 'dozen'],
    default: 'pieces'
  },
  images: [{
    type: String,
    default: ''
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: String,
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  rating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  specifications: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    color: String,
    material: String
  }
}, {
  timestamps: true
});

// Method to update availability status
productSchema.methods.updateAvailabilityStatus = function() {
  if (this.stock === 0) {
    this.availabilityStatus = 'Out of Stock';
  } else if (this.stock <= 20) {
    this.availabilityStatus = 'Low Stock';
  } else {
    this.availabilityStatus = 'In Stock';
  }
  return this.save();
};

// Indexes for performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

productSchema.index({ price: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });

// Virtual for checking if stock is low
productSchema.virtual('isLowStock').get(function() {
  return this.stock <= this.minStock;
});

// Method to decrement stock
productSchema.methods.decrementStock = function(quantity) {
  if (this.stock < quantity) {
    throw new Error('Insufficient stock');
  }
  this.stock -= quantity;
  return this.save();
};

// Method to increment stock
productSchema.methods.incrementStock = function(quantity) {
  this.stock += quantity;
  return this.save();
};

module.exports = mongoose.model('Product', productSchema);
