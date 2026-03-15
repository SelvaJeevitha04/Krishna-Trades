const express = require('express');
const router = express.Router();
const { 
  createBulkOrder, 
  getUserBulkOrders, 
  getAllBulkOrders, 
  updateBulkOrderStatus 
} = require('../controllers/bulkOrderController');
const { authenticate: protect, authorize } = require('../middleware/auth');

// Note: Ensure the user is authenticated to submit a bulk order or view their orders
router.post('/', protect, createBulkOrder);
router.get('/my-requests', protect, getUserBulkOrders);

// Admin only routes
router.get('/', protect, authorize('admin', 'manager'), getAllBulkOrders);
router.put('/:id/status', protect, authorize('admin', 'manager'), updateBulkOrderStatus);

module.exports = router;
