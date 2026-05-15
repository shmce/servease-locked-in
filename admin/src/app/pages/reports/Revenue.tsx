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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "../../components/ui/badge";
import { useAdminGatewayData } from "../../../hooks/useAdminGatewayData";
import { notifyBackendRequired } from "../../utils/backendRequired";

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

function formatPeso(value: number) {
  return `₱${value.toLocaleString("en-PH", { maximumFractionDigits: 2 })}`;
}

export function Revenue() {
  const adminGateway = useAdminGatewayData();
  const [dateRange, setDateRange] = useState("last-30-days");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [serviceAreaFilter, setServiceAreaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const liveRevenueRows = useMemo(() => {
    return adminGateway.payments.map((payment) => ({
      date: payment.paidAt ?? payment.createdAt ?? "",
      paymentId: payment.id,
      bookingId: payment.bookingId,
      gross: payment.amount,
      net: payment.status === "refunded" || payment.status === "cancelled" ? 0 : payment.amount,
      commission: payment.platformFee,
      providerPayout: payment.providerPayout,
      status: payment.status,
      method: payment.paymentMethod ?? "N/A",
    }));
  }, [adminGateway.payments]);

  const liveRevenueStats = useMemo(() => {
    const paidRows = liveRevenueRows.filter((row) => row.status === "paid");
    const exceptionRows = liveRevenueRows.filter(
      (row) => row.status === "refunded" || row.status === "cancelled",
    );

    return {
      gross: liveRevenueRows.reduce((sum, row) => sum + row.gross, 0),
      net: paidRows.reduce((sum, row) => sum + row.net, 0),
      commission: liveRevenueRows.reduce((sum, row) => sum + row.commission, 0),
      refunds: exceptionRows.reduce((sum, row) => sum + row.gross, 0),
      completed: paidRows.length,
      averageOrderValue:
        paidRows.length > 0
          ? paidRows.reduce((sum, row) => sum + row.gross, 0) / paidRows.length
          : 0,
    };
  }, [liveRevenueRows]);

  const handleExportCSV = () => {
    const rows =
      liveRevenueRows.length > 0
        ? liveRevenueRows.map((row) => [
            row.date,
            row.paymentId,
            row.bookingId,
            row.gross,
            row.net,
            row.commission,
            row.providerPayout,
            row.status,
            row.method,
          ])
        : revenueBreakdownData.map((row) => [
            row.date,
            row.category,
            row.completedBookings,
            row.gross,
            row.net,
            row.commission,
          ]);
    const headers =
      liveRevenueRows.length > 0
        ? [
            "Date",
            "Payment ID",
            "Booking ID",
            "Gross",
            "Net",
            "Commission",
            "Provider Payout",
            "Status",
            "Method",
          ]
        : ["Date", "Category", "Completed Bookings", "Gross", "Net", "Commission"];
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `revenue-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleExportPDF = () => {
    notifyBackendRequired("Generating revenue PDFs", "GET /v1/admin/reports/revenue.pdf");
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
          <h1 className="text-[22px] font-semibold text-gray-900">Revenue</h1>
          <p className="text-[14px] text-gray-500 mt-1">
            Track gross revenue, net revenue, refunds, and commission over time.
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
        <KPICard label="Gross Revenue" value={formatPeso(liveRevenueStats.gross || 2410000)} change="+12.5%" changeType="up" icon={DollarSign} />
        <KPICard label="Net Revenue" value={formatPeso(liveRevenueStats.net || 2020000)} change="+10.8%" changeType="up" icon={TrendingUp} />
        <KPICard label="Total Commission" value={formatPeso(liveRevenueStats.commission || 396000)} change="+11.2%" changeType="up" icon={DollarSign} />
        <KPICard label="Refund Amount" value={formatPeso(liveRevenueStats.refunds || 55100)} change="-8.2%" changeType="down" icon={TrendingUp} />
        <KPICard label="Paid Payments" value={(liveRevenueStats.completed || 2326).toLocaleString()} change="+14.2%" changeType="up" icon={CheckCircle} />
        <KPICard label="Average Order Value" value={formatPeso(liveRevenueStats.averageOrderValue || 1037)} change="+5.3%" changeType="up" icon={Package} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[16px] font-semibold">Live Gateway Revenue</CardTitle>
          <p className="text-sm text-gray-500">
            Built client-side from the existing admin payments endpoint.
          </p>
        </CardHeader>
        <CardContent>
          {adminGateway.error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {adminGateway.error}
            </div>
          )}
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Booking ID</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminGateway.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Loading live payment revenue...
                    </TableCell>
                  </TableRow>
                ) : liveRevenueRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No payment revenue records found
                    </TableCell>
                  </TableRow>
                ) : (
                  liveRevenueRows.map((row) => (
                    <TableRow key={row.paymentId}>
                      <TableCell className="font-mono text-xs text-[#16A34A]">
                        {row.paymentId}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-gray-600">
                        {row.bookingId}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatPeso(row.gross)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatPeso(row.net)}
                      </TableCell>
                      <TableCell className="text-right text-[#00BF63] font-semibold">
                        {formatPeso(row.commission)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{row.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{row.method}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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

      {/* Detail Drawer */}
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
                    {selectedItem.category || "Revenue details"}
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
