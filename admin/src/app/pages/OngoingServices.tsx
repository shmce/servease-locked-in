import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Search,
  MapPin,
  CreditCard,
  MessageSquare,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import {
  cancelAdminBooking,
  escalateAdminBooking,
  listAdminBookingMessages,
  listAdminBookings,
  sendAdminProviderMessage,
  type AdminBookingMessage,
  type AdminBookingStatus,
  type AdminBookingSummary,
} from "../../services/serveaseAdminApi";

type LiveStatus = "Scheduled" | "In Progress" | "Completed" | "Cancelled";
type PaymentStatus = "Paid" | "Pending" | "Failed";

interface OngoingService {
  id: string;
  bookingId: string;
  customer: string;
  provider: string;
  category: string;
  startTime: string;
  expectedCompletion: string;
  liveStatus: LiveStatus;
  paymentStatus: PaymentStatus;
  location: string;
  amount: number;
}

const initialServices: OngoingService[] = [
  {
    id: "SVC-001",
    bookingId: "BK-2026-001850",
    customer: "Maria Santos",
    provider: "HomeFixPro Manila",
    category: "Home Maintenance & Repair",
    startTime: "2026-03-04T09:00:00",
    expectedCompletion: "2026-03-04T12:00:00",
    liveStatus: "In Progress",
    paymentStatus: "Paid",
    location: "Makati City, Metro Manila",
    amount: 3500,
  },
  {
    id: "SVC-002",
    bookingId: "BK-2026-001851",
    customer: "Roberto Garcia",
    provider: "Glow Beauty Spa",
    category: "Beauty, Wellness & Personal Care",
    startTime: "2026-03-04T10:00:00",
    expectedCompletion: "2026-03-04T11:30:00",
    liveStatus: "In Progress",
    paymentStatus: "Paid",
    location: "Quezon City, Metro Manila",
    amount: 2800,
  },
  {
    id: "SVC-003",
    bookingId: "BK-2026-001852",
    customer: "Ana Cruz",
    provider: "Party Perfect Planners",
    category: "Events & Entertainment",
    startTime: "2026-03-04T08:00:00",
    expectedCompletion: "2026-03-04T14:00:00",
    liveStatus: "In Progress",
    paymentStatus: "Paid",
    location: "Pasig City, Metro Manila",
    amount: 12500,
  },
  {
    id: "SVC-004",
    bookingId: "BK-2026-001853",
    customer: "Gabriel Sanchez",
    provider: "FitLife Wellness Center",
    category: "Health & Fitness",
    startTime: "2026-03-04T13:00:00",
    expectedCompletion: "2026-03-04T14:00:00",
    liveStatus: "Scheduled",
    paymentStatus: "Paid",
    location: "Taguig City, Metro Manila",
    amount: 2000,
  },
  {
    id: "SVC-005",
    bookingId: "BK-2026-001854",
    customer: "Carlos Aquino",
    provider: "Pawsome Pet Care",
    category: "Pet Services",
    startTime: "2026-03-04T11:00:00",
    expectedCompletion: "2026-03-04T12:30:00",
    liveStatus: "In Progress",
    paymentStatus: "Paid",
    location: "Mandaluyong City, Metro Manila",
    amount: 1500,
  },
  {
    id: "SVC-006",
    bookingId: "BK-2026-001855",
    customer: "Jose Reyes",
    provider: "GadgetFix Tech Services",
    category: "Automotive & Tech Support",
    startTime: "2026-03-04T14:00:00",
    expectedCompletion: "2026-03-04T16:00:00",
    liveStatus: "Scheduled",
    paymentStatus: "Paid",
    location: "Manila City, Metro Manila",
    amount: 3500,
  },
  {
    id: "SVC-007",
    bookingId: "BK-2026-001856",
    customer: "Fernando Lopez",
    provider: "ElectroPro Electricians",
    category: "Home Maintenance & Repair",
    startTime: "2026-03-04T07:00:00",
    expectedCompletion: "2026-03-04T10:00:00",
    liveStatus: "Completed",
    paymentStatus: "Paid",
    location: "Paranaque City, Metro Manila",
    amount: 3800,
  },
  {
    id: "SVC-008",
    bookingId: "BK-2026-001857",
    customer: "Antonio Rivera",
    provider: "Radiant Skin Clinic",
    category: "Beauty, Wellness & Personal Care",
    startTime: "2026-03-04T08:30:00",
    expectedCompletion: "2026-03-04T10:00:00",
    liveStatus: "Completed",
    paymentStatus: "Paid",
    location: "Quezon City, Metro Manila",
    amount: 3500,
  },
  {
    id: "SVC-009",
    bookingId: "BK-2026-001858",
    customer: "Angelica Ramos",
    provider: "QuickFix Plumbing",
    category: "Home Maintenance & Repair",
    startTime: "2026-03-04T06:00:00",
    expectedCompletion: "2026-03-04T09:00:00",
    liveStatus: "In Progress",
    paymentStatus: "Paid",
    location: "Makati City, Metro Manila",
    amount: 2800,
  },
  {
    id: "SVC-010",
    bookingId: "BK-2026-001859",
    customer: "Luisa Mendoza",
    provider: "Happy Paws Veterinary",
    category: "Pet Services",
    startTime: "2026-03-04T15:00:00",
    expectedCompletion: "2026-03-04T16:30:00",
    liveStatus: "Scheduled",
    paymentStatus: "Paid",
    location: "Pasay City, Metro Manila",
    amount: 2800,
  },
];

function toLiveStatus(status: AdminBookingStatus): LiveStatus {
  switch (status) {
    case "confirmed":
    case "pending":
      return "Scheduled";
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "cancelled":
    case "rejected":
      return "Cancelled";
  }
}

function toOngoingService(booking: AdminBookingSummary): OngoingService {
  const startTime = booking.scheduledAt;
  const expectedCompletion = new Date(new Date(startTime).getTime() + 2 * 60 * 60 * 1000).toISOString();

  return {
    id: booking.id,
    bookingId: booking.bookingReference,
    customer: booking.customerFullName ?? booking.customerId,
    provider: booking.providerId,
    category: booking.serviceTitle ?? "Service booking",
    startTime,
    expectedCompletion,
    liveStatus: toLiveStatus(booking.status),
    paymentStatus: booking.status === "cancelled" ? "Failed" : "Pending",
    location: booking.serviceAddress ?? "No address recorded",
    amount: booking.totalAmount,
  };
}

export function OngoingServices() {
  const { accessToken } = useAuth();
  const [services, setServices] = useState<OngoingService[]>(initialServices.slice(0, 0));
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<OngoingService | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [escalationReason, setEscalationReason] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [threadMessages, setThreadMessages] = useState<AdminBookingMessage[]>([]);
  const [isLoadingThread, setIsLoadingThread] = useState(false);

  const loadThreadFor = async (bookingId: string) => {
    if (!accessToken) return;
    setIsLoadingThread(true);
    try {
      const data = await listAdminBookingMessages(accessToken, bookingId);
      setThreadMessages(data);
    } catch {
      setThreadMessages([]);
    } finally {
      setIsLoadingThread(false);
    }
  };

  useEffect(() => {
    if (!accessToken) return;

    const loadServices = async () => {
      setIsLoading(true);
      try {
        const data = await listAdminBookings(accessToken, { limit: 200 });
        setServices(data.map(toOngoingService));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load active services.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadServices();
  }, [accessToken]);

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.provider.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "all" || service.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || service.liveStatus === statusFilter;
    const matchesLocation =
      locationFilter === "all" || service.location.includes(locationFilter);

    return matchesSearch && matchesCategory && matchesStatus && matchesLocation;
  });

  const activeBookings = services.filter((s) => s.liveStatus === "Scheduled" || s.liveStatus === "In Progress").length;
  const inProgress = services.filter((s) => s.liveStatus === "In Progress").length;
  const delayedServices = services.filter((s) => {
    if (s.liveStatus !== "In Progress") return false;
    const expected = new Date(s.expectedCompletion);
    const now = new Date();
    return now > expected;
  }).length;
  const completedToday = services.filter((s) => s.liveStatus === "Completed").length;

  const stats = [
    {
      title: "Active Bookings",
      value: activeBookings.toString(),
      change: "Scheduled + In Progress",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "In Progress",
      value: inProgress.toString(),
      change: "Currently being served",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Delayed Services",
      value: delayedServices.toString(),
      change: "Past expected time",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Completed Today",
      value: completedToday.toString(),
      change: "Successfully finished",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  const getStatusBadge = (status: LiveStatus) => {
    switch (status) {
      case "Scheduled":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Calendar className="w-3 h-3 mr-1" />
            Scheduled
          </Badge>
        );
      case "In Progress":
        return (
          <Badge className="bg-orange-100 text-orange-700 border-orange-200">
            <Clock className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        );
      case "Completed":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "Cancelled":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
    }
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case "Paid":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CreditCard className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        );
      case "Pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "Failed":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
    }
  };

  const handleForceCancel = (service: OngoingService) => {
    setSelectedService(service);
    setCancelReason("");
    setCancelModalOpen(true);
  };

  const handleEscalateDispute = (service: OngoingService) => {
    setSelectedService(service);
    setEscalationReason("");
    setEscalateModalOpen(true);
  };

  const handleContactProvider = (service: OngoingService) => {
    setSelectedService(service);
    setContactMessage("");
    setThreadMessages([]);
    setContactModalOpen(true);
    void loadThreadFor(service.id);
  };

  const handleConfirmCancel = async () => {
    if (!selectedService || !cancelReason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }

    if (!accessToken) return;

    try {
      const updated = await cancelAdminBooking(accessToken, selectedService.id, {
        reason: cancelReason,
      });
      setServices((current) =>
        current.map((service) =>
          service.id === selectedService.id ? toOngoingService(updated) : service,
        ),
      );
      setCancelModalOpen(false);
      toast.success(`Booking ${updated.bookingReference} cancelled.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to cancel booking.");
    }
  };

  const handleConfirmEscalate = async () => {
    if (!selectedService || !escalationReason.trim()) {
      toast.error("Please provide an escalation reason");
      return;
    }

    if (!accessToken) return;

    try {
      const updated = await escalateAdminBooking(accessToken, selectedService.id, {
        reason: escalationReason,
        priority: "high",
      });
      setServices((current) =>
        current.map((service) =>
          service.id === selectedService.id ? toOngoingService(updated) : service,
        ),
      );
      setEscalateModalOpen(false);
      toast.success(`Booking ${updated.bookingReference} escalated.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to escalate booking.");
    }
  };

  const handleSendMessage = async () => {
    if (!selectedService || !contactMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (!accessToken) return;

    try {
      await sendAdminProviderMessage(
        accessToken,
        selectedService.id,
        contactMessage,
      );
      setContactMessage("");
      await loadThreadFor(selectedService.id);
      toast.success(`Message sent to ${selectedService.provider}.`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to message provider.",
      );
    }
  };

  const formatTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ongoing Services</h1>
        <p className="text-gray-500 mt-1">
          Monitor active service bookings in real-time
        </p>
      </div>

      {/* Stats */}
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

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Service Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by Booking ID, Customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Home Maintenance & Repair">Home Maintenance</SelectItem>
                <SelectItem value="Beauty, Wellness & Personal Care">Beauty & Wellness</SelectItem>
                <SelectItem value="Events & Entertainment">Events</SelectItem>
                <SelectItem value="Pet Services">Pet Services</SelectItem>
                <SelectItem value="Health & Fitness">Health & Fitness</SelectItem>
                <SelectItem value="Automotive & Tech Support">Auto & Tech</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Location Filter */}
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <MapPin className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="Makati">Makati City</SelectItem>
                <SelectItem value="Quezon">Quezon City</SelectItem>
                <SelectItem value="Pasig">Pasig City</SelectItem>
                <SelectItem value="Taguig">Taguig City</SelectItem>
                <SelectItem value="Manila">Manila City</SelectItem>
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
                  <TableHead>Service Provider</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>Expected Completion</TableHead>
                  <TableHead>Live Status</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      {isLoading ? "Loading services..." : "No backend services found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <span className="font-mono font-semibold text-blue-600">
                          {service.bookingId}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-gray-900">{service.customer}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700">{service.provider}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{service.category}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700">
                          {formatTime(service.startTime)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700">
                          {formatTime(service.expectedCompletion)}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(service.liveStatus)}</TableCell>
                      <TableCell>{getPaymentBadge(service.paymentStatus)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleContactProvider(service)}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          <Select>
                            <SelectTrigger className="w-[100px] h-9">
                              <SelectValue placeholder="Actions" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem
                                value="cancel"
                                onSelect={() => handleForceCancel(service)}
                              >
                                Force Cancel
                              </SelectItem>
                              <SelectItem
                                value="escalate"
                                onSelect={() => handleEscalateDispute(service)}
                              >
                                Escalate to Dispute
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Force Cancel Modal */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Force Cancel Booking</DialogTitle>
            <DialogDescription>
              This action will cancel the booking. Please provide a reason.
            </DialogDescription>
          </DialogHeader>

          {selectedService && (
            <div className="py-4 space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Booking ID:</span>
                    <span className="font-mono font-semibold">{selectedService.bookingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Customer:</span>
                    <span className="font-semibold">{selectedService.customer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Provider:</span>
                    <span className="font-semibold">{selectedService.provider}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Cancellation Reason
                </label>
                <textarea
                  className="w-full min-h-[100px] p-3 border rounded-lg resize-none"
                  placeholder="Enter reason for cancellation..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>

              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">
                    Both customer and provider will be notified. This action is logged in the audit
                    trail.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmCancel} className="bg-red-600 hover:bg-red-700">
              <XCircle className="w-4 h-4 mr-2" />
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Escalate to Dispute Modal */}
      <Dialog open={escalateModalOpen} onOpenChange={setEscalateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escalate to Dispute</DialogTitle>
            <DialogDescription>
              This will create a dispute case for admin review.
            </DialogDescription>
          </DialogHeader>

          {selectedService && (
            <div className="py-4 space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Booking ID:</span>
                    <span className="font-mono font-semibold">{selectedService.bookingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Customer:</span>
                    <span className="font-semibold">{selectedService.customer}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Escalation Reason
                </label>
                <textarea
                  className="w-full min-h-[100px] p-3 border rounded-lg resize-none"
                  placeholder="Enter reason for escalation..."
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                />
              </div>

              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <p className="text-sm text-yellow-700">
                    The case will be moved to Disputes & Resolutions for full review.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEscalateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmEscalate} className="bg-orange-600 hover:bg-orange-700">
              <TrendingUp className="w-4 h-4 mr-2" />
              Escalate Case
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Provider Modal */}
      <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Service Provider</DialogTitle>
            <DialogDescription>
              Send an internal message to the service provider.
            </DialogDescription>
          </DialogHeader>

          {selectedService && (
            <div className="py-4 space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Provider:</span>
                    <span className="font-semibold">{selectedService.provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Booking ID:</span>
                    <span className="font-mono font-semibold">{selectedService.bookingId}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Conversation history
                </label>
                <div className="border rounded-lg bg-white max-h-64 overflow-y-auto p-3 space-y-3">
                  {isLoadingThread ? (
                    <p className="text-sm text-gray-500">Loading conversation...</p>
                  ) : threadMessages.length === 0 ? (
                    <p className="text-sm text-gray-500">No messages yet.</p>
                  ) : (
                    threadMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`rounded-lg p-3 text-sm ${
                          msg.senderRole === "admin"
                            ? "bg-blue-50 border border-blue-100"
                            : "bg-gray-50 border border-gray-100"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold capitalize">
                            {msg.senderRole}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(msg.createdAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-gray-800 whitespace-pre-wrap">{msg.body}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">New message</label>
                <textarea
                  className="w-full min-h-[100px] p-3 border rounded-lg resize-none"
                  placeholder="Enter your message..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <p className="text-sm text-blue-700">
                    Messages are persisted in the booking thread and delivered to the
                    provider as a notification.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setContactModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-700">
              <MessageSquare className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
