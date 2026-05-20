import { Calendar, DollarSign, Star, TrendingUp, Clock, CheckCircle, ArrowRight, Eye } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  getProviderDashboard,
  getStoredProviderAccessToken,
  type ProviderDashboardSummary,
} from '../../services/serveaseProviderApi';

export function DashboardPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<ProviderDashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredProviderAccessToken();

    if (!token) {
      setLoadError('Sign in to load your provider dashboard.');
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    void getProviderDashboard(token)
      .then(setDashboard)
      .catch((error) => {
        setDashboard(null);
        setLoadError(
          error instanceof Error ? error.message : 'Unable to load dashboard.',
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  const stats = useMemo(() => {
    const summary = dashboard?.summary;

    return [
      {
        label: 'New Requests',
        value: String(summary?.newRequests ?? 0),
        icon: Calendar,
        color: 'bg-blue-500',
        trend: 'Pending provider responses',
      },
      {
        label: "Today's Bookings",
        value: String(summary?.todayBookings ?? 0),
        icon: CheckCircle,
        color: 'bg-green-600',
        trend: `${summary?.todayCompleted ?? 0} completed`,
      },
      {
        label: "Today's Earnings",
        value: formatCurrency(summary?.todayEarnings ?? 0),
        icon: DollarSign,
        color: 'bg-purple-500',
        trend: `${formatCurrency(summary?.totalEarnings ?? 0)} total paid`,
      },
      {
        label: 'Overall Rating',
        value: String(summary?.overallRating ?? 0),
        icon: Star,
        color: 'bg-yellow-500',
        trend: `Based on ${summary?.reviewCount ?? 0} reviews`,
      },
    ];
  }, [dashboard]);

  const quickActions = [
    { label: 'Set Availability', path: '/provider/availability', color: 'bg-green-600' },
    { label: 'View Calendar', path: '/provider/calendar', color: 'bg-blue-600' },
    { label: 'Update Pricing', path: '/provider/edit-services', color: 'bg-purple-600' },
    { label: 'View Earnings', path: '/provider/earningsdashboard', color: 'bg-yellow-600' },
  ];

  const upcomingBookings =
    dashboard?.upcomingBookings.map((booking) => ({
      id: booking.id,
      time: booking.time,
      customer: booking.customerName || 'Customer',
      service: booking.serviceTitle || 'Service Booking',
      location: booking.location || 'Address unavailable',
      status: toTitleCase(booking.status),
    })) ?? [];

  const performanceMetrics = [
    {
      label: 'Acceptance Rate',
      value: dashboard ? `${dashboard.performance.acceptanceRate}%` : '0%',
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      label: 'Completion Rate',
      value: dashboard ? `${dashboard.performance.completionRate}%` : '0%',
      icon: TrendingUp,
      color: 'text-blue-600',
    },
    {
      label: 'Response Time',
      value:
        dashboard?.performance.responseTimeMinutes === null || !dashboard
          ? 'N/A'
          : `${dashboard.performance.responseTimeMinutes} min`,
      icon: Clock,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {loadError}
        </div>
      ) : null}
      {isLoading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
          Loading provider dashboard...
        </div>
      ) : null}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-xl`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                <p className="text-xs text-gray-400">{stat.trend}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className={`${action.color} text-white px-6 py-4 rounded-xl font-medium hover:opacity-90 transition-all shadow-sm hover:shadow-md`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* New Requests Banner */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-green-900 mb-1">You have {dashboard?.summary.newRequests ?? 0} new booking requests!</h3>
          <p className="text-sm text-green-700">Review and respond to customer requests to grow your business</p>
        </div>
        <button
          onClick={() => navigate('/provider/bookings')}
          className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2"
        >
          View Requests
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Upcoming Bookings Table */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Upcoming Bookings</h2>
          <button
            onClick={() => navigate('/provider/calendar')}
            className="text-green-600 text-sm font-medium hover:text-green-700 flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider pb-3">Time</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider pb-3">Customer Name</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider pb-3">Service Type</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider pb-3">Location</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider pb-3">Status</th>
                <th className="text-right text-xs font-bold text-gray-500 uppercase tracking-wider pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {upcomingBookings.map((booking, index) => (
                <tr key={booking.id ?? index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 text-sm font-medium text-gray-900">{booking.time}</td>
                  <td className="py-4 text-sm text-gray-700">{booking.customer}</td>
                  <td className="py-4 text-sm text-gray-700">{booking.service}</td>
                  <td className="py-4 text-sm text-gray-600">{booking.location}</td>
                  <td className="py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'Confirmed' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => {
                        navigate(`/provider/booking-details/${booking.id}`);
                      }}
                      className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1 ml-auto"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {upcomingBookings.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500">
              No upcoming backend bookings found.
            </div>
          ) : null}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {performanceMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 p-3 rounded-xl">
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <p className="text-sm text-gray-600">{metric.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(amount);
}

function toTitleCase(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
