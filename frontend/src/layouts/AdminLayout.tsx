import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ChartBarIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  UsersIcon,
  CubeIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import {
  ChartBarIcon as ChartBarSolid,
  ShoppingBagIcon as ShoppingBagSolid,
  DocumentTextIcon as DocumentTextSolid,
  UsersIcon as UsersSolid,
  CubeIcon as CubeSolid,
} from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    setNotificationsOpen(false);
    setProfileOpen(false);
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
    { name: 'Dashboard',  href: '/admin/dashboard',  icon: ChartBarIcon,      solidIcon: ChartBarSolid },
    { name: 'Products',   href: '/admin/products',   icon: ShoppingBagIcon,   solidIcon: ShoppingBagSolid },
    { name: 'Orders',     href: '/admin/orders',     icon: DocumentTextIcon,  solidIcon: DocumentTextSolid },
    { name: 'Users',      href: '/admin/users',      icon: UsersIcon,         solidIcon: UsersSolid },
    { name: 'Inventory',  href: '/admin/inventory',  icon: CubeIcon,          solidIcon: CubeSolid },
  ];

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const currentPage = navigation.find(item => location.pathname.startsWith(item.href))?.name || 'Admin Console';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 h-16 px-6 border-b border-white/10 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-amber-500/40 flex-shrink-0">
          K
        </div>
        <div>
          <p className="text-white font-black text-sm font-display leading-none">Krishna Trades</p>
          <p className="text-white/40 text-[10px] font-semibold tracking-widest uppercase mt-0.5">Admin Console</p>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest px-3 mb-3">Navigation</p>
        {navigation.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          const IconActive = item.solidIcon;
          const IconInactive = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-white/60 hover:bg-white/8 hover:text-white/90'
              }`}
            >
              {isActive ? (
                <IconActive className="h-5 w-5 text-amber-400 flex-shrink-0" />
              ) : (
                <IconInactive className="h-5 w-5 flex-shrink-0 group-hover:text-white/80 transition-colors" />
              )}
              <span>{item.name}</span>
              {isActive && <ChevronRightIcon className="h-3.5 w-3.5 ml-auto text-amber-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom User section */}
      <div className="px-3 py-4 border-t border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/8 hover:bg-white/12 transition-colors cursor-pointer group">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow flex-shrink-0">
            <span className="text-white text-sm font-black">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold truncate">{user?.name || 'Admin'}</p>
            <p className="text-white/40 text-xs truncate">{user?.email || 'admin@krishnatrades.com'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-white/40 hover:text-red-400 transition-colors"
            title="Sign out"
          >
            <ArrowRightOnRectangleIcon className="h-4.5 w-4.5" style={{width:'18px',height:'18px'}} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex overflow-hidden bg-slate-100">

      {/* ── Mobile Sidebar Overlay ───────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex flex-col w-72 bg-gradient-to-b from-gray-900 to-gray-950 shadow-2xl animate-in slide-in-from-left-4 duration-300">
            <button
              className="absolute top-4 right-4 p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* ── Desktop Sidebar ──────────────────────────────────── */}
      <div className="hidden md:flex flex-col w-64 flex-shrink-0 bg-gradient-to-b from-gray-900 to-gray-950 shadow-xl z-20">
        <SidebarContent />
      </div>

      {/* ── Main Area ────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Top Navbar */}
        <header className="flex-shrink-0 flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-gray-200/60 shadow-sm z-10">
          {/* Left: hamburger + page title */}
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-base font-black text-gray-900 font-display">{currentPage}</h2>
              <p className="text-xs text-gray-400 hidden sm:block">Krishna Trades Admin</p>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false); }}
                className="relative p-2 rounded-xl text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
              >
                <BellIcon className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                      {unreadCount > 0 && <p className="text-xs text-gray-400">{unreadCount} unread</p>}
                    </div>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-xs text-primary-600 font-bold hover:text-primary-700 px-2 py-1 rounded-lg hover:bg-primary-50 transition-colors">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <BellIcon className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm font-medium">No notifications</p>
                      </div>
                    ) : (
                      notifications.map((notif: any, i: number) => (
                        <div key={i} className={`p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors text-sm ${!notif.isRead ? 'border-l-2 border-l-primary-400 bg-primary-50/30' : ''}`}>
                          <p className="font-bold text-gray-900 mb-0.5">{notif.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-2">{notif.message}</p>
                          <span className="text-[10px] text-gray-400 mt-1.5 block">{new Date(notif.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Button */}
            <div className="relative">
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotificationsOpen(false); }}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow">
                  <span className="text-white text-sm font-black">
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-700 hidden sm:block">
                  {user?.name?.split(' ')[0] || 'Admin'}
                </span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
                    <p className="text-sm font-black text-gray-900">Krishna Trades</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@krishnatrades.com'}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
