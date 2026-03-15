import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface BrandFilterProps {
  brands: string[];
  selectedBrand: string | null;
  onBrandChange: (brand: string | null) => void;
}

const BrandFilter: React.FC<BrandFilterProps> = ({ 
  brands, 
  selectedBrand, 
  onBrandChange 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Filter by Brand</h3>
        {selectedBrand && (
          <button
            onClick={() => onBrandChange(null)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {/* All Brands Option */}
        <button
          onClick={() => onBrandChange(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedBrand === null
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Brands
        </button>
        
        {/* Individual Brand Options */}
        {brands.map((brand) => (
          <button
            key={brand}
            onClick={() => onBrandChange(brand)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedBrand === brand
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {brand}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BrandFilter;
