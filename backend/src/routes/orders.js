const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateCreateOrder, validateUpdateOrderStatus } = require('../validators/orderValidator');

// User routes
router.get('/', authenticate, orderController.getUserOrders);
router.post('/', authenticate, validateCreateOrder, orderController.createOrder);
router.get('/:id', authenticate, orderController.getOrderById);

// Admin only routes
router.get('/admin/all', authenticate, authorize('admin'), orderController.getAllOrders);
router.put('/:id/status', authenticate, authorize('admin'), validateUpdateOrderStatus, orderController.updateOrderStatus);

module.exports = router;
