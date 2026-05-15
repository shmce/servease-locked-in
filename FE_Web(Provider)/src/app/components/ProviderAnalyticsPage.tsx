import { useState } from "react";
import { Fragment } from "react";
import {
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Download,
  Clock,
  MapPin,
  PieChart,
  RefreshCw,
  Target,
  ShoppingBag,
  BarChart3,
  Lightbulb,
  TrendingDown,
  Settings,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Info,
} from "lucide-react";

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#F9FAFB",
    padding: "32px",
  },
  header: {
    marginBottom: "32px",
  },
  pageTitle: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#111827",
    letterSpacing: "-0.025em",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6B7280",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
    gap: "16px",
    flexWrap: "wrap" as const,
  },
  dateSelector: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  select: {
    padding: "10px 16px",
    borderRadius: "10px",
    border: "2px solid #E5E7EB",
    fontSize: "14px",
    color: "#374151",
    outline: "none",
    backgroundColor: "white",
    cursor: "pointer",
    fontWeight: "500",
  },
  button: {
    padding: "10px 20px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    border: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  primaryButton: {
    backgroundColor: "#00BF63",
    color: "white",
    boxShadow: "0 4px 16px rgba(0, 191, 99, 0.25)",
  },
  secondaryButton: {
    backgroundColor: "white",
    color: "#6B7280",
    border: "2px solid #E5E7EB",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
    marginBottom: "32px",
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #F3F4F6",
    padding: "24px",
    transition: "all 0.3s ease",
  },
  statHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  statIconWrapper: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    fontSize: "14px",
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: "8px",
  },
  statValue: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "8px",
  },
  statChange: {
    fontSize: "13px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #F3F4F6",
    padding: "24px",
    marginBottom: "24px",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "20px",
  },
  chartPlaceholder: {
    width: "100%",
    height: "300px",
    backgroundColor: "#F3F4F6",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column" as const,
    gap: "12px",
    border: "2px dashed #D1D5DB",
  },
  chartText: {
    fontSize: "14px",
    color: "#9CA3AF",
    fontWeight: "500",
  },
  heatmapGrid: {
    display: "grid",
    gridTemplateColumns: "80px repeat(7, 1fr)",
    gap: "8px",
    marginTop: "16px",
  },
  heatmapCell: {
    padding: "12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    textAlign: "center" as const,
  },
  heatmapHeader: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#6B7280",
    padding: "8px",
    textAlign: "center" as const,
  },
  heatmapLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#6B7280",
    padding: "8px",
    textAlign: "right" as const,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  pieChartGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "32px",
    alignItems: "center",
  },
  pieChartPlaceholder: {
    width: "200px",
    height: "200px",
    margin: "0 auto",
    backgroundColor: "#F3F4F6",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px dashed #D1D5DB",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },
  legendColor: {
    width: "16px",
    height: "16px",
    borderRadius: "4px",
  },
  legendLabel: {
    fontSize: "14px",
    color: "#374151",
    flex: 1,
  },
  legendValue: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#111827",
  },
  twoColumnGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "24px",
  },
  mapPlaceholder: {
    width: "100%",
    height: "350px",
    backgroundColor: "#F3F4F6",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column" as const,
    gap: "12px",
    border: "2px dashed #D1D5DB",
    marginTop: "16px",
  },
  metricRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 0",
    borderBottom: "1px solid #F3F4F6",
  },
  metricLabel: {
    fontSize: "14px",
    color: "#6B7280",
    fontWeight: "500",
  },
  metricValue: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#111827",
  },
  progressBar: {
    width: "100%",
    height: "8px",
    backgroundColor: "#E5E7EB",
    borderRadius: "4px",
    overflow: "hidden",
    marginTop: "8px",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#00BF63",
    borderRadius: "4px",
    transition: "width 0.5s ease",
  },
  insightsPanel: {
    backgroundColor: "#ECFDF5",
    borderRadius: "16px",
    border: "2px solid #A7F3D0",
    padding: "24px",
    marginBottom: "32px",
    boxShadow: "0 4px 12px rgba(0, 191, 99, 0.1)",
  },
  insightsTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#065F46",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  insightsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "16px",
  },
  insightItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "12px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #D1FAE5",
  },
  insightIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    backgroundColor: "#D1FAE5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  insightText: {
    fontSize: "13px",
    color: "#065F46",
    fontWeight: "500",
    lineHeight: "1.5",
  },
  comparisonBadge: {
    fontSize: "11px",
    fontWeight: "600",
    padding: "4px 8px",
    borderRadius: "6px",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    marginTop: "4px",
  },
  heatmapLegend: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginTop: "20px",
    padding: "16px",
    backgroundColor: "#F9FAFB",
    borderRadius: "10px",
  },
  heatmapLegendItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  heatmapLegendBox: {
    width: "24px",
    height: "24px",
    borderRadius: "6px",
  },
  heatmapLegendLabel: {
    fontSize: "12px",
    color: "#6B7280",
    fontWeight: "500",
  },
  actionButton: {
    padding: "8px 16px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: "2px solid #E5E7EB",
    backgroundColor: "white",
    color: "#374151",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  personalizeText: {
    fontSize: "12px",
    color: "#00BF63",
    fontWeight: "600",
    marginTop: "8px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  enhancedStatCard: {
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  },
  statComparison: {
    fontSize: "11px",
    color: "#9CA3AF",
    marginTop: "4px",
  },
  tooltipHover: {
    position: "relative" as const,
    cursor: "pointer",
  },
  emptyState: {
    textAlign: "center" as const,
    padding: "40px 20px",
  },
  emptyStateText: {
    fontSize: "14px",
    color: "#9CA3AF",
    marginTop: "12px",
  },
};

export function ProviderAnalyticsPage() {
  const [dateRange, setDateRange] = useState("last-30-days");

  // Mock data
  const stats = [
    {
      label: "Total Bookings",
      value: "248",
      change: "+12.5%",
      isPositive: true,
      icon: ShoppingBag,
      color: "#00BF63",
      bgColor: "#D1FAE5",
    },
    {
      label: "Total Revenue",
      value: "₱324,500",
      change: "+18.2%",
      isPositive: true,
      icon: DollarSign,
      color: "#3B82F6",
      bgColor: "#DBEAFE",
    },
    {
      label: "Active Customers",
      value: "142",
      change: "+8.4%",
      isPositive: true,
      icon: Users,
      color: "#8B5CF6",
      bgColor: "#EDE9FE",
    },
    {
      label: "New Customers",
      value: "34",
      change: "+23.1%",
      isPositive: true,
      icon: TrendingUp,
      color: "#F59E0B",
      bgColor: "#FEF3C7",
    },
  ];

  const heatmapData = [
    { time: "6am-9am", values: [2, 3, 4, 5, 6, 8, 4] },
    { time: "9am-12pm", values: [8, 10, 12, 14, 15, 12, 9] },
    { time: "12pm-3pm", values: [6, 7, 8, 9, 10, 11, 7] },
    { time: "3pm-6pm", values: [12, 14, 15, 16, 18, 15, 12] },
    { time: "6pm-9pm", values: [10, 12, 14, 15, 16, 14, 11] },
  ];

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const getHeatmapColor = (value: number) => {
    if (value >= 15) return { bg: "#00BF63", color: "white" };
    if (value >= 10) return { bg: "#6EE7B7", color: "#065F46" };
    if (value >= 5) return { bg: "#D1FAE5", color: "#065F46" };
    return { bg: "#F3F4F6", color: "#6B7280" };
  };

  const serviceCategories = [
    { name: "Plumbing", value: 35, color: "#00BF63" },
    { name: "Electrical", value: 28, color: "#3B82F6" },
    { name: "Carpentry", value: 18, color: "#8B5CF6" },
    { name: "Painting", value: 12, color: "#F59E0B" },
    { name: "Others", value: 7, color: "#6B7280" },
  ];

  const handleExport = () => {
    // Handle export functionality
    console.log("Exporting report...");
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>Analytics</h1>
        <p style={styles.subtitle}>
          Comprehensive insights into your business performance
        </p>
      </div>

      {/* Top Bar with Date Range and Export */}
      <div style={styles.topBar}>
        <div style={styles.dateSelector}>
          <Calendar size={20} color="#6B7280" />
          <select
            style={styles.select}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="last-7-days">Last 7 Days</option>
            <option value="last-30-days">Last 30 Days</option>
            <option value="last-90-days">Last 90 Days</option>
            <option value="this-year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        <button
          style={{ ...styles.button, ...styles.primaryButton }}
          onClick={handleExport}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 6px 20px rgba(0, 191, 99, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 4px 16px rgba(0, 191, 99, 0.25)";
          }}
        >
          <Download size={16} />
          Export Report
        </button>
      </div>

      {/* Insights Panel */}
      <div style={styles.insightsPanel}>
        <div style={styles.insightsTitle}>
          <Lightbulb size={20} />
          Smart Insights
        </div>
        <div style={styles.insightsGrid}>
          <div style={styles.insightItem}>
            <div style={styles.insightIcon}>
              <TrendingUp size={16} color="#00BF63" />
            </div>
            <div style={styles.insightText}>
              Your revenue increased by <strong>18%</strong> this month compared
              to last month
            </div>
          </div>
          <div style={styles.insightItem}>
            <div style={styles.insightIcon}>
              <Clock size={16} color="#00BF63" />
            </div>
            <div style={styles.insightText}>
              Peak demand is <strong>3PM–6PM</strong> on weekdays. Consider
              adjusting your availability
            </div>
          </div>
          <div style={styles.insightItem}>
            <div style={styles.insightIcon}>
              <Info size={16} color="#00BF63" />
            </div>
            <div style={styles.insightText}>
              Low bookings on <strong>Mondays</strong>. Try offering special
              promotions
            </div>
          </div>
        </div>
      </div>

      {/* Business Overview Cards */}
      <div style={styles.statsGrid}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.isPositive ? ArrowUpRight : ArrowDownRight;
          return (
            <div
              key={index}
              style={{ ...styles.statCard, ...styles.enhancedStatCard }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 12px 24px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 2px 8px rgba(0, 0, 0, 0.08)";
              }}
            >
              <div style={styles.statHeader}>
                <div style={{ flex: 1 }}>
                  <div style={styles.statLabel}>{stat.label}</div>
                  <div style={styles.statValue}>{stat.value}</div>
                  <div
                    style={{
                      ...styles.comparisonBadge,
                      backgroundColor: stat.isPositive ? "#D1FAE5" : "#FEE2E2",
                      color: stat.isPositive ? "#065F46" : "#991B1B",
                    }}
                  >
                    <TrendIcon size={12} />
                    {stat.change} vs last month
                  </div>
                  <div style={styles.statComparison}>
                    {stat.isPositive ? "↑ Increasing" : "↓ Decreasing"}
                  </div>
                </div>
                <div
                  style={{
                    ...styles.statIconWrapper,
                    backgroundColor: stat.bgColor,
                  }}
                >
                  <Icon size={24} color={stat.color} />
                </div>
              </div>
              {index === 1 && (
                <button
                  style={styles.actionButton}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#F9FAFB";
                    e.currentTarget.style.borderColor = "#00BF63";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                    e.currentTarget.style.borderColor = "#E5E7EB";
                  }}
                >
                  <Settings size={14} />
                  Update Pricing
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Booking Trends Graph */}
      <div style={styles.card}>
        <div style={styles.sectionHeader}>
          <h2 style={{ ...styles.cardTitle, marginBottom: 0 }}>
            Booking Trends
          </h2>
          <button
            style={styles.actionButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#F9FAFB";
              e.currentTarget.style.borderColor = "#00BF63";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.borderColor = "#E5E7EB";
            }}
          >
            <Eye size={14} />
            View Bookings
          </button>
        </div>
        <div style={styles.chartPlaceholder}>
          <BarChart3 size={48} color="#9CA3AF" />
          <div style={styles.chartText}>
            Line chart showing booking trends over time
          </div>
          <div style={{ fontSize: "12px", color: "#D1D5DB" }}>
            Daily, Weekly, Monthly comparison
          </div>
        </div>
        <div style={styles.personalizeText}>
          <Target size={14} />
          Best performing day: Friday
        </div>
      </div>

      {/* Peak Hours Heatmap */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Peak Hours Heatmap</h2>
        <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "20px" }}>
          Busiest times throughout the week
        </p>

        <div style={styles.heatmapGrid}>
          {/* Header row */}
          <div style={styles.heatmapHeader}></div>
          {days.map((day) => (
            <div key={day} style={styles.heatmapHeader}>
              {day}
            </div>
          ))}

          {/* Data rows */}
          {heatmapData.map((row, rowIndex) => (
            <Fragment key={`row-${rowIndex}`}>
              <div style={styles.heatmapLabel}>
                {row.time}
              </div>
              {row.values.map((value, colIndex) => {
                const colors = getHeatmapColor(value);
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    style={{
                      ...styles.heatmapCell,
                      backgroundColor: colors.bg,
                      color: colors.color,
                    }}
                  >
                    {value}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>

        {/* Heatmap Legend */}
        <div style={styles.heatmapLegend}>
          <div style={styles.heatmapLegendItem}>
            <div
              style={{
                ...styles.heatmapLegendBox,
                backgroundColor: "#00BF63",
              }}
            />
            <div style={styles.heatmapLegendLabel}>High (15+ bookings)</div>
          </div>
          <div style={styles.heatmapLegendItem}>
            <div
              style={{
                ...styles.heatmapLegendBox,
                backgroundColor: "#6EE7B7",
              }}
            />
            <div style={styles.heatmapLegendLabel}>Medium (10-14)</div>
          </div>
          <div style={styles.heatmapLegendItem}>
            <div
              style={{
                ...styles.heatmapLegendBox,
                backgroundColor: "#D1FAE5",
              }}
            />
            <div style={styles.heatmapLegendLabel}>Low (5-9)</div>
          </div>
          <div style={styles.heatmapLegendItem}>
            <div
              style={{
                ...styles.heatmapLegendBox,
                backgroundColor: "#F3F4F6",
              }}
            />
            <div style={styles.heatmapLegendLabel}>Very Low (0-4)</div>
          </div>
        </div>

        {/* Action Button */}
        <div style={{ marginTop: "20px" }}>
          <button
            style={styles.actionButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#F9FAFB";
              e.currentTarget.style.borderColor = "#00BF63";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.borderColor = "#E5E7EB";
            }}
          >
            <Settings size={14} />
            Adjust Availability
          </button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={styles.twoColumnGrid}>
        {/* Service Category Breakdown */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Service Category Breakdown</h2>
          <div style={styles.pieChartGrid}>
            <div style={styles.pieChartPlaceholder}>
              <PieChart size={48} color="#9CA3AF" />
            </div>
            <div>
              {serviceCategories.map((category, index) => (
                <div key={index} style={styles.legendItem}>
                  <div
                    style={{
                      ...styles.legendColor,
                      backgroundColor: category.color,
                    }}
                  />
                  <div style={styles.legendLabel}>{category.name}</div>
                  <div style={styles.legendValue}>{category.value}%</div>
                </div>
              ))}
            </div>
          </div>
          <div style={styles.personalizeText}>
            <Target size={14} />
            Your top service: Plumbing (35%)
          </div>
        </div>

        {/* Key Metrics */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Key Performance Metrics</h2>

          <div>
            <div style={styles.metricRow}>
              <div>
                <div style={styles.metricLabel}>Customer Retention Rate</div>
                <div style={styles.progressBar}>
                  <div
                    style={{ ...styles.progressFill, width: "78%" }}
                  />
                </div>
              </div>
              <div style={styles.metricValue}>78%</div>
            </div>

            <div style={styles.metricRow}>
              <div>
                <div style={styles.metricLabel}>Repeat Booking Rate</div>
                <div style={styles.progressBar}>
                  <div
                    style={{ ...styles.progressFill, width: "64%" }}
                  />
                </div>
              </div>
              <div style={styles.metricValue}>64%</div>
            </div>

            <div style={styles.metricRow}>
              <div>
                <div style={styles.metricLabel}>Average Booking Value</div>
              </div>
              <div style={styles.metricValue}>₱1,308</div>
            </div>

            <div style={{ ...styles.metricRow, borderBottom: "none" }}>
              <div>
                <div style={styles.metricLabel}>Conversion Rate</div>
                <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "4px" }}>
                  Requests to confirmed bookings
                </div>
              </div>
              <div style={styles.metricValue}>72%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Geographic Distribution */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Geographic Distribution</h2>
        <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "20px" }}>
          Service locations across the region
        </p>
        <div style={styles.mapPlaceholder}>
          <MapPin size={48} color="#9CA3AF" />
          <div style={styles.chartText}>Interactive map showing service areas</div>
          <div style={{ fontSize: "12px", color: "#D1D5DB" }}>
            Heat map of booking concentration
          </div>
        </div>
      </div>
    </div>
  );
}