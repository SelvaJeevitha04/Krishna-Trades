const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Create a review
const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user already reviewed
    const alreadyReviewed = await Review.findOne({ product: productId, user: req.user.id });
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }

    // Check if user has purchased the product (verified purchase)
    const orders = await Order.find({ user: req.user.id, status: 'delivered' });
    const hasPurchased = orders.some(order => order.items.some(item => item.product.toString() === productId));

    const review = await Review.create({
      product: productId,
      user: req.user.id,
      userName: req.user.name || 'Verified Buyer',
      rating: Number(rating),
      comment,
      isVerifiedPurchase: hasPurchased
    });

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: { review }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get reviews for a product
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ product: productId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name profilePicture');

    const total = await Review.countDocuments({ product: productId });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createReview,
  getProductReviews
};
