import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
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
  listProviderBookings,
  listProviderPayments,
  listProviderPayouts,
  type BookingSummary,
  type PaymentSummary,
  type PayoutSummary,
} from "../../services/serveaseProviderApi";
import { pickQueryItemId } from "../utils/providerDeeplinks";

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

function isPaymentInPeriod(
  payment: PaymentSummary,
  selectedPeriod: "today" | "week" | "month" | "all",
): boolean {
  if (selectedPeriod === "all") {
    return true;
  }

  const date = paymentDate(payment);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (selectedPeriod === "today") {
    return date >= start;
  }

  if (selectedPeriod === "week") {
    start.setDate(start.getDate() - 6);
    return date >= start;
  }

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
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

const categoryColors = ["#00BF63", "#059669", "#10B981", "#34D399", "#6EE7B7"];

function buildServiceCategoryData(
  payments: PaymentSummary[],
  bookings: BookingSummary[],
) {
  const bookingTitles = new Map(
    bookings.map((booking) => [
      booking.id,
      booking.serviceTitle?.trim() || "Uncategorized",
    ]),
  );
  const totals = new Map<string, number>();

  payments
    .filter((payment) => payment.status === "paid")
    .forEach((payment) => {
      const title = bookingTitles.get(payment.bookingId) ?? "Uncategorized";
      totals.set(title, (totals.get(title) ?? 0) + payment.providerPayout);
    });

  return Array.from(totals.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, categoryColors.length)
    .map(([name, value], index) => ({
      name,
      value,
      color: categoryColors[index],
    }));
}

function buildTopEarningDays(payments: PaymentSummary[]) {
  const totals = new Map<string, number>();

  payments
    .filter((payment) => payment.status === "paid")
    .forEach((payment) => {
      const date = paymentDate(payment);
      if (Number.isNaN(date.getTime())) {
        return;
      }

      const day = date.toLocaleDateString("en-US", { weekday: "long" });
      totals.set(day, (totals.get(day) ?? 0) + payment.providerPayout);
    });

  const maxAmount = Math.max(0, ...totals.values());

  return Array.from(totals.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4)
    .map(([day, amount]) => ({
      day,
      amount,
      percentage: maxAmount > 0 ? Math.round((amount / maxAmount) * 100) : 0,
    }));
}

function downloadProviderStatement(payments: PaymentSummary[]) {
  if (payments.length === 0) {
    return;
  }

  const header = [
    "Payment ID",
    "Booking ID",
    "Status",
    "Amount",
    "Platform Fee",
    "Provider Payout",
    "Payment Method",
    "Paid At",
    "Created At",
  ];
  const rows = payments.map((payment) => [
    payment.id,
    payment.bookingId,
    payment.status,
    String(payment.amount),
    String(payment.platformFee),
    String(payment.providerPayout),
    payment.paymentMethod ?? "",
    payment.paidAt ?? "",
    payment.createdAt ?? "",
  ]);
  const csv = [header, ...rows]
    .map((row) =>
      row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `servease-provider-statement-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function ProviderEarningsDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month" | "all">("month");
  const [payments, setPayments] = useState<PaymentSummary[]>([]);
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [payouts, setPayouts] = useState<PayoutSummary[]>([]);
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
        const [providerPayments, providerBookings, providerPayouts] =
          await Promise.all([
            listProviderPayments(token),
            listProviderBookings(token),
            listProviderPayouts(token),
          ]);
        const requestedPaymentId = pickQueryItemId(
          location.search,
          "paymentId",
          providerPayments.map((payment) => payment.id),
        );

        setPayments(providerPayments);
        setBookings(providerBookings);
        setPayouts(providerPayouts);

        if (requestedPaymentId) {
          navigate(`/provider/earningsdetails?paymentId=${encodeURIComponent(String(requestedPaymentId))}`, {
            replace: true,
          });
        }
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : "Unable to load earnings.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadPayments();
  }, [location.search, navigate]);

  const displayedPayments = useMemo(
    () =>
      payments.filter((payment) => isPaymentInPeriod(payment, selectedPeriod)),
    [payments, selectedPeriod],
  );
  const earningsTrendData = useMemo(
    () => buildTrendData(displayedPayments),
    [displayedPayments],
  );
  const serviceCategoryData = useMemo(
    () => buildServiceCategoryData(displayedPayments, bookings),
    [bookings, displayedPayments],
  );
  const topEarningDays = useMemo(
    () => buildTopEarningDays(displayedPayments),
    [displayedPayments],
  );
  const totalEarnings = displayedPayments
        .filter((payment) => payment.status !== "cancelled" && payment.status !== "refunded")
        .reduce((sum, payment) => sum + payment.providerPayout, 0);
  const pendingEarnings = displayedPayments
        .filter((payment) => payment.status === "pending")
        .reduce((sum, payment) => sum + payment.providerPayout, 0);
  const inProcessing = payouts
    .filter((payout) => payout.status === "requested" || payout.status === "processing")
    .reduce((sum, payout) => sum + payout.netAmount, 0);
  const paidOut = displayedPayments
        .filter((payment) => payment.status === "paid")
        .reduce((sum, payment) => sum + payment.providerPayout, 0);
  const completedBookings = displayedPayments.filter((payment) => payment.status === "paid").length;
  const avgBookingValue = completedBookings > 0
    ? Math.round(paidOut / completedBookings)
    : 0;
  const grossSales = displayedPayments
    .filter((payment) => payment.status !== "cancelled" && payment.status !== "refunded")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const platformFees = displayedPayments.reduce((sum, payment) => sum + payment.platformFee, 0);

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
            <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>
              Net of platform fees
            </p>
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
                <LineChart data={earningsTrendData}>
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
                {serviceCategoryData.length > 0 ? (
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
                ) : (
                  <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: '#6B7280', fontSize: '14px' }}>
                    No paid service earnings for this period.
                  </div>
                )}
              </ResponsiveContainer>
              
              {/* Legend */}
              {serviceCategoryData.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                  {serviceCategoryData.map((item) => (
                    <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: item.color }} />
                      <span style={{ fontSize: '12px', color: '#6B7280' }}>{item.name}</span>
                    </div>
                  ))}
                </div>
              )}
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

              {/* Gross Sales */}
              <div style={styles.metricsCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{...styles.metricIcon, backgroundColor: '#D1FAE5'}}>
                    <DollarSign style={{ width: '20px', height: '20px', color: '#00BF63' }} />
                  </div>
                  <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>Gross Sales</p>
                </div>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>₱{grossSales.toLocaleString()}</p>
                <p style={{ fontSize: '11px', color: '#9CA3AF' }}>Before platform fees</p>
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
              {topEarningDays.length > 0 ? (
                topEarningDays.map((item) => (
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
                ))
              ) : (
                <p style={{ color: '#6B7280', fontSize: '14px', textAlign: 'center', padding: '32px 0' }}>
                  No paid earnings for this period.
                </p>
              )}
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
            <button
              style={{
                ...styles.button,
                ...styles.secondaryButton,
                opacity: displayedPayments.length === 0 ? 0.6 : 1,
                cursor: displayedPayments.length === 0 ? 'not-allowed' : 'pointer',
              }}
              disabled={displayedPayments.length === 0}
              onClick={() => downloadProviderStatement(displayedPayments)}
            >
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
                Use the earnings details page to reconcile individual payments and payout timing.
                Add more availability on days where paid bookings already perform well.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
