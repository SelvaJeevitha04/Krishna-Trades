const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { validateCreateProduct, validateUpdateProduct } = require('../validators/productValidator');

// Public routes
router.get('/', optionalAuth, productController.getProducts);
router.get('/:id', optionalAuth, productController.getProductById);

// User routes
router.post('/:id/reviews', authenticate, productController.addReview);

// Admin only routes
router.post('/', authenticate, authorize('admin'), validateCreateProduct, productController.createProduct);
router.put('/:id', authenticate, authorize('admin'), validateUpdateProduct, productController.updateProduct);
router.delete('/:id', authenticate, authorize('admin'), productController.deleteProduct);
router.get('/admin/low-stock', authenticate, authorize('admin'), productController.getLowStockProducts);

module.exports = router;
