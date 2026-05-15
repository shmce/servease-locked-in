import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Receipt,
  Download,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const stats = [
  {
    title: "Total Revenue",
    value: "$1,456,780",
    change: "+18.2% from last month",
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Commission Earned",
    value: "$145,678",
    change: "+15.4% this month",
    icon: TrendingUp,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Pending Settlements",
    value: "$42,350",
    change: "23 pending",
    icon: CreditCard,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    title: "Transactions",
    value: "12,456",
    change: "This month",
    icon: Receipt,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
];

const revenueData = [
  { month: "Jan", revenue: 120000, commission: 12000 },
  { month: "Feb", revenue: 135000, commission: 13500 },
  { month: "Mar", revenue: 128000, commission: 12800 },
  { month: "Apr", revenue: 155000, commission: 15500 },
  { month: "May", revenue: 142000, commission: 14200 },
  { month: "Jun", revenue: 168000, commission: 16800 },
];

const moduleCommissions = [
  { module: "Marketplace", commission: 45230, percentage: "10%" },
  { module: "Grocery", commission: 32890, percentage: "8%" },
  { module: "Restaurant", commission: 28450, percentage: "12%" },
  { module: "Pharmacy", commission: 18900, percentage: "7%" },
  { module: "Hospital", commission: 12340, percentage: "15%" },
  { module: "Taxi", commission: 7868, percentage: "20%" },
];

const pendingSettlements = [
  {
    id: "ST-001",
    seller: "TechStore Pro",
    module: "Marketplace",
    amount: "$4,523",
    dueDate: "2026-02-10",
    status: "pending",
  },
  {
    id: "ST-002",
    seller: "Fresh Mart 24",
    module: "Grocery",
    amount: "$3,289",
    dueDate: "2026-02-11",
    status: "pending",
  },
  {
    id: "ST-003",
    seller: "Gourmet Kitchen",
    module: "Restaurant",
    amount: "$2,845",
    dueDate: "2026-02-09",
    status: "overdue",
  },
];

export function Finance() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance & Settlements</h1>
          <p className="text-gray-500 mt-1">
            Manage payments, commissions, and financial reports
          </p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
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
            <CardTitle>Revenue & Commission Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Revenue ($)"
                />
                <Line
                  type="monotone"
                  dataKey="commission"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Commission ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commission by Module</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {moduleCommissions.map((item) => (
                <div
                  key={item.module}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.module}</p>
                    <p className="text-xs text-gray-500">Commission Rate: {item.percentage}</p>
                  </div>
                  <p className="font-semibold text-green-600">
                    ${item.commission.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Settlements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingSettlements.map((settlement) => (
              <div
                key={settlement.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{settlement.seller}</h3>
                      <Badge
                        variant={settlement.status === "overdue" ? "destructive" : "secondary"}
                      >
                        {settlement.status}
                      </Badge>
                      <Badge variant="outline">{settlement.module}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>ID: {settlement.id}</span>
                      <span>Due Date: {settlement.dueDate}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{settlement.amount}</p>
                    <Button size="sm" className="mt-2">
                      Process Payment
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
