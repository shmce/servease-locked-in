import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  Download, 
  TrendingUp,
  CreditCard,
  FileText,
  Briefcase,
  CircleDollarSign,
  Wallet,
  Eye
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";
import {
  getStoredProviderAccessToken,
  listProviderPayments,
  type PaymentSummary,
} from "../../services/serveaseProviderApi";

// Styles object for reusability
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom right, #F9FAFB, rgba(16, 185, 129, 0.05))',
    padding: '32px',
  },
  maxWidthContainer: {
    maxWidth: '1280px',
    margin: '0 auto',
  },
  pageHeader: {
    marginBottom: '40px',
  },
  pageTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '12px',
    letterSpacing: '-0.025em',
  },
  pageSubtitle: {
    fontSize: '16px',
    color: '#6B7280',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #F3F4F6',
    padding: '24px',
    transition: 'box-shadow 0.3s ease',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '24px',
  },
  sectionTitleBar: {
    height: '4px',
    width: '32px',
    backgroundColor: '#00BF63',
    borderRadius: '9999px',
  },
  sectionTitleText: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#111827',
  },
  kpiCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #F3F4F6',
    padding: '24px',
    transition: 'all 0.3s ease',
  },
  kpiIconContainer: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  kpiLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '8px',
  },
  kpiValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#111827',
  },
  button: {
    padding: '14px 24px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  primaryButton: {
    backgroundColor: '#00BF63',
    color: 'white',
    boxShadow: '0 4px 16px rgba(0, 191, 99, 0.25)',
  },
  secondaryButton: {
    backgroundColor: 'white',
    color: '#374151',
    border: '2px solid #E5E7EB',
  },
  periodPill: {
    padding: '12px 24px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.3s ease',
  },
  metricsCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    border: '1px solid #E5E7EB',
    padding: '20px',
  },
  metricIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    padding: '20px',
  },
  topDayItem: {
    marginBottom: '16px',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#F3F4F6',
    borderRadius: '9999px',
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(to right, #00BF63, #059669)',
    borderRadius: '9999px',
    transition: 'width 0.5s ease',
  },
  tipCard: {
    backgroundColor: '#E8F5E9',
    border: '1px solid rgba(0, 191, 99, 0.2)',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    gap: '16px',
  },
  tipIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: 'rgba(0, 191, 99, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
};

function paymentDate(payment: PaymentSummary): Date {
  return new Date(payment.paidAt || payment.createdAt || "");
}

function buildTrendData(payments: PaymentSummary[]) {
  const totals = new Map<string, number>();

  payments
    .filter((payment) => payment.status === "paid")
    .forEach((payment) => {
      const date = paymentDate(payment);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const key = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      totals.set(key, (totals.get(key) ?? 0) + payment.providerPayout);
    });

  return Array.from(totals.entries()).map(([date, amount]) => ({ date, amount }));
}

export function ProviderEarningsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month" | "all">("month");
  const [payments, setPayments] = useState<PaymentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadPayments = async () => {
      const token = getStoredProviderAccessToken();

      if (!token) {
        return;
      }

      setIsLoading(true);
      setLoadError(null);

      try {
        setPayments(await listProviderPayments(token));
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : "Unable to load earnings.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadPayments();
  }, []);

  // Sample data
  const earningsTrendData = [
    { date: "Mar 6", amount: 1870 },
    { date: "Mar 7", amount: 1425 },
    { date: "Mar 8", amount: 3020 },
    { date: "Mar 9", amount: 1530 },
    { date: "Mar 10", amount: 2325 },
    { date: "Mar 11", amount: 2850 },
    { date: "Mar 12", amount: 3100 },
  ];

  const serviceCategoryData = [
    { name: "House Cleaning", value: 4500, color: "#00BF63" },
    { name: "Plumbing", value: 3200, color: "#059669" },
    { name: "Electrical", value: 2800, color: "#10B981" },
    { name: "Aircon Services", value: 1950, color: "#34D399" },
  ];

  const topEarningDays = [
    { day: "Monday", amount: 3200, percentage: 100 },
    { day: "Wednesday", amount: 2850, percentage: 89 },
    { day: "Saturday", amount: 2650, percentage: 83 },
    { day: "Friday", amount: 2100, percentage: 66 },
  ];

  const liveTrendData = useMemo(() => buildTrendData(payments), [payments]);
  const hasLivePayments = payments.length > 0;
  const totalEarnings = hasLivePayments
    ? payments
        .filter((payment) => payment.status !== "cancelled" && payment.status !== "refunded")
        .reduce((sum, payment) => sum + payment.providerPayout, 0)
    : selectedPeriod === "month" ? 12450 : 42300;
  const pendingEarnings = hasLivePayments
    ? payments
        .filter((payment) => payment.status === "pending")
        .reduce((sum, payment) => sum + payment.providerPayout, 0)
    : 1530;
  const inProcessing = 0;
  const paidOut = hasLivePayments
    ? payments
        .filter((payment) => payment.status === "paid")
        .reduce((sum, payment) => sum + payment.providerPayout, 0)
    : 10920;
  const completedBookings = hasLivePayments
    ? payments.filter((payment) => payment.status === "paid").length
    : 47;
  const avgBookingValue = completedBookings > 0
    ? Math.round(paidOut / completedBookings)
    : 0;
  const totalTips = 1340;
  const platformFees = hasLivePayments
    ? payments.reduce((sum, payment) => sum + payment.platformFee, 0)
    : 1868;
  const displayedTrendData = liveTrendData.length > 0 ? liveTrendData : earningsTrendData;

  return (
    <div style={styles.container}>
      <div style={styles.maxWidthContainer}>
        {/* Page Header */}
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Earnings Dashboard</h1>
          <p style={styles.pageSubtitle}>Track your earnings, payouts, and performance metrics</p>
          {loadError && (
            <p style={{ color: "#B91C1C", fontSize: "14px", marginTop: "12px" }}>
              {loadError}
            </p>
          )}
          {isLoading && (
            <p style={{ color: "#6B7280", fontSize: "14px", marginTop: "12px" }}>
              Loading live earnings...
            </p>
          )}
        </div>

        {/* Period Selector */}
        <div style={{ marginBottom: '32px', display: 'flex', gap: '12px', flexWrap: 'wrap' as const }}>
          {[
            { key: "today", label: "Today" },
            { key: "week", label: "This Week" },
            { key: "month", label: "This Month" },
            { key: "all", label: "All Time" },
          ].map((period) => (
            <button
              key={period.key}
              onClick={() => setSelectedPeriod(period.key as any)}
              style={{
                ...styles.periodPill,
                backgroundColor: selectedPeriod === period.key ? '#00BF63' : '#F3F4F6',
                color: selectedPeriod === period.key ? 'white' : '#6B7280',
                boxShadow: selectedPeriod === period.key ? '0 2px 8px rgba(0, 191, 99, 0.25)' : 'none',
              }}
            >
              {period.label}
            </button>
          ))}
        </div>

        {/* Top Row: 4 KPI Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '24px',
          marginBottom: '32px'
        }}>
          {/* Total Earnings */}
          <Link 
            to="/provider/earningsdetails"
            style={{ 
              ...styles.kpiCard, 
              cursor: 'pointer',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 191, 99, 0.15)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{...styles.kpiIconContainer, backgroundColor: '#D1FAE5'}}>
              <DollarSign style={{ width: '24px', height: '24px', color: '#00BF63' }} />
            </div>
            <p style={styles.kpiLabel}>Total Earnings</p>
            <p style={styles.kpiValue}>₱{totalEarnings.toLocaleString()}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
              <TrendingUp style={{ width: '14px', height: '14px', color: '#00BF63' }} />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#00BF63' }}>+12%</span>
            </div>
          </Link>

          {/* Pending */}
          <div style={styles.kpiCard}>
            <div style={{...styles.kpiIconContainer, backgroundColor: '#FEF3C7'}}>
              <Clock style={{ width: '24px', height: '24px', color: '#F59E0B' }} />
            </div>
            <p style={styles.kpiLabel}>Pending</p>
            <p style={styles.kpiValue}>₱{pendingEarnings.toLocaleString()}</p>
          </div>

          {/* Processing */}
          <div style={styles.kpiCard}>
            <div style={{...styles.kpiIconContainer, backgroundColor: '#DBEAFE'}}>
              <CreditCard style={{ width: '24px', height: '24px', color: '#3B82F6' }} />
            </div>
            <p style={styles.kpiLabel}>Processing</p>
            <p style={styles.kpiValue}>₱{inProcessing.toLocaleString()}</p>
          </div>

          {/* Paid Out */}
          <div style={styles.kpiCard}>
            <div style={{...styles.kpiIconContainer, backgroundColor: '#D1FAE5'}}>
              <CheckCircle style={{ width: '24px', height: '24px', color: '#00BF63' }} />
            </div>
            <p style={styles.kpiLabel}>Paid Out</p>
            <p style={styles.kpiValue}>₱{paidOut.toLocaleString()}</p>
          </div>
        </div>

        {/* Second Row: Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          {/* Left: Earnings Trend */}
          <div style={styles.card}>
            <div style={styles.sectionTitle}>
              <div style={styles.sectionTitleBar}></div>
              <h2 style={styles.sectionTitleText}>Earnings Trend</h2>
            </div>
            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={displayedTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    stroke="#E5E7EB"
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    stroke="#E5E7EB"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: any) => [`₱${value}`, 'Earnings']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#00BF63" 
                    strokeWidth={3}
                    dot={{ fill: '#00BF63', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right: Service Category */}
          <div style={styles.card}>
            <div style={styles.sectionTitle}>
              <div style={styles.sectionTitleBar}></div>
              <h2 style={styles.sectionTitleText}>Service Category</h2>
            </div>
            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={serviceCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {serviceCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`₱${value}`, 'Earnings']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Legend */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                {serviceCategoryData.map((item) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: item.color }} />
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Third Row: Performance Metrics & Top Earning Days */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          {/* Left: Performance Metrics */}
          <div style={styles.card}>
            <div style={styles.sectionTitle}>
              <div style={styles.sectionTitleBar}></div>
              <h2 style={styles.sectionTitleText}>Performance Metrics</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Completed Bookings */}
              <div style={styles.metricsCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{...styles.metricIcon, backgroundColor: '#EEF2FF'}}>
                    <Briefcase style={{ width: '20px', height: '20px', color: '#6366F1' }} />
                  </div>
                  <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>Completed</p>
                </div>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>{completedBookings}</p>
                <p style={{ fontSize: '11px', color: '#9CA3AF' }}>Bookings</p>
              </div>

              {/* Average Booking Value */}
              <div style={styles.metricsCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{...styles.metricIcon, backgroundColor: '#FEF3C7'}}>
                    <CircleDollarSign style={{ width: '20px', height: '20px', color: '#F59E0B' }} />
                  </div>
                  <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>Avg. Value</p>
                </div>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>₱{avgBookingValue.toLocaleString()}</p>
                <p style={{ fontSize: '11px', color: '#9CA3AF' }}>Per Booking</p>
              </div>

              {/* Total Tips */}
              <div style={styles.metricsCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{...styles.metricIcon, backgroundColor: '#D1FAE5'}}>
                    <DollarSign style={{ width: '20px', height: '20px', color: '#00BF63' }} />
                  </div>
                  <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>Total Tips</p>
                </div>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>₱{totalTips.toLocaleString()}</p>
                <p style={{ fontSize: '11px', color: '#00BF63' }}>+8% vs last period</p>
              </div>

              {/* Platform Fees */}
              <div style={styles.metricsCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{...styles.metricIcon, backgroundColor: '#F3F4F6'}}>
                    <FileText style={{ width: '20px', height: '20px', color: '#6B7280' }} />
                  </div>
                  <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>Platform Fees</p>
                </div>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#9CA3AF' }}>₱{platformFees.toLocaleString()}</p>
                <p style={{ fontSize: '11px', color: '#9CA3AF' }}>15% of total</p>
              </div>
            </div>
          </div>

          {/* Right: Top Earning Days */}
          <div style={styles.card}>
            <div style={styles.sectionTitle}>
              <div style={styles.sectionTitleBar}></div>
              <h2 style={styles.sectionTitleText}>Top Earning Days</h2>
            </div>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '20px' }}>
              {topEarningDays.map((item) => (
                <div key={item.day} style={styles.topDayItem}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: '600', fontSize: '14px', color: '#374151' }}>{item.day}</span>
                      <span style={{ fontSize: '13px', color: '#6B7280' }}>₱{item.amount.toLocaleString()}</span>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#00BF63' }}>{item.percentage}%</span>
                  </div>
                  <div style={styles.progressBar}>
                    <div style={{...styles.progressFill, width: `${item.percentage}%`}} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fourth Row: Action Buttons & Efficiency Tip */}
        <div style={{ marginBottom: '32px' }}>
          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <Link 
              to="/provider/earningsdetails"
              style={{
                ...styles.button, 
                ...styles.secondaryButton,
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#00BF63';
                e.currentTarget.style.color = '#00BF63';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.color = '#374151';
              }}
            >
              <Eye style={{ width: '20px', height: '20px' }} />
              <span>View Earnings Details</span>
            </Link>
            <Link
              to="/provider/payout"
              style={{
                ...styles.button,
                ...styles.primaryButton,
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#059669';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#00BF63';
              }}
            >
              <Wallet style={{ width: '20px', height: '20px' }} />
              <span>Request Payout</span>
            </Link>
            <button style={{...styles.button, ...styles.secondaryButton}}>
              <Download style={{ width: '20px', height: '20px' }} />
              <span>Download Statement</span>
            </button>
          </div>

          {/* Efficiency Tip */}
          <div style={styles.tipCard}>
            <div style={styles.tipIcon}>
              <TrendingUp style={{ width: '20px', height: '20px', color: '#00BF63' }} />
            </div>
            <div>
              <p style={{ fontWeight: '600', fontSize: '14px', color: '#111827', marginBottom: '8px' }}>
                Efficiency Tip
              </p>
              <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
                Your peak earning hours are <span style={{ fontWeight: '600', color: '#00BF63' }}>10 AM - 2 PM on weekdays</span>. 
                Consider scheduling more availability during these times to maximize earnings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
