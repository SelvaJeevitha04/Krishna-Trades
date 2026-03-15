import React from 'react';
import BrandCard from './BrandCard';

export const FEATURED_BRANDS = [
  {
    name: 'Sakthi Masala',
    slug: 'sakthi-masala',
    logo: 'https://seeklogo.com/images/S/sakthi-masala-logo-4AEC1F9650-seeklogo.com.png', 
    description: 'Authentic Indian Spice Range'
  },
  {
    name: 'Cadbury',
    slug: 'cadbury',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Cadbury_Logo.svg/1200px-Cadbury_Logo.svg.png',
    description: 'Premium Chocolate Collection'
  },
  {
    name: 'Dabur',
    slug: 'dabur',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Dabur_Logo.png',
    description: 'Trusted Health & Personal Care'
  },
  {
    name: 'Milky Mist',
    slug: 'milky-mist',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e4/Milky_Mist_Logo.svg/1200px-Milky_Mist_Logo.svg.png',
    description: 'Fresh Dairy Products'
  },
  {
    name: 'Complan',
    slug: 'complan',
    logo: 'https://seeklogo.com/images/C/complan-logo-F96AB600DB-seeklogo.com.png',
    description: 'Nutrition Health Drink'
  },
  {
    name: 'Himalaya',
    slug: 'himalaya',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Himalaya_Drug_Company_logo.svg/1200px-Himalaya_Drug_Company_logo.svg.png',
    description: 'Natural Herbal Wellness'
  },
  {
    name: 'Medimix',
    slug: 'medimix',
    logo: 'https://upload.wikimedia.org/wikipedia/en/d/d2/Medimix_logo.jpg',
    description: 'Ayurvedic Skincare'
  },
  {
    name: 'Kinder Joy',
    slug: 'kinder-joy',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Ferrero_logo.svg/1200px-Ferrero_logo.svg.png',
    description: 'Fun Surprise Treats'
  },
  {
    name: 'Parachute',
    slug: 'parachute',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Marico_Logo.svg/1200px-Marico_Logo.svg.png',
    description: 'Pure Coconut Hair Care'
  },
  {
    name: 'Allout',
    slug: 'allout',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/SC_Johnson_logo.svg/1200px-SC_Johnson_logo.svg.png',
    description: 'Mosquito Repellent Solutions'
  }
];

const BrandSection: React.FC = () => {
  return (
    <section className="py-4 relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-widest mb-4 border border-primary-100">
          ✦ Trusted Partners
        </span>
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 font-display">
          Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">Brands</span>
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto">
          Explore trusted wholesale brands available at Krishna Trades — all verified and ready to order.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {FEATURED_BRANDS.map((brand) => (
          <BrandCard
            key={brand.slug}
            brandName={brand.name}
            brandSlug={brand.slug}
            brandLogo={brand.logo}
            brandDescription={brand.description}
          />
        ))}
      </div>
    </section>
  );
};

export default BrandSection;
