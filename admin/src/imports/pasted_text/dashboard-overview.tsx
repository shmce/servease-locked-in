import { useState, useEffect } from "react";
import {
  DollarSign,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  Activity,
  UserCheck,
  Clock,
  ShieldAlert,
  AlertTriangle,
  CreditCard,
  MessageSquare,
  Ticket,
  UserPlus,
  FileText,
  BarChart2,
  ChevronRight,
  ClipboardList,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { useData } from "../../contexts/DataContext";
import { useNavigate } from "react-router";

export function Dashboard() {
  const navigate = useNavigate();
  const { bookings, serviceProviders, customers, payoutRequests, disputes } = useData();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Computed metrics
  const totalUsers = customers.length + serviceProviders.length;
  const activeBookings = bookings.filter(
    (b) => b.status === "In Progress" || b.status === "Confirmed"
  ).length;
  const completedBookings = bookings.filter((b) => b.status === "Completed").length;
  const cancelledBookings = bookings.filter((b) => b.status === "Cancelled").length;
  const pendingVerifications = 47;
  const pendingProviderApprovals = serviceProviders.filter(
    (sp) => sp.status === "Pending" || sp.status === "Under Review"
  ).length;
  const activeProviders = serviceProviders.filter(
    (sp) => sp.status === "Verified" || sp.status === "Active"
  ).length;
  const openDisputes = disputes.filter(
    (d) => d.status === "Open" || d.status === "Under Review"
  ).length;
  const pendingPayouts = payoutRequests.filter((p) => p.status === "Pending").length;
  const totalRevenue = bookings
    .filter((b) => b.status === "Completed" && b.paymentStatus === "Paid")
    .reduce((sum, b) => sum + b.amount, 0);

  // Formatted date
  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Chart 1: Customers Overview - Line chart showing growth over time
  const customersGrowthData = [
    { date: "Mar 1", customers: 420 },
    { date: "Mar 5", customers: 438 },
    { date: "Mar 9", customers: 452 },
    { date: "Mar 13", customers: 465 },
    { date: "Mar 17", customers: 478 },
    { date: "Mar 21", customers: 492 },
    { date: "Mar 25", customers: 505 },
    { date: "Mar 29", customers: customers.length },
  ];

  // Chart 2: Service Providers Overview - Stacked bar chart
  const providersData = [
    { week: "Week 1", active: 95, pending: 8 },
    { week: "Week 2", active: 102, pending: 10 },
    { week: "Week 3", active: 108, pending: 12 },
    { week: "Week 4", active: activeProviders, pending: pendingProviderApprovals },
  ];

  // Chart 3: Bookings Overview - Grouped bar chart
  const bookingsData = [
    { week: "Week 1", active: 145, completed: 180, cancelled: 12 },
    { week: "Week 2", active: 162, completed: 201, cancelled: 15 },
    { week: "Week 3", active: 178, completed: 225, cancelled: 18 },
    { week: "Week 4", active: activeBookings, completed: completedBookings, cancelled: cancelledBookings },
  ];

  // Chart 4: Revenue & Commission - Dual-line chart
  const revenueCommissionData = [
    { date: "Mar 1", revenue: 14500, commission: 1885 },
    { date: "Mar 3", revenue: 16200, commission: 2106 },
    { date: "Mar 5", revenue: 13800, commission: 1794 },
    { date: "Mar 7", revenue: 17800, commission: 2314 },
    { date: "Mar 9", revenue: 15500, commission: 2015 },
    { date: "Mar 11", revenue: 19200, commission: 2496 },
    { date: "Mar 13", revenue: 16800, commission: 2184 },
    { date: "Mar 15", revenue: 20500, commission: 2665 },
    { date: "Mar 17", revenue: 18800, commission: 2444 },
    { date: "Mar 19", revenue: 21700, commission: 2821 },
    { date: "Mar 21", revenue: 19600, commission: 2548 },
    { date: "Mar 23", revenue: 23400, commission: 3042 },
    { date: "Mar 25", revenue: 22100, commission: 2873 },
    { date: "Mar 27", revenue: 24800, commission: 3224 },
    { date: "Mar 29", revenue: totalRevenue, commission: Math.round(totalRevenue * 0.13) },
  ];

  // Chart 5: Issues & Operations - Bar chart
  const issuesData = [
    { category: "Pending Payouts", count: pendingPayouts, color: "#F59E0B" },
    { category: "Open Disputes", count: openDisputes, color: "#EF4444" },
  ];

  // Alert items
  const alerts = [
    {
      id: "fraud",
      label: "Fraud Alerts",
      count: 3,
      icon: ShieldAlert,
      bg: "bg-red-50",
      border: "border-red-200",
      iconColor: "text-red-600",
      dot: "bg-red-500",
    },
    {
      id: "system",
      label: "System Issues",
      count: 1,
      icon: AlertTriangle,
      bg: "bg-orange-50",
      border: "border-orange-200",
      iconColor: "text-orange-500",
      dot: "bg-orange-500",
    },
    {
      id: "failed",
      label: "Failed Payments",
      count: 8,
      icon: CreditCard,
      bg: "bg-amber-50",
      border: "border-amber-200",
      iconColor: "text-amber-600",
      dot: "bg-amber-500",
    },
    {
      id: "tickets",
      label: "High Priority Tickets",
      count: 5,
      icon: Ticket,
      bg: "bg-purple-50",
      border: "border-purple-200",
      iconColor: "text-purple-600",
      dot: "bg-purple-500",
    },
  ];

  // Recent activity feed
  const activities = [
    {
      id: 1,
      type: "provider",
      icon: UserPlus,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      title: "New provider application submitted",
      description: "CleanPro Services applied for Cleaning & Sanitation category",
      time: "2 min ago",
    },
    {
      id: 2,
      type: "verification",
      icon: CheckCircle,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      title: "Provider verification completed",
      description: "Juan's Electrical Services — KYC approved",
      time: "14 min ago",
    },
    {
      id: 3,
      type: "dispute",
      icon: MessageSquare,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      title: "Dispute resolved",
      description: "Booking #BK-2024-018 — Ruling in favor of customer",
      time: "38 min ago",
    },
    {
      id: 4,
      type: "update",
      icon: RefreshCw,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      title: "Platform update deployed",
      description: "ServEase v2.1 — Improved booking flow & payment processing",
      time: "1 hr ago",
    },
    {
      id: 5,
      type: "provider",
      icon: UserPlus,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      title: "New provider application submitted",
      description: "Maria's Catering Co. applied for Food & Events category",
      time: "2 hr ago",
    },
    {
      id: 6,
      type: "verification",
      icon: CheckCircle,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      title: "Verification approved",
      description: "TechFix Solutions — Background check cleared",
      time: "3 hr ago",
    },
    {
      id: 7,
      type: "dispute",
      icon: XCircle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      title: "Dispute escalated",
      description: "Booking #BK-2024-011 — Escalated to senior review",
      time: "4 hr ago",
    },
    {
      id: 8,
      type: "update",
      icon: FileText,
      iconBg: "bg-gray-100",
      iconColor: "text-gray-600",
      title: "Scheduled maintenance complete",
      description: "Database optimization finished — All systems operational",
      time: "6 hr ago",
    },
  ];

  // Quick actions
  const quickActions = [
    {
      label: "Verify Provider",
      description: "Review pending KYC",
      icon: UserCheck,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      action: () => navigate("/approval-queue"),
      count: pendingVerifications,
    },
    {
      label: "Review Dispute",
      description: "Open cases",
      icon: MessageSquare,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      action: () => navigate("/disputes-resolutions"),
      count: openDisputes,
    },
    {
      label: "Approve Payouts",
      description: "Pending requests",
      icon: TrendingUp,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      action: () => navigate("/payout-requests"),
      count: pendingPayouts,
    },
    {
      label: "Process Refunds",
      description: "Refund management",
      icon: RotateCcw,
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
      action: () => navigate("/refund-management"),
    },
    {
      label: "View Reports",
      description: "Analytics & insights",
      icon: BarChart2,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      action: () => navigate("/reports-insights"),
    },
    {
      label: "Manage Users",
      description: "Customers & providers",
      icon: Users,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      action: () => navigate("/customers"),
      count: totalUsers,
    },
  ];

  return (
    <div className="space-y-7">
      {/* ── Welcome Header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">{formattedDate}</p>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, Admin 👋</h1>
          <p className="text-gray-500 mt-1">
            Here's what's happening on ServEase today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="text-gray-600 border-gray-200 gap-2"
            onClick={() => navigate("/reports-insights")}
          >
            <BarChart2 className="w-4 h-4" />
            View Reports
          </Button>
          <Button
            size="sm"
            className="bg-[#16A34A] hover:bg-[#15803D] text-white gap-2"
            onClick={() => navigate("/approval-queue")}
          >
            <ClipboardList className="w-4 h-4" />
            Review Queue ({pendingVerifications})
          </Button>
        </div>
      </div>

      {/* ── Alert Strip ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-center gap-4 p-4 rounded-xl border ${alert.bg} ${alert.border} cursor-pointer group hover:shadow-md transition-all`}
          >
            <div className="relative flex-shrink-0">
              <div className={`p-2.5 rounded-lg bg-white shadow-sm`}>
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

      {/* ── 5 Main Charts Section ─────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Platform Overview</h2>

        <div className="space-y-6">
          {/* Chart 1: Customers Overview */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-base font-semibold text-gray-900">
                    Customers Overview
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Total customer growth over time</p>
                </div>
                <Badge className="bg-blue-50 text-blue-700 border-0">
                  {customers.length.toLocaleString()} Total Customers
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={customersGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280" 
                    tick={{ fontSize: 13 }} 
                    axisLine={false} 
                    tickLine={false}
                    label={{ value: 'Date', position: 'insideBottom', offset: -8, style: { fontSize: 13, fill: '#6b7280', fontWeight: 500 } }}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    tick={{ fontSize: 13 }} 
                    axisLine={false} 
                    tickLine={false}
                    label={{ value: 'Number of Customers', angle: -90, position: 'insideLeft', style: { fontSize: 13, fill: '#6b7280', fontWeight: 500 } }}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: "#fff", 
                      border: "1px solid #e5e7eb", 
                      borderRadius: "8px", 
                      fontSize: "14px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      padding: "12px"
                    }}
                    formatter={(value: number) => [value.toLocaleString(), "Customers"]}
                    labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="customers" 
                    stroke="#16A34A" 
                    strokeWidth={3} 
                    dot={{ fill: "#16A34A", r: 5, strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 7, strokeWidth: 2 }}
                    name="Customers"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 2: Service Providers Overview */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-base font-semibold text-gray-900">
                    Service Providers Overview
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Active providers vs pending approvals</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-50 text-emerald-700 border-0">
                    {activeProviders} Active
                  </Badge>
                  <Badge className="bg-orange-50 text-orange-700 border-0">
                    {pendingProviderApprovals} Pending
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={providersData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis 
                    dataKey="week" 
                    stroke="#6b7280" 
                    tick={{ fontSize: 13 }} 
                    axisLine={false} 
                    tickLine={false}
                    label={{ value: 'Time Period', position: 'insideBottom', offset: -8, style: { fontSize: 13, fill: '#6b7280', fontWeight: 500 } }}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    tick={{ fontSize: 13 }} 
                    axisLine={false} 
                    tickLine={false}
                    label={{ value: 'Number of Providers', angle: -90, position: 'insideLeft', style: { fontSize: 13, fill: '#6b7280', fontWeight: 500 } }}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: "#fff", 
                      border: "1px solid #e5e7eb", 
                      borderRadius: "8px", 
                      fontSize: "14px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      padding: "12px"
                    }}
                    cursor={{ fill: 'rgba(229, 231, 235, 0.3)' }}
                    labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                  />
                  <Legend 
                    iconType="circle" 
                    iconSize={10} 
                    wrapperStyle={{ fontSize: "14px", paddingTop: "20px", fontWeight: 500 }}
                  />
                  <Bar 
                    dataKey="active" 
                    stackId="a" 
                    fill="#16A34A" 
                    radius={[0, 0, 0, 0]} 
                    name="Active Providers"
                  />
                  <Bar 
                    dataKey="pending" 
                    stackId="a" 
                    fill="#F59E0B" 
                    radius={[6, 6, 0, 0]} 
                    name="Pending Approvals"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 3: Bookings Overview */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-base font-semibold text-gray-900">
                    Bookings Overview
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Active, completed, and cancelled bookings</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-blue-50 text-blue-700 border-0">
                    {activeBookings} Active
                  </Badge>
                  <Badge className="bg-emerald-50 text-emerald-700 border-0">
                    {completedBookings} Completed
                  </Badge>
                  <Badge className="bg-red-50 text-red-700 border-0">
                    {cancelledBookings} Cancelled
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={bookingsData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis 
                    dataKey="week" 
                    stroke="#6b7280" 
                    tick={{ fontSize: 13 }} 
                    axisLine={false} 
                    tickLine={false}
                    label={{ value: 'Time Period', position: 'insideBottom', offset: -8, style: { fontSize: 13, fill: '#6b7280', fontWeight: 500 } }}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    tick={{ fontSize: 13 }} 
                    axisLine={false} 
                    tickLine={false}
                    label={{ value: 'Number of Bookings', angle: -90, position: 'insideLeft', style: { fontSize: 13, fill: '#6b7280', fontWeight: 500 } }}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: "#fff", 
                      border: "1px solid #e5e7eb", 
                      borderRadius: "8px", 
                      fontSize: "14px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      padding: "12px"
                    }}
                    cursor={{ fill: 'rgba(229, 231, 235, 0.3)' }}
                    labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                  />
                  <Legend 
                    iconType="circle" 
                    iconSize={10} 
                    wrapperStyle={{ fontSize: "14px", paddingTop: "20px", fontWeight: 500 }}
                  />
                  <Bar 
                    dataKey="active" 
                    fill="#3B82F6" 
                    radius={[6, 6, 0, 0]} 
                    name="Active Bookings"
                  />
                  <Bar 
                    dataKey="completed" 
                    fill="#16A34A" 
                    radius={[6, 6, 0, 0]} 
                    name="Completed Bookings"
                  />
                  <Bar 
                    dataKey="cancelled" 
                    fill="#EF4444" 
                    radius={[6, 6, 0, 0]} 
                    name="Cancelled Bookings"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 4: Revenue & Commission */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-base font-semibold text-gray-900">
                    Revenue & Commission
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Total revenue and platform commission over time</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-emerald-50 text-emerald-700 border-0">
                    ₱{totalRevenue.toLocaleString()} Revenue
                  </Badge>
                  <Badge className="bg-blue-50 text-blue-700 border-0">
                    ₱{Math.round(totalRevenue * 0.13).toLocaleString()} Commission
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={revenueCommissionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280" 
                    tick={{ fontSize: 13 }} 
                    axisLine={false} 
                    tickLine={false}
                    label={{ value: 'Date', position: 'insideBottom', offset: -8, style: { fontSize: 13, fill: '#6b7280', fontWeight: 500 } }}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    tick={{ fontSize: 13 }} 
                    axisLine={false} 
                    tickLine={false}
                    label={{ value: 'Amount (₱)', angle: -90, position: 'insideLeft', style: { fontSize: 13, fill: '#6b7280', fontWeight: 500 } }}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: "#fff", 
                      border: "1px solid #e5e7eb", 
                      borderRadius: "8px", 
                      fontSize: "14px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      padding: "12px"
                    }}
                    formatter={(value: number, name: string) => [
                      `₱${value.toLocaleString()}`, 
                      name === "revenue" ? "Revenue" : "Commission"
                    ]}
                    labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                  />
                  <Legend 
                    iconType="circle" 
                    iconSize={10} 
                    wrapperStyle={{ fontSize: "14px", paddingTop: "20px", fontWeight: 500 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#16A34A" 
                    strokeWidth={3} 
                    dot={{ fill: "#16A34A", r: 4, strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                    name="Revenue"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="commission" 
                    stroke="#3B82F6" 
                    strokeWidth={3} 
                    dot={{ fill: "#3B82F6", r: 4, strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                    name="Commission"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 5: Issues & Operations */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-base font-semibold text-gray-900">
                    Issues & Operations
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Pending payouts and open disputes requiring attention</p>
                </div>
                <Badge className="bg-orange-50 text-orange-700 border-0">
                  {pendingPayouts + openDisputes} Total Items
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={issuesData} layout="vertical" barSize={60}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                  <XAxis 
                    type="number" 
                    stroke="#6b7280" 
                    tick={{ fontSize: 13 }} 
                    axisLine={false} 
                    tickLine={false}
                    label={{ value: 'Count', position: 'insideBottom', offset: -8, style: { fontSize: 13, fill: '#6b7280', fontWeight: 500 } }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="category" 
                    stroke="#6b7280" 
                    tick={{ fontSize: 14 }} 
                    axisLine={false} 
                    tickLine={false}
                    width={160}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: "#fff", 
                      border: "1px solid #e5e7eb", 
                      borderRadius: "8px", 
                      fontSize: "14px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      padding: "12px"
                    }}
                    cursor={{ fill: 'rgba(229, 231, 235, 0.3)' }}
                    formatter={(value: number) => [value, "Count"]}
                    labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                  />
                  <Bar 
                    dataKey="count" 
                    radius={[0, 6, 6, 0]}
                    label={{ 
                      position: 'right', 
                      fontSize: 14, 
                      fontWeight: 600,
                      fill: '#374151'
                    }}
                  >
                    {issuesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Bottom Section: Activity Feed + Quick Actions ───────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Recent Activity Feed */}
        <div className="xl:col-span-2">
          <Card className="border border-gray-200 h-full">
            <CardHeader className="pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold text-gray-800">Recent Activity</CardTitle>
                  <p className="text-xs text-gray-400 mt-0.5">Latest platform events</p>
                </div>
                <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-[#16A34A] gap-1">
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-y-auto max-h-[420px] divide-y divide-gray-50">
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

        {/* Quick Actions Panel */}
        <div>
          <Card className="border border-gray-200 h-full">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-sm font-semibold text-gray-800">Quick Actions</CardTitle>
              <p className="text-xs text-gray-400 mt-0.5">Common admin tasks</p>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={action.action}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all group border border-transparent hover:border-gray-200"
                  >
                    <div className={`flex-shrink-0 p-2.5 rounded-lg ${action.iconBg}`}>
                      <action.icon className={`w-4 h-4 ${action.iconColor}`} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-[#16A34A] transition-colors">
                        {action.label}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{action.description}</p>
                    </div>
                    {action.count !== undefined && (
                      <Badge className="bg-gray-100 text-gray-700 border-0 flex-shrink-0">
                        {action.count}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
