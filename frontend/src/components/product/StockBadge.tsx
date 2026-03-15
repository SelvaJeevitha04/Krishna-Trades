import React from 'react';

interface StockBadgeProps {
  stockQuantity: number;
  minOrderQuantity: number;
}

const StockBadge: React.FC<StockBadgeProps> = ({ stockQuantity, minOrderQuantity }) => {
  const getStockStatus = () => {
    if (stockQuantity === 0) {
      return {
        text: 'Out of Stock',
        className: 'bg-red-100 text-red-800 border-red-200'
      };
    } else if (stockQuantity <= minOrderQuantity) {
      return {
        text: 'Low Stock',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      };
    } else {
      return {
        text: 'In Stock',
        className: 'bg-green-100 text-green-800 border-green-200'
      };
    }
  };

  const { text, className } = getStockStatus();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      {text} ({stockQuantity})
    </span>
  );
};

export default StockBadge;
