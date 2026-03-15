import React from 'react';
import { Link } from 'react-router-dom';

interface BrandCardProps {
  brandName: string;
  brandLogo: string;
  brandDescription: string;
  brandSlug: string;
}

const BrandCard: React.FC<BrandCardProps> = ({ brandName, brandLogo, brandDescription, brandSlug }) => {
  return (
    <Link
      to={`/products?brand=${brandSlug}`}
      className="group flex flex-col items-center p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:border-primary-100 hover:-translate-y-1.5 transition-all duration-300 ease-in-out"
    >
      {/* Logo circle */}
      <div className="w-20 h-20 mb-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center p-2.5 overflow-hidden group-hover:border-primary-100 transition-colors duration-300">
        {brandLogo ? (
          <img
            src={brandLogo}
            alt={`${brandName} Logo`}
            className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <span className={`text-2xl font-black text-gray-400 group-hover:text-primary-600 transition-colors ${brandLogo ? 'hidden' : ''}`}>
          {brandName.charAt(0)}
        </span>
      </div>

      <h3 className="text-sm font-bold text-gray-900 mb-1 font-display text-center">
        {brandName}
      </h3>

      <p className="text-xs text-gray-500 text-center line-clamp-2 mb-4 leading-relaxed">
        {brandDescription}
      </p>

      <div className="mt-auto w-full">
        <span className="block w-full py-1.5 px-3 rounded-lg bg-primary-50 text-primary-700 text-xs font-bold text-center border border-primary-100 group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 transition-all duration-300">
          View Products →
        </span>
      </div>
    </Link>
  );
};

export default BrandCard;
