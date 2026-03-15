import React, { useState, useEffect } from 'react';
import { adminAPI, orderAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { UserIcon, MapPinIcon, PhoneIcon, XMarkIcon, DocumentTextIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal State
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await adminAPI.getAllUsers({ limit: 100, role: 'user' });
      if (res.data.success) {
        setUsers((res.data.data as any).users || []);
      }
    } catch (err: any) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean, userName: string) => {
    if (window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} the account for ${userName}?`)) {
      try {
        await adminAPI.updateUserStatus(userId, { isActive: !currentStatus });
        setUsers(users.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
      } catch (err) {
        console.error('Failed to update status', err);
        alert('Failed to update status. Note: You cannot deactivate yourself.');
      }
    }
  };

  const handleOpenUser = async (user: any) => {
    setSelectedUser(user);
    setOrdersLoading(true);
    setUserOrders([]);
    try {
      const res = await orderAPI.getAllOrders({ user: user._id, limit: 50 });
      if (res.data.success) {
        setUserOrders((res.data.data as any).orders || []);
      }
    } catch (err) {
      console.error('Failed to load user orders', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-black text-gray-900 font-display tracking-tight">Registered Shops / Users</h1>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 font-bold rounded-xl">{error}</div>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Shop / User Name</th>
                <th className="px-6 py-4">Contact Detail</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center cursor-pointer group" onClick={() => handleOpenUser(user)}>
                      <div className="h-10 w-10 flex-shrink-0 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{user.name}</div>
                        <div className="text-xs text-gray-500 font-medium mt-0.5">Joined {new Date(user.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 flex items-center"><EnvelopeIcon className="w-4 h-4 mr-1.5 text-gray-400" /> {user.email}</div>
                    {user.phone && <div className="text-xs text-gray-500 font-medium mt-1 flex items-center"><PhoneIcon className="w-4 h-4 mr-1.5 text-gray-400" /> {user.phone}</div>}
                  </td>
                  <td className="px-6 py-4">
                    {user.address ? (
                      <div className="text-sm text-gray-600 max-w-xs truncate flex items-center" title={`${user.address.street}, ${user.address.city}`}>
                        <MapPinIcon className="w-4 h-4 mr-1 text-gray-400 flex-shrink-0" />
                        {user.address.city || user.address.street || 'Address saved'}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">No address provided</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleOpenUser(user)} 
                      className="text-indigo-600 hover:text-indigo-900 mr-4 font-bold transition-colors"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(user._id, user.isActive, user.name)} 
                      className={`${user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} font-bold transition-colors`}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <UserIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="font-medium">No users found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details & Order History Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity backdrop-blur-sm" onClick={() => setSelectedUser(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full animate-in zoom-in-95 duration-200">
              
              <div className="bg-gray-50/80 px-6 py-5 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center">
                  <div className="h-12 w-12 flex-shrink-0 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-black text-xl shadow-inner border border-indigo-200">
                    {selectedUser.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-black leading-6 text-gray-900 font-display" id="modal-title">
                      {selectedUser.name}
                    </h3>
                    <p className="text-sm font-medium text-gray-500 mt-0.5">{selectedUser.email}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-full shadow-sm hover:shadow focus:outline-none transition-all">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="px-6 py-6 h-[70vh] overflow-y-auto CustomScrollbar">
                
                {/* User Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-3">Contact Information</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p className="flex items-center font-medium"><EnvelopeIcon className="w-5 h-5 mr-2 text-blue-400" /> {selectedUser.email}</p>
                      <p className="flex items-center font-medium"><PhoneIcon className="w-5 h-5 mr-2 text-blue-400" /> {selectedUser.phone || 'No phone provided'}</p>
                    </div>
                  </div>
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3">Shop Address</h4>
                    <div className="text-sm text-gray-700 font-medium">
                      {selectedUser.address ? (
                        <div className="flex items-start">
                           <MapPinIcon className="w-5 h-5 mr-2 text-emerald-400 flex-shrink-0 mt-0.5" />
                           <div>
                             <p>{selectedUser.address.street}</p>
                             <p>{selectedUser.address.city}, {selectedUser.address.state} {selectedUser.address.zipCode}</p>
                             <p>{selectedUser.address.country}</p>
                           </div>
                        </div>
                      ) : (
                        <p className="italic text-gray-500 flex items-center"><MapPinIcon className="w-5 h-5 mr-2 text-gray-400" /> Address not configured yet</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order History */}
                <div>
                  <h4 className="text-lg font-black text-gray-900 mb-4 font-display border-b border-gray-100 pb-2">Order History</h4>
                  
                  {ordersLoading ? (
                    <div className="py-12"><LoadingSpinner /></div>
                  ) : userOrders.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium tracking-tight">This user hasn't placed any orders yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userOrders.map((order) => (
                        <div key={order._id} className="bg-white border text-left border-gray-200/70 rounded-xl p-4 shadow-sm hover:border-indigo-300 transition-colors">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                               <div className="flex items-center gap-3 mb-1">
                                 <h5 className="font-bold text-gray-900 border-b border-gray-900">Order #{order.orderNumber}</h5>
                                 <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest
                                  ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                                    order.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
                                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                                    'bg-yellow-100 text-yellow-800'}`}>
                                  {order.status}
                                </span>
                               </div>
                               <span className="text-xs text-gray-500 font-medium">{new Date(order.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="text-right">
                              <span className="block text-lg font-black text-gray-900">₹{order.total.toLocaleString()}</span>
                              <span className="text-xs font-bold text-gray-500">{order.items.length} items</span>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50/50 rounded-lg p-3">
                            <ul className="space-y-2">
                              {order.items.map((item: any, idx: number) => (
                                <li key={idx} className="flex justify-between text-sm">
                                  <span className="text-gray-700 font-medium"> <span className="text-gray-400 font-normal mr-1">{item.quantity}x</span> {item.name || item.product?.name || 'Unknown Product'}</span>
                                  <span className="font-bold text-gray-900">₹{item.total.toLocaleString()}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
