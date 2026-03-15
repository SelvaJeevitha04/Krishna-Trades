import React, { useState, useEffect } from 'react';
import { orderAPI, bulkOrderAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { EyeIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [bulkOrders, setBulkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'standard' | 'bulk'>('standard');

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'standard') {
        const response = await orderAPI.getAllOrders({ limit: 50 });
        if (response.data.success) {
          setOrders((response.data.data as any).orders || []);
        }
      } else {
        const response = await bulkOrderAPI.getAllBulkOrders({ limit: 50 });
        if (response.data.success) {
          setBulkOrders((response.data.data as any).requests || (response.data.data as any).items || []);
        }
      }
    } catch (err: any) {
      console.warn('Failed to fetch orders', err);
      // Don't show critical errors if backend bulk orders aren't fully implemented
      if (activeTab === 'standard') {
        setError('Failed to load standard orders');
      } else {
        setError('Failed to load bulk order requests or endpoint not available.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      if (activeTab === 'standard') {
        await orderAPI.updateOrderStatus(orderId, { status: newStatus });
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      } else {
        await bulkOrderAPI.updateBulkOrderStatus(orderId, { status: newStatus });
        setBulkOrders(bulkOrders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const statusColors: any = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    reviewed: 'bg-purple-100 text-purple-800', // for bulk
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-black text-gray-900 font-display tracking-tight">Order Management</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('standard')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-bold text-sm transition-colors ${
              activeTab === 'standard' 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Standard Orders
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-bold text-sm transition-colors ${
              activeTab === 'bulk' 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Bulk / Custom Requests
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 font-bold bg-red-50">{error}</div>
        ) : activeTab === 'standard' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer / Shop Name</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-indigo-600">#{order.orderNumber}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">{order.user?.name || 'Guest'}</div>
                      <div className="text-xs text-gray-500">{order.user?.email || ''}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{order.total?.toLocaleString() || 0}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      {updatingId === order._id ? (
                        <LoadingSpinner size="sm" />
                       ) : (
                         <select 
                           value={order.status}
                           onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                           className={`text-xs font-bold rounded-full px-3 py-1 border-0 focus:ring-2 focus:ring-primary-500 ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}
                         >
                           <option value="pending">Pending</option>
                           <option value="processing">Processing</option>
                           <option value="shipped">Shipped</option>
                           <option value="delivered">Delivered</option>
                           <option value="cancelled">Cancelled</option>
                         </select>
                       )}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <p className="font-medium">No standard orders found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Request #</th>
                  <th className="px-6 py-4">Customer / Shop Name</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {bulkOrders.map((request, i) => (
                  <tr key={request._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-primary-600">REQ-{request._id.substring(request._id.length - 6).toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">{request.user?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{request.phone || request.user?.phone || 'No Phone provided'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{request.requirements || request.notes || 'No notes'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">{new Date(request.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      {updatingId === request._id ? (
                        <LoadingSpinner size="sm" />
                       ) : (
                        <select 
                          value={request.status}
                          onChange={(e) => handleUpdateStatus(request._id, e.target.value)}
                          className={`text-xs font-bold rounded-full px-3 py-1 border-0 focus:ring-2 focus:ring-primary-500 ${statusColors[request.status] || 'bg-gray-100 text-gray-800'}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
                {bulkOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <p className="font-medium">No bulk order requests found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity backdrop-blur-sm" onClick={() => setSelectedOrder(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full animate-in zoom-in-95 duration-200">
              
              <div className="bg-gray-50/80 px-6 py-5 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
                <h3 className="text-xl font-black leading-6 text-gray-900 font-display" id="modal-title">
                  {selectedOrder.orderNumber ? `Order #${selectedOrder.orderNumber}` : `Request #${selectedOrder._id.substring(selectedOrder._id.length - 6).toUpperCase()}`}
                </h3>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-full shadow-sm hover:shadow focus:outline-none transition-all">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="px-6 py-6 h-[60vh] overflow-y-auto CustomScrollbar">
                {/* Shop / Customer Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Shop Information</h4>
                    <p className="font-black text-gray-900">{selectedOrder.user?.name || 'Guest User'}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.user?.email}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.phone || selectedOrder.user?.phone}</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">Delivery Details</h4>
                    {selectedOrder.shippingAddress ? (
                      <div className="text-sm text-gray-600">
                        <p>{selectedOrder.shippingAddress.street}</p>
                        <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 italic">No delivery address specified.</p>
                    )}
                  </div>
                </div>

                {/* Items / Details */}
                {selectedOrder.items ? (
                  <div className="bg-gray-50/50 rounded-xl border border-gray-100 overflow-hidden mb-6">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-100/50 font-bold text-gray-700">Order Items</div>
                    <ul className="divide-y divide-gray-100">
                      {selectedOrder.items.map((item: any, idx: number) => (
                        <li key={idx} className="px-4 py-3 flex justify-between items-center">
                          <div className="flex items-center">
                             {item.product?.images?.[0] ? (
                               <img src={item.product?.images[0]} alt="" className="w-10 h-10 object-cover rounded border border-gray-200 mr-3" />
                             ) : (
                               <div className="w-10 h-10 bg-gray-200 rounded border border-gray-300 mr-3 flex justify-center items-center text-xs text-gray-400">IMG</div>
                             )}
                             <div>
                               <p className="font-bold text-sm text-gray-900">{item.name || item.product?.name}</p>
                               <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                             </div>
                          </div>
                          <p className="font-bold text-gray-900">₹{item.total?.toLocaleString()}</p>
                        </li>
                      ))}
                    </ul>
                    <div className="px-4 py-3 bg-gray-100/30 flex justify-between items-center border-t border-gray-100">
                       <span className="font-bold text-gray-700">Total</span>
                       <span className="text-lg font-black text-gray-900">₹{selectedOrder.total?.toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50/50 rounded-xl border border-gray-100 p-4 mb-6">
                    <h4 className="font-bold text-sm text-gray-700 mb-2">Request Description</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedOrder.requirements || selectedOrder.notes}</p>
                  </div>
                )}
                
                {/* Notes */}
                {selectedOrder.notes && selectedOrder.items && (
                  <div className="mb-2">
                    <h4 className="font-bold text-sm text-gray-700 mb-1">Customer Notes</h4>
                    <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-100">"{selectedOrder.notes}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
