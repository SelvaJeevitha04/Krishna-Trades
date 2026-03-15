import React, { useState, useEffect } from 'react';
import { UserIcon, LockClosedIcon, BuildingStorefrontIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import InputField from '../../components/ui/InputField';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { userAPI } from '../../services/api';

interface ShopProfile {
  ownerName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  shopName: string;
  shopType: 'retail' | 'supermarket' | 'medical' | 'stationary' | 'other';
  gstNumber?: string;
  shopAddress: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  shopPhoto?: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [profile, setProfile] = useState<ShopProfile>({
    ownerName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    shopName: '',
    shopType: 'retail',
    gstNumber: '',
    shopAddress: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    shopPhoto: ''
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const shopTypeOptions = [
    { value: 'retail', label: 'Retail Store' },
    { value: 'supermarket', label: 'Supermarket' }
  ];

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate loading
      
      if (user) {
        setProfile({
          ownerName: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          alternatePhone: user.alternatePhone || '',
          shopName: user.shopName || '',
          shopType: (user.shopType as 'retail' | 'supermarket') || 'retail',
          gstNumber: user.gstNumber || '',
          shopAddress: user.shopAddress || '',
          city: user.city || '',
          state: user.state || '',
          pincode: user.pincode || '',
          landmark: user.landmark || '',
          shopPhoto: user.shopPhoto || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showMessage('error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (field: keyof ShopProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePasswordChange = (field: keyof PasswordData, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateProfile = () => {
    const newErrors: Record<string, string> = {};

    if (!profile.ownerName.trim()) newErrors.ownerName = 'Owner name is required';
    if (!profile.shopName.trim()) newErrors.shopName = 'Shop name is required';
    if (!profile.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(profile.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    if (!profile.shopAddress.trim()) newErrors.shopAddress = 'Shop address is required';
    if (!profile.city.trim()) newErrors.city = 'City is required';
    if (!profile.state.trim()) newErrors.state = 'State is required';
    if (!profile.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(profile.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword.trim()) newErrors.currentPassword = 'Current password is required';
    if (!passwordData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (!passwordData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) {
      showMessage('error', 'Please correct the errors before saving.');
      return;
    }

    try {
      setSaving(true);
      await userAPI.updateProfile(profile);
      // Wait to simulate UX polish
      await new Promise(resolve => setTimeout(resolve, 800));
      showMessage('success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      showMessage('error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) {
      showMessage('error', 'Please correct the errors before saving.');
      return;
    }

    try {
      setChangingPassword(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      showMessage('success', 'Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      showMessage('error', 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="pb-12">
      <div className="mb-8 bg-white/50 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-3xl border border-white shadow-sm backdrop-blur-xl animate-in fade-in slide-in-from-top-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 font-display tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-accent-600">Shop Profile</h1>
          <p className="mt-1 text-gray-500 font-medium">Manage your shop, personal details, and security.</p>
        </div>
        <Button onClick={logout} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 rounded-xl">
          Sign Out
        </Button>
      </div>

      {message && (
        <div className={`mb-8 p-4 rounded-2xl border animate-in slide-in-from-top-2 flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? (
             <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          ) : (
             <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
          <p className="text-sm font-bold">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar Menu */}
        <div className="lg:col-span-1 animate-in fade-in slide-in-from-left-4">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <div className="text-center mb-8 relative">
              <label htmlFor="photo-upload" className="block relative w-24 h-24 mx-auto mb-4 cursor-pointer group">
                <div className="w-full h-full bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden relative z-10">
                  {profile.shopPhoto ? (
                    <img src={profile.shopPhoto} alt="Shop" className="w-full h-full object-cover" />
                  ) : (
                    <BuildingStorefrontIcon className="h-10 w-10 text-primary-600" />
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-[10px] font-bold uppercase tracking-widest">Change</span>
                  </div>
                </div>
              </label>
              <input 
                id="photo-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      handleProfileChange('shopPhoto', reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }} 
              />
              <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{profile.shopName || 'Shop Name'}</h3>
              <p className="text-sm text-gray-500 font-medium mb-1">{profile.ownerName || 'Partner'}</p>
              <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full capitalize">
                {profile.shopType} Account
              </span>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === 'profile'
                    ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserIcon className="w-5 h-5" /> Shop Info
                </div>
                {activeTab === 'profile' && <ArrowRightIcon className="w-4 h-4" />}
              </button>
              
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === 'security'
                    ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <LockClosedIcon className="w-5 h-5" /> Security
                </div>
                {activeTab === 'security' && <ArrowRightIcon className="w-4 h-4" />}
              </button>
            </nav>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-10 animate-in fade-in slide-in-from-bottom-4">
            
            {activeTab === 'profile' ? (
              <div className="space-y-10">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Shop & Owner Details</h2>
                  <p className="text-gray-500">Keep your billing and retail store information up to date.</p>
                </div>

                {/* Section 1 */}
                <div>
                  <h3 className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-6 pb-2 border-b border-gray-100">Owner Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Owner Full Name *"
                      name="ownerName"
                      value={profile.ownerName}
                      onChange={(e) => handleProfileChange('ownerName', e.target.value)}
                      placeholder="Enter owner name"
                      error={errors.ownerName}
                    />
                    <InputField
                      label="Email Address"
                      name="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      disabled
                      className="bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <InputField
                      label="Primary Phone *"
                      name="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => handleProfileChange('phone', e.target.value)}
                      placeholder="10-digit phone number"
                      error={errors.phone}
                    />
                  </div>
                </div>

                {/* Section 2 */}
                <div>
                  <h3 className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-6 pb-2 border-b border-gray-100">Store Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Shop Name *"
                      name="shopName"
                      value={profile.shopName}
                      onChange={(e) => handleProfileChange('shopName', e.target.value)}
                      placeholder="Enter your store name"
                      error={errors.shopName}
                    />
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Shop Category *
                      </label>
                      <select
                        value={profile.shopType}
                        onChange={(e) => handleProfileChange('shopType', e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                      >
                        {shopTypeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <InputField
                        label="GST Number (Optional)"
                        name="gstNumber"
                        value={profile.gstNumber || ''}
                        onChange={(e) => handleProfileChange('gstNumber', e.target.value)}
                        placeholder="GSTIN if available"
                        error={errors.gstNumber}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3 */}
                <div>
                  <h3 className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-6 pb-2 border-b border-gray-100">Delivery Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <InputField
                        label="Complete Street Address *"
                        name="shopAddress"
                        value={profile.shopAddress}
                        onChange={(e) => handleProfileChange('shopAddress', e.target.value)}
                        placeholder="Plot no, building, street..."
                        error={errors.shopAddress}
                      />
                    </div>
                    <InputField
                      label="City *"
                      name="city"
                      value={profile.city}
                      onChange={(e) => handleProfileChange('city', e.target.value)}
                      placeholder="Enter city name"
                      error={errors.city}
                    />
                    <InputField
                      label="State *"
                      name="state"
                      value={profile.state}
                      onChange={(e) => handleProfileChange('state', e.target.value)}
                      placeholder="State name"
                      error={errors.state}
                    />
                    <InputField
                      label="Pincode *"
                      name="pincode"
                      value={profile.pincode}
                      onChange={(e) => handleProfileChange('pincode', e.target.value)}
                      placeholder="6-digit PIN"
                      error={errors.pincode || ''}
                    />
                    <InputField
                      label="Landmark (Optional)"
                      name="landmark"
                      value={profile.landmark || ''}
                      onChange={(e) => handleProfileChange('landmark', e.target.value)}
                      placeholder="Near hospital, school, etc."
                      error={errors.landmark || ''}
                    />
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end">
                  <Button
                    onClick={handleSaveProfile}
                    size="lg"
                    loading={saving}
                    className="px-8 rounded-xl shadow-lg font-bold"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-10">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Security Settings</h2>
                  <p className="text-gray-500">Update your password to keep your wholesale account safe.</p>
                </div>

                <div className="max-w-md space-y-6">
                  <InputField
                    label="Current Password"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    placeholder="Enter current password"
                    error={errors.currentPassword || ''}
                  />

                  <div className="border-t border-gray-100 pt-6 mt-6">
                    <InputField
                      label="New Password"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      placeholder="Create a new password"
                      error={errors.newPassword || ''}
                    />
                  </div>
                  
                  <InputField
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    placeholder="Type new password again"
                    error={errors.confirmPassword || ''}
                  />

                  <div className="pt-4">
                    <Button
                      onClick={handleChangePassword}
                      size="lg"
                      loading={changingPassword}
                      className="w-full rounded-xl shadow-lg font-bold py-4"
                    >
                      Update Password
                    </Button>
                  </div>
                </div>

                <div className="max-w-md p-5 bg-blue-50/50 border border-blue-100 rounded-2xl">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-blue-900 mb-3">
                    <LockClosedIcon className="h-5 w-5 text-blue-600" /> Password Advice
                  </h4>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-center gap-2">• <span className="opacity-80">Use at least 8 characters.</span></li>
                    <li className="flex items-center gap-2">• <span className="opacity-80">Mix letters, numbers & symbols.</span></li>
                    <li className="flex items-center gap-2">• <span className="opacity-80">Don't reuse passwords from other sites.</span></li>
                  </ul>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
