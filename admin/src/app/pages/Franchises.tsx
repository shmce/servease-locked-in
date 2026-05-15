import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Store, MapPin, DollarSign, TrendingUp } from "lucide-react";
import {
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
    title: "Active Franchises",
    value: "45",
    change: "+5 this quarter",
    icon: Store,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Total Revenue",
    value: "$456K",
    change: "+18% this month",
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Covered Areas",
    value: "23",
    change: "Cities",
    icon: MapPin,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    title: "Avg Performance",
    value: "92%",
    change: "+3% improved",
    icon: TrendingUp,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
];

const franchises = [
  {
    id: "FR001",
    name: "North Zone",
    area: "Downtown & Business District",
    status: "active",
    orders: 2345,
    revenue: "$87,650",
    commission: "$8,765",
    performance: "95%",
  },
  {
    id: "FR002",
    name: "East Region",
    area: "Suburbs & Residential",
    status: "active",
    orders: 1980,
    revenue: "$72,340",
    commission: "$7,234",
    performance: "92%",
  },
  {
    id: "FR003",
    name: "West District",
    area: "Industrial & Commercial",
    status: "active",
    orders: 1560,
    revenue: "$58,920",
    commission: "$5,892",
    performance: "88%",
  },
  {
    id: "FR004",
    name: "South Hub",
    area: "Mixed Development",
    status: "active",
    orders: 1430,
    revenue: "$52,100",
    commission: "$5,210",
    performance: "90%",
  },
];

const performanceData = [
  { month: "Jan", revenue: 45000, orders: 1200 },
  { month: "Feb", revenue: 52000, orders: 1400 },
  { month: "Mar", revenue: 48000, orders: 1300 },
  { month: "Apr", revenue: 61000, orders: 1600 },
  { month: "May", revenue: 55000, orders: 1500 },
  { month: "Jun", revenue: 67000, orders: 1800 },
];

export function Franchises() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Franchise Portal</h1>
        <p className="text-gray-500 mt-1">
          Manage franchise operations, revenue sharing, and performance analytics
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

      <Card>
        <CardHeader>
          <CardTitle>Franchise Performance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#3b82f6" name="Revenue ($)" />
              <Bar dataKey="orders" fill="#10b981" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Franchises</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {franchises.map((franchise) => (
              <div
                key={franchise.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{franchise.name}</h3>
                      <Badge variant="default">{franchise.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{franchise.area}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Total Orders</p>
                        <p className="font-medium">{franchise.orders}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Revenue</p>
                        <p className="font-medium text-green-600">{franchise.revenue}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Commission</p>
                        <p className="font-medium text-blue-600">{franchise.commission}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Performance</p>
                        <p className="font-medium text-purple-600">{franchise.performance}</p>
                      </div>
                    </div>
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
