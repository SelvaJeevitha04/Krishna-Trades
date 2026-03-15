const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', adminController.getDashboardAnalytics);

// User management
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/status', adminController.updateUserStatus);

// Inventory management
router.get('/inventory-logs', adminController.getInventoryLogs);
router.post('/inventory/adjust', adminController.adjustInventory);

// Sales and exports
router.get('/sales/export', adminController.exportSalesData);

module.exports = router;
