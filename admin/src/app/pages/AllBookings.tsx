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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Search,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  DollarSign,
  TrendingUp,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  cancelAdminBooking,
  escalateAdminBooking,
  getAdminBooking,
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
  const [selectedBooking, setSelectedBooking] = useState<AdminBookingSummary | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelExplanation, setCancelExplanation] = useState("");
  const [escalationReason, setEscalationReason] = useState("");
  const [isActionBusy, setIsActionBusy] = useState(false);

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

  const upsertBooking = (booking: AdminBookingSummary) => {
    setBookings((current) =>
      current.map((item) => (item.id === booking.id ? booking : item)),
    );
    setSelectedBooking(booking);
  };

  const openBookingDetail = async (booking: AdminBookingSummary) => {
    setSelectedBooking(booking);
    setDetailOpen(true);

    if (!accessToken) return;

    try {
      upsertBooking(await getAdminBooking(accessToken, booking.id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to inspect booking.");
    }
  };

  const openCancelDialog = (booking: AdminBookingSummary) => {
    setSelectedBooking(booking);
    setCancelReason("");
    setCancelExplanation("");
    setCancelOpen(true);
  };

  const openEscalateDialog = (booking: AdminBookingSummary) => {
    setSelectedBooking(booking);
    setEscalationReason("");
    setEscalateOpen(true);
  };

  const confirmCancelBooking = async () => {
    if (!accessToken || !selectedBooking) return;
    if (!cancelReason.trim()) {
      toast.error("Provide a cancellation reason.");
      return;
    }

    setIsActionBusy(true);
    try {
      const updated = await cancelAdminBooking(accessToken, selectedBooking.id, {
        reason: cancelReason.trim(),
        explanation: cancelExplanation.trim() || null,
      });
      upsertBooking(updated);
      setCancelOpen(false);
      toast.success(`Booking ${updated.bookingReference} cancelled.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to cancel booking.");
    } finally {
      setIsActionBusy(false);
    }
  };

  const confirmEscalateBooking = async () => {
    if (!accessToken || !selectedBooking) return;
    if (!escalationReason.trim()) {
      toast.error("Provide an escalation reason.");
      return;
    }

    setIsActionBusy(true);
    try {
      const updated = await escalateAdminBooking(accessToken, selectedBooking.id, {
        reason: escalationReason.trim(),
        priority: "high",
      });
      upsertBooking(updated);
      setEscalateOpen(false);
      toast.success(`Booking ${updated.bookingReference} escalated.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to escalate booking.");
    } finally {
      setIsActionBusy(false);
    }
  };

  const canCancel = (status: AdminBookingStatus) =>
    status === "pending" || status === "confirmed" || status === "in_progress";

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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
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
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => void openBookingDetail(booking)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEscalateDialog(booking)}
                            >
                              <AlertTriangle className="w-4 h-4 mr-1" />
                              Escalate
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!canCancel(booking.status)}
                              onClick={() => openCancelDialog(booking)}
                              className="text-red-700 hover:text-red-800"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
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

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Detail</DialogTitle>
            <DialogDescription>
              Inspect the current gateway record and operational history.
            </DialogDescription>
          </DialogHeader>

          {selectedBooking ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
              <Detail label="Booking ID" value={selectedBooking.bookingReference} />
              <Detail label="Status" value={selectedBooking.status.replace("_", " ")} />
              <Detail label="Customer" value={selectedBooking.customerFullName ?? selectedBooking.customerId} />
              <Detail label="Customer Contact" value={selectedBooking.customerContactNumber ?? "Not provided"} />
              <Detail label="Provider ID" value={selectedBooking.providerId} />
              <Detail label="Service" value={selectedBooking.serviceTitle ?? "Service booking"} />
              <Detail label="Scheduled" value={new Date(selectedBooking.scheduledAt).toLocaleString()} />
              <Detail label="Amount" value={`₱${selectedBooking.totalAmount.toLocaleString()}`} />
              <Detail label="Address" value={selectedBooking.serviceAddress ?? "No address recorded"} wide />
              <Detail label="Escalations" value={String(selectedBooking.escalationCount)} />
              <Detail label="Latest Escalation" value={selectedBooking.latestEscalationReason ?? "None"} wide />
              <Detail label="Cancel Reason" value={selectedBooking.cancelReason ?? "None"} wide />
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              This changes the booking through Booking Service and writes an audit log.
            </DialogDescription>
          </DialogHeader>

          {selectedBooking ? (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border bg-gray-50 p-4">
                <p className="font-mono text-sm font-semibold text-gray-900">
                  {selectedBooking.bookingReference}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedBooking.customerFullName ?? selectedBooking.customerId}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <textarea
                  className="w-full min-h-[96px] resize-none rounded-lg border p-3"
                  value={cancelReason}
                  onChange={(event) => setCancelReason(event.target.value)}
                  placeholder="Reason shown in operations history"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Explanation
                </label>
                <textarea
                  className="w-full min-h-[96px] resize-none rounded-lg border p-3"
                  value={cancelExplanation}
                  onChange={(event) => setCancelExplanation(event.target.value)}
                  placeholder="Optional internal explanation"
                />
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Keep Booking
            </Button>
            <Button
              onClick={() => void confirmCancelBooking()}
              disabled={isActionBusy}
              className="bg-red-600 hover:bg-red-700"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Confirm Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={escalateOpen} onOpenChange={setEscalateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escalate Booking</DialogTitle>
            <DialogDescription>
              Create a high-priority Booking Service escalation for admin follow-up.
            </DialogDescription>
          </DialogHeader>

          {selectedBooking ? (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border bg-gray-50 p-4">
                <p className="font-mono text-sm font-semibold text-gray-900">
                  {selectedBooking.bookingReference}
                </p>
                <p className="text-sm text-gray-600">
                  Current escalations: {selectedBooking.escalationCount}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escalation Reason
                </label>
                <textarea
                  className="w-full min-h-[120px] resize-none rounded-lg border p-3"
                  value={escalationReason}
                  onChange={(event) => setEscalationReason(event.target.value)}
                  placeholder="Reason for escalation"
                />
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEscalateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => void confirmEscalateBooking()}
              disabled={isActionBusy}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Escalate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Detail({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "md:col-span-2" : undefined}>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}
