const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const updateAvailability = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🗄️  Connected to MongoDB');

    const products = await Product.find({});
    console.log(`📦 Updating availability status for ${products.length} products...`);
    
    for (const product of products) {
      if (product.stock === 0) {
        product.availabilityStatus = 'Out of Stock';
      } else if (product.stock <= 20) {
        product.availabilityStatus = 'Low Stock';
      } else {
        product.availabilityStatus = 'In Stock';
      }
      
      await product.markModified('availabilityStatus');
      await product.save({ validateBeforeSave: false });
      console.log(`✅ ${product.name} - ${product.availabilityStatus} (Stock: ${product.stock})`);
    }
    
    console.log('🎉 All products updated!');
    
  } catch (error) {
    console.error('❌ Error updating products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

updateAvailability();
