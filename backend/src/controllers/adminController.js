const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');

// Get dashboard analytics
const getDashboardAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // Default last 30 days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const totalUsers = await User.countDocuments({ role: 'user', isActive: true });
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalOrders = await Order.countDocuments({ createdAt: { $gte: daysAgo } });

    // Get revenue
    const revenueData = await Order.aggregate([
      { $match: { createdAt: { $gte: daysAgo }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    // Get order status breakdown
    const orderStatusData = await Order.aggregate([
      { $match: { createdAt: { $gte: daysAgo } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get daily sales data
    const dailySales = await Order.aggregate([
      { $match: { createdAt: { $gte: daysAgo }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get top selling products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $match: { createdAt: { $gte: daysAgo } } },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.total' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    // Get low stock alerts
    const lowStockProducts = await Product.find({
      isActive: true,
      $expr: { $lte: ['$stock', '$minStock'] }
    }).countDocuments();

    // Get recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue,
          lowStockProducts
        },
        orderStatusBreakdown: orderStatusData,
        dailySales,
        topProducts,
        recentOrders
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, isActive } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password -refreshToken');

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
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

// Update user status (Admin only)
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user.id && !isActive) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get inventory logs (Admin only)
const getInventoryLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, product, type, startDate, endDate } = req.query;
    const query = {};

    if (product) {
      query.product = product;
    }

    if (type) {
      query.type = type;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const logs = await InventoryLog.find(query)
      .populate('product', 'name sku')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await InventoryLog.countDocuments(query);

    res.json({
      success: true,
      data: {
        logs,
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

// Adjust inventory (Admin only)
const adjustInventory = async (req, res) => {
  try {
    const { productId, quantity, reason } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const previousStock = product.stock;
    const newStock = Math.max(0, previousStock + quantity);

    product.stock = newStock;
    await product.save();

    // Log inventory change
    await InventoryLog.create({
      product: product._id,
      type: quantity > 0 ? 'purchase' : 'adjustment',
      quantity: Math.abs(quantity),
      previousStock,
      newStock,
      reason: reason || 'Manual adjustment',
      user: req.user.id
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('inventory-updated', { 
      product, 
      previousStock, 
      newStock,
      adjustedBy: req.user.name 
    });

    res.json({
      success: true,
      message: 'Inventory adjusted successfully',
      data: { product, previousStock, newStock }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Export sales data (Admin only)
const exportSalesData = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    const query = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name sku')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      // Convert to CSV format
      const csvWriter = require('csv-writer');
      const createCsvWriter = csvWriter.createObjectCsvWriter;
      
      const csvFilePath = `temp/sales-export-${Date.now()}.csv`;
      const csvWriterInstance = createCsvWriter({
        path: csvFilePath,
        header: [
          { id: 'orderNumber', title: 'Order Number' },
          { id: 'customerName', title: 'Customer Name' },
          { id: 'customerEmail', title: 'Customer Email' },
          { id: 'status', title: 'Status' },
          { id: 'total', title: 'Total' },
          { id: 'createdAt', title: 'Order Date' },
          { id: 'items', title: 'Items' }
        ]
      });

      const records = orders.map(order => ({
        orderNumber: order.orderNumber,
        customerName: order.user.name,
        customerEmail: order.user.email,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt.toISOString().split('T')[0],
        items: order.items.map(item => `${item.name} (${item.quantity})`).join('; ')
      }));

      await csvWriterInstance.writeRecords(records);
      
      res.download(csvFilePath, 'sales-export.csv', (err) => {
        if (err) {
          res.status(500).json({
            success: false,
            message: 'Error downloading file'
          });
        }
        // Clean up temp file
        require('fs').unlinkSync(csvFilePath);
      });
    } else {
      res.json({
        success: true,
        data: { orders }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getDashboardAnalytics,
  getAllUsers,
  updateUserStatus,
  getInventoryLogs,
  adjustInventory,
  exportSalesData
};
