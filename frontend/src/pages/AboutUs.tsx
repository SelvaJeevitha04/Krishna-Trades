import React from 'react';
import { ShieldCheckIcon, ChartBarIcon, UserGroupIcon, TruckIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const AboutUs: React.FC = () => {
  const stats = [
    { label: 'Active Retailers', value: '15+' },
    { label: 'Products', value: '100+' },
    { label: 'Brands', value: '15+' },
    { label: 'Years Experience', value: '5+' },
  ];

  const features = [
    {
      name: 'Trusted Wholesale Partner',
      description: 'We supply high-quality products directly from manufacturers to your shop, ensuring minimal supply chain delays and maximum reliability.',
      icon: ShieldCheckIcon,
    },
    {
      name: 'Competitive Pricing',
      description: 'Benefit from industry-leading wholesale pricing, volume discounts, and regular offers to maximize your retail margins.',
      icon: ChartBarIcon,
    },
    {
      name: 'Dedicated Support',
      description: 'Our consultancy platform acts as an extended part of your business, helping you pick the right products and track your orders seamlessly.',
      icon: UserGroupIcon,
    },
    {
      name: 'Fast & Reliable Delivery',
      description: 'A robust logistics network ensures your retail shelves are restocked safely and on time, every time.',
      icon: TruckIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-16 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-500 shadow-lg mb-6">
            <span className="text-3xl font-bold text-white font-display">K</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight font-display mb-4">
            About Krishna Trades
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Your reliable wholesale consultancy platform bridging the gap between top manufacturers and retail businesses.
          </p>
        </div>

        {/* Impact Stats */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-20 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {stats.map((stat, idx) => (
              <div key={idx} className="p-8 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
                <p className="text-4xl font-extrabold text-primary-600 font-display mb-2">{stat.value}</p>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Story Section */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
          <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 font-display">Our Mission</h2>
            <div className="prose prose-lg text-gray-600">
              <p className="mb-4">
                At Krishna Trades, our mission is to empower retail shop owners by providing a seamless, transparent, and highly efficient wholesale trading experience. 
              </p>
              <p>
                We understand the daily challenges faced by retailers in sourcing authentic products at the right price point. By digitizing the traditional wholesale procurement model, we offer unparalleled access to trusted brands like Sakthi Masala, Cadbury, and Dabur, right at your fingertips.
              </p>
            </div>
            <div className="mt-8">
              <Link to="/products" className="btn btn-primary">
                Explore Our Catalog &rarr;
              </Link>
            </div>
          </div>
          <div className="relative animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-600 to-accent-500 rounded-3xl transform rotate-3 shadow-2xl opacity-80"></div>
            <img 
              src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Warehouse logistics" 
              className="relative rounded-3xl shadow-lg border-4 border-white object-cover w-full h-[400px]"
            />
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="border-t border-gray-200 pt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-display">Why Retailers Choose Us</h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div 
                key={feature.name} 
                className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-shadow duration-300 animate-fade-in-up"
                style={{ animationDelay: `${500 + (idx * 100)}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.name}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutUs;
