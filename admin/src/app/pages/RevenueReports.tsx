import { useState } from "react";
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
  TrendingDown,
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

// Monthly Revenue Data
const monthlyRevenueData = [
  { month: "Aug 2025", revenue: 1250000, commission: 125000, bookings: 456 },
  { month: "Sep 2025", revenue: 1450000, commission: 145000, bookings: 523 },
  { month: "Oct 2025", revenue: 1680000, commission: 168000, bookings: 612 },
  { month: "Nov 2025", revenue: 1820000, commission: 182000, bookings: 678 },
  { month: "Dec 2025", revenue: 2100000, commission: 210000, bookings: 789 },
  { month: "Jan 2026", revenue: 1950000, commission: 195000, bookings: 721 },
  { month: "Feb 2026", revenue: 2250000, commission: 225000, bookings: 834 },
  { month: "Mar 2026", revenue: 2450000, commission: 245000, bookings: 912 },
];

// Commission by Service Category
const commissionByCategoryData = [
  { category: "Home Maintenance & Repair", commission: 425000, percentage: 24.3, bookings: 234 },
  { category: "Beauty Wellness & Personal Care", commission: 385000, percentage: 22.0, bookings: 312 },
  { category: "Events & Entertainment", commission: 295000, percentage: 16.9, bookings: 89 },
  { category: "Pet Services", commission: 215000, percentage: 12.3, bookings: 189 },
  { category: "Health & Fitness", commission: 185000, percentage: 10.6, bookings: 145 },
  { category: "Automotive & Tech Support", commission: 125000, percentage: 7.1, bookings: 98 },
  { category: "Education & Professional Services", commission: 95000, percentage: 5.4, bookings: 67 },
  { category: "Domestic & Cleaning Services", commission: 25000, percentage: 1.4, bookings: 45 },
];

// Top Earning Service Providers
const topProvidersData = [
  { name: "HomeFixPro Manila", revenue: 516560, commission: 51656, bookings: 145, category: "Home Maintenance" },
  { name: "Glow Beauty Spa", revenue: 378250, commission: 37825, bookings: 98, category: "Beauty & Wellness" },
  { name: "Party Perfect Planners", revenue: 350000, commission: 35000, bookings: 45, category: "Events" },
  { name: "TechFix Auto Solutions", revenue: 342280, commission: 34228, bookings: 87, category: "Automotive" },
  { name: "SkillUp Training Center", revenue: 326760, commission: 32676, bookings: 56, category: "Education" },
  { name: "Crystal Clear Housekeeping", revenue: 410400, commission: 41040, bookings: 134, category: "Cleaning" },
  { name: "FitLife Wellness Center", revenue: 259260, commission: 25926, bookings: 78, category: "Health & Fitness" },
  { name: "Pawsome Pet Care", revenue: 255840, commission: 25584, bookings: 112, category: "Pet Services" },
];

const CHART_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#84CC16", // Lime
];

export function RevenueReports() {
  const [dateRange, setDateRange] = useState("last-6-months");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Calculate stats
  const totalRevenueAllTime = 14950000;
  const revenueThisMonth = 2450000;
  const commissionEarned = 245000;
  const totalRefunds = 89500;
  const failedPaymentRate = 2.3;

  const revenueGrowth = 8.9; // Percentage
  const commissionGrowth = 8.9;

  const handleExportCSV = () => {
    // Create CSV content
    let csvContent = "Revenue Report - ServEase Admin Dashboard\n\n";

    // Summary Stats
    csvContent += "Summary Statistics\n";
    csvContent += "Metric,Value\n";
    csvContent += `Total Revenue (All Time),₱${totalRevenueAllTime.toLocaleString()}\n`;
    csvContent += `Revenue This Month,₱${revenueThisMonth.toLocaleString()}\n`;
    csvContent += `Commission Earned,₱${commissionEarned.toLocaleString()}\n`;
    csvContent += `Total Refunds,₱${totalRefunds.toLocaleString()}\n`;
    csvContent += `Failed Payment Rate,${failedPaymentRate}%\n\n`;

    // Monthly Revenue
    csvContent += "Monthly Revenue Trend\n";
    csvContent += "Month,Revenue,Commission,Bookings\n";
    monthlyRevenueData.forEach((row) => {
      csvContent += `${row.month},₱${row.revenue.toLocaleString()},₱${row.commission.toLocaleString()},${
        row.bookings
      }\n`;
    });
    csvContent += "\n";

    // Commission by Category
    csvContent += "Commission by Service Category\n";
    csvContent += "Category,Commission,Percentage,Bookings\n";
    commissionByCategoryData.forEach((row) => {
      csvContent += `${row.category},₱${row.commission.toLocaleString()},${row.percentage}%,${
        row.bookings
      }\n`;
    });
    csvContent += "\n";

    // Top Providers
    csvContent += "Top Earning Service Providers\n";
    csvContent += "Provider Name,Revenue,Commission,Bookings,Category\n";
    topProvidersData.forEach((row) => {
      csvContent += `${row.name},₱${row.revenue.toLocaleString()},₱${row.commission.toLocaleString()},${
        row.bookings
      },${row.category}\n`;
    });

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `ServEase_Revenue_Report_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = [
    {
      title: "Total Revenue (All Time)",
      value: `₱${(totalRevenueAllTime / 1000000).toFixed(2)}M`,
      change: `+${revenueGrowth}% from last period`,
      trend: "up",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Revenue This Month",
      value: `₱${(revenueThisMonth / 1000000).toFixed(2)}M`,
      change: `+${commissionGrowth}% from last month`,
      trend: "up",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Commission Earned",
      value: `₱${(commissionEarned / 1000).toFixed(0)}K`,
      change: "10% platform commission",
      trend: "neutral",
      icon: Percent,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Refunds",
      value: `₱${(totalRefunds / 1000).toFixed(0)}K`,
      change: "0.6% of total revenue",
      trend: "neutral",
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revenue Reports</h1>
          <p className="text-gray-500 mt-1">
            Comprehensive financial analytics and performance insights
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
          <Button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700">
            <Download className="w-4 h-4 mr-2" />
            Export to CSV
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
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
                  <div className="flex items-center gap-1 mt-1">
                    {stat.trend === "up" && <TrendingUp className="w-3 h-3 text-green-600" />}
                    {stat.trend === "down" && <TrendingDown className="w-3 h-3 text-red-600" />}
                    <p className={`text-xs ${stat.trend === "up" ? "text-green-600" : stat.trend === "down" ? "text-red-600" : "text-gray-400"}`}>
                      {stat.change}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Trend</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Total revenue and commission earnings over time
          </p>
        </CardHeader>
        <CardContent>
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
                  name="Total Revenue"
                  dot={{ fill: "#3B82F6", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="commission"
                  stroke="#10B981"
                  strokeWidth={3}
                  name="Commission Earned"
                  dot={{ fill: "#10B981", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600">Average Monthly Revenue</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                ₱
                {(
                  monthlyRevenueData.reduce((sum, m) => sum + m.revenue, 0) /
                  monthlyRevenueData.length /
                  1000000
                ).toFixed(2)}
                M
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {monthlyRevenueData.reduce((sum, m) => sum + m.bookings, 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Growth Rate</p>
              <p className="text-2xl font-bold text-purple-600 mt-1 flex items-center justify-center gap-1">
                <TrendingUp className="w-5 h-5" />
                +{revenueGrowth}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commission Breakdown and Top Providers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commission by Service Category */}
        <Card>
          <CardHeader>
            <CardTitle>Commission by Service Category</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Revenue distribution across service categories
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={commissionByCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category.split(" ")[0]} ${percentage}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="commission"
                  >
                    {commissionByCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
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
              {commissionByCategoryData.slice(0, 4).map((category, index) => (
                <div key={category.category} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[index] }}
                    />
                    <span className="text-sm text-gray-700">{category.category}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    ₱{(category.commission / 1000).toFixed(0)}K
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Earning Service Providers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Earning Service Providers</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Highest revenue generating providers</p>
          </CardHeader>
          <CardContent>
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
                  <p className="font-semibold text-gray-900 mt-1">{topProvidersData[0].name}</p>
                  <p className="text-sm text-blue-600">
                    ₱{topProvidersData[0].revenue.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Most Bookings</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {topProvidersData.reduce((prev, current) => 
                      current.bookings > prev.bookings ? current : prev
                    ).name}
                  </p>
                  <p className="text-sm text-green-600">
                    {topProvidersData.reduce((prev, current) => 
                      current.bookings > prev.bookings ? current : prev
                    ).bookings} bookings
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Category Table */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Breakdown by Service Category</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Detailed revenue and booking statistics per category
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Service Category
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Commission
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Percentage
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Bookings
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Avg per Booking
                  </th>
                </tr>
              </thead>
              <tbody>
                {commissionByCategoryData.map((category, index) => (
                  <tr key={category.category} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: CHART_COLORS[index] }}
                        />
                        <span className="font-medium text-gray-900">{category.category}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 font-bold text-blue-600">
                      ₱{category.commission.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-700">{category.percentage}%</td>
                    <td className="text-right py-3 px-4 text-gray-700">{category.bookings}</td>
                    <td className="text-right py-3 px-4 font-semibold text-green-600">
                      ₱{Math.round(category.commission / category.bookings).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-bold">
                  <td className="py-3 px-4 text-gray-900">Total</td>
                  <td className="text-right py-3 px-4 text-blue-600">
                    ₱
                    {commissionByCategoryData
                      .reduce((sum, c) => sum + c.commission, 0)
                      .toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4 text-gray-900">100%</td>
                  <td className="text-right py-3 px-4 text-gray-900">
                    {commissionByCategoryData.reduce((sum, c) => sum + c.bookings, 0)}
                  </td>
                  <td className="text-right py-3 px-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
