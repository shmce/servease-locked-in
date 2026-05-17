import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { TrendingUp, Users, ShoppingCart, DollarSign } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
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
import { useAdminGatewayData } from "../../hooks/useAdminGatewayData";

const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

function monthKey(value: Date) {
  return value.toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

function lastMonths(count: number) {
  const months: string[] = [];
  const cursor = new Date();
  cursor.setDate(1);
  cursor.setHours(0, 0, 0, 0);

  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const date = new Date(cursor);
    date.setMonth(cursor.getMonth() - offset);
    months.push(monthKey(date));
  }

  return months;
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[300px] items-center justify-center text-sm text-gray-500">
      {message}
    </div>
  );
}

export function Analytics() {
  const adminGateway = useAdminGatewayData();
  const {
    adminUsers,
    bookingsSummary,
    categories,
    payments,
    providerListings,
    services,
    summary,
  } = adminGateway;

  const paidPayments = payments.filter((payment) => payment.status === "paid");
  const totalRevenue = paidPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const avgOrderValue =
    paidPayments.length > 0 ? Math.round(totalRevenue / paidPayments.length) : 0;
  const bookingVolume = bookingsSummary?.totalCount ?? summary.totalBookings;

  const stats = [
    {
      title: "Total Users",
      value: summary.totalUsers.toLocaleString(),
      change: `${summary.newUsersThisMonth.toLocaleString()} new this month`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Booking Volume",
      value: bookingVolume.toLocaleString(),
      change: `${(bookingsSummary?.recentCount ?? 0).toLocaleString()} recent bookings`,
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Paid Revenue",
      value: `₱${totalRevenue.toLocaleString()}`,
      change: `₱${summary.platformFees.toLocaleString()} platform fees`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Avg Order Value",
      value: `₱${avgOrderValue.toLocaleString()}`,
      change: `${paidPayments.length.toLocaleString()} paid payments`,
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const userGrowth = useMemo(() => {
    const months = lastMonths(6);
    const usersByMonth = new Map(
      months.map((month) => [month, { month, users: 0, active: 0 }]),
    );

    adminUsers.forEach((user) => {
      if (!user.createdAt) return;
      const key = monthKey(new Date(user.createdAt));
      const bucket = usersByMonth.get(key);
      if (!bucket) return;
      bucket.users += 1;
      if (user.status === "active") {
        bucket.active += 1;
      }
    });

    return Array.from(usersByMonth.values());
  }, [adminUsers]);

  const bookingDistribution = useMemo(() => {
    const byStatus = bookingsSummary?.byStatus;
    if (!byStatus) return [];

    return [
      { name: "Completed", value: byStatus.completed, color: "#10b981" },
      { name: "Confirmed", value: byStatus.confirmed, color: "#3b82f6" },
      { name: "In Progress", value: byStatus.in_progress, color: "#06b6d4" },
      { name: "Pending", value: byStatus.pending, color: "#f59e0b" },
      { name: "Cancelled", value: byStatus.cancelled, color: "#ef4444" },
      { name: "Rejected", value: byStatus.rejected, color: "#8b5cf6" },
    ].filter((item) => item.value > 0);
  }, [bookingsSummary]);

  const revenueByMonth = useMemo(() => {
    const months = lastMonths(6);
    const buckets = new Map(
      months.map((month) => [
        month,
        { month, revenue: 0, commission: 0, providerPayout: 0 },
      ]),
    );

    paidPayments.forEach((payment) => {
      const occurredAt = payment.paidAt ?? payment.createdAt;
      if (!occurredAt) return;
      const bucket = buckets.get(monthKey(new Date(occurredAt)));
      if (!bucket) return;
      bucket.revenue += payment.amount;
      bucket.commission += payment.platformFee;
      bucket.providerPayout += payment.providerPayout;
    });

    return Array.from(buckets.values());
  }, [paidPayments]);

  const peakPaymentHours = useMemo(() => {
    const buckets = new Map(
      Array.from({ length: 24 }, (_, hour) => [
        hour,
        {
          hour: `${hour.toString().padStart(2, "0")}:00`,
          payments: 0,
        },
      ]),
    );

    payments.forEach((payment) => {
      const occurredAt = payment.paidAt ?? payment.createdAt;
      if (!occurredAt) return;
      const hour = new Date(occurredAt).getHours();
      const bucket = buckets.get(hour);
      if (bucket) {
        bucket.payments += 1;
      }
    });

    return Array.from(buckets.values()).filter((bucket) => bucket.payments > 0);
  }, [payments]);

  const providerCategoryDistribution = useMemo(() => {
    const serviceCategoryLookup = new Map(
      services.map((service) => [service.id, service.categoryId]),
    );
    const categoryLookup = new Map(
      categories.map((category) => [category.id, category.name]),
    );
    const counts = new Map<string, number>();

    providerListings.forEach((listing) => {
      const categoryId = listing.serviceId
        ? serviceCategoryLookup.get(listing.serviceId)
        : null;
      const categoryName = categoryId
        ? categoryLookup.get(categoryId) ?? "Uncategorized"
        : "Uncategorized";
      counts.set(categoryName, (counts.get(categoryName) ?? 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([name, value], index) => ({
        name,
        value,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [categories, providerListings, services]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
        <p className="text-gray-500 mt-1">
          Live marketplace analytics from users, bookings, payments, and providers.
        </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {userGrowth.every((item) => item.users === 0 && item.active === 0) ? (
              <EmptyChart message="No user signup history found" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={userGrowth}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                    name="New Users"
                  />
                  <Area
                    type="monotone"
                    dataKey="active"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorActive)"
                    name="Active New Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {bookingDistribution.length === 0 ? (
              <EmptyChart message="No booking status data found" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={bookingDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {bookingDistribution.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue, Commission, and Provider Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          {revenueByMonth.every(
            (item) =>
              item.revenue === 0 &&
              item.commission === 0 &&
              item.providerPayout === 0,
          ) ? (
            <EmptyChart message="No paid payment revenue found" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" tickFormatter={(value) => `₱${Number(value).toLocaleString()}`} />
                <Tooltip formatter={(value: number) => `₱${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" name="Gross Revenue" />
                <Bar dataKey="commission" fill="#10b981" name="Platform Fees" />
                <Bar dataKey="providerPayout" fill="#f59e0b" name="Provider Payouts" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Provider Listings by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {providerCategoryDistribution.length === 0 ? (
              <EmptyChart message="No provider listings found" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={providerCategoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {providerCategoryDistribution.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Activity by Hour</CardTitle>
          </CardHeader>
          <CardContent>
            {peakPaymentHours.length === 0 ? (
              <EmptyChart message="No payment activity found" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={peakPaymentHours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="hour" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="payments"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="Payments"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
