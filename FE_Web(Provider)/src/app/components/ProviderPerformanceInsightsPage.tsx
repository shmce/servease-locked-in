import { TrendingUp, TrendingDown, Award, Clock, CheckCircle, XCircle, Star, Target, BarChart3, Trophy } from 'lucide-react';

export function ProviderPerformanceInsightsPage() {
  // Mock data
  const performanceScore = 87;
  const metrics = {
    acceptanceRate: 92,
    completionRate: 96,
    cancellationRate: 4,
    avgResponseTime: '12 min',
    customerSatisfaction: 4.8,
    onTimeArrivalRate: 94
  };

  const categoryAverage = {
    acceptanceRate: 85,
    completionRate: 90,
    customerSatisfaction: 4.5,
    onTimeArrivalRate: 88
  };

  const trendsData = [
    { day: 'Day 1', score: 82 },
    { day: 'Day 5', score: 83 },
    { day: 'Day 10', score: 85 },
    { day: 'Day 15', score: 84 },
    { day: 'Day 20', score: 86 },
    { day: 'Day 25', score: 87 },
    { day: 'Day 30', score: 87 }
  ];

  const improvements = [
    {
      icon: Clock,
      title: 'Response Time',
      current: '12 min',
      target: '< 10 min',
      description: 'Respond to booking requests faster to improve your acceptance rate',
      priority: 'high'
    },
    {
      icon: Target,
      title: 'Acceptance Rate',
      current: '92%',
      target: '95%',
      description: 'Accept more booking requests to qualify for Top Provider status',
      priority: 'medium'
    },
    {
      icon: Star,
      title: 'Customer Satisfaction',
      current: '4.8/5',
      target: '4.9/5',
      description: 'Maintain excellent service quality to boost your rating',
      priority: 'low'
    }
  ];

  const topProviderCriteria = [
    { label: 'Acceptance Rate ≥ 95%', current: 92, required: 95, met: false },
    { label: 'Completion Rate ≥ 95%', current: 96, required: 95, met: true },
    { label: 'Cancellation Rate ≤ 5%', current: 4, required: 5, met: true },
    { label: 'Customer Satisfaction ≥ 4.7', current: 4.8, required: 4.7, met: true },
    { label: 'On-time Arrival ≥ 90%', current: 94, required: 90, met: true }
  ];

  const metCriteria = topProviderCriteria.filter(c => c.met).length;
  const totalCriteria = topProviderCriteria.length;

  // Styles
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom right, #f9fafb, #f0fdf4)',
    padding: '32px',
    paddingBottom: '32px'
  };

  const maxWidthContainerStyle: React.CSSProperties = {
    maxWidth: '1280px',
    margin: '0 auto'
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: '40px'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '12px',
    letterSpacing: '-0.025em'
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '18px',
    color: '#6b7280'
  };

  const cardStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #f3f4f6',
    padding: '32px',
    transition: 'box-shadow 0.2s',
    cursor: 'default'
  };

  const cardHoverStyle: React.CSSProperties = {
    ...cardStyle,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const accentBarStyle: React.CSSProperties = {
    height: '4px',
    width: '32px',
    background: '#00BF63',
    borderRadius: '4px'
  };

  // Top row grid
  const topRowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '32px',
    marginBottom: '32px'
  };

  // Metrics grid (6 cards, 3 columns)
  const metricsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    marginBottom: '32px'
  };

  // Third row (2 columns)
  const twoColGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '32px',
    marginBottom: '32px'
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return '#00BF63';
    if (score >= 75) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div style={containerStyle}>
      <div style={maxWidthContainerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h1 style={titleStyle}>Performance Insights</h1>
          <p style={subtitleStyle}>Track your performance metrics and progress toward Top Provider status</p>
        </div>

        {/* Top Row: Performance Score */}
        <div style={topRowStyle}>
          {/* Performance Score Card */}
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>
              <span>Performance Score</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px', flex: 1, padding: '16px 0' }}>
              <div style={{ 
                width: '260px', 
                height: '260px', 
                borderRadius: '50%', 
                background: `conic-gradient(${getScoreColor(performanceScore)} ${performanceScore * 3.6}deg, #f3f4f6 0deg)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <div style={{
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}>
                  <div style={{ fontSize: '64px', fontWeight: 'bold', color: getScoreColor(performanceScore), lineHeight: 1 }}>
                    {performanceScore}
                  </div>
                  <div style={{ fontSize: '15px', color: '#6b7280', fontWeight: '600', marginTop: '6px' }}>out of 100</div>
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: getScoreColor(performanceScore), marginBottom: '4px' }}>
                  {getScoreLabel(performanceScore)}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Overall Performance</div>
              </div>
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>
              <span>Quick Summary</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'linear-gradient(to right, #f0fdf4, transparent)', borderRadius: '12px', border: '1px solid #dcfce7' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: '#00BF63', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <CheckCircle style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                    Completion Rate
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>{metrics.completionRate}%</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: 'linear-gradient(to bottom right, #f0fdf4, #dcfce7)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '1px solid #dcfce7',
                  flexShrink: 0
                }}>
                  <Star style={{ width: '24px', height: '24px', color: '#00BF63' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                    Customer Satisfaction
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>{metrics.customerSatisfaction}/5</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: 'linear-gradient(to bottom right, #f0fdf4, #dcfce7)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '1px solid #dcfce7',
                  flexShrink: 0
                }}>
                  <Clock style={{ width: '24px', height: '24px', color: '#00BF63' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                    Avg Response Time
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>{metrics.avgResponseTime}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Second Row: Key Metrics Grid (6 cards) */}
        <div style={metricsGridStyle}>
          {/* Acceptance Rate */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                background: 'linear-gradient(to bottom right, #f0fdf4, #dcfce7)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1px solid #dcfce7',
                flexShrink: 0
              }}>
                <CheckCircle style={{ width: '24px', height: '24px', color: '#00BF63' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Acceptance Rate
                </div>
              </div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>{metrics.acceptanceRate}%</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp style={{ width: '16px', height: '16px', color: '#00BF63' }} />
              <span style={{ fontSize: '14px', color: '#059669', fontWeight: '600' }}>+3% vs last month</span>
            </div>
          </div>

          {/* Completion Rate */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                background: 'linear-gradient(to bottom right, #f0fdf4, #dcfce7)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1px solid #dcfce7',
                flexShrink: 0
              }}>
                <Target style={{ width: '24px', height: '24px', color: '#00BF63' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Completion Rate
                </div>
              </div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>{metrics.completionRate}%</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp style={{ width: '16px', height: '16px', color: '#00BF63' }} />
              <span style={{ fontSize: '14px', color: '#059669', fontWeight: '600' }}>+1% vs last month</span>
            </div>
          </div>

          {/* Cancellation Rate */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                background: 'linear-gradient(to bottom right, #fef2f2, #fee2e2)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1px solid #fee2e2',
                flexShrink: 0
              }}>
                <XCircle style={{ width: '24px', height: '24px', color: '#ef4444' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Cancellation Rate
                </div>
              </div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>{metrics.cancellationRate}%</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingDown style={{ width: '16px', height: '16px', color: '#00BF63' }} />
              <span style={{ fontSize: '14px', color: '#059669', fontWeight: '600' }}>-1% vs last month</span>
            </div>
          </div>

          {/* Average Response Time */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                background: 'linear-gradient(to bottom right, #f0fdf4, #dcfce7)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1px solid #dcfce7',
                flexShrink: 0
              }}>
                <Clock style={{ width: '24px', height: '24px', color: '#00BF63' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Response Time
                </div>
              </div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>{metrics.avgResponseTime}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingDown style={{ width: '16px', height: '16px', color: '#00BF63' }} />
              <span style={{ fontSize: '14px', color: '#059669', fontWeight: '600' }}>-2 min faster</span>
            </div>
          </div>

          {/* Customer Satisfaction */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                background: 'linear-gradient(to bottom right, #fffbeb, #fef3c7)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1px solid #fef3c7',
                flexShrink: 0
              }}>
                <Star style={{ width: '24px', height: '24px', color: '#f59e0b' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Customer Satisfaction
                </div>
              </div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>{metrics.customerSatisfaction}/5</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star style={{ width: '16px', height: '16px', color: '#f59e0b', fill: '#f59e0b' }} />
              <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>126 reviews</span>
            </div>
          </div>

          {/* On-time Arrival Rate */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                background: 'linear-gradient(to bottom right, #f0fdf4, #dcfce7)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1px solid #dcfce7',
                flexShrink: 0
              }}>
                <Award style={{ width: '24px', height: '24px', color: '#00BF63' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  On-time Arrival
                </div>
              </div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>{metrics.onTimeArrivalRate}%</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp style={{ width: '16px', height: '16px', color: '#00BF63' }} />
              <span style={{ fontSize: '14px', color: '#059669', fontWeight: '600' }}>+2% vs last month</span>
            </div>
          </div>
        </div>

        {/* Third Row: Comparison & Trends */}
        <div style={twoColGridStyle}>
          {/* Comparison to Category Average */}
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>
              <BarChart3 style={{ width: '24px', height: '24px', color: '#00BF63' }} />
              <span>Comparison to Category Average</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Acceptance Rate Comparison */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Acceptance Rate</span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>{metrics.acceptanceRate}% vs {categoryAverage.acceptanceRate}%</span>
                </div>
                <div style={{ position: 'relative', height: '32px', background: '#f3f4f6', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ 
                    position: 'absolute', 
                    left: 0, 
                    top: 0, 
                    bottom: 0, 
                    width: `${categoryAverage.acceptanceRate}%`, 
                    background: '#d1d5db', 
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '8px'
                  }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Avg</span>
                  </div>
                  <div style={{ 
                    position: 'absolute', 
                    left: 0, 
                    top: 0, 
                    bottom: 0, 
                    width: `${metrics.acceptanceRate}%`, 
                    background: 'linear-gradient(to right, #00BF63, #16A34A)', 
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '8px'
                  }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'white' }}>You</span>
                  </div>
                </div>
              </div>

              {/* Completion Rate Comparison */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Completion Rate</span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>{metrics.completionRate}% vs {categoryAverage.completionRate}%</span>
                </div>
                <div style={{ position: 'relative', height: '32px', background: '#f3f4f6', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ 
                    position: 'absolute', 
                    left: 0, 
                    top: 0, 
                    bottom: 0, 
                    width: `${categoryAverage.completionRate}%`, 
                    background: '#d1d5db', 
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '8px'
                  }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Avg</span>
                  </div>
                  <div style={{ 
                    position: 'absolute', 
                    left: 0, 
                    top: 0, 
                    bottom: 0, 
                    width: `${metrics.completionRate}%`, 
                    background: 'linear-gradient(to right, #00BF63, #16A34A)', 
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '8px'
                  }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'white' }}>You</span>
                  </div>
                </div>
              </div>

              {/* Customer Satisfaction Comparison */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Customer Satisfaction</span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>{metrics.customerSatisfaction}/5 vs {categoryAverage.customerSatisfaction}/5</span>
                </div>
                <div style={{ position: 'relative', height: '32px', background: '#f3f4f6', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ 
                    position: 'absolute', 
                    left: 0, 
                    top: 0, 
                    bottom: 0, 
                    width: `${(categoryAverage.customerSatisfaction / 5) * 100}%`, 
                    background: '#d1d5db', 
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '8px'
                  }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Avg</span>
                  </div>
                  <div style={{ 
                    position: 'absolute', 
                    left: 0, 
                    top: 0, 
                    bottom: 0, 
                    width: `${(metrics.customerSatisfaction / 5) * 100}%`, 
                    background: 'linear-gradient(to right, #00BF63, #16A34A)', 
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '8px'
                  }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'white' }}>You</span>
                  </div>
                </div>
              </div>

              {/* On-time Arrival Comparison */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>On-time Arrival</span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>{metrics.onTimeArrivalRate}% vs {categoryAverage.onTimeArrivalRate}%</span>
                </div>
                <div style={{ position: 'relative', height: '32px', background: '#f3f4f6', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ 
                    position: 'absolute', 
                    left: 0, 
                    top: '0', 
                    bottom: '0', 
                    width: `${categoryAverage.onTimeArrivalRate}%`, 
                    background: '#d1d5db', 
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '8px'
                  }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Avg</span>
                  </div>
                  <div style={{ 
                    position: 'absolute', 
                    left: 0, 
                    top: '0', 
                    bottom: '0', 
                    width: `${metrics.onTimeArrivalRate}%`, 
                    background: 'linear-gradient(to right, #00BF63, #16A34A)', 
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '8px'
                  }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'white' }}>You</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trends Graph */}
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>
              <TrendingUp style={{ width: '24px', height: '24px', color: '#00BF63' }} />
              <span>Performance Trends (Last 30 Days)</span>
            </div>
            <div style={{ position: 'relative', height: '280px' }}>
              {/* Y-axis labels */}
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 40, width: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingRight: '8px' }}>
                <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>100</span>
                <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>90</span>
                <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>80</span>
                <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>70</span>
                <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>60</span>
              </div>
              
              {/* Chart area */}
              <div style={{ position: 'absolute', left: '40px', right: 0, top: 0, bottom: 40 }}>
                {/* Grid lines */}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  {[0, 1, 2, 3, 4].map(i => (
                    <div key={i} style={{ height: '1px', background: '#f3f4f6' }}></div>
                  ))}
                </div>
                
                {/* Line chart */}
                <svg style={{ width: '100%', height: '100%' }} viewBox="0 0 600 240" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#00BF63', stopOpacity: 0.3 }} />
                      <stop offset="100%" style={{ stopColor: '#00BF63', stopOpacity: 0 }} />
                    </linearGradient>
                  </defs>
                  
                  {/* Area under line */}
                  <path
                    d={`M 0 ${240 - ((trendsData[0].score - 60) / 40 * 240)} ${trendsData.map((d, i) => `L ${(i / (trendsData.length - 1)) * 600} ${240 - ((d.score - 60) / 40 * 240)}`).join(' ')} L 600 240 L 0 240 Z`}
                    fill="url(#lineGradient)"
                  />
                  
                  {/* Line */}
                  <path
                    d={`M 0 ${240 - ((trendsData[0].score - 60) / 40 * 240)} ${trendsData.map((d, i) => `L ${(i / (trendsData.length - 1)) * 600} ${240 - ((d.score - 60) / 40 * 240)}`).join(' ')}`}
                    fill="none"
                    stroke="#00BF63"
                    strokeWidth="3"
                  />
                  
                  {/* Data points */}
                  {trendsData.map((d, i) => (
                    <circle
                      key={i}
                      cx={(i / (trendsData.length - 1)) * 600}
                      cy={240 - ((d.score - 60) / 40 * 240)}
                      r="5"
                      fill="white"
                      stroke="#00BF63"
                      strokeWidth="3"
                    />
                  ))}
                </svg>
              </div>
              
              {/* X-axis labels */}
              <div style={{ position: 'absolute', left: '40px', right: 0, bottom: 0, height: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {trendsData.map((d, i) => (
                  <span key={i} style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>{d.day}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Fourth Row: Areas for Improvement */}
        <div style={{ ...cardStyle, marginBottom: '32px' }}>
          <div style={sectionTitleStyle}>
            <Target style={{ width: '24px', height: '24px', color: '#00BF63' }} />
            <span>Areas for Improvement</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {improvements.map((item, index) => {
              const Icon = item.icon;
              const priorityColors = {
                high: { bg: '#fef2f2', border: '#fee2e2', text: '#dc2626' },
                medium: { bg: '#fffbeb', border: '#fef3c7', text: '#d97706' },
                low: { bg: '#f0fdf4', border: '#dcfce7', text: '#16a34a' }
              };
              const colors = priorityColors[item.priority as keyof typeof priorityColors];
              
              return (
                <div key={index} style={{ 
                  padding: '20px', 
                  background: colors.bg, 
                  borderRadius: '12px', 
                  border: `1px solid ${colors.border}` 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '10px', 
                      background: 'white', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: `2px solid ${colors.border}`,
                      flexShrink: 0
                    }}>
                      <Icon style={{ width: '20px', height: '20px', color: colors.text }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>{item.title}</div>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: colors.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {item.priority} priority
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px', lineHeight: '1.5' }}>
                    {item.description}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'white', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>Current</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>{item.current}</div>
                    </div>
                    <div style={{ fontSize: '20px', color: '#d1d5db' }}>→</div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>Target</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: colors.text }}>{item.target}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fifth Row: Top Provider Eligibility */}
        <div style={cardStyle}>
          <div style={sectionTitleStyle}>
            <Trophy style={{ width: '24px', height: '24px', color: '#00BF63' }} />
            <span>Top Provider Eligibility</span>
          </div>
          
          <div style={{ 
            padding: '24px', 
            background: 'linear-gradient(to right, #f0fdf4, #ecfdf5)', 
            borderRadius: '12px', 
            border: '2px solid #dcfce7',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '12px', 
                  background: 'linear-gradient(to bottom right, #00BF63, #16A34A)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 4px 6px rgba(0, 191, 99, 0.2)'
                }}>
                  <Trophy style={{ width: '28px', height: '28px', color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>Top Provider Badge Progress</div>
                  <div style={{ fontSize: '14px', color: '#059669', fontWeight: '600' }}>{metCriteria} of {totalCriteria} criteria met</div>
                </div>
              </div>
              <div style={{ 
                padding: '12px 20px', 
                background: metCriteria === totalCriteria ? '#00BF63' : '#f59e0b', 
                borderRadius: '8px',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                {metCriteria === totalCriteria ? 'Eligible!' : `${totalCriteria - metCriteria} to go`}
              </div>
            </div>
            
            {/* Overall progress bar */}
            <div style={{ height: '12px', background: 'white', borderRadius: '6px', overflow: 'hidden', border: '1px solid #dcfce7' }}>
              <div style={{ 
                height: '100%', 
                width: `${(metCriteria / totalCriteria) * 100}%`, 
                background: 'linear-gradient(to right, #00BF63, #16A34A)',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>

          {/* Criteria list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {topProviderCriteria.map((criterion, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                padding: '16px',
                background: criterion.met ? '#f0fdf4' : '#fef2f2',
                borderRadius: '10px',
                border: `1px solid ${criterion.met ? '#dcfce7' : '#fee2e2'}`
              }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  background: criterion.met ? '#00BF63' : '#ef4444', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {criterion.met ? (
                    <CheckCircle style={{ width: '18px', height: '18px', color: 'white' }} />
                  ) : (
                    <XCircle style={{ width: '18px', height: '18px', color: 'white' }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{criterion.label}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    Your score: <span style={{ fontWeight: 'bold', color: criterion.met ? '#059669' : '#dc2626' }}>{criterion.current}{typeof criterion.current === 'number' && criterion.current <= 100 ? '%' : ''}</span>
                  </div>
                </div>
                {!criterion.met && (
                  <div style={{ 
                    padding: '6px 12px', 
                    background: 'white', 
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#dc2626',
                    border: '1px solid #fee2e2'
                  }}>
                    Need {criterion.required - (typeof criterion.current === 'number' ? criterion.current : 0)}{typeof criterion.current === 'number' && criterion.current <= 100 ? '%' : ''} more
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}