import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { 
  UsersIcon, 
  ShoppingBagIcon, 
  CurrencyRupeeIcon, 
  DocumentTextIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    fetchDashboardData(period);
  }, [period]);

  const fetchDashboardData = async (currentPeriod: string) => {
    setLoading(true);
    try {
      const response = await adminAPI.getDashboardAnalytics({ period: currentPeriod });
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 font-bold p-4 bg-red-50 rounded-xl">{error}</div>;
  if (!data) return null;

  const { overview, orderStatusBreakdown, recentOrders } = data;

  const stats = [
    { name: 'Total Revenue', value: `₹${overview.totalRevenue.toLocaleString()}`, icon: CurrencyRupeeIcon, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Total Orders', value: overview.totalOrders, icon: DocumentTextIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Active Users', value: overview.totalUsers, icon: UsersIcon, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: 'Total Products', value: overview.totalProducts, icon: ShoppingBagIcon, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Low Stock Alerts', value: overview.lowStockProducts, icon: ExclamationTriangleIcon, color: 'text-amber-600', bg: 'bg-amber-100' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900 font-display tracking-tight">Overview</h1>
        <select 
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 shadow-sm font-medium">
          <option value="30">Last 30 days</option>
          <option value="7">Last 7 days</option>
          <option value="365">This Year</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-bold text-gray-500 mb-1">{stat.name}</p>
              <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" strokeWidth={2} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 font-display">Order Status Breakdown</h2>
          <div className="space-y-4">
            {orderStatusBreakdown?.map((status: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 capitalize">{status._id}</span>
                <span className="text-sm font-black text-gray-900 bg-gray-100 px-3 py-1 rounded-full">{status.count}</span>
              </div>
            ))}
            {(!orderStatusBreakdown || orderStatusBreakdown.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">No recent orders found.</p>
            )}
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 font-display">Recent Operations</h2>
            <button className="text-sm font-bold text-primary-600 hover:text-primary-700">View All</button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders?.map((order: any) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 text-sm font-bold text-indigo-600">#{order.orderNumber}</td>
                    <td className="py-3 text-sm font-medium text-gray-900">{order.user?.name || 'Guest'}</td>
                    <td className="py-3 text-sm font-bold text-gray-900">₹{order.total.toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize
                        ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-500 font-medium text-right">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!recentOrders || recentOrders.length === 0) && (
              <div className="text-center py-10">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No recent orders to display.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
