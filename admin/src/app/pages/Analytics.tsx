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

const stats = [
  {
    title: "Total Users",
    value: "45,678",
    change: "+12.5% vs last month",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Order Volume",
    value: "23,456",
    change: "+18.2% vs last month",
    icon: ShoppingCart,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Revenue Growth",
    value: "+24.3%",
    change: "Month over month",
    icon: TrendingUp,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "Avg Order Value",
    value: "$62.40",
    change: "+5.1% improvement",
    icon: DollarSign,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
];

const userGrowth = [
  { month: "Jan", users: 12000, active: 8400 },
  { month: "Feb", users: 15000, active: 10500 },
  { month: "Mar", users: 18000, active: 12600 },
  { month: "Apr", users: 22000, active: 15400 },
  { month: "May", users: 28000, active: 19600 },
  { month: "Jun", users: 35000, active: 24500 },
];

const moduleRevenue = [
  { month: "Jan", marketplace: 45000, grocery: 32000, restaurant: 28000 },
  { month: "Feb", marketplace: 52000, grocery: 38000, restaurant: 32000 },
  { month: "Mar", marketplace: 48000, grocery: 35000, restaurant: 29000 },
  { month: "Apr", marketplace: 61000, grocery: 42000, restaurant: 38000 },
  { month: "May", marketplace: 55000, grocery: 39000, restaurant: 34000 },
  { month: "Jun", marketplace: 67000, grocery: 48000, restaurant: 42000 },
];

const orderDistribution = [
  { name: "Marketplace", value: 35, color: "#3b82f6" },
  { name: "Grocery", value: 25, color: "#10b981" },
  { name: "Restaurant", value: 20, color: "#f59e0b" },
  { name: "Pharmacy", value: 10, color: "#ef4444" },
  { name: "Hospital", value: 6, color: "#8b5cf6" },
  { name: "Taxi", value: 4, color: "#06b6d4" },
];

const peakHours = [
  { hour: "6AM", orders: 120 },
  { hour: "9AM", orders: 450 },
  { hour: "12PM", orders: 890 },
  { hour: "3PM", orders: 560 },
  { hour: "6PM", orders: 1240 },
  { hour: "9PM", orders: 780 },
  { hour: "12AM", orders: 320 },
];

export function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
        <p className="text-gray-500 mt-1">
          Comprehensive analytics across all modules and operations
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
                  name="Total Users"
                />
                <Area
                  type="monotone"
                  dataKey="active"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorActive)"
                  name="Active Users"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Distribution by Module</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue by Module</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={moduleRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Bar dataKey="marketplace" fill="#3b82f6" name="Marketplace" />
              <Bar dataKey="grocery" fill="#10b981" name="Grocery" />
              <Bar dataKey="restaurant" fill="#f59e0b" name="Restaurant" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Peak Order Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={peakHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="hour" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="Orders"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
