import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  DollarSign,
  TrendingUp,
  Download,
  Calendar,
  Percent,
  XCircle,
} from "lucide-react";
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
  Legend,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import {
  exportAdminRevenueCsv,
  getAdminBookingsSummary,
  listAdminManagedProviders,
  listAdminPayments,
  listAdminRefunds,
  type AdminBookingsSummaryStats,
  type AdminPaymentSummary,
  type AdminProviderSummary,
  type AdminRefundSummary,
} from "../../services/serveaseAdminApi";

const CHART_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
];

function monthKey(value: string | null) {
  if (!value) return "No date";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function startDateForRange(range: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  if (range === "last-30-days") {
    start.setDate(start.getDate() - 30);
    return start;
  }
  if (range === "last-3-months") {
    start.setMonth(start.getMonth() - 3);
    return start;
  }
  if (range === "last-6-months") {
    start.setMonth(start.getMonth() - 6);
    return start;
  }
  if (range === "last-year") {
    start.setFullYear(start.getFullYear() - 1);
    return start;
  }
  return null;
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[350px] items-center justify-center text-sm text-gray-500">
      {message}
    </div>
  );
}

export function RevenueReports() {
  const { accessToken } = useAuth();
  const [dateRange, setDateRange] = useState("last-6-months");
  const [bookingsSummary, setBookingsSummary] = useState<AdminBookingsSummaryStats | null>(null);
  const [payments, setPayments] = useState<AdminPaymentSummary[]>([]);
  const [refunds, setRefunds] = useState<AdminRefundSummary[]>([]);
  const [providers, setProviders] = useState<AdminProviderSummary[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    Promise.all([
      getAdminBookingsSummary(accessToken).catch(() => null),
      listAdminPayments(accessToken).catch(() => [] as AdminPaymentSummary[]),
      listAdminRefunds(accessToken).catch(() => [] as AdminRefundSummary[]),
      listAdminManagedProviders(accessToken).catch(() => [] as AdminProviderSummary[]),
    ]).then(([summary, pays, refs, providerRows]) => {
      setBookingsSummary(summary);
      setPayments(pays);
      setRefunds(refs);
      setProviders(providerRows);
    });
  }, [accessToken]);

  const filteredPayments = useMemo(() => {
    const startDate = startDateForRange(dateRange);
    if (!startDate) return payments;
    return payments.filter((payment) => {
      const occurredAt = payment.paidAt ?? payment.createdAt;
      return occurredAt && new Date(occurredAt).getTime() >= startDate.getTime();
    });
  }, [dateRange, payments]);

  const paidPayments = useMemo(
    () => filteredPayments.filter((payment) => payment.status === "paid"),
    [filteredPayments],
  );

  const totalRevenueAllTime = paidPayments.reduce((s, p) => s + p.amount, 0);
  const commissionEarned = paidPayments.reduce((s, p) => s + p.platformFee, 0);
  const totalRefunds = refunds
    .filter((r) => r.status === "approved" || r.status === "processed")
    .reduce((s, r) => s + r.amount, 0);
  const failedPaymentRate =
    filteredPayments.length > 0
      ? (
          (filteredPayments.filter(
            (p) => p.status === "cancelled" || p.status === "refunded",
          ).length /
            filteredPayments.length) *
          100
        ).toFixed(1)
      : "0.0";

  const monthlyRevenueData = useMemo(() => {
    const buckets = new Map<
      string,
      { month: string; revenue: number; commission: number; bookings: number }
    >();

    paidPayments.forEach((payment) => {
      const month = monthKey(payment.paidAt ?? payment.createdAt);
      const bucket = buckets.get(month) ?? {
        month,
        revenue: 0,
        commission: 0,
        bookings: 0,
      };
      bucket.revenue += payment.amount;
      bucket.commission += payment.platformFee;
      bucket.bookings += 1;
      buckets.set(month, bucket);
    });

    return Array.from(buckets.values());
  }, [paidPayments]);

  const commissionByMethodData = useMemo(() => {
    const totalCommission = paidPayments.reduce(
      (sum, payment) => sum + payment.platformFee,
      0,
    );
    const buckets = new Map<
      string,
      { method: string; commission: number; percentage: number; bookings: number }
    >();

    paidPayments.forEach((payment) => {
      const method = payment.paymentMethod ?? "Unspecified";
      const bucket = buckets.get(method) ?? {
        method,
        commission: 0,
        percentage: 0,
        bookings: 0,
      };
      bucket.commission += payment.platformFee;
      bucket.bookings += 1;
      buckets.set(method, bucket);
    });

    return Array.from(buckets.values())
      .map((bucket) => ({
        ...bucket,
        percentage:
          totalCommission > 0
            ? Number(((bucket.commission / totalCommission) * 100).toFixed(1))
            : 0,
      }))
      .sort((a, b) => b.commission - a.commission);
  }, [paidPayments]);

  const topProvidersData = useMemo(() => {
    const providerLookup = new Map(providers.map((provider) => [provider.id, provider]));
    const buckets = new Map<
      string,
      { id: string; name: string; revenue: number; commission: number; bookings: number; category: string }
    >();

    paidPayments.forEach((payment) => {
      if (!payment.providerId) return;
      const provider = providerLookup.get(payment.providerId);
      const bucket = buckets.get(payment.providerId) ?? {
        id: payment.providerId,
        name:
          provider?.businessName ??
          provider?.userFullName ??
          provider?.userEmail ??
          payment.providerId,
        revenue: 0,
        commission: 0,
        bookings: 0,
        category: provider?.serviceDescription ?? provider?.serviceArea ?? "Unspecified",
      };
      bucket.revenue += payment.amount;
      bucket.commission += payment.platformFee;
      bucket.bookings += 1;
      buckets.set(payment.providerId, bucket);
    });

    return Array.from(buckets.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
  }, [paidPayments, providers]);

  const handleExportCSV = async () => {
    if (!accessToken) {
      toast.error("Sign in to export revenue reports.");
      return;
    }

    setIsExporting(true);
    try {
      const csv = await exportAdminRevenueCsv(accessToken);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ServEase_Revenue_Report_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Revenue report exported.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to export revenue report.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const stats = [
    {
      title: "Paid Revenue",
      value: `₱${(totalRevenueAllTime / 1000000).toFixed(2)}M`,
      change: `${paidPayments.length.toLocaleString()} paid payments`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Booking Revenue",
      value: `₱${((bookingsSummary?.totalRevenue ?? 0) / 1000000).toFixed(2)}M`,
      change: `${(bookingsSummary?.totalCount ?? 0).toLocaleString()} total bookings`,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Commission Earned",
      value: `₱${(commissionEarned / 1000).toFixed(0)}K`,
      change: "Gateway payment platform fees",
      icon: Percent,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Refunds / Failures",
      value: `₱${(totalRefunds / 1000).toFixed(0)}K`,
      change: `${failedPaymentRate}% exception payment rate`,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  const averageMonthlyRevenue =
    monthlyRevenueData.length > 0
      ? monthlyRevenueData.reduce((sum, m) => sum + m.revenue, 0) /
        monthlyRevenueData.length
      : 0;
  const topProvider = topProvidersData[0] ?? null;
  const mostBookingsProvider =
    topProvidersData.length > 0
      ? topProvidersData.reduce((prev, current) =>
          current.bookings > prev.bookings ? current : prev,
        )
      : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revenue Reports</h1>
          <p className="text-gray-500 mt-1">
            Gateway-backed financial analytics and payment performance insights
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[200px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-30-days">Last 30 Days</SelectItem>
              <SelectItem value="last-3-months">Last 3 Months</SelectItem>
              <SelectItem value="last-6-months">Last 6 Months</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
              <SelectItem value="all-time">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => void handleExportCSV()}
            disabled={isExporting}
            className="bg-green-600 hover:bg-green-700"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? "Exporting..." : "Export to CSV"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Trend</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Paid payment revenue and platform fees over time
          </p>
        </CardHeader>
        <CardContent>
          {monthlyRevenueData.length === 0 ? (
            <EmptyChart message="No paid payment revenue found" />
          ) : (
            <>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => `₱${value.toLocaleString()}`}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      name="Paid Revenue"
                      dot={{ fill: "#3B82F6", r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="commission"
                      stroke="#10B981"
                      strokeWidth={3}
                      name="Platform Fees"
                      dot={{ fill: "#10B981", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Average Monthly Revenue</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    ₱{(averageMonthlyRevenue / 1000000).toFixed(2)}M
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Paid Bookings</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {monthlyRevenueData
                      .reduce((sum, m) => sum + m.bookings, 0)
                      .toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Platform Fees</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    ₱{(commissionEarned / 1000).toFixed(0)}K
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Commission by Payment Method</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Platform-fee distribution across gateway payment methods
            </p>
          </CardHeader>
          <CardContent>
            {commissionByMethodData.length === 0 ? (
              <EmptyChart message="No payment-method commission found" />
            ) : (
              <>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={commissionByMethodData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ method, percentage }) => `${method} ${percentage}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="commission"
                      >
                        {commissionByMethodData.map((entry, index) => (
                          <Cell key={entry.method} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => `₱${value.toLocaleString()}`}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 space-y-2">
                  {commissionByMethodData.slice(0, 4).map((method, index) => (
                    <div key={method.method} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: CHART_COLORS[index] }}
                        />
                        <span className="text-sm text-gray-700">{method.method}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        ₱{(method.commission / 1000).toFixed(0)}K
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Earning Service Providers</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Highest paid-payment revenue by provider
            </p>
          </CardHeader>
          <CardContent>
            {topProvidersData.length === 0 ? (
              <EmptyChart message="No provider revenue found" />
            ) : (
              <>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProvidersData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip
                        formatter={(value: number) => `₱${value.toLocaleString()}`}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Highest Revenue</p>
                      <p className="font-semibold text-gray-900 mt-1">
                        {topProvider?.name ?? "N/A"}
                      </p>
                      <p className="text-sm text-blue-600">
                        ₱{(topProvider?.revenue ?? 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Most Paid Bookings</p>
                      <p className="font-semibold text-gray-900 mt-1">
                        {mostBookingsProvider?.name ?? "N/A"}
                      </p>
                      <p className="text-sm text-green-600">
                        {(mostBookingsProvider?.bookings ?? 0).toLocaleString()} bookings
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commission Breakdown by Payment Method</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Detailed platform fee and paid-booking statistics per method
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Payment Method
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Commission
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Percentage
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Paid Bookings
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Avg per Booking
                  </th>
                </tr>
              </thead>
              <tbody>
                {commissionByMethodData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-gray-500">
                      No payment-method commission found
                    </td>
                  </tr>
                ) : (
                  commissionByMethodData.map((method, index) => (
                    <tr key={method.method} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                          />
                          <span className="font-medium text-gray-900">{method.method}</span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4 font-bold text-blue-600">
                        ₱{method.commission.toLocaleString()}
                      </td>
                      <td className="text-right py-3 px-4 text-gray-700">{method.percentage}%</td>
                      <td className="text-right py-3 px-4 text-gray-700">{method.bookings}</td>
                      <td className="text-right py-3 px-4 font-semibold text-green-600">
                        ₱{Math.round(method.commission / Math.max(method.bookings, 1)).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {commissionByMethodData.length > 0 && (
                <tfoot>
                  <tr className="bg-gray-50 font-bold">
                    <td className="py-3 px-4 text-gray-900">Total</td>
                    <td className="text-right py-3 px-4 text-blue-600">
                      ₱{commissionByMethodData
                        .reduce((sum, c) => sum + c.commission, 0)
                        .toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-900">100%</td>
                    <td className="text-right py-3 px-4 text-gray-900">
                      {commissionByMethodData.reduce((sum, c) => sum + c.bookings, 0)}
                    </td>
                    <td className="text-right py-3 px-4"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
