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
import { useAuth } from "../../contexts/AuthContext";
import {
  exportAdminReportPdf,
  exportAdminRevenueCsv,
} from "../../../services/serveaseAdminApi";

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

function formatPaymentDate(value: string | null) {
  if (!value) return "No date";
  return new Date(value).toLocaleDateString("en-CA");
}

export function Revenue() {
  const adminGateway = useAdminGatewayData();
  const { accessToken } = useAuth();
  const [dateRange, setDateRange] = useState("last-30-days");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [serviceAreaFilter, setServiceAreaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const liveRevenueRows = useMemo(() => {
    return adminGateway.payments.map((payment) => ({
      date: formatPaymentDate(payment.paidAt ?? payment.createdAt),
      paymentId: payment.id,
      bookingId: payment.bookingId,
      gross: payment.amount,
      discounts: 0,
      refunds:
        payment.status === "refunded" || payment.status === "cancelled"
          ? payment.amount
          : 0,
      net: payment.status === "refunded" || payment.status === "cancelled" ? 0 : payment.amount,
      commission: payment.platformFee,
      providerPayout: payment.providerPayout,
      status: payment.status,
      method: payment.paymentMethod ?? "N/A",
      category: payment.paymentMethod ?? "Unspecified method",
      completedBookings: payment.status === "paid" ? 1 : 0,
    }));
  }, [adminGateway.payments]);

  const filteredRevenueRows = useMemo(() => {
    const query = searchTerm.toLowerCase();

    return liveRevenueRows.filter((row) => {
      const matchesSearch =
        !query ||
        Object.values(row).some((value) => String(value).toLowerCase().includes(query));
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "completed" && row.status === "paid") ||
        (statusFilter === "cancelled" &&
          (row.status === "cancelled" || row.status === "refunded"));

      return matchesSearch && matchesStatus;
    });
  }, [liveRevenueRows, searchTerm, statusFilter]);

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

  const revenueOverTimeData = useMemo(() => {
    const byDate = filteredRevenueRows.reduce<Record<string, number>>((totals, row) => {
      totals[row.date] = (totals[row.date] ?? 0) + row.net;
      return totals;
    }, {});

    return Object.entries(byDate)
      .map(([date, revenue]) => ({ date, revenue }))
      .slice(-10);
  }, [filteredRevenueRows]);

  const revenueByCategoryData = useMemo(() => {
    const byCategory = filteredRevenueRows.reduce<Record<string, number>>((totals, row) => {
      totals[row.category] = (totals[row.category] ?? 0) + row.net;
      return totals;
    }, {});

    return Object.entries(byCategory).map(([category, revenue]) => ({
      category,
      revenue,
    }));
  }, [filteredRevenueRows]);

  const handleExportCSV = async () => {
    if (!accessToken) {
      notifyBackendRequired("Exporting revenue CSV", "GET /v1/admin/reports/revenue.csv");
      return;
    }

    setIsExportingCsv(true);
    try {
      const csv = await exportAdminRevenueCsv(accessToken);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `revenue-report-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      notifyBackendRequired(
        error instanceof Error ? error.message : "Exporting revenue CSV failed",
        "GET /v1/admin/reports/revenue.csv",
      );
    } finally {
      setIsExportingCsv(false);
    }
  };

  const handleExportPDF = async () => {
    if (!accessToken) {
      notifyBackendRequired("Exporting revenue PDF", "GET /v1/admin/reports/revenue.pdf");
      return;
    }

    setIsExportingPdf(true);
    try {
      const pdf = await exportAdminReportPdf(accessToken, "revenue");
      const url = URL.createObjectURL(pdf);
      const link = document.createElement("a");
      link.href = url;
      link.download = `revenue-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      notifyBackendRequired(
        error instanceof Error ? error.message : "Exporting revenue PDF failed",
        "GET /v1/admin/reports/revenue.pdf",
      );
    } finally {
      setIsExportingPdf(false);
    }
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
          <Button
            onClick={() => void handleExportCSV()}
            variant="outline"
            className="text-[14px] font-medium"
            disabled={isExportingCsv}
          >
            <Download className="w-4 h-4 mr-2" />
            {isExportingCsv ? "Exporting..." : "Export CSV"}
          </Button>
          <Button
            onClick={() => void handleExportPDF()}
            className="bg-[#00BF63] hover:bg-[#00A356] text-[14px] font-medium"
            disabled={isExportingPdf}
          >
            <FileText className="w-4 h-4 mr-2" />
            {isExportingPdf ? "Exporting..." : "Export PDF"}
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
        <KPICard label="Gross Revenue" value={formatPeso(liveRevenueStats.gross)} icon={DollarSign} />
        <KPICard label="Net Revenue" value={formatPeso(liveRevenueStats.net)} icon={TrendingUp} />
        <KPICard label="Total Commission" value={formatPeso(liveRevenueStats.commission)} icon={DollarSign} />
        <KPICard label="Refund Amount" value={formatPeso(liveRevenueStats.refunds)} icon={TrendingUp} />
        <KPICard label="Paid Payments" value={liveRevenueStats.completed.toLocaleString()} icon={CheckCircle} />
        <KPICard label="Average Order Value" value={formatPeso(liveRevenueStats.averageOrderValue)} icon={Package} />
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
            {revenueOverTimeData.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-sm text-gray-500">
                No payment revenue records found
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueOverTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}K`} style={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => `₱${value.toLocaleString()}`} />
                  <Line type="monotone" dataKey="revenue" stroke="#00BF63" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[16px] font-semibold">Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueByCategoryData.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-sm text-gray-500">
                No payment-method revenue records found
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueByCategoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="category" stroke="#6b7280" angle={-45} textAnchor="end" height={100} style={{ fontSize: 11 }} />
                  <YAxis stroke="#6b7280" tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}K`} style={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => `₱${value.toLocaleString()}`} />
                  <Bar dataKey="revenue" fill="#00BF63" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
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
                {adminGateway.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-8 text-center text-sm text-gray-500">
                      Loading payment revenue...
                    </TableCell>
                  </TableRow>
                ) : filteredRevenueRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-8 text-center text-sm text-gray-500">
                      No payment revenue records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRevenueRows.map((row) => (
                    <TableRow key={row.paymentId} className="hover:bg-gray-50">
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-3">
            {adminGateway.isLoading ? (
              <div className="rounded-lg border p-4 text-center text-sm text-gray-500">
                Loading payment revenue...
              </div>
            ) : filteredRevenueRows.length === 0 ? (
              <div className="rounded-lg border p-4 text-center text-sm text-gray-500">
                No payment revenue records found
              </div>
            ) : (
              filteredRevenueRows.map((row) => (
                <Card key={row.paymentId} className="p-4">
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
                        <span className="text-gray-500">Refunds:</span>
                        <span className="ml-1 text-red-600">-₱{row.refunds.toLocaleString()}</span>
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
              ))
            )}
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
