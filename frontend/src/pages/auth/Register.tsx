import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import InputField from '../../components/ui/InputField';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [ownerDetails, setOwnerDetails] = useState({
    ownerName: '', email: '', phone: '', password: '', confirmPassword: ''
  });

  const [shopDetails, setShopDetails] = useState({
    shopName: '', shopType: 'retail' as 'retail' | 'supermarket', gstNumber: '', shopAddress: '', city: '', state: '', pincode: '', landmark: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const shopTypeOptions = [
    { value: 'retail', label: 'Retail Store' },
    { value: 'supermarket', label: 'Supermarket' }
  ];

  const handleOwnerChange = (field: string, value: string) => {
    setOwnerDetails(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleShopChange = (field: string, value: string) => {
    setShopDetails(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateOwnerDetails = () => {
    const newErrors: Record<string, string> = {};
    if (!ownerDetails.ownerName.trim()) newErrors.ownerName = 'Owner name is required';
    if (!ownerDetails.email.trim()) newErrors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(ownerDetails.email)) newErrors.email = 'Use a valid email';
    if (!ownerDetails.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!/^[6-9]\d{9}$/.test(ownerDetails.phone.replace(/\D/g, ''))) newErrors.phone = 'Valid 10-digit number required';
    if (!ownerDetails.password.trim()) newErrors.password = 'Password is required';
    else if (ownerDetails.password.length < 6) newErrors.password = 'Min 6 characters required';
    if (!ownerDetails.confirmPassword.trim()) newErrors.confirmPassword = 'Confirm your password';
    else if (ownerDetails.password !== ownerDetails.confirmPassword) newErrors.confirmPassword = 'Passwords mismatch';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateShopDetails = () => {
    const newErrors: Record<string, string> = {};
    if (!shopDetails.shopName.trim()) newErrors.shopName = 'Shop name is required';
    if (!shopDetails.shopAddress.trim()) newErrors.shopAddress = 'Address is required';
    if (!shopDetails.city.trim()) newErrors.city = 'City is required';
    if (!shopDetails.state.trim()) newErrors.state = 'State is required';
    if (!shopDetails.pincode.trim()) newErrors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(shopDetails.pincode)) newErrors.pincode = 'Valid 6-digit PIN required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 1) {
      if (validateOwnerDetails()) setCurrentStep(2);
      return;
    }
    if (!validateShopDetails()) return;

    try {
      setLoading(true);
      await register({ ...ownerDetails, ...shopDetails, role: 'user' });
      setMessage({ type: 'success', text: 'Registration successful! Taking you to login...' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Registration failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl p-6 sm:p-10 w-full max-w-2xl mx-auto rounded-[2.5rem] shadow-2xl border border-white/50 animate-in slide-in-from-bottom-8 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-gray-900 font-display tracking-tight">
          Register Your Shop
        </h2>
        <p className="mt-2 text-gray-500 font-medium">
          Join Krishna Trades & unlock wholesale pricing.
        </p>
      </div>

      <div className="mb-8 relative flex justify-center items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
        <div className={`w-24 h-1 mx-2 rounded-full ${currentStep >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
      </div>

      {message && (
        <div className={`mb-8 p-4 rounded-2xl flex items-center font-bold text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {currentStep === 1 ? (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
            <h3 className="text-xl font-extrabold text-gray-800 mb-6 pb-2 border-b border-gray-100">Owner Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="Full Name" name="ownerName" value={ownerDetails.ownerName} onChange={e => handleOwnerChange('ownerName', e.target.value)} error={errors.ownerName} required />
              <InputField label="Email Address" type="email" name="email" value={ownerDetails.email} onChange={e => handleOwnerChange('email', e.target.value)} error={errors.email} required />
              <InputField label="Phone Number" type="tel" name="phone" value={ownerDetails.phone} onChange={e => handleOwnerChange('phone', e.target.value)} error={errors.phone} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
              <InputField label="Password" type="password" name="password" value={ownerDetails.password} onChange={e => handleOwnerChange('password', e.target.value)} error={errors.password} required />
              <InputField label="Confirm Password" type="password" name="confirmPassword" value={ownerDetails.confirmPassword} onChange={e => handleOwnerChange('confirmPassword', e.target.value)} error={errors.confirmPassword} required />
            </div>
            <div className="pt-6">
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl hover:bg-indigo-700 transition-all text-lg">Next Step</button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
            <h3 className="text-xl font-extrabold text-gray-800 mb-6 pb-2 border-b border-gray-100">Shop Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="Shop Name" name="shopName" value={shopDetails.shopName} onChange={e => handleShopChange('shopName', e.target.value)} error={errors.shopName} required />
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Shop Type *</label>
                <select value={shopDetails.shopType} onChange={e => handleShopChange('shopType', e.target.value as any)} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 bg-gray-50/50 font-medium">
                  {shopTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <InputField label="Shop Address" name="shopAddress" value={shopDetails.shopAddress} onChange={e => handleShopChange('shopAddress', e.target.value)} error={errors.shopAddress} required />
              </div>
              <InputField label="City" name="city" value={shopDetails.city} onChange={e => handleShopChange('city', e.target.value)} error={errors.city} required />
              <InputField label="State" name="state" value={shopDetails.state} onChange={e => handleShopChange('state', e.target.value)} error={errors.state} required />
              <InputField label="Pincode" name="pincode" value={shopDetails.pincode} onChange={e => handleShopChange('pincode', e.target.value)} error={errors.pincode} required />
              <InputField label="GST Number (Optional)" name="gstNumber" value={shopDetails.gstNumber} onChange={e => handleShopChange('gstNumber', e.target.value)} error={errors.gstNumber} />
            </div>
            <div className="flex gap-4 pt-6">
              <button type="button" onClick={() => setCurrentStep(1)} className="w-1/3 py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all text-lg">Back</button>
              <button type="submit" disabled={loading} className="w-2/3 flex justify-center items-center py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl hover:bg-indigo-700 transition-all text-lg">
                {loading ? <LoadingSpinner size="sm" className="mr-2" /> : 'Complete Registration'}
              </button>
            </div>
          </div>
        )}
      </form>
      <div className="mt-8 text-center pt-6 border-t border-gray-100">
        <span className="text-sm font-medium text-gray-500">Already registered? </span>
        <Link to="/login" className="text-sm font-bold text-indigo-600 hover:text-indigo-500 transition-colors">Sign in</Link>
      </div>
    </div>
  );
};

export default Register;
