const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  type: {
    type: String,
    enum: ['sale', 'purchase', 'adjustment', 'return', 'damage'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  previousStock: {
    type: Number,
    required: true
  },
  newStock: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true,
    maxlength: [200, 'Reason cannot exceed 200 characters']
  },
  reference: {
    type: String,
    maxlength: [50, 'Reference cannot exceed 50 characters']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }
}, {
  timestamps: true
});

// Indexes for performance
inventoryLogSchema.index({ product: 1 });
inventoryLogSchema.index({ type: 1 });
inventoryLogSchema.index({ createdAt: -1 });
inventoryLogSchema.index({ user: 1 });

module.exports = mongoose.model('InventoryLog', inventoryLogSchema);
