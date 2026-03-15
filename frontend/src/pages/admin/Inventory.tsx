import React, { useState, useEffect } from 'react';
import { adminAPI, productAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ExclamationTriangleIcon, PlusIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const AdminInventory: React.FC = () => {
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState('Manual adjustment');
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [lowStockRes, logsRes] = await Promise.all([
        productAPI.getLowStockProducts(),
        adminAPI.getInventoryLogs({ limit: 50 })
      ]);
      
      if (lowStockRes.data.success) {
        setLowStockProducts(lowStockRes.data.data.products || []);
      }
      
      if (logsRes.data.success) {
        setLogs((logsRes.data.data as any).logs || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch inventory', err);
      setError('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdjustModal = (product: any) => {
    setAdjustingProduct(product);
    setQuantity(0);
    setReason('Restock');
    setIsModalOpen(true);
  };

  const handleAdjustInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct || quantity === 0) return;
    
    setAdjusting(true);
    try {
      await adminAPI.adjustInventory({
        productId: adjustingProduct._id,
        quantity,
        reason
      });
      setIsModalOpen(false);
      fetchData(); // Refresh both products and logs
    } catch (err) {
      alert('Failed to adjust inventory');
    } finally {
      setAdjusting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-8 text-center text-red-500 font-bold bg-red-50 rounded-xl">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-black text-gray-900 font-display tracking-tight">Inventory Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden lg:col-span-1">
          <div className="bg-red-50 px-6 py-4 flex items-center justify-between border-b border-red-100">
            <h2 className="text-lg font-bold text-red-900 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              Low Stock Alerts
            </h2>
            <span className="bg-red-200 text-red-800 text-xs font-bold px-2 py-1 rounded-full">{lowStockProducts.length}</span>
          </div>
          
          <div className="p-0 overflow-y-auto max-h-[500px] CustomScrollbar">
            {lowStockProducts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <CheckCircleIcon className="w-12 h-12 text-green-400 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" />
                <p className="font-medium">All products are adequately stocked.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {lowStockProducts.map(product => (
                  <li key={product._id} className="p-4 hover:bg-gray-50 flex items-center justify-between transition-colors">
                    <div>
                      <p className="font-bold text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                          {product.stock} {product.unit} left
                        </span>
                        <span className="text-xs text-gray-400">Min: {product.minStock}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleOpenAdjustModal(product)}
                      className="p-2 bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-lg transition-colors focus:ring-2 focus:ring-primary-500"
                      title="Quick Restock"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Inventory Audit Logs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2 flex flex-col">
          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
          </div>
          
          <div className="overflow-x-auto flex-1 h-[500px]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Quantity Change</th>
                  <th className="px-6 py-4">Reason / Notes</th>
                  <th className="px-6 py-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">{log.product?.name || 'Unknown Product'}</div>
                      <div className="text-xs text-gray-500">{log.product?.sku || ''}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase
                        ${log.type === 'sale' ? 'bg-blue-50 text-blue-700' :
                          log.type === 'purchase' ? 'bg-emerald-50 text-emerald-700' :
                          'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {log.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-bold">
                        {log.quantity > 0 && log.type !== 'sale' ? (
                          <span className="text-emerald-600 flex items-center">
                            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" /> +{log.quantity}
                          </span>
                        ) : (
                          <span className="text-red-600 flex items-center">
                            <ArrowTrendingDownIcon className="w-4 h-4 mr-1" /> -{Math.abs(log.quantity)}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">{log.previousStock} &rarr; {log.newStock}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate" title={log.reason}>
                      {log.reason || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium text-right whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <p className="font-medium">No inventory activity recorded yet.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Adjust Modal */}
      {isModalOpen && adjustingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto w-full h-full flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 animate-in fade-in zoom-in-95 overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-lg text-gray-900">Adjust Inventory</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                  <XMarkIcon className="w-6 h-6" />
                </button>
             </div>
             <form onSubmit={handleAdjustInventory} className="p-6">
                <div className="mb-4">
                  <p className="text-sm font-bold text-gray-900 mb-1">{adjustingProduct.name}</p>
                  <p className="text-xs text-gray-500">Current Stock: <strong className="text-gray-900">{adjustingProduct.stock} {adjustingProduct.unit}</strong></p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Quantity Adjustment</label>
                    <div className="relative rounded-xl border border-gray-200 overflow-hidden flex">
                      <button type="button" onClick={() => setQuantity(q => q - 1)} className="px-4 py-3 bg-gray-50 hover:bg-gray-100 border-r border-gray-200 text-gray-600 font-bold">-</button>
                      <input 
                        type="number" 
                        value={quantity} 
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="flex-1 text-center font-bold text-lg focus:outline-none focus:ring-inset focus:ring-2 focus:ring-primary-500"
                        required
                      />
                      <button type="button" onClick={() => setQuantity(q => q + 1)} className="px-4 py-3 bg-gray-50 hover:bg-gray-100 border-l border-gray-200 text-gray-600 font-bold">+</button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Use a negative number to reduce stock.</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Reason</label>
                    <input 
                      type="text" 
                      value={reason} 
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                      placeholder="e.g. Restock, Missing items, Damaged..."
                    />
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={adjusting} className="flex-1 px-4 py-3 rounded-xl font-bold bg-primary-600 text-white hover:bg-primary-700 transition-colors flex justify-center items-center disabled:opacity-50">
                    {adjusting ? <LoadingSpinner size="sm" /> : 'Confirm'}
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
