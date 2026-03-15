import React, { useState, useEffect } from 'react';
import { FunnelIcon, AdjustmentsHorizontalIcon, ShoppingCartIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { productAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { Product } from '../../types';

const toast = {
  success: (message: string) => console.log('✅', message),
  error: (message: string) => console.error('❌', message)
};

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('All Brands');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const { addToCart } = useCart();

  const availableBrands = [
    'All Brands',
    'Sakthi Masala',
    'Cadbury',
    'Dabur',
    'Milky Mist',
    'Complan',
    'Himalaya',
    'Medimix',
    'Kinder Joy',
    'Parachute',
    'Allout'
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedBrand, stockFilter, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getProducts({ limit: 1000 });

      if (response.data.success) {
        // @ts-ignore
        const productsData = response.data.data.products || response.data.data.items || [];
        setProducts(productsData);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedBrand && selectedBrand !== 'All Brands') {
      filtered = filtered.filter(product => product.brand === selectedBrand);
    }

    if (stockFilter !== 'all') {
      filtered = filtered.filter(product => {
        if (stockFilter === 'inStock') return product.stock > 0;
        if (stockFilter === 'outOfStock') return product.stock <= 0;
        return true;
      });
    }

    filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'priceLow') return a.price - b.price;
      if (sortBy === 'priceHigh') return b.price - a.price;
      if (sortBy === 'stock') return b.stock - a.stock;
      return 0;
    });

    setFilteredProducts(filtered);
  };

  const handleAddToCart = async (product: Product) => {
    try {
      setAddingToCart(product._id);

      const quantityToAdd = product.minOrderQuantity || 1;

      await addToCart({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: quantityToAdd,
        minOrderQuantity: quantityToAdd,
        stock: product.stock,
        brand: product.brand,
        total: product.price * quantityToAdd
      });

      toast.success(`${product.name} added to cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  const getStockDisplayInfo = (stock: number) => {
    if (stock <= 0) return { text: 'Out of Stock', color: 'bg-red-50 text-red-700 border-red-200' };
    if (stock < 20) return { text: 'Low Stock', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
    return { text: 'In Stock', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="pb-12 h-full">
      {/* Header Area */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 p-6 rounded-3xl border border-white shadow-sm backdrop-blur-xl">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight font-display bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-accent-600">Wholesale Catalog</h1>
          <p className="text-gray-500 mt-1 font-medium">{filteredProducts.length} Premium items available</p>
        </div>
        <div className="flex w-full sm:w-auto gap-3">
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border font-semibold ${showFilters ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm'}`}
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            <span className="hidden sm:block">Filters</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="lg:w-72 flex-shrink-0 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                <FunnelIcon className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-bold text-gray-900">Refine Search</h3>
              </div>

              <div className="space-y-6">
                {/* Brand Filter */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Brand</label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {availableBrands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                {/* Stock Filter */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Availability</label>
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">Any Status</option>
                    <option value="inStock">In Stock Only</option>
                    <option value="outOfStock">Out of Stock</option>
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="name">Alphabetical (A-Z)</option>
                    <option value="priceLow">Price: Low to High</option>
                    <option value="priceHigh">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-24 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300">
              <ShoppingCartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-1">No products found</h3>
              <p className="text-gray-500">Try adjusting your filters or search term to find what you're looking for.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedBrand('All Brands');
                  setStockFilter('all');
                }}
                className="mt-6 text-primary-600 font-semibold hover:text-primary-700"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => {
                const stockInfo = getStockDisplayInfo(product.stock);
                const isOutOfStock = product.stock <= 0;

                return (
                  <div
                    key={product._id}
                    className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Product Image Area */}
                    <Link to={`/products/${product._id}`} className="block relative aspect-square w-full bg-gray-50 overflow-hidden mix-blend-multiply group-hover:shadow-inner">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                          <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mb-3 shadow-inner transform -rotate-6">
                            <span className="text-gray-500 text-3xl font-black font-display">
                              {product.brand.charAt(0)}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-gray-400 capitalize">{product.brand}</span>
                        </div>
                      )}

                      {/* Hover Overlay Details */}
                      <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="bg-white/95 backdrop-blur-md text-primary-700 px-5 py-2.5 rounded-full font-bold text-sm shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-2">
                          View Details
                        </span>
                      </div>

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border backdrop-blur-md ${stockInfo.color}`}>
                          {stockInfo.text}
                        </span>
                      </div>
                    </Link>

                    {/* Product Details Area */}
                    <div className="p-5 flex flex-col flex-1 border-t border-gray-50">
                      <div className="mb-1 flex items-center justify-between">
                        <p className="text-xs font-bold text-primary-600 uppercase tracking-wider">{product.brand}</p>
                        <p className="text-xs text-gray-500 font-medium">MOQ: {product.minOrderQuantity || 1}</p>
                      </div>

                      <Link to={`/products/${product._id}`} className="hover:text-primary-600 transition-colors">
                        <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem] leading-snug">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="mt-auto pt-4 flex items-end justify-between">
                        <div>
                          <p className="text-2xl font-black text-gray-900 tracking-tight">
                            ₹{product.price.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500 font-medium mt-1">Available: <span className={product.stock > 0 ? 'text-gray-900' : 'text-red-500'}>{product.stock} pcs</span></p>
                        </div>

                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={addingToCart === product._id || isOutOfStock}
                          className={`
                            h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-200
                            ${isOutOfStock
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/30'
                            }
                          `}
                          aria-label="Add to cart"
                        >
                          {addingToCart === product._id ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <ShoppingCartIcon className="h-6 w-6" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
