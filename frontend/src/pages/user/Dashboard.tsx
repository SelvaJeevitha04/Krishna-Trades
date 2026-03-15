import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { 
  ShoppingCartIcon, 
  CubeIcon, 
  ClipboardDocumentListIcon,
  UserIcon,
  ShoppingBagIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { itemCount } = useCart();

  const features = [
    {
      name: 'Wide Product Range',
      description: 'Access hundreds of products from top brands like Sakthi Masala, Cadbury, and more.',
      icon: ShoppingBagIcon,
    },
    {
      name: 'Fast Delivery',
      description: 'Get your inventory restocked quickly with our optimized logistics network.',
      icon: TruckIcon,
    },
    {
      name: 'Secure & Reliable',
      description: '100% genuine products with secure payment and order tracking.',
      icon: ShieldCheckIcon,
    },
  ];

  return (
    <div className="flex flex-col gap-12 pb-12">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 border border-primary-700/50 shadow-2xl mt-4">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 to-transparent"></div>
        
        <div className="relative z-10 px-6 py-16 sm:px-12 sm:py-24 lg:py-32 lg:px-16 flex flex-col items-center text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6 font-display">
            Welcome, <span className="text-emerald-400">{user?.shopName || user?.name?.split(' ')[0] || 'Partner'}</span>
          </h1>
          <p className="mt-4 text-xl sm:text-2xl text-blue-100 max-w-4xl font-light leading-relaxed">
            Manage your shop inventory with ease. Discover premium grocery brands, competitive prices, and reliable supply — all in one platform designed for retailers.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/products">
              <button className="w-full sm:w-auto text-lg px-8 py-4 bg-white text-indigo-900 hover:bg-gray-50 border-none shadow-xl hover:shadow-2xl font-extrabold rounded-2xl transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
                Start Shopping <ArrowRightIcon className="w-5 h-5" />
              </button>
            </Link>
            <Link to="/orders">
              <button className="w-full sm:w-auto text-lg px-8 py-4 bg-transparent text-white border-2 border-white/50 hover:bg-white/20 hover:border-white font-bold rounded-2xl backdrop-blur-sm transition-all flex items-center justify-center">
                Track Orders
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Actions / Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        <Link to="/products" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
            <ShoppingBagIcon className="w-6 h-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Products</h3>
          <p className="text-sm text-gray-500">Browse catalogue</p>
        </Link>
        <Link to="/orders" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-accent-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent-100 transition-colors">
            <ClipboardDocumentListIcon className="w-6 h-6 text-accent-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">My Orders</h3>
          <p className="text-sm text-gray-500">Track shipments</p>
        </Link>
        <Link to="/bulk-orders" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group border-l-4 border-l-primary-500">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
            <ArchiveBoxIcon className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Bulk Orders</h3>
          <p className="text-sm text-gray-500">Custom / Large queries</p>
        </Link>
        <Link to="/cart" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
            <ShoppingCartIcon className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Cart ({itemCount})</h3>
          <p className="text-sm text-gray-500">Checkout items</p>
        </Link>
      </section>

      {/* About Us / Features Section */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-12 sm:px-12 lg:py-16">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl mb-4">About Krishna Trades</h2>
            <p className="text-lg text-gray-600">
              We are dedicated to empowering retail businesses by providing a seamless B2B procurement platform. 
              Our mission is to simplify your supply chain so you can focus on growing your retail shop.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {features.map((feature) => (
              <div key={feature.name} className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 mb-6">
                  <feature.icon className="h-8 w-8" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.name}</h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-xl overflow-hidden text-white">
        <div className="px-6 py-12 sm:px-12 lg:py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl mb-4">Need Assistance?</h2>
            <p className="text-lg text-gray-300 mb-8 max-w-lg">
              Our support team is always ready to help you with your orders, product inquiries, or platform navigation.
            </p>
            
            <dl className="space-y-6">
              <div className="flex bg-white/5 p-4 rounded-xl border border-white/10">
                <dt className="flex-shrink-0">
                  <PhoneIcon className="h-6 w-6 text-accent-400" aria-hidden="true" />
                </dt>
                <dd className="ml-4 text-base text-gray-200">
                  <p className="font-semibold text-white mb-1">Call Us Support</p>
                  <p>+91 8056588833</p>
                </dd>
              </div>
              <div className="flex bg-white/5 p-4 rounded-xl border border-white/10">
                <dt className="flex-shrink-0">
                  <EnvelopeIcon className="h-6 w-6 text-accent-400" aria-hidden="true" />
                </dt>
                <dd className="ml-4 text-base text-gray-200">
                  <p className="font-semibold text-white mb-1">Email Us</p>
                  <p>karthi0986@gmail.com</p>
                </dd>
              </div>
              <div className="flex bg-white/5 p-4 rounded-xl border border-white/10">
                <dt className="flex-shrink-0">
                  <MapPinIcon className="h-6 w-6 text-accent-400" aria-hidden="true" />
                </dt>
                <dd className="ml-4 text-base text-gray-200">
                  <p className="font-semibold text-white mb-1">Location</p>
                  <p>92/5,Palaniyappa Colony,Annadhanapatty,Salem <br/>Tamil Nadu, India</p>
                </dd>
              </div>
            </dl>
          </div>
          
          <div className="hidden lg:flex justify-center items-center">
            <div className="w-full max-w-sm bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
              <h3 className="text-2xl font-bold mb-4 text-center">Business Hours</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex justify-between border-b border-white/10 pb-2"><span>Monday - Friday</span> <span className="text-white font-medium">9:00 AM - 8:00 PM</span></li>
                <li className="flex justify-between border-b border-white/10 pb-2"><span>Saturday</span> <span className="text-white font-medium">10:00 AM - 6:00 PM</span></li>
                <li className="flex justify-between border-b border-white/10 pb-2"><span>Sunday</span> <span className="text-accent-400 font-medium">Closed</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Dashboard;
