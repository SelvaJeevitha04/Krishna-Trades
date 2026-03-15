const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const Notification = require('../models/Notification');

// Initialise Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── Step 1: Create a Razorpay Order ─────────────────────────────────────────
// Called BEFORE showing the Razorpay popup.
// Returns: { razorpayOrderId, amount, currency, keyId }
const createRazorpayOrder = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items provided' });
    }

    // Calculate amount from DB prices (never trust client-side totals)
    let subtotal = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return res.status(400).json({ success: false, message: `Product ${item.product} not found or inactive` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }
      subtotal += product.price * item.quantity;
    }

    // Tax 10%
    const totalAmount = Math.round(subtotal * 1.1 * 100); // Razorpay needs amount in paise

    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: { userId: req.user.id },
    });

    res.json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Step 2: Verify Razorpay Payment & Place Order ───────────────────────────
// Called AFTER the user completes payment in the Razorpay popup.
const verifyAndPlaceOrder = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      shippingAddress,
    } = req.body;

    // 1. Verify the payment signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed: invalid signature' });
    }

    // 2. Build order items & decrement stock (same logic as createOrder)
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return res.status(400).json({ success: false, message: `Product ${item.product} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        sku: product.sku,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal,
      });
    }

    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    // 3. Create the order in DB with razorpay payment info
    const order = new Order({
      user: req.user.id,
      items: orderItems,
      subtotal,
      tax,
      shipping: 0,
      total,
      shippingAddress: shippingAddress || {
        street: 'Not provided',
        city: 'Not provided',
        state: 'Not provided',
        zipCode: '000000',
        country: 'India',
      },
      paymentMethod: 'online',
      paymentStatus: 'paid',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    await order.save();

    // 4. Decrement stock & log inventory
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      const previousStock = product.stock;
      await product.decrementStock(item.quantity);

      await InventoryLog.create({
        product: product._id,
        type: 'sale',
        quantity: item.quantity,
        previousStock,
        newStock: product.stock,
        reason: `Order #${order.orderNumber} (Razorpay: ${razorpay_payment_id})`,
        user: req.user.id,
        order: order._id,
      });
    }

    // 5. Notifications
    await Notification.create({
      title: 'Payment Successful 🎉',
      message: `Your order #${order.orderNumber} has been placed. Payment ID: ${razorpay_payment_id}`,
      type: 'order',
      user: req.user.id,
      data: { orderId: order._id, action: 'placed' },
    });

    await Notification.create({
      title: 'New Online Order Received',
      message: `Order #${order.orderNumber} placed via Razorpay (₹${total.toFixed(2)})`,
      type: 'order',
      user: '000000000000000000000000',
      data: { orderId: order._id, action: 'placed' },
    });

    // 6. Socket emit
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${req.user.id}`).emit('order-placed', { order });
      io.to('admin-room').emit('new-order', { order });
    }

    res.status(201).json({
      success: true,
      message: 'Payment verified and order placed successfully',
      data: { order },
    });
  } catch (error) {
    console.error('Razorpay verify error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createRazorpayOrder, verifyAndPlaceOrder };
