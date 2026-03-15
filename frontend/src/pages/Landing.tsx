import React from 'react';
import { Link } from 'react-router-dom';
import BrandSection from '../components/product/BrandSection';
import { ShieldCheckIcon, TruckIcon, CurrencyDollarIcon, StarIcon } from '@heroicons/react/24/outline';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Background Image via CSS - uses public folder, always works in Vite */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-banner.png')" }}
        />
        {/* Layered gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-900/75 to-gray-900/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 via-transparent to-transparent" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left: Content */}
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold tracking-widest mb-8 border border-amber-400/30 uppercase backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Trusted B2B Wholesale Platform
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] mb-6 font-display">
                Simplify Your{' '}
                <span className="relative">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300">
                    Retail Supply
                  </span>
                </span>{' '}
                Chain
              </h1>

              <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Connect directly with top FMCG brands. Get seamless ordering, integrated logistics, and the best wholesale pricing for your retail business.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <Link
                  to="/register"
                  className="group inline-flex justify-center items-center gap-2 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-2xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Create Free Account
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
                <Link
                  to="/login"
                  className="inline-flex justify-center items-center gap-2 px-8 py-4 text-base font-bold text-white bg-white/10 border border-white/25 hover:bg-white/20 rounded-2xl shadow-sm transition-all duration-300 backdrop-blur-sm hover:-translate-y-0.5"
                >
                  Sign In to Dashboard
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-gray-300 font-semibold">
                <span className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                  <ShieldCheckIcon className="w-5 h-5 text-amber-400" />
                  Verified Brands
                </span>
                <span className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                  <TruckIcon className="w-5 h-5 text-amber-400" />
                  Fast Delivery
                </span>
                <span className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                  <CurrencyDollarIcon className="w-5 h-5 text-amber-400" />
                  Best Margins
                </span>
              </div>
            </div>

            {/* Right: Login Card */}
            <div className="w-full lg:w-1/2 flex justify-center">
              <div className="w-full max-w-md">
                <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-black/30 border border-white/80 p-8 sm:p-10 animate-fade-in-up">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-600 text-white font-black text-3xl shadow-lg shadow-primary-600/30 mb-4 font-display">
                      K
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 font-display">Krishna Trades</h2>
                    <p className="text-gray-500 font-medium mt-1">Partner Portal Access</p>
                  </div>

                  <div className="space-y-3 mb-8">
                    <Link
                      to="/login"
                      className="flex items-center justify-center w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-primary-500 hover:to-indigo-500 shadow-lg shadow-primary-600/25 transition-all duration-200 hover:-translate-y-0.5"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="flex items-center justify-center w-full px-6 py-4 bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-100 hover:border-gray-300 transition-all duration-200"
                    >
                      Create Account
                    </Link>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Demo Credentials</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100">
                        <span className="block text-blue-700 font-black text-xs uppercase tracking-wide mb-2">Admin</span>
                        <span className="block text-gray-700 font-semibold text-xs">admin@example.com</span>
                        <code className="block text-gray-500 text-xs mt-1.5 bg-white px-2 py-1 rounded-lg border border-blue-100">admin123</code>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-100">
                        <span className="block text-emerald-700 font-black text-xs uppercase tracking-wide mb-2">User</span>
                        <span className="block text-gray-700 font-semibold text-xs">user@example.com</span>
                        <code className="block text-gray-500 text-xs mt-1.5 bg-white px-2 py-1 rounded-lg border border-emerald-100">user123</code>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social proof */}
                <div className="mt-4 flex items-center justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                  <span className="text-white/70 text-sm font-medium ml-2">Trusted by 500+ retailers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '500+', label: 'Retail Partners' },
              { value: '50+', label: 'FMCG Brands' },
              { value: '10,000+', label: 'Orders Delivered' },
              { value: '98%', label: 'Satisfaction Rate' },
            ].map((stat) => (
              <div key={stat.label} className="group">
                <div className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 font-display mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="bg-slate-50 py-20">
        <BrandSection />
      </section>
    </div>
  );
};

export default Landing;
