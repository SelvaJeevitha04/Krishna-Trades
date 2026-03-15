const BulkOrder = require('../models/BulkOrder');
const crypto = require('crypto');

// Create a new bulk order request
exports.createBulkOrder = async (req, res) => {
  try {
    const { 
      shopName, 
      ownerName, 
      phone, 
      address, 
      products, 
      deliveryDate, 
      additionalNotes 
    } = req.body;

    // Validate required fields
    if (!products || products.length === 0) {
      return res.status(400).json({ success: false, message: 'Products list cannot be empty' });
    }

    // Generate a unique Request ID (e.g., BO-2024-XXXX)
    const requestId = `BO-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const newBulkOrder = new BulkOrder({
      requestId,
      user: req.user._id,
      shopName,
      ownerName,
      phone,
      address,
      products,
      deliveryDate,
      additionalNotes,
      status: 'Pending'
    });

    await newBulkOrder.save();
    
    // Optional: Send socket notification to admin
    const io = req.app.get('io');
    if (io) {
      io.emit('new_bulk_order', { message: 'New Bulk Order received', orderId: newBulkOrder._id });
    }

    res.status(201).json({ success: true, data: newBulkOrder });
  } catch (error) {
    console.error('Bulk Order Creation Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all bulk orders for a user
exports.getUserBulkOrders = async (req, res) => {
  try {
    const bulkOrders = await BulkOrder.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bulkOrders.length, data: bulkOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all bulk orders (Admin)
exports.getAllBulkOrders = async (req, res) => {
  try {
    const bulkOrders = await BulkOrder.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bulkOrders.length, data: bulkOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update bulk order status (Admin)
exports.updateBulkOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['Pending', 'Under Review', 'Approved', 'Rejected', 'Completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const bulkOrder = await BulkOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!bulkOrder) {
      return res.status(404).json({ success: false, message: 'Bulk order not found' });
    }

    // Optional: Notify user
    const io = req.app.get('io');
    if (io) {
      io.emit('bulk_order_update', { message: `Bulk Order ${bulkOrder.requestId} status updated to ${status}`, orderId: bulkOrder._id, user: bulkOrder.user });
    }

    res.status(200).json({ success: true, data: bulkOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
