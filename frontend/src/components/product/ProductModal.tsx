import React, { useState } from 'react';
import { XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import StockBadge from './StockBadge';

interface Product {
  _id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  stockQuantity: number;
  minOrderQuantity: number;
  description: string;
  images: string[];
  isActive: boolean;
}

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  isLoading?: boolean;
}

const ProductModal: React.FC<ProductModalProps> = ({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart,
  isLoading = false
}) => {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const isOutOfStock = product.stockQuantity === 0;
  const maxQuantity = Math.min(product.stockQuantity, 99);

  const handleAddToCart = () => {
    if (!isOutOfStock && quantity >= product.minOrderQuantity) {
      onAddToCart(product, quantity);
      onClose();
    }
  };

  const incrementQuantity = () => {
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={onClose}
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="bg-gray-100 p-8">
              <img
                src={product.images[0] || '/api/placeholder/400/400'}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>

            {/* Product Details */}
            <div className="p-8">
              {/* Brand */}
              <p className="text-sm text-gray-500 font-medium mb-2">{product.brand}</p>
              
              {/* Product Name */}
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {product.name}
              </h2>
              
              {/* Category */}
              <p className="text-gray-600 mb-4">{product.category}</p>

              {/* Price */}
              <div className="mb-6">
                <p className="text-3xl font-bold text-indigo-600">
                  ${product.price.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">per piece</p>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                <StockBadge 
                  stockQuantity={product.stockQuantity} 
                  minOrderQuantity={product.minOrderQuantity} 
                />
                <p className="text-sm text-gray-500 mt-2">
                  Minimum Order Quantity: {product.minOrderQuantity} pieces
                </p>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description || 'No description available for this product.'}
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-lg">-</span>
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val >= 1 && val <= maxQuantity) {
                        setQuantity(val);
                      }
                    }}
                    min={1}
                    max={maxQuantity}
                    className="w-20 text-center border border-gray-300 rounded-md py-2"
                  />
                  <button
                    onClick={incrementQuantity}
                    disabled={quantity >= maxQuantity}
                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-lg">+</span>
                  </button>
                </div>
                {quantity < product.minOrderQuantity && (
                  <p className="text-sm text-red-600 mt-1">
                    Minimum order quantity is {product.minOrderQuantity} pieces
                  </p>
                )}
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || quantity < product.minOrderQuantity || isLoading}
                className={`w-full py-3 px-4 rounded-md font-medium transition-colors duration-200 flex items-center justify-center ${
                  isOutOfStock || quantity < product.minOrderQuantity
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCartIcon className="h-5 w-5 mr-2" />
                    {isOutOfStock ? 'Out of Stock' : `Add ${quantity} to Cart`}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
