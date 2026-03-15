import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  ShoppingCartIcon, 
  DocumentTextIcon, 
  UserIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  InformationCircleIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { ShoppingCartIcon as ShoppingCartSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { userAPI } from '../services/api';

const UserLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    setNotificationsOpen(false);
    setSidebarOpen(false);
  }, [location.pathname]);

  const fetchNotifications = async () => {
    try {
      const response = await userAPI.getNotifications();
      if (response.data.success) {
        // @ts-ignore
        const notifs = response.data.data.items || response.data.data.notifications || [];
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n: any) => !n.isRead).length);
      }
    } catch (error) {
      // silently ignore
    }
  };

  const markAllAsRead = async () => {
    try {
      await userAPI.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      // silently ignore
    }
  };

  const navigation = [
    { name: 'Home', href: '/dashboard', icon: HomeIcon },
    { name: 'Products', href: '/products', icon: ShoppingBagIcon },
    { name: 'Cart', href: '/cart', icon: ShoppingCartIcon, badge: itemCount },
    { name: 'Orders', href: '/orders', icon: DocumentTextIcon },
    { name: 'About Us', href: '/about', icon: InformationCircleIcon },
  ];

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const userInitial = user?.shopName?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'U';
  const displayName = user?.shopName || user?.name?.split(' ')[0] || 'User';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ── Top Navigation Bar ───────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-primary-500/30">
                K
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-700 to-indigo-600 font-display tracking-tight">
                  Krishna Trades
                </span>
                <span className="block text-[10px] text-gray-400 font-semibold tracking-widest uppercase -mt-0.5">Wholesale Portal</span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`relative inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'text-primary-700 bg-primary-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                    }`}
                  >
                    <item.icon className={`h-4.5 w-4.5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} style={{width:'18px',height:'18px'}} />
                    {item.name}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-2 ring-white shadow-sm">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {/* Cart Icon (mobile visible) */}
              <Link
                to="/cart"
                className="md:hidden relative p-2 rounded-xl text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"
              >
                <ShoppingCartSolid className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-1 ring-white">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 rounded-xl text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  <BellIcon className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl shadow-gray-200/60 border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                        {unreadCount > 0 && <p className="text-xs text-gray-400">{unreadCount} unread</p>}
                      </div>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-xs text-primary-600 font-bold hover:text-primary-700 px-3 py-1 rounded-lg hover:bg-primary-50 transition-colors">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <BellIcon className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                          <p className="text-gray-400 text-sm font-medium">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notif: any, i: number) => (
                          <div key={i} className={`p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${!notif.isRead ? 'border-l-2 border-l-primary-400 bg-primary-50/30' : ''}`}>
                            <p className="text-sm font-bold text-gray-900 mb-0.5">{notif.title}</p>
                            <p className="text-xs text-gray-500 line-clamp-2">{notif.message}</p>
                            <span className="text-[10px] text-gray-400 mt-2 block">{new Date(notif.createdAt).toLocaleDateString()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User profile */}
              <Link
                to="/profile"
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200 group"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm shadow-violet-500/30 ring-2 ring-white">
                  <span className="text-white text-sm font-black">{userInitial}</span>
                </div>
                <span className="text-sm font-bold text-gray-700 hidden sm:block group-hover:text-gray-900 transition-colors">
                  {displayName}
                </span>
              </Link>

              {/* Logout (desktop) */}
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                title="Sign out"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>

              {/* Mobile menu */}
              <button
                className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 focus:outline-none"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {sidebarOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-xl animate-in slide-in-from-top-1 duration-200">
            <div className="px-3 py-4 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                    {item.name}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-black rounded-full bg-red-500 text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors mt-2 border-t border-gray-100 pt-4"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ── Main Content ─────────────────────────────────────── */}
      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="bg-white border-t border-gray-100 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-indigo-600 flex items-center justify-center text-white font-black text-base shadow">
                K
              </div>
              <div>
                <span className="font-black text-gray-900 text-sm font-display">Krishna Trades</span>
                <p className="text-xs text-gray-400">B2B Wholesale Platform</p>
              </div>
            </div>

            {/* Contact */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-gray-500 text-center">
              <span>📞 <a href="tel:8056588833" className="hover:text-primary-600 font-semibold transition-colors">8056588833</a></span>
              <span>✉️ <a href="mailto:karthi0986@gmail.com" className="hover:text-primary-600 font-semibold transition-colors">karthi0986@gmail.com</a></span>
              <span>📍 92/5, PalaniyappaColony, Annadhanapatty, Salem-636006</span>
            </div>

            <p className="text-xs text-gray-400">© 2024 Krishna Trades</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserLayout;
