import {
  useEffect,
  useState,
  type ComponentType,
  type CSSProperties,
} from 'react';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  ShoppingBag,
  Star,
  Target,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import {
  getProviderDashboard,
  getStoredProviderAccessToken,
  listProviderBookings,
  type BookingSummary,
} from '../../services/serveaseProviderApi';

interface PerformanceState {
  acceptanceRate: number;
  completionRate: number;
  cancellationRate: number;
  responseTimeMinutes: number | null;
  customerSatisfaction: number;
  reviewCount: number;
  totalBookings: number;
  totalRevenue: number;
}

const emptyPerformanceState: PerformanceState = {
  acceptanceRate: 0,
  completionRate: 0,
  cancellationRate: 0,
  responseTimeMinutes: null,
  customerSatisfaction: 0,
  reviewCount: 0,
  totalBookings: 0,
  totalRevenue: 0,
};

export function ProviderPerformanceInsightsPage() {
  const [performance, setPerformance] = useState<PerformanceState>(
    emptyPerformanceState,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const token = getStoredProviderAccessToken();

    if (!token) {
      setIsLoading(false);
      setErrorMessage('Sign in to view performance insights.');
      return;
    }

    Promise.all([getProviderDashboard(token), listProviderBookings(token)])
      .then(([dashboard, bookings]) => {
        if (!isMounted) return;

        setPerformance({
          acceptanceRate: dashboard.performance.acceptanceRate,
          completionRate: dashboard.performance.completionRate,
          cancellationRate:
            dashboard.performance.cancellationRate ??
            calculateCancellationRate(bookings),
          responseTimeMinutes: dashboard.performance.responseTimeMinutes,
          customerSatisfaction: dashboard.summary.overallRating,
          reviewCount: dashboard.summary.reviewCount,
          totalBookings: bookings.length,
          totalRevenue: dashboard.summary.totalEarnings,
        });
        setErrorMessage(null);
      })
      .catch(() => {
        if (!isMounted) return;
        setErrorMessage('Performance insights are unavailable right now.');
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const responseTimeLabel =
    performance.responseTimeMinutes !== null
      ? `${performance.responseTimeMinutes} min`
      : 'Unavailable';
  const performanceScore = calculatePerformanceScore(performance);
  const recommendations = buildRecommendations(performance);

  const overviewMetrics = [
    {
      label: 'Total Bookings',
      value: performance.totalBookings.toLocaleString('en-PH'),
      detail: 'Provider bookings returned by the gateway',
      icon: ShoppingBag,
      iconColor: '#047857',
      iconBackground: '#d1fae5',
    },
    {
      label: 'Total Revenue',
      value: formatMoney(performance.totalRevenue),
      detail: 'Paid provider payout total',
      icon: DollarSign,
      iconColor: '#1d4ed8',
      iconBackground: '#dbeafe',
    },
    {
      label: 'Rating',
      value:
        performance.customerSatisfaction > 0
          ? performance.customerSatisfaction.toFixed(1)
          : 'No reviews',
      detail: `${performance.reviewCount} review${
        performance.reviewCount === 1 ? '' : 's'
      }`,
      icon: Star,
      iconColor: '#b45309',
      iconBackground: '#fef3c7',
    },
  ];

  const metricCards = [
    {
      label: 'Acceptance Rate',
      value: `${performance.acceptanceRate}%`,
      detail: 'Accepted bookings out of provider decisions',
      icon: CheckCircle,
      iconColor: '#047857',
      iconBackground: '#d1fae5',
    },
    {
      label: 'Completion Rate',
      value: `${performance.completionRate}%`,
      detail: 'Completed bookings out of terminal bookings',
      icon: Target,
      iconColor: '#047857',
      iconBackground: '#d1fae5',
    },
    {
      label: 'Cancellation Rate',
      value: `${performance.cancellationRate}%`,
      detail: 'Cancelled bookings out of terminal bookings',
      icon: XCircle,
      iconColor: '#b91c1c',
      iconBackground: '#fee2e2',
    },
    {
      label: 'Response Time',
      value: responseTimeLabel,
      detail: 'Average request-to-decision time',
      icon: Clock,
      iconColor: '#1d4ed8',
      iconBackground: '#dbeafe',
    },
    {
      label: 'Customer Satisfaction',
      value:
        performance.customerSatisfaction > 0
          ? `${performance.customerSatisfaction.toFixed(1)}/5`
          : 'No reviews',
      detail: 'Average provider rating',
      icon: Star,
      iconColor: '#b45309',
      iconBackground: '#fef3c7',
    },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>Performance Insights</h1>
            <p style={styles.subtitle}>
              Live provider metrics from bookings, payouts, and reviews.
            </p>
          </div>
          {isLoading && <span style={styles.statusBadge}>Loading</span>}
        </header>

        {errorMessage && (
          <section style={styles.warning} role="status">
            <AlertCircle style={styles.warningIcon} />
            <span>{errorMessage}</span>
          </section>
        )}

        <section style={styles.overviewGrid}>
          {overviewMetrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </section>

        <section style={styles.scoreGrid}>
          <div style={styles.card}>
            <div style={styles.sectionHeading}>
              <TrendingUp style={styles.sectionIcon} />
              <span>Performance Score</span>
            </div>
            <div style={styles.scoreContent}>
              <div
                style={{
                  ...styles.scoreRing,
                  background: `conic-gradient(${getScoreColor(
                    performanceScore,
                  )} ${performanceScore * 3.6}deg, #e5e7eb 0deg)`,
                }}
              >
                <div style={styles.scoreInner}>
                  <span
                    style={{
                      ...styles.scoreValue,
                      color: getScoreColor(performanceScore),
                    }}
                  >
                    {performanceScore}
                  </span>
                  <span style={styles.scoreCaption}>out of 100</span>
                </div>
              </div>
              <div style={styles.scoreText}>
                Based on acceptance, completion, and customer satisfaction.
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.sectionHeading}>
              <Target style={styles.sectionIcon} />
              <span>Recommended Actions</span>
            </div>
            <div style={styles.recommendationList}>
              {recommendations.map((recommendation) => (
                <div key={recommendation.title} style={styles.recommendation}>
                  <div style={styles.recommendationTitle}>
                    {recommendation.title}
                  </div>
                  <div style={styles.recommendationBody}>
                    {recommendation.body}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={styles.metricsGrid}>
          {metricCards.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  iconColor,
  iconBackground,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ComponentType<{ style?: CSSProperties }>;
  iconColor: string;
  iconBackground: string;
}) {
  return (
    <div style={styles.card}>
      <div style={styles.metricHeader}>
        <div>
          <div style={styles.metricLabel}>{label}</div>
          <div style={styles.metricValue}>{value}</div>
        </div>
        <div style={{ ...styles.metricIcon, background: iconBackground }}>
          <Icon style={{ width: '24px', height: '24px', color: iconColor }} />
        </div>
      </div>
      <div style={styles.metricDetail}>{detail}</div>
    </div>
  );
}

function calculateCancellationRate(bookings: BookingSummary[]): number {
  const terminalCount = bookings.filter((booking) =>
    ['completed', 'cancelled'].includes(booking.status),
  ).length;

  if (terminalCount === 0) {
    return 0;
  }

  const cancelledCount = bookings.filter(
    (booking) => booking.status === 'cancelled',
  ).length;
  return Math.round((cancelledCount / terminalCount) * 100);
}

function calculatePerformanceScore(performance: PerformanceState): number {
  const ratingScore =
    performance.customerSatisfaction > 0
      ? (performance.customerSatisfaction / 5) * 100
      : 0;

  return Math.round(
    performance.acceptanceRate * 0.3 +
      performance.completionRate * 0.3 +
      ratingScore * 0.4,
  );
}

function buildRecommendations(performance: PerformanceState) {
  const recommendations: Array<{ title: string; body: string }> = [];

  if (performance.acceptanceRate < 95) {
    recommendations.push({
      title: 'Improve acceptance rate',
      body: 'Review pending requests quickly and only decline work that is outside your service scope.',
    });
  }

  if (performance.completionRate < 95) {
    recommendations.push({
      title: 'Protect completion rate',
      body: 'Keep confirmed bookings on schedule and move unavoidable changes into customer support early.',
    });
  }

  if (performance.cancellationRate > 5) {
    recommendations.push({
      title: 'Reduce cancellations',
      body: 'Keep availability current so new requests match your actual working hours.',
    });
  }

  if (
    performance.responseTimeMinutes !== null &&
    performance.responseTimeMinutes > 10
  ) {
    recommendations.push({
      title: 'Respond faster',
      body: 'Aim to accept or reject new booking requests promptly so customers can plan around your availability.',
    });
  }

  if (
    performance.customerSatisfaction > 0 &&
    performance.customerSatisfaction < 4.7
  ) {
    recommendations.push({
      title: 'Raise customer satisfaction',
      body: 'Use progress updates and clear completion notes to set expectations before review time.',
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      title: 'No urgent actions',
      body: 'Current live metrics are healthy across the wired performance checks.',
    });
  }

  return recommendations;
}

function formatMoney(amount: number): string {
  return `₱${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function getScoreColor(score: number): string {
  if (score >= 90) return '#047857';
  if (score >= 75) return '#b45309';
  return '#b91c1c';
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#f8fafc',
    padding: '32px',
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '24px',
    marginBottom: '24px',
  },
  title: {
    fontSize: '36px',
    fontWeight: 800,
    color: '#111827',
    margin: '0 0 8px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#64748b',
    margin: 0,
  },
  statusBadge: {
    border: '1px solid #d1d5db',
    borderRadius: '999px',
    color: '#475569',
    fontSize: '13px',
    fontWeight: 700,
    padding: '8px 12px',
  },
  warning: {
    alignItems: 'center',
    background: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '8px',
    color: '#92400e',
    display: 'flex',
    fontSize: '14px',
    fontWeight: 700,
    gap: '10px',
    marginBottom: '24px',
    padding: '14px 16px',
  },
  warningIcon: {
    width: '18px',
    height: '18px',
  },
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '24px',
  },
  scoreGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
    gap: '24px',
    marginBottom: '24px',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
  },
  card: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
    padding: '24px',
  },
  metricHeader: {
    alignItems: 'center',
    display: 'flex',
    gap: '16px',
    justifyContent: 'space-between',
    marginBottom: '18px',
  },
  metricLabel: {
    color: '#64748b',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.04em',
    marginBottom: '8px',
    textTransform: 'uppercase',
  },
  metricValue: {
    color: '#111827',
    fontSize: '30px',
    fontWeight: 800,
    lineHeight: 1,
  },
  metricIcon: {
    alignItems: 'center',
    borderRadius: '8px',
    display: 'flex',
    flexShrink: 0,
    height: '48px',
    justifyContent: 'center',
    width: '48px',
  },
  metricDetail: {
    color: '#64748b',
    fontSize: '14px',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  sectionHeading: {
    alignItems: 'center',
    color: '#111827',
    display: 'flex',
    fontSize: '20px',
    fontWeight: 800,
    gap: '10px',
    marginBottom: '24px',
  },
  sectionIcon: {
    width: '22px',
    height: '22px',
    color: '#047857',
  },
  scoreContent: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    textAlign: 'center',
  },
  scoreRing: {
    alignItems: 'center',
    borderRadius: '50%',
    display: 'flex',
    height: '220px',
    justifyContent: 'center',
    width: '220px',
  },
  scoreInner: {
    alignItems: 'center',
    background: '#ffffff',
    borderRadius: '50%',
    display: 'flex',
    flexDirection: 'column',
    height: '166px',
    justifyContent: 'center',
    width: '166px',
  },
  scoreValue: {
    fontSize: '56px',
    fontWeight: 900,
    lineHeight: 1,
  },
  scoreCaption: {
    color: '#64748b',
    fontSize: '13px',
    fontWeight: 700,
    marginTop: '6px',
  },
  scoreText: {
    color: '#64748b',
    fontSize: '14px',
    fontWeight: 600,
    lineHeight: 1.5,
    maxWidth: '320px',
  },
  recommendationList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  recommendation: {
    background: '#f8fafc',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '14px 16px',
  },
  recommendationTitle: {
    color: '#111827',
    fontSize: '15px',
    fontWeight: 800,
    marginBottom: '4px',
  },
  recommendationBody: {
    color: '#64748b',
    fontSize: '14px',
    fontWeight: 600,
    lineHeight: 1.45,
  },
};
