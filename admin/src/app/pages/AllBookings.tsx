import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
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
import {
  Search,
  Filter,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  DollarSign,
  TrendingUp,
  CalendarClock,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  listAdminBookings,
  type AdminBookingStatus,
  type AdminBookingSummary,
} from "../../services/serveaseAdminApi";

type BookingTab = "all" | "upcoming" | "ongoing" | "completed" | "cancelled";

export function AllBookings() {
  const { accessToken } = useAuth();
  const [bookings, setBookings] = useState<AdminBookingSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [activeTab, setActiveTab] = useState<BookingTab>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");

  useEffect(() => {
    if (!accessToken) return;

    const loadBookings = async () => {
      setIsLoading(true);
      try {
        setBookings(await listAdminBookings(accessToken, { limit: 200 }));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load bookings.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadBookings();
  }, [accessToken]);

  // Filter bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      // Tab-based filtering
      let matchesTab = true;

      switch (activeTab) {
        case "upcoming":
          matchesTab = booking.status === "pending" || booking.status === "confirmed";
          break;
        case "ongoing":
          matchesTab = booking.status === "in_progress";
          break;
        case "completed":
          matchesTab = booking.status === "completed";
          break;
        case "cancelled":
          matchesTab = booking.status === "cancelled";
          break;
        case "all":
        default:
          matchesTab = true;
      }

      const matchesSearch =
        booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.bookingReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.customerFullName ?? booking.customerId).toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.providerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.serviceTitle ?? "").toLowerCase().includes(searchTerm.toLowerCase());

      // Date filter logic
      let matchesDate = true;
      if (dateFilter !== "all") {
        const bookingDate = new Date(booking.scheduledAt);
        const today = new Date();
        const daysDiff = Math.floor((today.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));

        switch (dateFilter) {
          case "today":
            matchesDate = daysDiff === 0;
            break;
          case "week":
            matchesDate = daysDiff <= 7;
            break;
          case "month":
            matchesDate = daysDiff <= 30;
            break;
        }
      }

      return matchesTab && matchesSearch && matchesDate;
    });
  }, [bookings, activeTab, searchTerm, dateFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = filteredBookings.length;
    const completed = filteredBookings.filter((b) => b.status === "completed").length;
    const inProgress = filteredBookings.filter((b) => b.status === "in_progress").length;
    const cancelled = filteredBookings.filter((b) => b.status === "cancelled").length;
    const totalRevenue = filteredBookings
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + b.totalAmount, 0);
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return { total, completed, inProgress, cancelled, totalRevenue, completionRate };
  }, [filteredBookings]);

  const getStatusBadge = (status: AdminBookingStatus) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Activity className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        );
      case "confirmed":
        return (
          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">All Bookings</h1>
        <p className="text-gray-500 mt-1">
          Manage and monitor all service bookings across the platform
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Bookings</p>
                <p className="text-xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#DCFCE7]">
                <CheckCircle className="w-5 h-5 text-[#16A34A]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Completed</p>
                <p className="text-xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">In Progress</p>
                <p className="text-xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-50">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Cancelled</p>
                <p className="text-xl font-bold text-gray-900">{stats.cancelled}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#DCFCE7]">
                <DollarSign className="w-5 h-5 text-[#16A34A]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Revenue</p>
                <p className="text-xl font-bold text-gray-900">
                  ₱{(stats.totalRevenue / 1000).toFixed(1)}K
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Completion Rate</p>
                <p className="text-xl font-bold text-gray-900">{stats.completionRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Booking List</CardTitle>
            
            {/* Tab Navigation */}
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "all"
                    ? "bg-[#16A34A] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "upcoming"
                    ? "bg-[#16A34A] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab("ongoing")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "ongoing"
                    ? "bg-[#16A34A] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Ongoing
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "completed"
                    ? "bg-[#16A34A] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setActiveTab("cancelled")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "cancelled"
                    ? "bg-[#16A34A] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Cancelled
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by ID, customer, provider..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Scheduled Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Escalations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      {isLoading ? "Loading bookings..." : "No backend bookings found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => {
                    return (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <span className="font-mono font-semibold text-[#16A34A]">
                            {booking.bookingReference}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">
                              {booking.customerFullName ?? "Customer"}
                            </p>
                            <p className="text-xs text-gray-500">{booking.customerId}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{booking.providerId}</p>
                            <p className="text-xs text-gray-500">Provider ID</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-700">{booking.serviceTitle ?? "Service booking"}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {new Date(booking.scheduledAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-gray-900">
                            ₱{booking.totalAmount.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell>
                          {booking.escalationCount > 0 ? (
                            <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                              {booking.escalationCount} escalated
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-gray-300 text-gray-600">
                              None
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
