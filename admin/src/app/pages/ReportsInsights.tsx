import { useState, useEffect, useMemo } from "react";
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
import { useAuth } from "../contexts/AuthContext";
import {
  exportAdminReportPdf,
  exportAdminReportCsv,
  getAdminBookingsSummary,
  getAdminUsersSummary,
  listAdminManagedProviders,
  listAdminPayments,
  listAdminReviews,
  listAdminUsers,
  AdminBookingsSummaryStats,
  AdminUsersSummaryStats,
  AdminProviderSummary,
  AdminReviewSummary,
  AdminPaymentSummary,
  AdminUserSummary,
} from "../../services/serveaseAdminApi";

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

function formatDate(value: string | null) {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-CA");
}

function formatMonth(value: string | null) {
  if (!value) return "No date";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

function newestDate(values: Array<string | null | undefined>) {
  return values.reduce<string | null>((latest, value) => {
    if (!value) return latest;
    if (!latest) return value;
    return new Date(value).getTime() > new Date(latest).getTime()
      ? value
      : latest;
  }, null);
}

export function ReportsInsights() {
  const { accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState("revenue");
  const [dateRange, setDateRange] = useState("last-30-days");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [serviceAreaFilter, setServiceAreaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [bookingsSummary, setBookingsSummary] = useState<AdminBookingsSummaryStats | null>(null);
  const [usersSummary, setUsersSummary] = useState<AdminUsersSummaryStats | null>(null);
  const [payments, setPayments] = useState<AdminPaymentSummary[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUserSummary[]>([]);
  const [managedProviders, setManagedProviders] = useState<AdminProviderSummary[]>([]);
  const [reviews, setReviews] = useState<AdminReviewSummary[]>([]);

  useEffect(() => {
    if (!accessToken) return;
    Promise.all([
      getAdminBookingsSummary(accessToken).catch(() => null),
      getAdminUsersSummary(accessToken).catch(() => null),
      listAdminPayments(accessToken).catch(() => [] as AdminPaymentSummary[]),
      listAdminUsers(accessToken).catch(() => [] as AdminUserSummary[]),
      listAdminManagedProviders(accessToken).catch(() => [] as AdminProviderSummary[]),
      listAdminReviews(accessToken, { limit: 500 }).catch(() => [] as AdminReviewSummary[]),
    ]).then(([bSum, uSum, pays, users, providers, reviewRows]) => {
      setBookingsSummary(bSum);
      setUsersSummary(uSum);
      setPayments(pays);
      setAdminUsers(users);
      setManagedProviders(providers);
      setReviews(reviewRows);
    });
  }, [accessToken]);

  const liveRevenueRows = useMemo(() => {
    return payments.map((payment) => {
      const occurredAt = payment.paidAt ?? payment.createdAt ?? null;
      const date = occurredAt
        ? new Date(occurredAt).toLocaleDateString("en-CA")
        : "No date";
      const isException =
        payment.status === "refunded" || payment.status === "cancelled";

      return {
        id: payment.id,
        date,
        category: payment.paymentMethod ?? "Unspecified method",
        completedBookings: payment.status === "paid" ? 1 : 0,
        gross: payment.amount,
        discounts: 0,
        refunds: isException ? payment.amount : 0,
        net: isException ? 0 : payment.amount,
        commission: payment.platformFee,
        status: payment.status,
      };
    });
  }, [payments]);

  const filteredRevenueRows = useMemo(() => {
    const query = searchTerm.toLowerCase();

    return liveRevenueRows.filter((row) => {
      const matchesSearch =
        !query ||
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(query),
        );
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "completed" && row.status === "paid") ||
        (statusFilter === "cancelled" &&
          (row.status === "cancelled" || row.status === "refunded"));

      return matchesSearch && matchesStatus;
    });
  }, [liveRevenueRows, searchTerm, statusFilter]);

  const revenueOverTimeData = useMemo(() => {
    const byDate = filteredRevenueRows.reduce<Record<string, number>>(
      (totals, row) => {
        totals[row.date] = (totals[row.date] ?? 0) + row.net;
        return totals;
      },
      {},
    );

    return Object.entries(byDate)
      .map(([date, revenue]) => ({ date, revenue }))
      .slice(-10);
  }, [filteredRevenueRows]);

  const revenueByCategoryData = useMemo(() => {
    const byCategory = filteredRevenueRows.reduce<Record<string, number>>(
      (totals, row) => {
        totals[row.category] = (totals[row.category] ?? 0) + row.net;
        return totals;
      },
      {},
    );

    return Object.entries(byCategory).map(([category, revenue]) => ({
      category,
      revenue,
    }));
  }, [filteredRevenueRows]);

  const liveBookingRows = useMemo(() => {
    return payments.map((payment) => {
      const createdAt = payment.createdAt ?? payment.paidAt ?? null;
      const scheduledDate = createdAt
        ? new Date(createdAt).toLocaleDateString("en-CA")
        : "No date";
      const scheduledTime = createdAt
        ? new Date(createdAt).toLocaleTimeString("en-PH", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "No time";

      return {
        paymentId: payment.id,
        id: payment.bookingId,
        scheduledDate,
        scheduledTime,
        customer: payment.customerId ?? "Unknown customer",
        provider: payment.providerId ?? "Unknown provider",
        category: "Payment-linked booking",
        service: payment.paymentMethod ?? "Unknown method",
        status:
          payment.status === "paid"
            ? "Completed"
            : payment.status === "pending"
              ? "Pending"
              : "Cancelled",
        amount: payment.amount,
      };
    });
  }, [payments]);

  const filteredBookingRows = useMemo(() => {
    const query = searchTerm.toLowerCase();

    return liveBookingRows.filter((booking) => {
      const matchesSearch =
        !query ||
        Object.values(booking).some((value) =>
          String(value).toLowerCase().includes(query),
        );
      const matchesStatus =
        statusFilter === "all" || booking.status.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [liveBookingRows, searchTerm, statusFilter]);

  const bookingsOverTimeData = useMemo(() => {
    const byDate = liveBookingRows.reduce<Record<string, number>>(
      (totals, booking) => {
        totals[booking.scheduledDate] =
          (totals[booking.scheduledDate] ?? 0) + 1;
        return totals;
      },
      {},
    );

    return Object.entries(byDate)
      .map(([date, bookings]) => ({ date, bookings }))
      .slice(-10);
  }, [liveBookingRows]);

  const bookingStatusData = useMemo(() => {
    const counts = liveBookingRows.reduce<Record<string, number>>(
      (totals, booking) => {
        totals[booking.status] = (totals[booking.status] ?? 0) + 1;
        return totals;
      },
      {},
    );

    return [
      { name: "Completed", value: counts.Completed ?? 0, color: "#00BF63" },
      { name: "Pending", value: counts.Pending ?? 0, color: "#F59E0B" },
      { name: "Cancelled", value: counts.Cancelled ?? 0, color: "#EF4444" },
    ].filter((item) => item.value > 0);
  }, [liveBookingRows]);

  const providerLeaderboardData = useMemo(() => {
    const reviewStats = reviews.reduce<
      Record<string, { ratingTotal: number; count: number }>
    >((stats, review) => {
      const current = stats[review.providerId] ?? { ratingTotal: 0, count: 0 };
      current.ratingTotal += review.rating;
      current.count += 1;
      stats[review.providerId] = current;
      return stats;
    }, {});

    const providerIds = new Set<string>();
    managedProviders.forEach((provider) => providerIds.add(provider.id));
    payments.forEach((payment) => {
      if (payment.providerId) providerIds.add(payment.providerId);
    });

    return Array.from(providerIds)
      .map((providerId) => {
        const provider = managedProviders.find((item) => item.id === providerId);
        const providerPayments = payments.filter(
          (payment) => payment.providerId === providerId,
        );
        const completedJobs = providerPayments.filter(
          (payment) => payment.status === "paid",
        ).length;
        const cancelledJobs = providerPayments.filter(
          (payment) =>
            payment.status === "cancelled" || payment.status === "refunded",
        ).length;
        const totalJobs = providerPayments.length;
        const cancelRate =
          totalJobs > 0 ? `${((cancelledJobs / totalJobs) * 100).toFixed(1)}%` : "0.0%";
        const reviewSummary = reviewStats[providerId];
        const avgRating =
          provider?.averageRating && provider.averageRating > 0
            ? provider.averageRating
            : reviewSummary?.count
              ? reviewSummary.ratingTotal / reviewSummary.count
              : 0;
        const lastActive =
          newestDate(
            providerPayments.flatMap((payment) => [
              payment.paidAt,
              payment.createdAt,
            ]),
          ) ?? provider?.createdAt ?? null;

        return {
          id: providerId,
          provider:
            provider?.businessName ??
            provider?.userFullName ??
            provider?.userEmail ??
            providerId,
          categoryFocus:
            provider?.serviceDescription ??
            provider?.serviceArea ??
            "Unspecified services",
          completedJobs,
          cancelRate,
          avgRating,
          earnings: providerPayments
            .filter((payment) => payment.status === "paid")
            .reduce((sum, payment) => sum + payment.providerPayout, 0),
          lastActive: formatDate(lastActive),
        };
      })
      .filter((provider) => {
        const query = searchTerm.toLowerCase();
        return (
          !query ||
          provider.provider.toLowerCase().includes(query) ||
          provider.categoryFocus.toLowerCase().includes(query) ||
          provider.id.toLowerCase().includes(query)
        );
      })
      .sort(
        (a, b) =>
          b.completedJobs - a.completedJobs ||
          b.earnings - a.earnings ||
          a.provider.localeCompare(b.provider),
      );
  }, [managedProviders, payments, reviews, searchTerm]);

  const topProvidersByJobsData = useMemo(
    () =>
      providerLeaderboardData
        .filter((provider) => provider.completedJobs > 0)
        .slice(0, 8)
        .map((provider) => ({
          provider: provider.provider,
          jobs: provider.completedJobs,
        })),
    [providerLeaderboardData],
  );

  const ratingDistributionData = useMemo(() => {
    const counts = reviews.reduce<Record<number, number>>((totals, review) => {
      const rating = Math.min(5, Math.max(1, Math.round(review.rating)));
      totals[rating] = (totals[rating] ?? 0) + 1;
      return totals;
    }, {});

    return [5, 4, 3, 2, 1]
      .map((rating) => ({
        rating: `${rating} Star${rating === 1 ? "" : "s"}`,
        count: counts[rating] ?? 0,
      }))
      .filter((item) => item.count > 0);
  }, [reviews]);

  const customerSummaryData = useMemo(() => {
    const customers = adminUsers.filter((user) => user.role === "customer");

    return customers
      .map((customer) => {
        const customerPayments = payments.filter(
          (payment) => payment.customerId === customer.id,
        );
        const latestBooking = newestDate(
          customerPayments.flatMap((payment) => [
            payment.paidAt,
            payment.createdAt,
          ]),
        );

        return {
          id: customer.id,
          customer: customer.fullName ?? customer.email ?? customer.id,
          signupDate: formatDate(customer.createdAt),
          totalBookings: customerPayments.length,
          lastBooking: formatDate(latestBooking),
          totalSpend: customerPayments
            .filter((payment) => payment.status === "paid")
            .reduce((sum, payment) => sum + payment.amount, 0),
          cancellations: customerPayments.filter(
            (payment) =>
              payment.status === "cancelled" || payment.status === "refunded",
          ).length,
        };
      })
      .filter((customer) => {
        const query = searchTerm.toLowerCase();
        return (
          !query ||
          customer.customer.toLowerCase().includes(query) ||
          customer.id.toLowerCase().includes(query)
        );
      })
      .sort(
        (a, b) =>
          b.totalBookings - a.totalBookings ||
          b.totalSpend - a.totalSpend ||
          a.customer.localeCompare(b.customer),
      );
  }, [adminUsers, payments, searchTerm]);

  const newCustomersOverTimeData = useMemo(() => {
    const byDate = adminUsers
      .filter((user) => user.role === "customer" && user.createdAt)
      .reduce<Record<string, number>>((totals, user) => {
        const date = formatDate(user.createdAt);
        totals[date] = (totals[date] ?? 0) + 1;
        return totals;
      }, {});

    return Object.entries(byDate)
      .map(([date, customers]) => ({ date, customers }))
      .slice(-10);
  }, [adminUsers]);

  const repeatVsNewData = useMemo(() => {
    const sortedPayments = payments
      .filter((payment) => payment.customerId)
      .slice()
      .sort((a, b) => {
        const aTime = new Date(a.paidAt ?? a.createdAt ?? 0).getTime();
        const bTime = new Date(b.paidAt ?? b.createdAt ?? 0).getTime();
        return aTime - bTime;
      });
    const seenCustomers = new Set<string>();
    const byMonth: Record<string, { month: string; repeat: number; new: number }> = {};

    sortedPayments.forEach((payment) => {
      if (!payment.customerId) return;
      const month = formatMonth(payment.paidAt ?? payment.createdAt);
      if (!byMonth[month]) {
        byMonth[month] = { month, repeat: 0, new: 0 };
      }
      if (seenCustomers.has(payment.customerId)) {
        byMonth[month].repeat += 1;
      } else {
        byMonth[month].new += 1;
        seenCustomers.add(payment.customerId);
      }
    });

    return Object.values(byMonth).slice(-10);
  }, [payments]);

  const handleExportCSV = async () => {
    if (!accessToken) {
      notifyBackendRequired(
        `Exporting ${activeTab} CSV`,
        `GET /v1/admin/reports/${activeTab}.csv`,
      );
      return;
    }
    const kindMap: Record<string, "revenue" | "bookings" | "users"> = {
      revenue: "revenue",
      bookings: "bookings",
      providers: "users",
      customers: "users",
    };
    const kind = kindMap[activeTab] ?? "bookings";
    try {
      const csv = await exportAdminReportCsv(accessToken, kind);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      notifyBackendRequired(
        error instanceof Error
          ? error.message
          : `Exporting ${activeTab} CSV failed`,
        `GET /v1/admin/reports/${kind}.csv`,
      );
    }
  };

  const handleExportPDF = async () => {
    if (!accessToken) {
      notifyBackendRequired(
        `Exporting ${activeTab} PDF`,
        `GET /v1/admin/reports/${activeTab}.pdf`,
      );
      return;
    }

    const kindMap: Record<string, "revenue" | "bookings" | "users"> = {
      revenue: "revenue",
      bookings: "bookings",
      providers: "users",
      customers: "users",
    };
    const kind = kindMap[activeTab] ?? "bookings";
    setIsExportingPdf(true);
    try {
      const pdf = await exportAdminReportPdf(accessToken, kind);
      const blobUrl = URL.createObjectURL(pdf);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${activeTab}-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      notifyBackendRequired(
        error instanceof Error
          ? error.message
          : `Exporting ${activeTab} PDF failed`,
        `GET /v1/admin/reports/${kind}.pdf`,
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
          {(() => {
            const grossRevenue = payments.reduce((s, p) => s + p.amount, 0);
            const commission = payments.reduce((s, p) => s + p.platformFee, 0);
            const completed = bookingsSummary?.byStatus?.completed ?? 0;
            const totalRev = bookingsSummary?.totalRevenue ?? grossRevenue;
            const avgOrder = completed > 0 ? Math.round(totalRev / completed) : 0;
            const fmtM = (n: number) => n >= 1_000_000 ? `₱${(n / 1_000_000).toFixed(2)}M` : `₱${(n / 1000).toFixed(0)}K`;
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <KPICard label="Gross Revenue" value={fmtM(grossRevenue)} icon={DollarSign} />
                <KPICard label="Net Revenue" value={fmtM(totalRev)} icon={TrendingUp} />
                <KPICard label="Total Commission" value={fmtM(commission)} icon={DollarSign} />
                <KPICard label="Completed Bookings" value={completed.toLocaleString()} icon={CheckCircle} />
                <KPICard label="Avg Order Value" value={`₱${avgOrder.toLocaleString()}`} icon={Package} />
                <KPICard label="Total Payments" value={payments.length.toLocaleString()} icon={Star} />
              </div>
            );
          })()}

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
                    {filteredRevenueRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="py-8 text-center text-sm text-gray-500">
                          No payment revenue records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRevenueRows.map((row) => (
                        <TableRow key={row.id} className="hover:bg-gray-50">
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
                {filteredRevenueRows.length === 0 ? (
                  <div className="rounded-lg border p-4 text-center text-sm text-gray-500">
                    No payment revenue records found
                  </div>
                ) : (
                  filteredRevenueRows.map((row) => (
                    <Card key={row.id} className="p-4">
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
        </TabsContent>

        {/* BOOKING ANALYTICS TAB */}
        <TabsContent value="bookings" className="space-y-6 mt-6">
          {/* KPI Cards */}
          {(() => {
            const total = bookingsSummary?.totalCount ?? 0;
            const completed = bookingsSummary?.byStatus?.completed ?? 0;
            const cancelled = bookingsSummary?.byStatus?.cancelled ?? 0;
            const rate = total > 0 ? ((completed / total) * 100).toFixed(1) : "0.0";
            const avgVal = completed > 0
              ? Math.round((bookingsSummary?.totalRevenue ?? 0) / completed)
              : 0;
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <KPICard label="Total Bookings" value={total.toLocaleString()} icon={Package} />
                <KPICard label="Completed" value={completed.toLocaleString()} icon={CheckCircle} />
                <KPICard label="Cancelled" value={cancelled.toLocaleString()} icon={Package} />
                <KPICard label="Completion Rate" value={`${rate}%`} icon={TrendingUp} />
                <KPICard label="Avg Booking Value" value={`₱${avgVal.toLocaleString()}`} icon={DollarSign} />
                <KPICard label="Recent Bookings" value={(bookingsSummary?.recentCount ?? 0).toLocaleString()} icon={Clock} />
              </div>
            );
          })()}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-[16px] font-semibold">Bookings Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                {bookingsOverTimeData.length === 0 ? (
                  <div className="flex h-[300px] items-center justify-center text-sm text-gray-500">
                    No payment-linked bookings found
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={bookingsOverTimeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: 12 }} />
                      <YAxis stroke="#6b7280" style={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="bookings" stroke="#00BF63" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[16px] font-semibold">Booking Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {bookingStatusData.length === 0 ? (
                  <div className="flex h-[300px] items-center justify-center text-sm text-gray-500">
                    No booking status data found
                  </div>
                ) : (
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
                )}
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
                    {filteredBookingRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="py-8 text-center text-sm text-gray-500">
                          No payment-linked bookings found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBookingRows.map((booking) => (
                        <TableRow key={booking.paymentId} className="hover:bg-gray-50">
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
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden space-y-3">
                {filteredBookingRows.length === 0 ? (
                  <div className="rounded-lg border p-4 text-center text-sm text-gray-500">
                    No payment-linked bookings found
                  </div>
                ) : (
                  filteredBookingRows.map((booking) => (
                    <Card key={booking.paymentId} className="p-4">
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
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PROVIDER PERFORMANCE TAB */}
        <TabsContent value="providers" className="space-y-6 mt-6">
          {/* KPI Cards */}
          {(() => {
            const providerUsers = adminUsers.filter((user) => user.role === "provider");
            const providerCount = providerUsers.length || usersSummary?.byRole?.provider || 0;
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            const newThisMonth = providerUsers.filter(
              (user) =>
                user.createdAt &&
                new Date(user.createdAt).getTime() >= startOfMonth.getTime(),
            ).length;
            const activeProviders = managedProviders.filter(
              (provider) => provider.isActive,
            ).length || providerUsers.filter((user) => user.status === "active").length;
            const suspendedProviders = providerUsers.filter(
              (user) => user.status === "suspended",
            ).length;
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <KPICard label="Total Providers" value={providerCount.toLocaleString()} icon={Users} />
                <KPICard label="New This Month" value={newThisMonth.toLocaleString()} icon={Users} />
                <KPICard label="Active Providers" value={activeProviders.toLocaleString()} icon={CheckCircle} />
                <KPICard label="Suspended" value={suspendedProviders.toLocaleString()} icon={Package} />
                <KPICard label="Total Bookings" value={(bookingsSummary?.totalCount ?? 0).toLocaleString()} icon={TrendingUp} />
                <KPICard label="Completed" value={(bookingsSummary?.byStatus?.completed ?? 0).toLocaleString()} icon={Star} />
              </div>
            );
          })()}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-[16px] font-semibold">Top Providers by Completed Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                {topProvidersByJobsData.length === 0 ? (
                  <div className="flex h-[300px] items-center justify-center text-sm text-gray-500">
                    No completed provider jobs found
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topProvidersByJobsData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" stroke="#6b7280" style={{ fontSize: 12 }} />
                      <YAxis dataKey="provider" type="category" stroke="#6b7280" width={120} style={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="jobs" fill="#00BF63" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[16px] font-semibold">Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {ratingDistributionData.length === 0 ? (
                  <div className="flex h-[300px] items-center justify-center text-sm text-gray-500">
                    No review ratings found
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ratingDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="rating" stroke="#6b7280" style={{ fontSize: 12 }} />
                      <YAxis stroke="#6b7280" style={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} />
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
                    {providerLeaderboardData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="py-8 text-center text-sm text-gray-500">
                          No providers match the current filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      providerLeaderboardData.map((provider) => (
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
                              <span className="font-semibold">{provider.avgRating.toFixed(1)}</span>
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
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden space-y-3">
                {providerLeaderboardData.length === 0 ? (
                  <div className="rounded-lg border p-4 text-center text-sm text-gray-500">
                    No providers match the current filters
                  </div>
                ) : (
                  providerLeaderboardData.map((provider) => (
                    <Card key={provider.id} className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[14px] font-semibold">{provider.provider}</p>
                            <p className="text-[12px] text-gray-500">{provider.categoryFocus}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-[14px] font-semibold">{provider.avgRating.toFixed(1)}</span>
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
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CUSTOMER GROWTH TAB */}
        <TabsContent value="customers" className="space-y-6 mt-6">
          {/* KPI Cards */}
          {(() => {
            const customerUsers = adminUsers.filter((user) => user.role === "customer");
            const customerCount = customerUsers.length || usersSummary?.byRole?.customer || 0;
            const activeCustomers = customerUsers.filter(
              (user) => user.status === "active",
            ).length;
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            const newThisMonth = customerUsers.filter(
              (user) =>
                user.createdAt &&
                new Date(user.createdAt).getTime() >= startOfMonth.getTime(),
            ).length;
            const totalSpend = payments
              .filter((payment) => payment.status === "paid")
              .reduce((s, p) => s + p.amount, 0);
            const recentSignups = customerUsers.filter((user) => {
              if (!user.createdAt) return false;
              const createdAt = new Date(user.createdAt);
              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              return createdAt.getTime() >= thirtyDaysAgo.getTime();
            }).length;
            const fmtM = (n: number) => n >= 1_000_000 ? `₱${(n / 1_000_000).toFixed(2)}M` : `₱${(n / 1000).toFixed(0)}K`;
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <KPICard label="Total Customers" value={customerCount.toLocaleString()} icon={Users} />
                <KPICard label="Active Customers" value={activeCustomers.toLocaleString()} icon={Users} />
                <KPICard label="New This Month" value={newThisMonth.toLocaleString()} icon={CheckCircle} />
                <KPICard label="Total Bookings" value={(bookingsSummary?.totalCount ?? 0).toLocaleString()} icon={Package} />
                <KPICard label="Total Spend" value={fmtM(totalSpend)} icon={DollarSign} />
                <KPICard label="Recent Signups" value={recentSignups.toLocaleString()} icon={TrendingUp} />
              </div>
            );
          })()}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-[16px] font-semibold">New Customers Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                {newCustomersOverTimeData.length === 0 ? (
                  <div className="flex h-[300px] items-center justify-center text-sm text-gray-500">
                    No customer signups found
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={newCustomersOverTimeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: 12 }} />
                      <YAxis stroke="#6b7280" style={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="customers" stroke="#00BF63" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[16px] font-semibold">Repeat vs New Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {repeatVsNewData.length === 0 ? (
                  <div className="flex h-[300px] items-center justify-center text-sm text-gray-500">
                    No customer payment activity found
                  </div>
                ) : (
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
                )}
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
                    {customerSummaryData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-8 text-center text-sm text-gray-500">
                          No customers match the current filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      customerSummaryData.map((customer) => (
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
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden space-y-3">
                {customerSummaryData.length === 0 ? (
                  <div className="rounded-lg border p-4 text-center text-sm text-gray-500">
                    No customers match the current filters
                  </div>
                ) : (
                  customerSummaryData.map((customer) => (
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
                  ))
                )}
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
