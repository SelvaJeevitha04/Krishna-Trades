const Notification = require('../models/Notification');
const Product = require('../models/Product');

class SocketService {
  constructor(io) {
    this.io = io;
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);

      // Handle user joining their personal room
      socket.on('join-user-room', (userId) => {
        socket.join(`user-${userId}`);
        console.log(`User ${userId} joined their room`);
      });

      // Handle admin joining admin room
      socket.on('join-admin-room', () => {
        socket.join('admin-room');
        console.log('Admin joined admin room');
      });

      // Handle real-time stock checking
      socket.on('check-stock', async (productIds) => {
        try {
          const products = await Product.find({
            _id: { $in: productIds },
            isActive: true
          }).select('name stock minStock');

          socket.emit('stock-updates', products);
        } catch (error) {
          socket.emit('error', { message: 'Failed to check stock' });
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  // Emit product stock update to all connected clients
  emitStockUpdate(product, previousStock, newStock) {
    this.io.emit('stock-updated', {
      productId: product._id,
      productName: product.name,
      previousStock,
      newStock,
      isLowStock: newStock <= product.minStock
    });

    // Notify admin room about low stock
    if (newStock <= product.minStock) {
      this.io.to('admin-room').emit('low-stock-alert', {
        product,
        currentStock: newStock,
        minStock: product.minStock
      });
    }
  }

  // Emit order status update
  emitOrderStatusUpdate(order, previousStatus, newStatus, userId) {
    this.io.to(`user-${userId}`).emit('order-status-updated', {
      order,
      previousStatus,
      newStatus,
      message: `Your order #${order.orderNumber} status has been updated to ${newStatus}`
    });

    // Also notify admin room
    this.io.to('admin-room').emit('order-status-updated', {
      order,
      previousStatus,
      newStatus,
      updatedBy: 'System'
    });
  }

  // Emit new order notification to admin room
  emitNewOrder(order) {
    this.io.to('admin-room').emit('new-order', {
      order,
      message: `New order #${order.orderNumber} received`
    });
  }

  // Emit notification to specific user
  async emitNotification(userId, notificationData) {
    try {
      const notification = await Notification.create({
        ...notificationData,
        user: userId
      });

      this.io.to(`user-${userId}`).emit('notification', {
        notification,
        unreadCount: await Notification.countDocuments({ user: userId, isRead: false })
      });
    } catch (error) {
      console.error('Failed to emit notification:', error);
    }
  }

  // Emit product update to all clients
  emitProductUpdate(product, action) {
    this.io.emit('product-updated', {
      product,
      action, // 'created', 'updated', 'deleted'
      message: `Product ${product.name} has been ${action}`
    });
  }

  // Emit inventory log update to admin room
  emitInventoryUpdate(logData) {
    this.io.to('admin-room').emit('inventory-updated', {
      log: logData,
      message: `Inventory updated for product ${logData.product?.name || 'Unknown'}`
    });
  }

  // Broadcast system message
  broadcastSystemMessage(message, type = 'info') {
    this.io.emit('system-message', {
      message,
      type,
      timestamp: new Date()
    });
  }

  // Handle user-specific events
  handleUserEvent(userId, event, data) {
    this.io.to(`user-${userId}`).emit(event, data);
  }

  // Handle admin-specific events
  handleAdminEvent(event, data) {
    this.io.to('admin-room').emit(event, data);
  }
}

module.exports = SocketService;
