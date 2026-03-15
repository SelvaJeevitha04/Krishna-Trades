const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyAndPlaceOrder } = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

// All payment routes require authentication
router.use(authenticate);

// POST /api/payments/create-razorpay-order
// Creates a Razorpay order (step 1 before showing the popup)
router.post('/create-razorpay-order', createRazorpayOrder);

// POST /api/payments/verify
// Verifies payment signature and places the order in DB (step 2 after popup)
router.post('/verify', verifyAndPlaceOrder);

module.exports = router;
