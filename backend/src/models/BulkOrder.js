const mongoose = require('mongoose');

const bulkOrderSchema = new mongoose.Schema({
  requestId: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shopName: {
    type: String,
    required: true,
    trim: true
  },
  ownerName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  products: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    brand: {
      type: String,
      required: true,
      enum: ['Sakthi Masala', 'Cadbury', 'Dabur', 'Milky Mist', 'Complan', 'Other']
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  totalRequestedItems: {
    type: Number,
    required: true,
    default: 0
  },
  deliveryDate: {
    type: Date,
    required: true
  },
  additionalNotes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Approved', 'Rejected', 'Completed'],
    default: 'Pending'
  }
}, { timestamps: true });

// Pre-save middleware to calculate total request items
bulkOrderSchema.pre('save', function() {
  if (this.products && this.products.length > 0) {
    this.totalRequestedItems = this.products.reduce((total, item) => total + item.quantity, 0);
  }
});

module.exports = mongoose.model('BulkOrder', bulkOrderSchema);
