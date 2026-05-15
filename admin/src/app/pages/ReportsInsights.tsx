import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Download,
  FileText,
  TrendingUp,
  DollarSign,
  Users,
  Star,
  Package,
  Clock,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Eye,
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
import { notifyBackendRequired } from "../utils/backendRequired";

// Revenue Data
const revenueOverTimeData = [
  { date: "Feb 1", revenue: 285000 },
  { date: "Feb 5", revenue: 312000 },
  { date: "Feb 10", revenue: 298000 },
  { date: "Feb 15", revenue: 345000 },
  { date: "Feb 20", revenue: 378000 },
  { date: "Feb 25", revenue: 392000 },
  { date: "Feb 28", revenue: 402000 },
];

const revenueByCategoryData = [
  { category: "Home Maintenance", revenue: 458000 },
  { category: "Beauty & Wellness", revenue: 387000 },
  { category: "Cleaning Services", revenue: 356000 },
  { category: "Events", revenue: 298000 },
  { category: "Pet Services", revenue: 267000 },
  { category: "Auto & Tech", revenue: 234000 },
  { category: "Education", revenue: 212000 },
];

const revenueBreakdownData = [
  { date: "2026-02-28", category: "Home Maintenance", completedBookings: 45, gross: 87500, discounts: 3200, refunds: 1500, net: 82800, commission: 13650 },
  { date: "2026-02-28", category: "Beauty & Wellness", completedBookings: 38, gross: 68400, discounts: 2800, refunds: 800, net: 64800, commission: 10692 },
  { date: "2026-02-27", category: "Cleaning Services", completedBookings: 32, gross: 54300, discounts: 1900, refunds: 600, net: 51800, commission: 8547 },
  { date: "2026-02-27", category: "Events", completedBookings: 28, gross: 98000, discounts: 5200, refunds: 2100, net: 90700, commission: 14965 },
  { date: "2026-02-26", category: "Pet Services", completedBookings: 25, gross: 42500, discounts: 1200, refunds: 400, net: 40900, commission: 6748 },
  { date: "2026-02-26", category: "Auto & Tech", completedBookings: 22, gross: 38600, discounts: 1600, refunds: 500, net: 36500, commission: 6023 },
  { date: "2026-02-25", category: "Education", completedBookings: 19, gross: 52800, discounts: 2100, refunds: 700, net: 50000, commission: 8250 },
];

// Booking Analytics Data
const bookingsOverTimeData = [
  { date: "Feb 1", bookings: 67 },
  { date: "Feb 5", bookings: 72 },
  { date: "Feb 10", bookings: 69 },
  { date: "Feb 15", bookings: 78 },
  { date: "Feb 20", bookings: 83 },
  { date: "Feb 25", bookings: 87 },
  { date: "Feb 28", bookings: 92 },
];

const bookingStatusData = [
  { name: "Completed", value: 2205, color: "#00BF63" },
  { name: "Pending", value: 86, color: "#F59E0B" },
  { name: "In Progress", value: 35, color: "#3B82F6" },
  { name: "Cancelled", value: 45, color: "#EF4444" },
];

const bookingsListData = [
  { id: "BKG-2847", scheduledDate: "2026-03-05", scheduledTime: "10:00 AM", customer: "Maria Santos", provider: "HomeFixPro Manila", category: "Home Maintenance", service: "Plumbing Repair", status: "Confirmed", amount: 2850 },
  { id: "BKG-2846", scheduledDate: "2026-03-05", scheduledTime: "2:00 PM", customer: "Juan dela Cruz", provider: "Sparkle Clean Services", category: "Cleaning", service: "House Cleaning", status: "Confirmed", amount: 1950 },
  { id: "BKG-2845", scheduledDate: "2026-03-04", scheduledTime: "11:00 AM", customer: "Ana Reyes", provider: "Glow Beauty Spa", category: "Beauty & Wellness", service: "Massage Therapy", status: "Completed", amount: 3200 },
  { id: "BKG-2844", scheduledDate: "2026-03-10", scheduledTime: "6:00 PM", customer: "Carlos Mendoza", provider: "Celebrate Events Co.", category: "Events", service: "Event Photography", status: "Pending", amount: 15800 },
  { id: "BKG-2843", scheduledDate: "2026-03-03", scheduledTime: "9:00 AM", customer: "Rosa Garcia", provider: "Pawsome Pet Care", category: "Pet Services", service: "Dog Grooming", status: "Completed", amount: 1250 },
];

// Provider Performance Data
const topProvidersByJobsData = [
  { provider: "HomeFixPro Manila", jobs: 127 },
  { provider: "Sparkle Clean", jobs: 98 },
  { provider: "Celebrate Events", jobs: 87 },
  { provider: "Glow Beauty Spa", jobs: 76 },
  { provider: "Pawsome Pet Care", jobs: 65 },
  { provider: "TechFix Solutions", jobs: 54 },
  { provider: "EventMasters PH", jobs: 48 },
  { provider: "CleanPro Services", jobs: 42 },
];

const ratingDistributionData = [
  { rating: "5 Stars", count: 856 },
  { rating: "4 Stars", count: 312 },
  { rating: "3 Stars", count: 98 },
  { rating: "2 Stars", count: 23 },
  { rating: "1 Star", count: 12 },
];

const providerLeaderboardData = [
  { id: "PRV-001", provider: "HomeFixPro Manila", categoryFocus: "Home Maintenance", completedJobs: 127, cancelRate: "2.1%", avgRating: 4.8, earnings: 587000, lastActive: "5 mins ago" },
  { id: "PRV-002", provider: "Sparkle Clean Services", categoryFocus: "Cleaning", completedJobs: 98, cancelRate: "1.8%", avgRating: 4.9, earnings: 510000, lastActive: "12 mins ago" },
  { id: "PRV-003", provider: "Glow Beauty Spa", categoryFocus: "Beauty & Wellness", completedJobs: 76, cancelRate: "3.2%", avgRating: 4.7, earnings: 445000, lastActive: "1 hour ago" },
  { id: "PRV-004", provider: "Celebrate Events Co.", categoryFocus: "Events", completedJobs: 87, cancelRate: "2.5%", avgRating: 4.9, earnings: 1250000, lastActive: "2 hours ago" },
  { id: "PRV-005", provider: "Pawsome Pet Care", categoryFocus: "Pet Services", completedJobs: 65, cancelRate: "2.8%", avgRating: 4.8, earnings: 312000, lastActive: "30 mins ago" },
];

// Customer Growth Data
const newCustomersOverTimeData = [
  { date: "Feb 1", customers: 28 },
  { date: "Feb 5", customers: 32 },
  { date: "Feb 10", customers: 29 },
  { date: "Feb 15", customers: 35 },
  { date: "Feb 20", customers: 38 },
  { date: "Feb 25", customers: 41 },
  { date: "Feb 28", customers: 45 },
];

const repeatVsNewData = [
  { month: "Sep", repeat: 189, new: 400 },
  { month: "Oct", repeat: 223, new: 389 },
  { month: "Nov", repeat: 267, new: 311 },
  { month: "Dec", repeat: 298, new: 447 },
  { month: "Jan", repeat: 339, new: 484 },
  { month: "Feb", repeat: 378, new: 514 },
];

const customerSummaryData = [
  { id: "CST-5621", customer: "Maria Santos", signupDate: "2025-11-15", totalBookings: 23, lastBooking: "2026-02-28", totalSpend: 48750, cancellations: 1 },
  { id: "CST-5620", customer: "Juan dela Cruz", signupDate: "2025-10-22", totalBookings: 18, lastBooking: "2026-02-27", totalSpend: 35400, cancellations: 0 },
  { id: "CST-5619", customer: "Ana Reyes", signupDate: "2025-12-03", totalBookings: 15, lastBooking: "2026-02-26", totalSpend: 42300, cancellations: 2 },
  { id: "CST-5618", customer: "Carlos Mendoza", signupDate: "2026-01-10", totalBookings: 8, lastBooking: "2026-02-25", totalSpend: 28900, cancellations: 0 },
  { id: "CST-5617", customer: "Rosa Garcia", signupDate: "2025-09-18", totalBookings: 31, lastBooking: "2026-02-28", totalSpend: 62500, cancellations: 1 },
];

// KPI Card Component
function KPICard({ label, value, change, icon: Icon, changeType }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-[13px] font-medium text-gray-500">{label}</p>
            <p className="text-[22px] font-semibold text-gray-900 mt-1">{value}</p>
            {change && (
              <p className={`text-xs font-medium mt-1 flex items-center gap-1 ${changeType === "up" ? "text-green-600" : "text-red-600"}`}>
                {changeType === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {change}
              </p>
            )}
          </div>
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
            <Icon className="w-6 h-6 text-gray-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ReportsInsights() {
  const [activeTab, setActiveTab] = useState("revenue");
  const [dateRange, setDateRange] = useState("last-30-days");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [serviceAreaFilter, setServiceAreaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleExportCSV = () => {
    notifyBackendRequired(`Exporting ${activeTab} CSV`, `GET /v1/admin/reports/${activeTab}.csv`);
  };

  const handleExportPDF = () => {
    notifyBackendRequired(`Generating ${activeTab} PDFs`, `GET /v1/admin/reports/${activeTab}.pdf`);
  };

  const openDrawer = (item: any) => {
    setSelectedItem(item);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-gray-900">
            {activeTab === "revenue" && "Revenue"}
            {activeTab === "bookings" && "Booking Analytics"}
            {activeTab === "providers" && "Provider Performance"}
            {activeTab === "customers" && "Customer Growth"}
          </h1>
          <p className="text-[14px] text-gray-500 mt-1">
            {activeTab === "revenue" && "Track gross revenue, net revenue, refunds, and commission over time."}
            {activeTab === "bookings" && "Understand booking volume, completion rate, cancellations, and trends."}
            {activeTab === "providers" && "Compare provider activity, reliability, and customer satisfaction."}
            {activeTab === "customers" && "Monitor new customers, repeat usage, and total spend."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleExportCSV} variant="outline" className="text-[14px] font-medium">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={handleExportPDF} className="bg-[#00BF63] hover:bg-[#00A356] text-[14px] font-medium">
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Global Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[12px] font-medium text-gray-700">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="text-[14px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                  <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px] font-medium text-gray-700">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="text-[14px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="home">Home Maintenance & Repair</SelectItem>
                  <SelectItem value="beauty">Beauty, Wellness & Personal Care</SelectItem>
                  <SelectItem value="cleaning">Domestic & Cleaning Services</SelectItem>
                  <SelectItem value="pet">Pet Services</SelectItem>
                  <SelectItem value="events">Events & Entertainment</SelectItem>
                  <SelectItem value="auto">Automotive & Tech Support</SelectItem>
                  <SelectItem value="education">Education & Professional Services</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px] font-medium text-gray-700">Service Area</Label>
              <Select value={serviceAreaFilter} onValueChange={setServiceAreaFilter}>
                <SelectTrigger className="text-[14px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  <SelectItem value="manila">Manila</SelectItem>
                  <SelectItem value="quezon-city">Quezon City</SelectItem>
                  <SelectItem value="makati">Makati</SelectItem>
                  <SelectItem value="pasig">Pasig</SelectItem>
                  <SelectItem value="taguig">Taguig</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px] font-medium text-gray-700">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="text-[14px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto">
          <TabsTrigger value="revenue" className="text-[14px] font-medium data-[state=active]:bg-[#00BF63] data-[state=active]:text-white">
            Revenue
          </TabsTrigger>
          <TabsTrigger value="bookings" className="text-[14px] font-medium data-[state=active]:bg-[#00BF63] data-[state=active]:text-white">
            Booking Analytics
          </TabsTrigger>
          <TabsTrigger value="providers" className="text-[14px] font-medium data-[state=active]:bg-[#00BF63] data-[state=active]:text-white">
            Provider Performance
          </TabsTrigger>
          <TabsTrigger value="customers" className="text-[14px] font-medium data-[state=active]:bg-[#00BF63] data-[state=active]:text-white">
            Customer Growth
          </TabsTrigger>
        </TabsList>

        {/* REVENUE TAB */}
        <TabsContent value="revenue" className="space-y-6 mt-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <KPICard label="Gross Revenue" value="₱2.41M" change="+12.5%" changeType="up" icon={DollarSign} />
            <KPICard label="Net Revenue" value="₱2.02M" change="+10.8%" changeType="up" icon={TrendingUp} />
            <KPICard label="Total Commission" value="₱396K" change="+11.2%" changeType="up" icon={DollarSign} />
            <KPICard label="Refund Amount" value="₱55.1K" change="-8.2%" changeType="down" icon={TrendingUp} />
            <KPICard label="Completed Bookings" value="2,326" change="+14.2%" changeType="up" icon={CheckCircle} />
            <KPICard label="Average Order Value" value="₱1,037" change="+5.3%" changeType="up" icon={Package} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-[16px] font-semibold">Revenue Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueOverTimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: 12 }} />
                    <YAxis stroke="#6b7280" tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}K`} style={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => `₱${value.toLocaleString()}`} />
                    <Line type="monotone" dataKey="revenue" stroke="#00BF63" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[16px] font-semibold">Revenue by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueByCategoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="category" stroke="#6b7280" angle={-45} textAnchor="end" height={100} style={{ fontSize: 11 }} />
                    <YAxis stroke="#6b7280" tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}K`} style={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => `₱${value.toLocaleString()}`} />
                    <Bar dataKey="revenue" fill="#00BF63" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detail Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-[16px] font-semibold">Revenue Breakdown</CardTitle>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 text-[14px]"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Desktop/Tablet Table */}
              <div className="hidden sm:block border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[12px] font-semibold">Date</TableHead>
                      <TableHead className="text-[12px] font-semibold">Category</TableHead>
                      <TableHead className="text-[12px] font-semibold text-right">Completed Bookings</TableHead>
                      <TableHead className="text-[12px] font-semibold text-right">Gross Revenue</TableHead>
                      <TableHead className="text-[12px] font-semibold text-right">Discounts</TableHead>
                      <TableHead className="text-[12px] font-semibold text-right">Refunds</TableHead>
                      <TableHead className="text-[12px] font-semibold text-right">Net Revenue</TableHead>
                      <TableHead className="text-[12px] font-semibold text-right">Commission</TableHead>
                      <TableHead className="text-[12px] font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenueBreakdownData.map((row, index) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell className="text-[14px]">{row.date}</TableCell>
                        <TableCell className="text-[14px]">{row.category}</TableCell>
                        <TableCell className="text-[14px] text-right">{row.completedBookings}</TableCell>
                        <TableCell className="text-[14px] text-right">₱{row.gross.toLocaleString()}</TableCell>
                        <TableCell className="text-[14px] text-right text-orange-600">-₱{row.discounts.toLocaleString()}</TableCell>
                        <TableCell className="text-[14px] text-right text-red-600">-₱{row.refunds.toLocaleString()}</TableCell>
                        <TableCell className="text-[14px] text-right font-semibold">₱{row.net.toLocaleString()}</TableCell>
                        <TableCell className="text-[14px] text-right text-[#00BF63] font-semibold">₱{row.commission.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openDrawer(row)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden space-y-3">
                {revenueBreakdownData.map((row, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[14px] font-semibold">{row.category}</p>
                          <p className="text-[12px] text-gray-500">{row.date}</p>
                        </div>
                        <Badge className="bg-[#00BF63] text-white">{row.completedBookings} bookings</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[13px]">
                        <div>
                          <span className="text-gray-500">Gross:</span>
                          <span className="ml-1 font-medium">₱{row.gross.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Net:</span>
                          <span className="ml-1 font-medium">₱{row.net.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Discounts:</span>
                          <span className="ml-1 text-orange-600">-₱{row.discounts.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Commission:</span>
                          <span className="ml-1 text-[#00BF63] font-medium">₱{row.commission.toLocaleString()}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full text-[14px] font-medium" onClick={() => openDrawer(row)}>
                        View Details
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BOOKING ANALYTICS TAB */}
        <TabsContent value="bookings" className="space-y-6 mt-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <KPICard label="Total Bookings" value="2,326" change="+14.2%" changeType="up" icon={Package} />
            <KPICard label="Completed" value="2,205" change="+15.1%" changeType="up" icon={CheckCircle} />
            <KPICard label="Cancelled" value="45" change="-12%" changeType="down" icon={Package} />
            <KPICard label="Completion Rate" value="94.8%" change="+2.1%" changeType="up" icon={TrendingUp} />
            <KPICard label="Avg Booking Value" value="₱1,037" change="+5.3%" changeType="up" icon={DollarSign} />
            <KPICard label="Avg Lead Time" value="3.2 days" change="-0.4 days" changeType="down" icon={Clock} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-[16px] font-semibold">Bookings Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={bookingsOverTimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: 12 }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="bookings" stroke="#00BF63" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[16px] font-semibold">Booking Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={bookingStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {bookingStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detail Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-[16px] font-semibold">Bookings List</CardTitle>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search bookings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 text-[14px]"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Desktop/Tablet Table */}
              <div className="hidden sm:block border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[12px] font-semibold">Booking ID</TableHead>
                      <TableHead className="text-[12px] font-semibold">Scheduled Date/Time</TableHead>
                      <TableHead className="text-[12px] font-semibold">Customer</TableHead>
                      <TableHead className="text-[12px] font-semibold">Provider</TableHead>
                      <TableHead className="text-[12px] font-semibold">Category</TableHead>
                      <TableHead className="text-[12px] font-semibold">Service</TableHead>
                      <TableHead className="text-[12px] font-semibold">Status</TableHead>
                      <TableHead className="text-[12px] font-semibold text-right">Total Amount</TableHead>
                      <TableHead className="text-[12px] font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookingsListData.map((booking) => (
                      <TableRow key={booking.id} className="hover:bg-gray-50">
                        <TableCell className="text-[14px] font-medium">{booking.id}</TableCell>
                        <TableCell className="text-[14px]">
                          <div>{booking.scheduledDate}</div>
                          <div className="text-gray-500 text-[12px]">{booking.scheduledTime}</div>
                        </TableCell>
                        <TableCell className="text-[14px]">{booking.customer}</TableCell>
                        <TableCell className="text-[14px]">{booking.provider}</TableCell>
                        <TableCell className="text-[14px]">{booking.category}</TableCell>
                        <TableCell className="text-[14px]">{booking.service}</TableCell>
                        <TableCell>
                          <Badge className={
                            booking.status === "Completed" ? "bg-green-100 text-green-700" :
                            booking.status === "Confirmed" ? "bg-blue-100 text-blue-700" :
                            "bg-yellow-100 text-yellow-700"
                          }>
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[14px] text-right font-semibold">₱{booking.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openDrawer(booking)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden space-y-3">
                {bookingsListData.map((booking) => (
                  <Card key={booking.id} className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[14px] font-semibold">{booking.id}</p>
                          <p className="text-[12px] text-gray-500">{booking.scheduledDate} at {booking.scheduledTime}</p>
                        </div>
                        <Badge className={
                          booking.status === "Completed" ? "bg-green-100 text-green-700" :
                          booking.status === "Confirmed" ? "bg-blue-100 text-blue-700" :
                          "bg-yellow-100 text-yellow-700"
                        }>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-[13px]">
                        <div><span className="text-gray-500">Customer:</span> <span className="ml-1">{booking.customer}</span></div>
                        <div><span className="text-gray-500">Provider:</span> <span className="ml-1">{booking.provider}</span></div>
                        <div><span className="text-gray-500">Service:</span> <span className="ml-1">{booking.service}</span></div>
                        <div><span className="text-gray-500">Amount:</span> <span className="ml-1 font-semibold">₱{booking.amount.toLocaleString()}</span></div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full text-[14px] font-medium" onClick={() => openDrawer(booking)}>
                        View Details
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PROVIDER PERFORMANCE TAB */}
        <TabsContent value="providers" className="space-y-6 mt-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <KPICard label="Active Providers" value="1,234" change="+8.3%" changeType="up" icon={Users} />
            <KPICard label="New Providers" value="67" change="+12%" changeType="up" icon={Users} />
            <KPICard label="Avg Provider Rating" value="4.82" change="+0.05" changeType="up" icon={Star} />
            <KPICard label="Acceptance Rate" value="87.3%" change="+2.1%" changeType="up" icon={CheckCircle} />
            <KPICard label="Completion Rate" value="96.2%" change="+1.8%" changeType="up" icon={CheckCircle} />
            <KPICard label="Provider Cancellations" value="87" change="-15%" changeType="down" icon={Package} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-[16px] font-semibold">Top Providers by Completed Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProvidersByJobsData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" stroke="#6b7280" style={{ fontSize: 12 }} />
                    <YAxis dataKey="provider" type="category" stroke="#6b7280" width={120} style={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="jobs" fill="#00BF63" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[16px] font-semibold">Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ratingDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="rating" stroke="#6b7280" style={{ fontSize: 12 }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detail Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-[16px] font-semibold">Provider Leaderboard</CardTitle>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search providers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 text-[14px]"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Desktop/Tablet Table */}
              <div className="hidden sm:block border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[12px] font-semibold">Provider Name</TableHead>
                      <TableHead className="text-[12px] font-semibold">Category Focus</TableHead>
                      <TableHead className="text-[12px] font-semibold text-right">Completed Jobs</TableHead>
                      <TableHead className="text-[12px] font-semibold">Cancel Rate</TableHead>
                      <TableHead className="text-[12px] font-semibold">Avg Rating</TableHead>
                      <TableHead className="text-[12px] font-semibold text-right">Earnings (Net)</TableHead>
                      <TableHead className="text-[12px] font-semibold">Last Active</TableHead>
                      <TableHead className="text-[12px] font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {providerLeaderboardData.map((provider) => (
                      <TableRow key={provider.id} className="hover:bg-gray-50">
                        <TableCell className="text-[14px] font-medium">{provider.provider}</TableCell>
                        <TableCell className="text-[14px]">{provider.categoryFocus}</TableCell>
                        <TableCell className="text-[14px] text-right font-semibold">{provider.completedJobs}</TableCell>
                        <TableCell>
                          <Badge className={
                            parseFloat(provider.cancelRate) < 2 ? "bg-green-100 text-green-700" :
                            parseFloat(provider.cancelRate) < 3 ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }>
                            {provider.cancelRate}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[14px]">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold">{provider.avgRating}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-[14px] text-right text-[#00BF63] font-semibold">₱{provider.earnings.toLocaleString()}</TableCell>
                        <TableCell className="text-[14px] text-gray-500">{provider.lastActive}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openDrawer(provider)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden space-y-3">
                {providerLeaderboardData.map((provider) => (
                  <Card key={provider.id} className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[14px] font-semibold">{provider.provider}</p>
                          <p className="text-[12px] text-gray-500">{provider.categoryFocus}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-[14px] font-semibold">{provider.avgRating}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[13px]">
                        <div>
                          <span className="text-gray-500">Jobs:</span>
                          <span className="ml-1 font-medium">{provider.completedJobs}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Cancel Rate:</span>
                          <span className="ml-1">{provider.cancelRate}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Earnings:</span>
                          <span className="ml-1 text-[#00BF63] font-semibold">₱{provider.earnings.toLocaleString()}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full text-[14px] font-medium" onClick={() => openDrawer(provider)}>
                        View Details
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CUSTOMER GROWTH TAB */}
        <TabsContent value="customers" className="space-y-6 mt-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <KPICard label="New Customers" value="248" change="+18.5%" changeType="up" icon={Users} />
            <KPICard label="Active Customers" value="2,145" change="+9.2%" changeType="up" icon={Users} />
            <KPICard label="Repeat Customers" value="918" change="+12.8%" changeType="up" icon={CheckCircle} />
            <KPICard label="Repeat Rate" value="42.8%" change="+3.2%" changeType="up" icon={TrendingUp} />
            <KPICard label="Total Bookings" value="5,234" change="+15.6%" changeType="up" icon={Package} />
            <KPICard label="Total Spend (LTV)" value="₱5.42M" change="+14.3%" changeType="up" icon={DollarSign} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-[16px] font-semibold">New Customers Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={newCustomersOverTimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: 12 }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="customers" stroke="#00BF63" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[16px] font-semibold">Repeat vs New Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={repeatVsNewData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: 12 }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="repeat" stackId="a" fill="#00BF63" name="Repeat" />
                    <Bar dataKey="new" stackId="a" fill="#3B82F6" name="New" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detail Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-[16px] font-semibold">Customer Summary</CardTitle>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 text-[14px]"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Desktop/Tablet Table */}
              <div className="hidden sm:block border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[12px] font-semibold">Customer</TableHead>
                      <TableHead className="text-[12px] font-semibold">Sign-up Date</TableHead>
                      <TableHead className="text-[12px] font-semibold text-right">Total Bookings</TableHead>
                      <TableHead className="text-[12px] font-semibold">Last Booking Date</TableHead>
                      <TableHead className="text-[12px] font-semibold text-right">Total Spend (LTV)</TableHead>
                      <TableHead className="text-[12px] font-semibold text-right">Cancellation Count</TableHead>
                      <TableHead className="text-[12px] font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerSummaryData.map((customer) => (
                      <TableRow key={customer.id} className="hover:bg-gray-50">
                        <TableCell className="text-[14px] font-medium">{customer.customer}</TableCell>
                        <TableCell className="text-[14px]">{customer.signupDate}</TableCell>
                        <TableCell className="text-[14px] text-right font-semibold">{customer.totalBookings}</TableCell>
                        <TableCell className="text-[14px]">{customer.lastBooking}</TableCell>
                        <TableCell className="text-[14px] text-right text-[#00BF63] font-semibold">₱{customer.totalSpend.toLocaleString()}</TableCell>
                        <TableCell className="text-[14px] text-right">{customer.cancellations}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openDrawer(customer)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden space-y-3">
                {customerSummaryData.map((customer) => (
                  <Card key={customer.id} className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[14px] font-semibold">{customer.customer}</p>
                          <p className="text-[12px] text-gray-500">Member since {customer.signupDate}</p>
                        </div>
                        <Badge className="bg-[#00BF63] text-white">{customer.totalBookings} bookings</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[13px]">
                        <div>
                          <span className="text-gray-500">Last Booking:</span>
                          <span className="ml-1">{customer.lastBooking}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Cancellations:</span>
                          <span className="ml-1">{customer.cancellations}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Total Spend:</span>
                          <span className="ml-1 text-[#00BF63] font-semibold">₱{customer.totalSpend.toLocaleString()}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full text-[14px] font-medium" onClick={() => openDrawer(customer)}>
                        View Details
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Drawer - Desktop */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedItem && (
            <>
              <SheetHeader>
                <SheetTitle className="text-[18px] font-semibold">Details</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-[13px] font-medium text-gray-500">Summary</p>
                  <p className="text-[14px] text-gray-900 mt-1">
                    {selectedItem.category || selectedItem.service || selectedItem.provider || selectedItem.customer || "Item details"}
                  </p>
                </div>
                <div className="space-y-3">
                  {Object.entries(selectedItem).slice(0, 6).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center pb-2 border-b">
                      <span className="text-[13px] font-medium text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="text-[14px] text-gray-900">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
