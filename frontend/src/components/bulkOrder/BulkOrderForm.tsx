import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { bulkOrderAPI } from '../../services/api';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const BRANDS = ['Sakthi Masala', 'Cadbury', 'Dabur', 'Milky Mist', 'Complan', 'Other'];

interface ProductRequest {
  name: string;
  brand: string;
  quantity: number | '';
}

export const BulkOrderForm: React.FC = () => {
  const { user } = useAuth();
  
  const [products, setProducts] = useState<ProductRequest[]>([
    { name: '', brand: 'Sakthi Masala', quantity: '' }
  ]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAddProduct = () => {
    setProducts([...products, { name: '', brand: 'Sakthi Masala', quantity: '' }]);
  };

  const handleRemoveProduct = (index: number) => {
    if (products.length > 1) {
      setProducts(products.filter((_, i) => i !== index));
    }
  };

  const handleProductChange = (index: number, field: keyof ProductRequest, value: any) => {
    const newProducts = [...products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setProducts(newProducts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const invalidProducts = products.some(p => !p.name.trim() || !p.brand || !p.quantity || p.quantity <= 0);
    if (invalidProducts) {
      toast.error('Please fill out all product details with valid quantities.');
      return;
    }
    
    if (!deliveryDate) {
      toast.error('Please select a preferred delivery date.');
      return;
    }

    try {
      setIsSubmitting(true);
      await bulkOrderAPI.createBulkOrder({
        shopName: user?.shopName || 'My Shop',
        ownerName: user?.name || 'Shop Owner',
        phone: user?.phone || 'Not Provided',
        address: typeof user?.address === 'string' 
          ? user.address 
          : user?.address 
            ? `${(user.address as any).street || ''}, ${(user.address as any).city || ''}` 
            : 'Address not set',
        products: products.map(p => ({
          ...p,
          quantity: Number(p.quantity)
        })),
        deliveryDate,
        additionalNotes
      });
      
      setSuccess(true);
      toast.success('Bulk order request submitted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center animate-fade-in-up">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted Successfully!</h2>
        <p className="text-gray-600 mb-6">
          Your bulk order request has been submitted successfully. Our team will contact you soon to confirm availability and pricing.
        </p>
        <button 
          onClick={() => {
            setSuccess(false);
            setProducts([{ name: '', brand: 'Sakthi Masala', quantity: '' }]);
            setDeliveryDate('');
            setAdditionalNotes('');
          }}
          className="btn btn-primary"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gray-50/50 p-6 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">Request Details</h3>
        <p className="text-sm text-gray-500">Shop details are auto-filled from your profile.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* Auto-filled Shop Details (Read-only UI representation) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Shop Name</label>
              <div className="text-gray-900 font-medium">{user?.shopName || 'Not Set'}</div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Owner Name</label>
              <div className="text-gray-900 font-medium">{user?.name || 'Not Set'}</div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone Number</label>
              <div className="text-gray-900 font-medium">{user?.phone || 'Not Set'}</div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Delivery Address</label>
              <div className="text-gray-900 font-medium truncate">
                {typeof user?.address === 'string' 
                  ? user.address 
                  : user?.address 
                    ? `${user.address.street || ''}, ${user.address.city || ''}, ${user.address.state || ''} ${user.address.zipCode || ''}`
                    : 'Not Set'}
              </div>
            </div>
        </div>

        {/* Dynamic Product Rows */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-bold text-gray-900">Requested Products</h4>
          </div>
          
          <div className="space-y-4">
            {products.map((product, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 bg-white border border-gray-200 rounded-xl hover:border-primary-300 transition-colors">
                <div className="flex-1 w-full relative">
                  <label className="block text-xs font-medium text-gray-500 mb-1 sm:hidden">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Product Name (e.g. Masala 50g)"
                    value={product.name}
                    onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  />
                </div>
                
                <div className="w-full sm:w-48">
                  <label className="block text-xs font-medium text-gray-500 mb-1 sm:hidden">Brand</label>
                  <select
                    required
                    value={product.brand}
                    onChange={(e) => handleProductChange(index, 'brand', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  >
                    {BRANDS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                
                <div className="w-full sm:w-32">
                  <label className="block text-xs font-medium text-gray-500 mb-1 sm:hidden">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="Qty"
                    value={product.quantity}
                    onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  />
                </div>
                
                {products.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveProduct(index)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-6 sm:mt-0"
                    title="Remove Product"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddProduct}
            className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Another Product
          </button>
        </div>

        {/* Additional Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Delivery Date *</label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]} // Disable past dates
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            />
          </div>
          
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Requirements / Notes</label>
            <textarea
              rows={3}
              placeholder="Any specific packaging requirements, variations, or instructions?"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-lg min-w-[200px]"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};
