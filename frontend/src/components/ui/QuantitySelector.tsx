import React from 'react';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  minQuantity?: number;
  maxQuantity?: number;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onQuantityChange,
  minQuantity = 1,
  maxQuantity = 99,
  disabled = false,
  size = 'md'
}) => {
  const incrementQuantity = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > minQuantity) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= minQuantity && value <= maxQuantity) {
      onQuantityChange(value);
    }
  };

  const sizeClasses = {
    sm: 'w-20 text-sm',
    md: 'w-24 text-base'
  };

  const buttonSizeClasses = {
    sm: 'p-1',
    md: 'p-2'
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={decrementQuantity}
        disabled={disabled || quantity <= minQuantity}
        className={`border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${buttonSizeClasses[size]}`}
      >
        <MinusIcon className="h-4 w-4" />
      </button>
      <input
        type="number"
        value={quantity}
        onChange={handleInputChange}
        min={minQuantity}
        max={maxQuantity}
        disabled={disabled}
        className={`text-center border border-gray-300 rounded-md py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${sizeClasses[size]} ${disabled ? 'bg-gray-100' : ''}`}
      />
      <button
        onClick={incrementQuantity}
        disabled={disabled || quantity >= maxQuantity}
        className={`border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${buttonSizeClasses[size]}`}
      >
        <PlusIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default QuantitySelector;
