import React, { useState, useEffect } from 'react';
import { productAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { PlusIcon, PencilSquareIcon, TrashIcon, XMarkIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',

    brand: '',
    price: 0,
    stock: 0,
    minOrderQuantity: 5,
    minStock: 10,
    unit: 'pieces',
    image: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const prodRes = await productAPI.getProducts({ limit: 100 }); // Get all for simplicity in this demo
      if (prodRes.data.success) {
        setProducts((prodRes.data.data as any).products || []);
      }
    } catch (err: any) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product: any = null) => {
    setError('');
    if (product) {
      setIsEditMode(true);
      setCurrentId(product._id);
      setFormData({
        name: product.name,
        description: product.description,
        sku: product.sku,

        brand: product.brand || '',
        price: product.price,
        stock: product.stock,
        minOrderQuantity: product.minOrderQuantity || 5,
        minStock: product.minStock || 10,
        unit: product.unit || 'pieces',
        image: product.images && product.images.length > 0 ? product.images[0] : ''
      });
    } else {
      setIsEditMode(false);
      setCurrentId(null);
      setFormData({
        name: '', description: '', sku: '',
        brand: '', price: 0, stock: 0, minOrderQuantity: 5, minStock: 10, unit: 'pieces', image: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await productAPI.deleteProduct(id);
        setProducts(products.filter(p => p._id !== id));
      } catch (err) {
        console.error('Failed to delete product', err);
        alert('Failed to delete product');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        ...formData,
        images: formData.image ? [formData.image] : []
      };
      if (isEditMode && currentId) {
        await productAPI.updateProduct(currentId, payload);
      } else {
        await productAPI.createProduct(payload);
      }
      setIsModalOpen(false);
      fetchData(); // Refresh list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-black text-gray-900 font-display tracking-tight">Product Management</h1>
        <button 
          onClick={() => handleOpenModal()} 
          className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-sm transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">SKU</th>

                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                        {product.images && product.images.length > 0 ? (
                          <img src={product.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                        ) : (
                          <ShoppingBagIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900">{product.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">{product.sku}</td>

                  <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{product.price.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      product.stock > product.minStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock} {product.unit}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleOpenModal(product)} 
                      className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors"
                      title="Edit"
                    >
                      <PencilSquareIcon className="h-5 w-5 inline" />
                    </button>
                    <button 
                      onClick={() => handleDelete(product._id, product.name)} 
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="h-5 w-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="font-medium">No products found. Add one to get started.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full animate-in zoom-in-95 duration-200">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold leading-6 text-gray-900 font-display" id="modal-title">
                  {isEditMode ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500 focus:outline-none">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="px-6 py-4">
                {error && <div className="mb-4 p-3 bg-red-50 text-red-700 font-medium text-sm rounded-xl">{error}</div>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-96 overflow-y-auto CustomScrollbar pr-2">
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Product Name *</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border-gray-200 border focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">SKU *</label>
                    <input type="text" required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full px-4 py-3 rounded-xl border-gray-200 border focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none" placeholder="e.g. MILK-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Price (₹) *</label>
                    <input type="number" min="0" required value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl border-gray-200 border focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Brand *</label>
                    <input type="text" required value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full px-4 py-3 rounded-xl border-gray-200 border focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none" placeholder="e.g. Sakthi Masala" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Unit *</label>
                    <select required value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full px-4 py-3 rounded-xl border-gray-200 border focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none">
                      <option value="pieces">Pieces (pcs)</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="liters">Liters (ltr)</option>
                      <option value="boxes">Boxes</option>
                      <option value="dozen">Dozen</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Initial Stock *</label>
                    <input type="number" min="0" required value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl border-gray-200 border focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Min Stock Alert *</label>
                    <input type="number" min="0" required value={formData.minStock} onChange={e => setFormData({...formData, minStock: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl border-gray-200 border focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Min Order Quantity *</label>
                    <input type="number" min="1" required value={formData.minOrderQuantity} onChange={e => setFormData({...formData, minOrderQuantity: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl border-gray-200 border focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none" />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Image URL</label>
                    <input type="url" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full px-4 py-3 rounded-xl border-gray-200 border focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none" placeholder="https://example.com/image.png" />
                  </div>
                  <div className="col-span-1 sm:col-span-2 mb-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border-gray-200 border focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none" rows={3}></textarea>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex sm:flex-row-reverse">
                  <button type="submit" disabled={submitting} className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-6 py-3 bg-primary-600 text-base font-bold text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors disabled:opacity-50">
                    {submitting ? <LoadingSpinner size="sm" /> : (isEditMode ? 'Update Product' : 'Save Product')}
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-bold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
