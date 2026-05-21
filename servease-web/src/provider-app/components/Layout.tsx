import { Outlet, Link, Navigate, useLocation, useNavigate } from 'react-router';
import { Home, Calendar, DollarSign, MessageSquare, Settings, BarChart3, Bell, User, Menu, Star, Search, HelpCircle, TrendingUp, Briefcase, LogOut } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import logo from '../../assets/d5c1631be6e8531539bd8040a765725f4a4ddc2c.png';
import { useProviderAuth } from '../context/ProviderAuthContext';
import {
  listProviderNotifications,
  markProviderNotificationRead,
  type NotificationSummary,
} from '../../services/serveaseProviderApi';
import { getProviderNotificationHref } from '../utils/providerNotifications';

function formatNotificationTime(value: string | null): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { accessToken, isAuthenticated, isLoading, logout, profile } = useProviderAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationSummary[]>([]);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const providerName =
    profile?.providerProfile?.businessName ||
    profile?.user.fullName ||
    profile?.user.email ||
    'Service Provider';

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { path: '/provider/dashboard', icon: Home, label: 'Dashboard' },
      ]
    },
    {
      title: 'BOOKINGS',
      items: [
        { path: '/provider/calendar', icon: Calendar, label: 'Calendar' },
        { path: '/provider/bookings', icon: Briefcase, label: 'My Bookings' },
      ]
    },
    {
      title: 'BUSINESS',
      items: [
        { path: '/provider/earningsdashboard', icon: BarChart3, label: 'Earnings' },
        { path: '/provider/reviews', icon: Star, label: 'Reviews' },
        { path: '/provider/performanceinsights', icon: TrendingUp, label: 'Performance Insights' },
      ]
    },
    {
      title: 'ACCOUNT',
      items: [
        { path: '/provider/messages', icon: MessageSquare, label: 'Messages' },
        { path: '/provider/profile', icon: User, label: 'Profile' },
        { path: '/provider/settings', icon: Settings, label: 'Settings' },
        { path: '/provider/help-center', icon: HelpCircle, label: 'Help & Support' },
      ]
    }
  ];

  const isActive = (path: string) => location.pathname === path;
  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  );

  useEffect(() => {
    const loadNotifications = async () => {
      if (!accessToken) {
        setNotifications([]);
        return;
      }

      try {
        setNotificationError(null);
        setNotifications(await listProviderNotifications(accessToken));
      } catch (error) {
        setNotificationError(
          error instanceof Error ? error.message : 'Unable to load notifications.',
        );
      }
    };

    void loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 30000);

    return () => window.clearInterval(intervalId);
  }, [accessToken]);

  const markNotificationRead = async (notificationId: string) => {
    if (!accessToken) {
      return;
    }

    try {
      setNotificationError(null);
      const updated = await markProviderNotificationRead(accessToken, notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId ? updated : notification,
        ),
      );
    } catch (error) {
      setNotificationError(
        error instanceof Error ? error.message : 'Unable to update notification.',
      );
    }
  };

  const openNotification = async (notification: NotificationSummary) => {
    if (!notification.isRead) {
      await markNotificationRead(notification.id);
    }

    const href = getProviderNotificationHref(notification);
    if (href) {
      setIsNotificationsOpen(false);
      navigate(href);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-sm font-semibold text-gray-500">Restoring provider session...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/provider/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <img src={logo.src} alt="ServEase" className="h-8" />
            <div className="hidden md:block ml-4">
              <p className="text-lg font-semibold text-gray-900">Welcome back, {providerName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="hidden lg:flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2 w-80">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
              />
            </div>

            <div className="relative">
              <button
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setIsNotificationsOpen((open) => !open)}
                aria-label="Notifications"
              >
                <Bell className="w-6 h-6 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-green-600 rounded-full text-white text-[11px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-96 max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-900">Notifications</p>
                      <p className="text-xs text-gray-500">{unreadCount} unread</p>
                    </div>
                    <Link
                      to="/provider/notification-preferences"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-xs font-semibold text-green-700 hover:text-green-800"
                    >
                      Preferences
                    </Link>
                  </div>

                  {notificationError && (
                    <div className="px-4 py-3 text-xs text-red-700 bg-red-50 border-b border-red-100">
                      {notificationError}
                    </div>
                  )}

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-sm text-gray-500 text-center">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.slice(0, 8).map((notification) => (
                        <button
                          key={notification.id}
                          className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                            notification.isRead ? 'bg-white' : 'bg-green-50/70'
                          }`}
                          onClick={() => {
                            void openNotification(notification);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                                notification.isRead ? 'bg-gray-300' : 'bg-green-600'
                              }`}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {notification.title || notification.type}
                                </p>
                                <span className="text-[11px] text-gray-400 flex-shrink-0">
                                  {formatNotificationTime(notification.createdAt)}
                                </span>
                              </div>
                              {notification.body && (
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                  {notification.body}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center ring-2 ring-green-100">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-bold text-gray-900">{providerName}</p>
                <p className="text-xs text-gray-500">Service Provider</p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/provider/login', { replace: true });
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 z-30
          w-64 transition-transform duration-300 lg:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <nav className="p-4 pt-20 lg:pt-4 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
            {navSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-bold text-gray-400 mb-2 px-4">{section.title}</h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium
                          ${active 
                            ? 'bg-green-600 text-white shadow-md' 
                            : 'text-gray-700 hover:bg-gray-100'
                          }
                        `}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Mobile overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-20 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
