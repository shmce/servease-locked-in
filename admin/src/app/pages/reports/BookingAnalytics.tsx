import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../../components/ui/sheet";
import {
  Download,
  FileText,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Package,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Eye,
} from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "../../components/ui/badge";
import { notifyBackendRequired } from "../../utils/backendRequired";
import { useAdminGatewayData } from "../../../hooks/useAdminGatewayData";

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

export function BookingAnalytics() {
  const adminGateway = useAdminGatewayData();
  const [dateRange, setDateRange] = useState("last-30-days");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [serviceAreaFilter, setServiceAreaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const liveBookingRows = useMemo(() => {
    return adminGateway.payments.map((payment) => ({
      id: payment.bookingId,
      scheduledDate: payment.createdAt
        ? new Date(payment.createdAt).toLocaleDateString("en-CA")
        : "No date",
      scheduledTime: payment.createdAt
        ? new Date(payment.createdAt).toLocaleTimeString("en-PH", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "No time",
      customer: payment.customerId ?? "Unknown customer",
      provider: payment.providerId ?? "Unknown provider",
      category: "Backend payment row",
      service: payment.paymentMethod ?? "Unknown method",
      status:
        payment.status === "paid"
          ? "Completed"
          : payment.status === "pending"
            ? "Pending"
            : "Cancelled",
      amount: payment.amount,
    }));
  }, [adminGateway.payments]);

  const visibleBookingRows = liveBookingRows.length > 0 ? liveBookingRows : bookingsListData;
  const filteredBookingRows = useMemo(() => {
    const query = searchTerm.toLowerCase();

    return visibleBookingRows.filter((booking) => {
      const matchesSearch =
        !query ||
        Object.values(booking).some((value) => String(value).toLowerCase().includes(query));
      const matchesStatus =
        statusFilter === "all" || booking.status.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, visibleBookingRows]);

  const liveStatusData = useMemo(() => {
    const counts = visibleBookingRows.reduce<Record<string, number>>((totals, booking) => {
      totals[booking.status] = (totals[booking.status] ?? 0) + 1;
      return totals;
    }, {});

    return [
      { name: "Completed", value: counts.Completed ?? 0, color: "#00BF63" },
      { name: "Pending", value: counts.Pending ?? 0, color: "#F59E0B" },
      { name: "Cancelled", value: counts.Cancelled ?? 0, color: "#EF4444" },
    ].filter((item) => item.value > 0);
  }, [visibleBookingRows]);

  const liveTimelineData = useMemo(() => {
    const byDate = visibleBookingRows.reduce<Record<string, number>>((totals, booking) => {
      totals[booking.scheduledDate] = (totals[booking.scheduledDate] ?? 0) + 1;
      return totals;
    }, {});

    return Object.entries(byDate)
      .map(([date, bookings]) => ({ date, bookings }))
      .slice(-10);
  }, [visibleBookingRows]);

  const totalBookings = visibleBookingRows.length;
  const completedBookings = visibleBookingRows.filter((row) => row.status === "Completed").length;
  const cancelledBookings = visibleBookingRows.filter((row) => row.status === "Cancelled").length;
  const averageBookingValue =
    totalBookings > 0
      ? visibleBookingRows.reduce((sum, row) => sum + row.amount, 0) / totalBookings
      : 0;
  const completionRate =
    totalBookings > 0 ? `${((completedBookings / totalBookings) * 100).toFixed(1)}%` : "0%";

  const handleExportCSV = () => {
    notifyBackendRequired("Exporting booking analytics CSV", "GET /v1/admin/reports/bookings.csv");
  };

  const handleExportPDF = () => {
    notifyBackendRequired("Generating booking analytics PDFs", "GET /v1/admin/reports/bookings.pdf");
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
          <h1 className="text-[22px] font-semibold text-gray-900">Booking Analytics</h1>
          <p className="text-[14px] text-gray-500 mt-1">
            Understand booking volume, completion rate, cancellations, and trends.
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard label="Payment-linked Bookings" value={totalBookings.toLocaleString()} icon={Package} />
        <KPICard label="Completed" value={completedBookings.toLocaleString()} icon={CheckCircle} />
        <KPICard label="Cancelled / Refunded" value={cancelledBookings.toLocaleString()} icon={Package} />
        <KPICard label="Completion Rate" value={completionRate} icon={TrendingUp} />
        <KPICard label="Avg Booking Value" value={`₱${averageBookingValue.toLocaleString("en-PH", { maximumFractionDigits: 0 })}`} icon={DollarSign} />
        <KPICard label="Data Source" value={liveBookingRows.length > 0 ? "Gateway" : "Demo"} icon={Clock} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-[16px] font-semibold">Bookings Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={liveTimelineData.length > 0 ? liveTimelineData : bookingsOverTimeData}>
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
                  data={liveStatusData.length > 0 ? liveStatusData : bookingStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(liveStatusData.length > 0 ? liveStatusData : bookingStatusData).map((entry, index) => (
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
                {filteredBookingRows.map((booking) => (
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
            {filteredBookingRows.map((booking) => (
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

      {/* Detail Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedItem && (
            <>
              <SheetHeader>
                <SheetTitle className="text-[18px] font-semibold">Booking Details</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-[13px] font-medium text-gray-500">Timeline</p>
                  <p className="text-[14px] text-gray-900 mt-1">
                    Created → Assigned → In Progress → {selectedItem.status}
                  </p>
                </div>
                <div className="space-y-3">
                  {Object.entries(selectedItem).slice(0, 8).map(([key, value]) => (
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
