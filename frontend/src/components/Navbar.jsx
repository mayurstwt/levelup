import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { markNotificationsRead } from '../features/notifications/notificationSlice';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { notifications, unreadCount } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const toggleNotif = () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen && unreadCount > 0) dispatch(markNotificationsRead());
  };

  const typeIcon = (type) => {
    if (type === 'bid') return '💰';
    if (type === 'accepted') return '🎉';
    if (type === 'message') return '💬';
    if (type === 'completed') return '✅';
    if (type === 'payment') return '💳';
    if (type === 'dispute') return '⚠️';
    return '🔔';
  };

  const isActive = (path) => location.pathname === path;

  // ── Role-specific nav items ────────────────────────────────────────────
  // Logged-out: Home, Browse Jobs, Pricing
  // Buyer: Home, Browse Jobs (to find sellers), Pricing, Dashboard
  // Seller: Browse Jobs (primary CTA), Pricing, Dashboard
  // Admin: Admin Panel

  const publicLinks = [
    { to: '/', label: 'Home' },
    { to: '/jobs', label: 'Browse Jobs' },
    { to: '/pricing', label: 'Pricing' },
  ];

  const buyerLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/jobs', label: 'Browse Jobs' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/change-password', label: '⚙️ Settings' },
  ];

  const sellerLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/my-bids', label: 'My Bids' },
    { to: '/jobs', label: 'Find Jobs' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/change-password', label: '⚙️ Settings' },
  ];

  const adminLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/admin', label: '🛡 Admin', className: 'text-red-600 font-black' },
    { to: '/change-password', label: '⚙️ Settings' },
  ];

  let centerLinks = publicLinks;
  if (isAuthenticated) {
    if (user?.role === 'admin') centerLinks = adminLinks;
    else if (user?.role === 'seller') centerLinks = sellerLinks;
    else centerLinks = buyerLinks; // buyer or undefined
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-1.5 flex-shrink-0 no-underline">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
            </svg>
          </div>
          <span className="font-black text-gray-900 text-sm tracking-tight">GameLevelUp</span>
        </Link>

        {/* Center Nav Links — desktop */}
        <div className="hidden md:flex items-center gap-5">
          {centerLinks.map(({ to, label, className: cls }) => (
            <Link
              key={to}
              to={to}
              className={`text-sm font-semibold transition-colors no-underline ${cls || ''} ${
                isActive(to)
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-0.5'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={toggleNotif}
                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 rounded hover:bg-gray-100 transition-colors relative"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="badge-pulse absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notifOpen && (
                  <div className="absolute right-0 top-10 w-80 bg-white border-2 border-gray-900 rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b-2 border-gray-100">
                      <span className="font-black text-gray-900 text-sm uppercase">Notifications</span>
                      {notifications.length > 0 && (
                        <button
                          onClick={() => dispatch(markNotificationsRead())}
                          className="text-xs text-blue-600 font-semibold hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                      <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-gray-700 text-lg ml-2">×</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="text-center py-10">
                          <p className="text-2xl mb-2">🔔</p>
                          <p className="text-gray-400 text-sm font-semibold">No notifications yet</p>
                          <p className="text-gray-300 text-xs mt-1">Activity on your jobs will appear here</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`flex gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${!n.read ? 'bg-blue-50' : ''}`}
                            onClick={() => n.jobId && navigate(`/jobs/${n.jobId}`)}
                          >
                            <span className="text-lg flex-shrink-0">{typeIcon(n.type)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 font-semibold leading-snug">{n.message}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {new Date(n.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {!n.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Role CTA button */}
              {user?.role === 'buyer' && (
                <button
                  onClick={() => navigate('/post-job')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-3 py-1.5 rounded transition-colors"
                >
                  + Post Job
                </button>
              )}
              {user?.role === 'seller' && (
                <button
                  onClick={() => navigate('/seller-onboarding')}
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-black text-xs px-3 py-1.5 rounded transition-colors"
                >
                  My Profile
                </button>
              )}

              {/* Role badge + Avatar → Dashboard */}
              <Link to="/dashboard" className="flex items-center gap-1.5 no-underline group">
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white font-black text-xs cursor-pointer group-hover:ring-2 group-hover:ring-blue-500 transition-all">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="hidden sm:block text-gray-400 hover:text-red-500 text-xs font-semibold transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-gray-900 text-sm font-semibold transition-colors no-underline">Login</Link>
              <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-4 py-1.5 rounded transition-colors no-underline">
                Sign Up
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 rounded"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-[100] md:hidden" 
          onClick={() => setMobileOpen(false)} 
        />
      )}

      {/* Mobile Drawer */}
      <div 
        className={`fixed top-0 left-0 h-full w-64 bg-white z-[101] shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col p-5 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <span className="font-black text-gray-900 tracking-tight">GameLevelUp</span>
          <button onClick={() => setMobileOpen(false)} className="text-gray-500 hover:text-gray-900 p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex flex-col space-y-4 flex-1">
          {centerLinks.map(({ to, label, className: cls }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`block text-lg font-bold pb-2 border-b-2 no-underline ${isActive(to) ? 'text-blue-600 border-blue-600' : 'text-gray-800 border-gray-100'} ${cls || ''}`}
            >
              {label}
            </Link>
          ))}
        </div>

        {isAuthenticated ? (
          <button onClick={handleLogout} className="mt-8 bg-red-50 text-red-600 w-full py-3 rounded text-sm font-black uppercase tracking-wider">
            Logout
          </button>
        ) : (
          <div className="mt-8 flex flex-col gap-3">
             <Link to="/login" onClick={() => setMobileOpen(false)} className="border-2 border-gray-900 text-center py-2.5 font-black text-xs uppercase text-gray-900 no-underline">Login</Link>
             <Link to="/register" onClick={() => setMobileOpen(false)} className="bg-blue-600 border-2 border-blue-600 text-center py-2.5 font-black text-xs uppercase text-white hover:bg-blue-700 no-underline">Sign Up</Link>
          </div>
        )}
      </div>

      {/* Overlay to close notif dropdown */}
      {notifOpen && <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />}
    </nav>
  );
};

export default Navbar;