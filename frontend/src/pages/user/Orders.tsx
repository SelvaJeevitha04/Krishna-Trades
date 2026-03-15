import React, { useState, useEffect } from 'react';
import { TruckIcon, CheckBadgeIcon, CubeIcon, ExclamationTriangleIcon, ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import { orderAPI } from '../../services/api';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { BulkOrderForm } from '../../components/bulkOrder/BulkOrderForm';
import { BulkOrderTable } from '../../components/bulkOrder/BulkOrderTable';

interface OrderProduct {
  _id: string;
  name: string;
  images?: string[];
}

interface OrderItem {
  product: OrderProduct;
  quantity: number;
  price: number;
  total: number;
  name?: string; // fallback
}

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  trackingNumber?: string;
}

const Orders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'standard' | 'bulk'>('standard');
  const [showNewBulkForm, setShowNewBulkForm] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getUserOrders();
      const responseData = response.data.data as any;
      if (response.data.success && (responseData.orders || responseData.items)) {
        setOrders(responseData.orders || responseData.items);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedOrder(null);
  };

  // Modern Minimalistic Progress Bar
  const OrderProgress = ({ status }: { status: Order['status'] }) => {
    if (status === 'cancelled') {
      return (
        <div className="flex items-center gap-3 bg-red-50 p-4 rounded-2xl border border-red-100">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h4 className="text-red-700 font-bold">Order Cancelled</h4>
            <p className="text-sm text-red-600 font-medium tracking-wide">This order will not be fulfilled.</p>
          </div>
        </div>
      );
    }

    const steps = [
      { id: 'placed', label: 'Placed', icon: CubeIcon, done: true },
      { id: 'processing', label: 'Processing', icon: CubeIcon, done: ['processing', 'shipped', 'delivered'].includes(status) },
      { id: 'shipped', label: 'Shipped', icon: TruckIcon, done: ['shipped', 'delivered'].includes(status) },
      { id: 'delivered', label: 'Delivered', icon: CheckBadgeIcon, done: status === 'delivered' }
    ];

    return (
      <div className="relative pt-2">
        <div className="flex flex-col sm:flex-row justify-between relative gap-6 sm:gap-0 z-10">
          <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full z-[-1] hidden sm:block px-8"></div>
          {steps.map((step, idx) => (
            <div key={step.id} className="flex flex-row sm:flex-col items-center sm:w-1/4 gap-4 sm:gap-3">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 border-[3px] bg-white
                ${step.done ? 'border-primary-600 text-primary-600 shadow-md shadow-primary-500/20' : 'border-gray-200 text-gray-300'}
              `}>
                <step.icon className="w-5 h-5" />
              </div>
              <div className="sm:text-center">
                <p className={`text-sm font-bold tracking-wide ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
              </div>
              
              {/* Mobile connecting line */}
              {idx < steps.length - 1 && (
                <div className={`sm:hidden absolute left-5 w-0.5 h-10 -z-10 bg-gray-100`} style={{ top: `${(idx * 64) + 40}px` }}></div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="pb-12 max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col justify-between items-start gap-2 animate-in fade-in slide-in-from-top-4">
        <h1 className="text-3xl font-black text-gray-900 font-display tracking-tight">Order History</h1>
        <p className="text-gray-500 font-medium tracking-wide">Manage and track your wholesale purchases and custom requests.</p>
      </div>

      <div className="mb-8 flex gap-6 border-b border-gray-200">
        <button 
          onClick={() => { setActiveTab('standard'); setShowNewBulkForm(false); }} 
          className={`pb-4 px-2 font-bold text-lg transition-colors ${activeTab === 'standard' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-900'}`}
        >
          Standard Orders
        </button>
        <button 
          onClick={() => setActiveTab('bulk')} 
          className={`pb-4 px-2 font-bold text-lg transition-colors ${activeTab === 'bulk' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-900'}`}
        >
          Bulk / Custom Requests
        </button>
      </div>

      {activeTab === 'bulk' && !showNewBulkForm && (
        <div className="mb-6 flex justify-end animate-in fade-in">
          <Button onClick={() => setShowNewBulkForm(true)} className="flex items-center gap-2">
            <PlusIcon className="w-5 h-5" />
            New Bulk Request
          </Button>
        </div>
      )}

      {activeTab === 'bulk' && showNewBulkForm && (
        <div className="mb-6 animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => setShowNewBulkForm(false)} className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-sm border border-gray-100">
               <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-xl font-bold text-gray-900">Create New Request</h2>
          </div>
          <BulkOrderForm />
        </div>
      )}

      {activeTab === 'bulk' && !showNewBulkForm && (
        <div className="animate-in fade-in">
          <BulkOrderTable />
        </div>
      )}

      {activeTab === 'standard' && (
      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white/60 backdrop-blur-xl rounded-[2rem] border border-gray-100 shadow-sm animate-in zoom-in-95">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-white border border-gray-100">
              <CubeIcon className="h-10 w-10 text-gray-300" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">No orders found</h2>
            <p className="text-gray-500 font-medium mb-8">You haven't placed any orders with Krishna Trades yet.</p>
            <Button onClick={() => window.location.href = '/products'} size="lg" className="rounded-xl shadow-xl hover:shadow-primary-500/30 font-bold px-8">
              Explore Products
            </Button>
          </div>
        ) : (
          orders.map((order, index) => (
            <div key={order._id} className="bg-white/80 backdrop-blur-md rounded-[2rem] shadow-sm border border-gray-100/50 overflow-hidden hover:shadow-lg hover:border-white transition-all duration-300 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 100}ms` }}>
              
              <div className="bg-gray-50/50 px-6 sm:px-8 py-5 border-b border-gray-100/50 flex flex-wrap items-center justify-between gap-6">
                <div className="flex flex-wrap gap-8">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 shadow-sm">Placed On</p>
                    <p className="text-sm font-bold text-gray-900">{new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 shadow-sm">Total</p>
                    <p className="text-sm font-bold text-gray-900">₹{order.total?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 shadow-sm">Order #</p>
                    <p className="text-sm font-mono font-bold text-gray-600">{order.orderNumber}</p>
                  </div>
                </div>
                
                <button onClick={() => handleViewDetails(order)} className="px-5 py-2.5 bg-white border border-gray-200 text-sm font-bold text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                  View Details
                </button>
              </div>

              <div className="p-6 sm:px-8">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                  
                  {/* Items Preview */}
                  <div className="flex-1 space-y-4 w-full">
                    {order.items.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-center group cursor-default">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shrink-0 border border-gray-100 shadow-sm group-hover:scale-105 transition-transform">
                          {item.product?.images?.[0] ? (
                            <img src={item.product.images[0]} alt="" className="w-full h-full object-contain p-2" />
                          ) : (
                             <span className="text-gray-300 font-black text-xl tracking-tighter">KT</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{item.product?.name || item.name || 'Unknown Product'}</p>
                          <p className="text-xs font-semibold text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-xs font-bold text-primary-600 tracking-wide mt-2 pl-2">
                        + {order.items.length - 2} more items in this order
                      </p>
                    )}
                  </div>

                  {/* Tracker Summary */}
                  <div className="w-full lg:w-[450px] shrink-0">
                    <OrderProgress status={order.status} />
                  </div>

                </div>
              </div>
            </div>
          ))
        )}
      </div>
      )}

      {/* Modern Overlay Details Modal */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 border-l border-white/20">
            
            <div className="sticky top-0 bg-white/80 backdrop-blur-xl z-20 px-6 py-5 border-b border-gray-100 flex items-center gap-4">
              <button onClick={handleCloseDetails} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 group">
                <ArrowLeftIcon className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                <h3 className="text-lg font-black text-gray-900">Order Details</h3>
                <p className="text-xs font-mono font-bold text-gray-500">{selectedOrder.orderNumber}</p>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Status Section */}
              <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 shadow-inner">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Delivery Progress</h4>
                <OrderProgress status={selectedOrder.status} />
                {selectedOrder.trackingNumber && (
                  <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-600">Tracking ID</span>
                    <span className="text-sm font-mono font-bold text-gray-900 bg-white px-3 py-1.5 border border-gray-200 rounded-lg">{selectedOrder.trackingNumber}</span>
                  </div>
                )}
              </div>

              {/* Items Section */}
              <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">Items Ordered ({selectedOrder.items.length})</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors bg-white">
                      <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 mix-blend-multiply">
                        {item.product?.images?.[0] ? (
                          <img src={item.product.images[0]} alt="" className="w-full h-full object-contain p-2" />
                        ) : (
                           <span className="text-gray-300 font-bold text-sm">No Img</span>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <p className="text-sm font-bold text-gray-900 pb-1">{item.product?.name || item.name || 'Product'}</p>
                        <div className="flex justify-between items-center mt-auto">
                          <p className="text-xs font-bold text-gray-500">₹{item.price?.toFixed(2)} x {item.quantity}</p>
                          <p className="text-sm font-black text-primary-600">₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-primary-50/50 rounded-3xl p-6 border border-primary-100/50">
                <h4 className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-4">Payment Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-gray-600">Method</span>
                    <span className="font-bold text-gray-900">{selectedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-gray-600">Subtotal</span>
                    <span className="font-bold text-gray-900">₹{(selectedOrder.total / 1.1).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-gray-600">Tax</span>
                    <span className="font-bold text-gray-900">₹{((selectedOrder.total / 1.1) * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-primary-200/50 flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-black text-primary-700">₹{(selectedOrder.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
