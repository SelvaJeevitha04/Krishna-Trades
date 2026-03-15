const Order = require('../models/Order');
const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const Notification = require('../models/Notification');

// Get user's orders
const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { user: req.user.id };

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('items.product', 'name sku images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name sku images')
      .populate('approvedBy', 'name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is owner or admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create order
const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, billingAddress, notes, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    // Validate stock and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product} not found or inactive`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${product.name}. Available: ${product.stock}`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        sku: product.sku,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal
      });
    }

    // Create order
    const order = new Order({
      user: req.user.id,
      items: orderItems,
      subtotal,
      tax: 0, // Calculate tax if needed
      shipping: 0, // Calculate shipping if needed
      total: subtotal,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      notes,
      paymentMethod: paymentMethod || 'cash'
    });

    await order.save();

    // Update product stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      const previousStock = product.stock;
      await product.decrementStock(item.quantity);

      // Log inventory change
      await InventoryLog.create({
        product: product._id,
        type: 'sale',
        quantity: item.quantity,
        previousStock,
        newStock: product.stock,
        reason: `Order #${order.orderNumber}`,
        user: req.user.id,
        order: order._id
      });
    }

    // Create notification for user
    await Notification.create({
      title: 'Order Placed Successfully',
      message: `Your order #${order.orderNumber} has been placed and is pending confirmation.`,
      type: 'order',
      user: req.user.id,
      data: { orderId: order._id, action: 'placed' }
    });

    // Create notification for admin
    await Notification.create({
      title: 'New Order Received',
      message: `A new order (#${order.orderNumber}) has been placed by user ${req.user.name || 'Guest'} for ₹${order.total}.`,
      type: 'order',
      user: '000000000000000000000000', // Mock Admin ID
      data: { orderId: order._id, action: 'placed' }
    });

    // Emit real-time updates
    const io = req.app.get('io');
    io.to(`user-${req.user.id}`).emit('order-placed', { order });
    io.to('admin-room').emit('new-order', { order });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: { order }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update order status (Admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const orderId = req.params.id;

    const order = await Order.findById(orderId).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const previousStatus = order.status;
    await order.updateStatus(status, req.user.id);

    // Create notification for user
    const statusMessages = {
      confirmed: 'Your order has been confirmed and is being processed.',
      processing: 'Your order is being prepared for shipment.',
      shipped: `Your order has been shipped. Tracking number: ${order.trackingNumber || 'N/A'}`,
      delivered: 'Your order has been delivered successfully.',
      cancelled: 'Your order has been cancelled.'
    };

    await Notification.create({
      title: `Order Status Updated`,
      message: statusMessages[status] || `Your order status has been updated to ${status}.`,
      type: 'order',
      user: order.user._id,
      data: { orderId: order._id, action: 'status-updated', status }
    });

    // Emit real-time updates
    const io = req.app.get('io');
    io.to(`user-${order.user._id}`).emit('order-status-updated', { 
      order, 
      previousStatus, 
      newStatus: status 
    });
    io.to('admin-room').emit('order-status-updated', { 
      order, 
      previousStatus, 
      newStatus: status 
    });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all orders (Admin only)
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate, user } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (user) {
      query.user = user;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.product', 'name sku')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getUserOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getAllOrders
};
