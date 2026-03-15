import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!isForgotPassword && !formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      if (isForgotPassword) {
        // Simulate forgot password API
        await new Promise(resolve => setTimeout(resolve, 1500));
        setResetMessage('A password reset link has been successfully sent to your email.');
        // Don't redirect immediately so they can read the message
      } else {
        const responseData = await login(formData.email, formData.password);
        if (responseData?.data?.user?.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      setErrors({ 
        general: error.response?.data?.message || (isForgotPassword ? 'Failed to send reset link.' : 'Login failed. Please try again.') 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isForgotPassword && resetMessage) {
    return (
      <div className="bg-white/90 backdrop-blur-xl p-8 sm:p-12 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-white/50 animate-in zoom-in-95 duration-300">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 font-display mb-4">Email Sent!</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            {resetMessage}
          </p>
          <button
            onClick={() => {
              setIsForgotPassword(false);
              setResetMessage('');
              setFormData({ email: '', password: '' });
            }}
            className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-colors shadow-lg"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-xl p-8 sm:p-12 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-white/50 animate-in slide-in-from-bottom-8 duration-500">
      
      {isForgotPassword && (
        <button 
          type="button" 
          onClick={() => {
            setIsForgotPassword(false);
            setErrors({});
          }}
          className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-6 group"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to login
        </button>
      )}

      <div className="mb-10 text-center">
        {!isForgotPassword && (
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-[2rem] bg-gradient-to-tr from-indigo-50 to-blue-50 text-indigo-600 shadow-sm border border-indigo-100">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
          </div>
        )}
        <h2 className="text-3xl font-black text-gray-900 font-display tracking-tight">
          {isForgotPassword ? 'Reset Password' : 'Welcome Back'}
        </h2>
        <p className="mt-3 text-base text-gray-500 font-medium">
          {isForgotPassword ? (
            'Enter your email address and we will send you a link to reset your password.'
          ) : (
            <>
              New to Krishna Trades?{' '}
              <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                Create a free account
              </Link>
            </>
          )}
        </p>
      </div>

      {errors.general && (
        <div className="mb-8 p-4 bg-red-50/80 backdrop-blur border border-red-100 rounded-2xl flex items-center shadow-sm">
          <svg className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
          <p className="text-sm font-bold text-red-800">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
            </div>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`block w-full pl-12 pr-4 py-4 bg-gray-50/50 border ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500'} rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 transition-all shadow-sm font-medium`}
              placeholder="you@example.com"
            />
          </div>
          {errors.email && <p className="mt-2 text-sm text-red-500 font-medium">{errors.email}</p>}
        </div>

        {!isForgotPassword && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-bold text-gray-700">
                Password
              </label>
              <button type="button" onClick={() => setIsForgotPassword(true)} className="text-sm font-bold text-indigo-600 hover:text-indigo-500">
                Forgot password?
              </button>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={`block w-full pl-12 pr-4 py-4 bg-gray-50/50 border ${errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500'} rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 transition-all shadow-sm font-medium`}
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="mt-2 text-sm text-red-500 font-medium">{errors.password}</p>}
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center py-4 px-8 border border-transparent rounded-2xl shadow-xl text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-3" />
                {isForgotPassword ? 'Sending...' : 'Signing in...'}
              </>
            ) : (
              isForgotPassword ? 'Reset Password' : 'Sign in'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
