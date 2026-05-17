import { useEffect, useMemo, useState } from "react";
import {
  DollarSign,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  Activity,
  UserCheck,
  FileCheck,
  Clock,
  Star,
  Package,
  ShieldAlert,
  AlertTriangle,
  CreditCard,
  Ticket,
  UserPlus,
  FileText,
  BarChart2,
  ChevronRight,
  ClipboardList,
  RefreshCw,
  RotateCcw,
  MessageSquare,
  AlertCircle,
  Headphones,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { KPICard } from "../components/shared/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useData } from "../../contexts/DataContext";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { useAdminGatewayData } from "../../hooks/useAdminGatewayData";
import { buildDashboardLiveMetrics } from "../utils/dashboardLiveMetrics";

export function Dashboard() {
  const navigate = useNavigate();
  const { admin } = useAuth();
  const adminGateway = useAdminGatewayData();
  const {
    serviceProviders,
    customers,
    getCategoryById,
  } = useData();

  // ── Live clock ──────────────────────────────────────────────────
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // ── Computed metrics ─────────────────────────────────────────────
  const liveMetrics = buildDashboardLiveMetrics({
    bookingsSummary: adminGateway.bookingsSummary,
    payouts: adminGateway.payouts,
    disputes: adminGateway.disputes,
    usersSummary: adminGateway.usersSummary,
  });
  const {
    activeBookingsToday,
    completedBookings,
    cancelledBookings,
    pendingPayouts,
    openDisputes,
  } = liveMetrics;
  const liveCustomerCount = adminGateway.summary.usersByRole?.customer ?? customers.length;

  const totalRevenue =
    adminGateway.summary.paymentCount > 0
      ? adminGateway.summary.paidPaymentAmount
      : adminGateway.summary.bookingsRevenue;
  const commissionEarnings =
    adminGateway.summary.paymentCount > 0
      ? adminGateway.summary.platformFees
      : 0;
  const pendingApprovals = adminGateway.providerListings.filter(
    (provider) => provider.verificationStatus === "pending",
  ).length;
  const openSupportTickets = adminGateway.summary.openSupportTicketCount;
  const providerCategoryName = (categoryId: string) =>
    getCategoryById(categoryId)?.name ?? "";

  // ── Chart 1: Customers Overview — preserved exactly ─────────────
  const customerGrowthData = [
    { month: "Sep 2025", customers: 380 },
    { month: "Oct 2025", customers: 420 },
    { month: "Nov 2025", customers: 410 },
    { month: "Dec 2025", customers: 450 },
    { month: "Jan 2026", customers: 435 },
    { month: "Feb 2026", customers: 468 },
    { month: "Mar 2026", customers: liveCustomerCount },
  ];

  // ── Chart 2: Service Providers Overview — preserved exactly ──────
  const providerOverviewData = [
    {
      category: "Marketplace",
      Active: serviceProviders.filter(
        (p) => providerCategoryName(p.categoryId).includes("Marketplace") && p.status === "Active"
      ).length,
      Pending: Math.floor(pendingApprovals * 0.2),
    },
    {
      category: "Grocery",
      Active: serviceProviders.filter(
        (p) => providerCategoryName(p.categoryId).includes("Grocery") && p.status === "Active"
      ).length,
      Pending: Math.floor(pendingApprovals * 0.15),
    },
    {
      category: "Restaurant",
      Active: serviceProviders.filter(
        (p) => providerCategoryName(p.categoryId).includes("Restaurant") && p.status === "Active"
      ).length,
      Pending: Math.floor(pendingApprovals * 0.25),
    },
    {
      category: "Pharmacy",
      Active: serviceProviders.filter(
        (p) => providerCategoryName(p.categoryId).includes("Pharmacy") && p.status === "Active"
      ).length,
      Pending: Math.floor(pendingApprovals * 0.15),
    },
    {
      category: "Healthcare",
      Active: serviceProviders.filter(
        (p) => providerCategoryName(p.categoryId).includes("Healthcare") && p.status === "Active"
      ).length,
      Pending: Math.floor(pendingApprovals * 0.15),
    },
    {
      category: "Franchise",
      Active: serviceProviders.filter(
        (p) => providerCategoryName(p.categoryId).includes("Franchise") && p.status === "Active"
      ).length,
      Pending: Math.floor(pendingApprovals * 0.1),
    },
  ];

  // ── Chart 3: Bookings Overview — preserved exactly ───────────────
  const bookingsOverviewData = [
    {
      period: "This Week",
      Active: activeBookingsToday,
      Completed: completedBookings,
      Cancelled: cancelledBookings,
    },
  ];

  // ── Chart 4: Revenue & Commission — preserved exactly ────────────
  const revenueCommissionData = [
    { date: "Feb 26", revenue: 145.2, commission: 18.5 },
    { date: "Feb 27", revenue: 162.8, commission: 21.0 },
    { date: "Feb 28", revenue: 158.4, commission: 19.8 },
    { date: "Mar 1",  revenue: 178.6, commission: 23.4 },
    { date: "Mar 2",  revenue: 185.3, commission: 24.5 },
    { date: "Mar 3",  revenue: 192.7, commission: 26.1 },
    { date: "Mar 4",  revenue: totalRevenue / 1000, commission: commissionEarnings / 1000 },
  ];

  // ── Chart 5: Issues & Operations — preserved exactly ─────────────
  const issuesOperationsData = [
    { type: "Pending Payout Requests", count: pendingPayouts,  fill: "#f59e0b" },
    { type: "Open Disputes",           count: openDisputes,    fill: "#ef4444" },
  ];

  // ── Top providers — preserved exactly ───────────────────────────
  const topProviders = useMemo(() => {
    if (adminGateway.providerListings.length > 0) {
      const groupedProviders = new Map<
        string,
        {
          name: string;
          listingCount: number;
          reviewCount: number;
          ratingTotal: number;
          estimatedValue: number;
        }
      >();

      adminGateway.providerListings.forEach((listing) => {
        const current = groupedProviders.get(listing.providerId) ?? {
          name: listing.providerBusinessName ?? "Unnamed Provider",
          listingCount: 0,
          reviewCount: 0,
          ratingTotal: 0,
          estimatedValue: 0,
        };

        current.listingCount += 1;
        current.reviewCount += listing.reviewCount;
        current.ratingTotal += listing.averageRating;
        current.estimatedValue += listing.price ?? 0;
        groupedProviders.set(listing.providerId, current);
      });

      return Array.from(groupedProviders.values())
        .sort((a, b) => b.reviewCount - a.reviewCount || b.estimatedValue - a.estimatedValue)
        .slice(0, 5)
        .map((provider, index) => ({
          rank: index + 1,
          name: provider.name,
          revenue: provider.estimatedValue,
          rating: provider.ratingTotal / provider.listingCount,
          bookings: provider.reviewCount,
          metricLabel: "reviews",
          valueLabel: "listed value",
        }));
    }

    return [...serviceProviders]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5)
      .map((provider, index) => ({
        rank: index + 1,
        name: provider.businessName,
        revenue: provider.totalRevenue,
        rating: provider.rating,
        bookings: provider.totalBookings,
        metricLabel: "bookings",
        valueLabel: "revenue",
      }));
  }, [adminGateway.providerListings, serviceProviders]);

  // ── Alerts ───────────────────────────────────────────────────────
  const ops = adminGateway.summary.operationsAlerts;
  const alerts = [
    {
      id: "flagged",
      label: "Flagged Reviews",
      count: ops?.flaggedReviews ?? 0,
      icon: ShieldAlert,
      bg: "bg-red-50",
      border: "border-red-200",
      iconColor: "text-red-600",
      dot: "bg-red-500",
    },
    {
      id: "overdue",
      label: "Overdue Bookings",
      count: ops?.overdueBookings ?? 0,
      icon: AlertTriangle,
      bg: "bg-orange-50",
      border: "border-orange-200",
      iconColor: "text-orange-500",
      dot: "bg-orange-500",
    },
    {
      id: "failed",
      label: "Failed Payments",
      count: adminGateway.summary.exceptionPaymentCount,
      icon: CreditCard,
      bg: "bg-amber-50",
      border: "border-amber-200",
      iconColor: "text-amber-600",
      dot: "bg-amber-500",
    },
    {
      id: "tickets",
      label: "Open Support Tickets",
      count: ops?.openSupportTickets ?? openSupportTickets,
      icon: Ticket,
      bg: "bg-purple-50",
      border: "border-purple-200",
      iconColor: "text-purple-600",
      dot: "bg-purple-500",
    },
  ];

  // ── Activity feed ────────────────────────────────────────────────
  const activities = useMemo(() => {
    const paymentActivities = adminGateway.payments.slice(0, 4).map((payment) => ({
      id: `payment-${payment.id}`,
      icon: CreditCard,
      iconBg:
        payment.status === "paid"
          ? "bg-emerald-100"
          : payment.status === "pending"
            ? "bg-amber-100"
            : "bg-red-100",
      iconColor:
        payment.status === "paid"
          ? "text-emerald-600"
          : payment.status === "pending"
            ? "text-amber-600"
            : "text-red-600",
      title: `Payment ${payment.status}`,
      description: `${payment.id} · ₱${payment.amount.toLocaleString("en-PH")} · ${payment.paymentMethod ?? "Unknown method"}`,
      time: payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : "No date",
    }));

    const ticketActivities = adminGateway.supportTickets.slice(0, 4).map((ticket) => ({
      id: `ticket-${ticket.id}`,
      icon: Ticket,
      iconBg:
        ticket.status === "resolved" || ticket.status === "closed"
          ? "bg-gray-100"
          : "bg-blue-100",
      iconColor:
        ticket.status === "resolved" || ticket.status === "closed"
          ? "text-gray-600"
          : "text-blue-600",
      title: `Support ticket ${ticket.status.replace("_", " ")}`,
      description: ticket.subject,
      time: ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : "No date",
    }));

    const liveActivities = [...paymentActivities, ...ticketActivities];
    if (liveActivities.length > 0) {
      return liveActivities.slice(0, 8);
    }

    return [
      {
        id: "empty",
        icon: FileText,
        iconBg: "bg-gray-100",
        iconColor: "text-gray-600",
        title: "No live gateway activity yet",
        description: "Payments and support tickets will appear here when returned by the gateway.",
        time: "Now",
      },
    ];
  }, [adminGateway.payments, adminGateway.supportTickets]);

  /* ══════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-7">

      {/* ── Welcome Header ──────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">
            {formattedDate} &nbsp;·&nbsp;
            <span className="font-mono tabular-nums">{formattedTime}</span>
          </p>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {admin?.name?.split(" ")[0] || "Admin"} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Here's what's happening on ServEase today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="text-gray-600 border-gray-200 gap-2"
            onClick={() => navigate("/reports/revenue")}
          >
            <BarChart2 className="w-4 h-4" />
            View Reports
          </Button>
          <Button
            size="sm"
            className="bg-[#16A34A] hover:bg-[#15803D] text-white gap-2"
            onClick={() => navigate("/provider-applications")}
          >
            <ClipboardList className="w-4 h-4" />
            Review Queue ({pendingApprovals})
          </Button>
        </div>
      </div>

      {adminGateway.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {adminGateway.error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Gateway Payments</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {adminGateway.isLoading ? "..." : adminGateway.summary.paymentCount}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  ₱{(adminGateway.summary.totalPaymentAmount / 1000).toFixed(1)}K total
                </p>
              </div>
              <CreditCard className="w-6 h-6 text-[#16A34A]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Open Support</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {adminGateway.isLoading ? "..." : openSupportTickets}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {adminGateway.summary.supportTicketCount} total tickets
                </p>
              </div>
              <Headphones className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Catalog</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {adminGateway.isLoading
                    ? "..."
                    : `${adminGateway.summary.categoryCount}/${adminGateway.summary.serviceCount}`}
                </p>
                <p className="text-xs text-gray-400 mt-1">categories / services</p>
              </div>
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Provider Listings</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {adminGateway.isLoading
                    ? "..."
                    : adminGateway.summary.providerListingCount}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {adminGateway.summary.approvedProviderListingCount} approved
                </p>
              </div>
              <UserCheck className="w-6 h-6 text-[#16A34A]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Alerts Strip ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-center gap-4 p-4 rounded-xl border ${alert.bg} ${alert.border} cursor-pointer group hover:shadow-md transition-all`}
          >
            <div className="relative flex-shrink-0">
              <div className="p-2.5 rounded-lg bg-white shadow-sm">
                <alert.icon className={`w-5 h-5 ${alert.iconColor}`} />
              </div>
              <span
                className={`absolute -top-1.5 -right-1.5 w-2.5 h-2.5 rounded-full ${alert.dot} ring-2 ring-white animate-pulse`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 truncate">{alert.label}</p>
              <p className={`text-xl font-bold ${alert.iconColor}`}>{alert.count}</p>
            </div>
            <ChevronRight className={`w-4 h-4 ${alert.iconColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
          </div>
        ))}
      </div>

      {/* ── 5 Charts Section ────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-5">Quick Stats</h2>
        <div className="space-y-6">

          {/* Chart 1: Customers Overview — full width line chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="w-6 h-6 text-[#00BF63]" />
                Customers Overview
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">Customer growth trend over the last 7 months</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={customerGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke="#6b7280"
                    tick={{ fontSize: 13 }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#6b7280"
                    tick={{ fontSize: 13 }}
                    tickLine={false}
                    label={{ value: "Total Customers", angle: -90, position: "insideLeft", style: { fontSize: 13, fill: "#6b7280" } }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "12px 16px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value: number) => [value.toLocaleString(), "Customers"]}
                    labelStyle={{ fontWeight: 600, marginBottom: "4px" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="customers"
                    stroke="#00BF63"
                    strokeWidth={4}
                    dot={{ fill: "#00BF63", r: 5, strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 7, fill: "#00BF63", strokeWidth: 2, stroke: "#fff" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 2 & 3: Service Providers + Bookings — side by side */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* Chart 2: Service Providers Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <UserCheck className="w-6 h-6 text-[#00BF63]" />
                  Service Providers Overview
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">Active providers and pending approvals by category</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={providerOverviewData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                      dataKey="category"
                      stroke="#6b7280"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      stroke="#6b7280"
                      tick={{ fontSize: 13 }}
                      tickLine={false}
                      label={{ value: "Number of Providers", angle: -90, position: "insideLeft", style: { fontSize: 13, fill: "#6b7280" } }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        padding: "12px 16px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                      cursor={{ fill: "rgba(0, 191, 99, 0.05)" }}
                    />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="square" />
                    <Bar dataKey="Active" stackId="a" fill="#00BF63" radius={[0, 0, 0, 0]} name="Active Providers" />
                    <Bar dataKey="Pending" stackId="a" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Pending Approvals" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Chart 3: Bookings Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Activity className="w-6 h-6 text-[#00BF63]" />
                  Bookings Overview
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">Active, completed, and cancelled bookings</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={bookingsOverviewData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                      dataKey="period"
                      stroke="#6b7280"
                      tick={{ fontSize: 13 }}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#6b7280"
                      tick={{ fontSize: 13 }}
                      tickLine={false}
                      label={{ value: "Number of Bookings", angle: -90, position: "insideLeft", style: { fontSize: 13, fill: "#6b7280" } }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        padding: "12px 16px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                      cursor={{ fill: "rgba(0, 191, 99, 0.05)" }}
                    />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="square" />
                    <Bar dataKey="Active"    fill="#3b82f6" radius={[8, 8, 0, 0]} name="Active Bookings" />
                    <Bar dataKey="Completed" fill="#00BF63" radius={[8, 8, 0, 0]} name="Completed Bookings" />
                    <Bar dataKey="Cancelled" fill="#ef4444" radius={[8, 8, 0, 0]} name="Cancelled Bookings" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Chart 4 & 5: Revenue & Issues — side by side */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* Chart 4: Revenue & Commission */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <TrendingUp className="w-6 h-6 text-[#00BF63]" />
                  Revenue & Commission
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">Revenue and commission earnings over the last 7 days</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={revenueCommissionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 13 }} tickLine={false} />
                    <YAxis
                      stroke="#6b7280"
                      tick={{ fontSize: 13 }}
                      tickLine={false}
                      label={{ value: "₱ (thousands)", angle: -90, position: "insideLeft", style: { fontSize: 13, fill: "#6b7280" } }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        padding: "12px 16px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                      formatter={(value: number) => [`₱${value.toFixed(1)}K`, ""]}
                    />
                    <Legend wrapperStyle={{ paddingTop: "10px" }} iconType="line" />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#00BF63"
                      strokeWidth={4}
                      name="Total Revenue"
                      dot={{ fill: "#00BF63", r: 5, strokeWidth: 2, stroke: "#fff" }}
                      activeDot={{ r: 7, strokeWidth: 2, stroke: "#fff" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="commission"
                      stroke="#3b82f6"
                      strokeWidth={4}
                      name="Commission Earnings"
                      dot={{ fill: "#3b82f6", r: 5, strokeWidth: 2, stroke: "#fff" }}
                      activeDot={{ r: 7, strokeWidth: 2, stroke: "#fff" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Chart 5: Issues & Operations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Clock className="w-6 h-6 text-[#00BF63]" />
                  Issues & Operations
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">Pending payouts and open disputes requiring attention</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={issuesOperationsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                      dataKey="type"
                      stroke="#6b7280"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      angle={-15}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      stroke="#6b7280"
                      tick={{ fontSize: 13 }}
                      tickLine={false}
                      label={{ value: "Count", angle: -90, position: "insideLeft", style: { fontSize: 13, fill: "#6b7280" } }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        padding: "12px 16px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                      cursor={{ fill: "rgba(0, 191, 99, 0.05)" }}
                    />
                    <Bar
                      dataKey="count"
                      radius={[8, 8, 0, 0]}
                      label={{ position: "top", fontSize: 14, fontWeight: 600, fill: "#6b7280" }}
                    >
                      {issuesOperationsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Top Providers + Activity Feed ────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Top Performing Providers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base">Top Performing Providers</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                Ranked from live provider listings when available
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate("/service-providers")}>
              View All
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {topProviders.map((provider) => (
                <div
                  key={provider.rank}
                  className="flex items-center gap-4 p-3 border border-gray-100 rounded-xl hover:border-[#00BF63]/40 hover:bg-[#F0FDF4] transition-all cursor-pointer group"
                  onClick={() => navigate("/service-providers")}
                >
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#DCFCE7] flex items-center justify-center">
                    <span className="text-sm font-bold text-[#16A34A]">#{provider.rank}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate group-hover:text-[#16A34A] transition-colors">
                      {provider.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs text-gray-600">{provider.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-600">
                          {provider.bookings} {provider.metricLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#16A34A]">
                      ₱{(provider.revenue / 1000).toFixed(1)}K
                    </p>
                    <p className="text-xs text-gray-400">{provider.valueLabel}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="border border-gray-200 flex flex-col">
          <CardHeader className="pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Recent Activity</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">Latest platform events</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500 hover:text-[#16A34A] gap-1"
                onClick={() => navigate("/audit-trail")}
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="overflow-y-auto max-h-[360px] divide-y divide-gray-50">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <div className={`flex-shrink-0 p-2 rounded-lg ${activity.iconBg}`}>
                    <activity.icon className={`w-4 h-4 ${activity.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-[#16A34A] transition-colors">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{activity.description}</p>
                  </div>
                  <span className="flex-shrink-0 text-xs text-gray-400 whitespace-nowrap mt-0.5">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
