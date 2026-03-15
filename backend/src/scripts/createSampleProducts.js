const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
require('dotenv').config();

const sampleProducts = [
  // Sakthi Masala Products
  {
    name: 'Sakthi Chicken Masala (200g)',
    brand: 'Sakthi Masala',
    category: 'Spices & Masalas',
    price: 45,
    stock: 150,
    minOrderQuantity: 10,
    description: 'Premium quality chicken masala for authentic South Indian taste',
    sku: 'SKT-CHICKEN-200',
    unit: 'pieces',
    tags: ['masala', 'spices', 'chicken', 'sakthi']
  },
  {
    name: 'Sakthi Chilli Powder (500g)',
    brand: 'Sakthi Masala',
    category: 'Spices & Masalas',
    price: 35,
    stock: 200,
    minOrderQuantity: 15,
    description: 'Pure red chilli powder with rich color and aroma',
    sku: 'SKT-CHILLI-500',
    unit: 'pieces',
    tags: ['chilli', 'powder', 'spices', 'sakthi']
  },
  {
    name: 'Sakthi Turmeric Powder (200g)',
    brand: 'Sakthi Masala',
    category: 'Spices & Masalas',
    price: 40,
    stock: 120,
    minOrderQuantity: 12,
    description: 'High-quality turmeric powder with natural color',
    sku: 'SKT-TURMERIC-200',
    unit: 'pieces',
    tags: ['turmeric', 'powder', 'spices', 'sakthi']
  },
  {
    name: 'Sakthi Garam Masala (100g)',
    brand: 'Sakthi Masala',
    category: 'Spices & Masalas',
    price: 25,
    stock: 180,
    minOrderQuantity: 20,
    description: 'Traditional blend of aromatic spices for curries',
    sku: 'SKT-GARAM-100',
    unit: 'pieces',
    tags: ['garam', 'masala', 'spices', 'sakthi']
  },

  // Cadbury Products
  {
    name: 'Cadbury Dairy Milk (50g)',
    brand: 'Cadbury',
    category: 'Chocolates',
    price: 50,
    stock: 300,
    minOrderQuantity: 25,
    description: 'Classic milk chocolate bar with smooth texture',
    sku: 'CAD-DM-50',
    unit: 'pieces',
    tags: ['dairy', 'milk', 'chocolate', 'cadbury']
  },
  {
    name: 'Cadbury Dairy Milk Silk',
    brand: 'Cadbury',
    category: 'Chocolates',
    price: 150,
    stock: 80,
    minOrderQuantity: 10,
    description: 'Premium silk chocolate with rich, creamy texture',
    sku: 'CAD-SILK-1',
    unit: 'pieces',
    tags: ['silk', 'premium', 'chocolate', 'cadbury']
  },
  {
    name: 'Cadbury Bournville Dark Chocolate',
    brand: 'Cadbury',
    category: 'Chocolates',
    price: 120,
    stock: 60,
    minOrderQuantity: 8,
    description: 'Rich dark chocolate with 70% cocoa',
    sku: 'CAD-BORN-1',
    unit: 'pieces',
    tags: ['bournville', 'dark', 'chocolate', 'cadbury']
  },
  {
    name: 'Cadbury 5 Star Chocolate',
    brand: 'Cadbury',
    category: 'Chocolates',
    price: 40,
    stock: 250,
    minOrderQuantity: 30,
    description: 'Caramel and nougat filled chocolate bar',
    sku: 'CAD-5STAR-1',
    unit: 'pieces',
    tags: ['5star', 'caramel', 'chocolate', 'cadbury']
  },

  // Dabur Products
  {
    name: 'Dabur Honey (250g)',
    brand: 'Dabur',
    category: 'Health & Wellness',
    price: 85,
    stock: 100,
    minOrderQuantity: 12,
    description: 'Pure and natural honey with multiple health benefits',
    sku: 'DAB-HONEY-250',
    unit: 'pieces',
    tags: ['honey', 'natural', 'health', 'dabur']
  },
  {
    name: 'Dabur Red Toothpaste',
    brand: 'Dabur',
    category: 'Personal Care',
    price: 45,
    stock: 200,
    minOrderQuantity: 20,
    description: 'Herbal toothpaste with natural ingredients',
    sku: 'DAB-RED-100',
    unit: 'pieces',
    tags: ['toothpaste', 'herbal', 'oral', 'dabur']
  },
  {
    name: 'Dabur Amla Hair Oil',
    brand: 'Dabur',
    category: 'Personal Care',
    price: 55,
    stock: 150,
    minOrderQuantity: 15,
    description: 'Traditional amla hair oil for healthy hair',
    sku: 'DAB-AMLA-200',
    unit: 'pieces',
    tags: ['hair', 'oil', 'amla', 'dabur']
  },
  {
    name: 'Dabur Chyawanprash',
    brand: 'Dabur',
    category: 'Health & Wellness',
    price: 180,
    stock: 80,
    minOrderQuantity: 6,
    description: 'Traditional Ayurvedic health supplement',
    sku: 'DAB-CHYAWAN-500',
    unit: 'pieces',
    tags: ['chyawanprash', 'ayurvedic', 'health', 'dabur']
  },

  // Complan Products
  {
    name: 'Complan Chocolate Health Drink',
    brand: 'Complan',
    category: 'Health Drinks',
    price: 220,
    stock: 90,
    minOrderQuantity: 8,
    description: 'Nutritious chocolate flavored health drink mix',
    sku: 'COM-CHOC-500',
    unit: 'pieces',
    tags: ['chocolate', 'health', 'drink', 'complan']
  },
  {
    name: 'Complan Kesar Badam',
    brand: 'Complan',
    category: 'Health Drinks',
    price: 240,
    stock: 75,
    minOrderQuantity: 6,
    description: 'Premium kesar badam flavored nutrition drink',
    sku: 'COM-KESAR-500',
    unit: 'pieces',
    tags: ['kesar', 'badam', 'health', 'complan']
  },
  {
    name: 'Complan Creamy Classic',
    brand: 'Complan',
    category: 'Health Drinks',
    price: 200,
    stock: 85,
    minOrderQuantity: 8,
    description: 'Classic creamy flavor health drink for growing children',
    sku: 'COM-CLASSIC-500',
    unit: 'pieces',
    tags: ['classic', 'creamy', 'health', 'complan']
  }
];

const createSampleProducts = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🗄️  Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    // Create categories if they don't exist
    const categories = [
      { name: 'Spices & Masalas', description: 'Indian spices and masalas' },
      { name: 'Chocolates', description: 'Chocolate products and confectionery' },
      { name: 'Health & Wellness', description: 'Health supplements and natural products' },
      { name: 'Personal Care', description: 'Personal hygiene and care products' },
      { name: 'Dairy Products', description: 'Milk and dairy based products' },
      { name: 'Health Drinks', description: 'Nutritional health drinks' }
    ];

    for (const cat of categories) {
      await Category.findOneAndUpdate(
        { name: cat.name },
        cat,
        { upsert: true, new: true }
      );
    }
    console.log('📂 Created categories');

    // Get category IDs
    const categoryMap = {};
    for (const cat of categories) {
      const category = await Category.findOne({ name: cat.name });
      categoryMap[cat.name] = category._id;
    }

    // Create products with category references
    const productsWithCategories = sampleProducts.map(product => ({
      ...product,
      category: categoryMap[product.category]
    }));

    // Insert sample products
    const insertedProducts = await Product.insertMany(productsWithCategories);
    console.log(`✅ Created ${insertedProducts.length} sample products`);

    // Display created products
    console.log('\n📦 Created Products:');
    insertedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ${product.brand} - ${product.availabilityStatus} (Stock: ${product.stock})`);
    });

    console.log('\n🎉 Sample products created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating sample products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the script
if (require.main === module) {
  createSampleProducts();
}

module.exports = { createSampleProducts, sampleProducts };
