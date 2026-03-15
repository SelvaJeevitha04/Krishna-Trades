const { body, validationResult } = require('express-validator');

const validateCreateOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  
  body('items.*.product')
    .isMongoId()
    .withMessage('Valid product ID is required for each item'),
  
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1 for each item'),
  
  body('shippingAddress.street')
    .notEmpty()
    .withMessage('Shipping street address is required'),
  
  body('shippingAddress.city')
    .notEmpty()
    .withMessage('Shipping city is required'),
  
  body('shippingAddress.state')
    .notEmpty()
    .withMessage('Shipping state is required'),
  
  body('shippingAddress.zipCode')
    .notEmpty()
    .withMessage('Shipping zip code is required'),
  
  body('shippingAddress.country')
    .notEmpty()
    .withMessage('Shipping country is required'),
  
  body('paymentMethod')
    .optional()
    .isIn(['cash', 'card', 'upi', 'bank_transfer'])
    .withMessage('Invalid payment method'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

const validateUpdateOrderStatus = [
  body('status')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  validateCreateOrder,
  validateUpdateOrderStatus
};
