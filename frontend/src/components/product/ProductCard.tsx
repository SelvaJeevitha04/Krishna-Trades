import React from 'react';
import { ShoppingCartIcon, EyeIcon } from '@heroicons/react/24/outline';
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

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  isLoading?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart, 
  onViewDetails, 
  isLoading = false 
}) => {
  const isOutOfStock = product.stockQuantity === 0;
  
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden group">
      {/* Product Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <img
          src={product.images[0] || '/api/placeholder/300/200'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        
        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            onClick={() => onViewDetails(product)}
            className="bg-white p-2 rounded-full mx-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-200"
          >
            <EyeIcon className="h-5 w-5 text-gray-700" />
          </button>
        </div>

        {/* Stock Badge */}
        <div className="absolute top-2 right-2">
          <StockBadge 
            stockQuantity={product.stockQuantity} 
            minOrderQuantity={product.minOrderQuantity} 
          />
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Brand */}
        <p className="text-sm text-gray-500 font-medium mb-1">{product.brand}</p>
        
        {/* Product Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        {/* Category */}
        <p className="text-sm text-gray-600 mb-3">{product.category}</p>

        {/* Price and MOQ */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-2xl font-bold text-indigo-600">
              ${product.price.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">MOQ: {product.minOrderQuantity} pcs</p>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart(product)}
          disabled={isOutOfStock || isLoading}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors duration-200 flex items-center justify-center ${
            isOutOfStock
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
          }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Adding...
            </>
          ) : (
            <>
              <ShoppingCartIcon className="h-5 w-5 mr-2" />
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
