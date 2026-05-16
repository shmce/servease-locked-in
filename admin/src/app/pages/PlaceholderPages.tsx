import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
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
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Eye,
  MessageSquare,
  Package,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
  XCircle,
  DollarSign,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  getAdminUsersSummary,
  listAdminSupportTickets,
  listAdminUsers,
  sendAdminBroadcast,
  updateAdminSupportTicketStatus,
  updateAdminUserStatus,
  type AdminBroadcastAudience,
  type AdminBroadcastResult,
  type AdminSupportTicketStatus,
  type AdminSupportTicketSummary,
  type AdminUserStatus,
  type AdminUserSummary,
  type AdminUsersSummaryStats,
} from "../../services/serveaseAdminApi";
import { toast } from "sonner";
import { usePersistentState } from "../../hooks/usePersistentState";

export function Customers() {
  const { accessToken } = useAuth();
  const [customers, setCustomers] = useState<AdminUserSummary[]>([]);
  const [summary, setSummary] = useState<AdminUsersSummaryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleSetCustomerStatus = useCallback(
    async (customer: AdminUserSummary, nextStatus: AdminUserStatus) => {
      if (!accessToken) return;
      setPendingId(customer.id);
      try {
        const updated = await updateAdminUserStatus(
          accessToken,
          customer.id,
          nextStatus,
        );
        setCustomers((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
        toast.success(
          nextStatus === "active"
            ? `${updated.fullName ?? updated.email} restored.`
            : `${updated.fullName ?? updated.email} suspended.`,
        );
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to update customer.",
        );
      } finally {
        setPendingId(null);
      }
    },
    [accessToken],
  );

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    Promise.all([
      listAdminUsers(accessToken, { role: "customer" }),
      getAdminUsersSummary(accessToken).catch(() => null),
    ])
      .then(([nextCustomers, nextSummary]) => {
        if (cancelled) return;
        setCustomers(nextCustomers);
        setSummary(nextSummary);
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadError(
          error instanceof Error ? error.message : "Unable to load customers.",
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const filteredCustomers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((customer) => {
      const haystack = [
        customer.fullName ?? "",
        customer.email,
        customer.id,
        customer.contactNumber ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [customers, searchTerm]);

  const activeCount = customers.filter((customer) => customer.status === "active").length;
  const suspendedCount = customers.filter(
    (customer) => customer.status === "suspended",
  ).length;

  const stats = [
    {
      title: "Total Customers",
      value: (summary?.byRole.customer ?? customers.length).toString(),
      change: `${activeCount} active`,
      icon: Users,
      color: "text-[#16A34A]",
      bgColor: "bg-[#DCFCE7]",
    },
    {
      title: "New This Month",
      value: (summary?.newThisMonth ?? 0).toString(),
      change: "Recent signups",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active",
      value: activeCount.toString(),
      change: "Currently active",
      icon: CheckCircle,
      color: "text-[#16A34A]",
      bgColor: "bg-[#DCFCE7]",
    },
    {
      title: "Suspended",
      value: suspendedCount.toString(),
      change: "Restricted accounts",
      icon: AlertCircle,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-500 mt-1">
          Manage and monitor all customers on the platform
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

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {loadError ? (
            <div className="mb-4 text-sm text-red-600">{loadError}</div>
          ) : null}
          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Member Since</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Loading customers…
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <span className="font-mono font-semibold text-[#16A34A]">
                          {customer.id.slice(0, 8).toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-gray-900">
                          {customer.fullName ?? "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{customer.email}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {customer.contactNumber ?? "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {customer.createdAt
                            ? new Date(customer.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {customer.status === "active" ? (
                          <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : customer.status === "suspended" ? (
                          <Badge className="bg-amber-50 text-amber-700 border-amber-200">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Suspended
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <XCircle className="w-3 h-3 mr-1" />
                            {customer.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {customer.status === "active" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              void handleSetCustomerStatus(customer, "suspended")
                            }
                            disabled={pendingId === customer.id}
                            className="text-amber-700 hover:text-amber-800 hover:bg-amber-50"
                          >
                            {pendingId === customer.id ? "Updating…" : "Suspend"}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() =>
                              void handleSetCustomerStatus(customer, "active")
                            }
                            disabled={pendingId === customer.id}
                          >
                            {pendingId === customer.id ? "Updating…" : "Restore"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Coming-soon placeholder helper ──────────────────────────── */
function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 mt-1">{description}</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-[#DCFCE7] rounded-2xl flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-[#16A34A]" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Coming Soon</h2>
          <p className="text-gray-400 text-sm max-w-sm">
            This section is under development and will be available in a future update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function Support() {
  const { accessToken } = useAuth();
  const [tickets, setTickets] = useState<AdminSupportTicketSummary[]>([]);
  const [searchTerm, setSearchTerm] = usePersistentState(
    "servease_admin_support_search",
    "",
  );
  const [statusFilter, setStatusFilter] = usePersistentState<
    AdminSupportTicketStatus | "all"
  >("servease_admin_support_status", "all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<AdminSupportTicketSummary | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    ticket: AdminSupportTicketSummary;
    nextStatus: AdminSupportTicketStatus;
  } | null>(null);

  const loadTickets = useCallback(async () => {
    if (!accessToken) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await listAdminSupportTickets(
        accessToken,
        statusFilter === "all" ? null : statusFilter,
      );
      setTickets(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load tickets.");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, statusFilter]);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  const filteredTickets = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    return tickets.filter((ticket) => {
      return (
        ticket.id.toLowerCase().includes(normalizedSearch) ||
        ticket.userId.toLowerCase().includes(normalizedSearch) ||
        ticket.subject.toLowerCase().includes(normalizedSearch) ||
        ticket.category?.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [searchTerm, tickets]);

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((ticket) => ticket.status === "open").length,
      inProgress: tickets.filter((ticket) => ticket.status === "in_progress").length,
      resolved: tickets.filter(
        (ticket) => ticket.status === "resolved" || ticket.status === "closed",
      ).length,
    };
  }, [tickets]);

  const requestStatusChange = (
    ticket: AdminSupportTicketSummary,
    nextStatus: AdminSupportTicketStatus,
  ) => {
    if (nextStatus === ticket.status) return;
    setPendingStatusChange({ ticket, nextStatus });
  };

  const confirmStatusChange = async () => {
    if (!accessToken || !pendingStatusChange) return;

    const { ticket, nextStatus } = pendingStatusChange;
    setUpdatingTicketId(ticket.id);

    try {
      const updated = await updateAdminSupportTicketStatus(
        accessToken,
        ticket.id,
        nextStatus,
      );
      setTickets((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      toast.success(`Ticket ${updated.id} updated to ${nextStatus}.`);
      setPendingStatusChange(null);
    } catch (updateError) {
      toast.error(
        updateError instanceof Error ? updateError.message : "Unable to update ticket.",
      );
    } finally {
      setUpdatingTicketId(null);
    }
  };

  const exportCsv = () => {
    const rows = filteredTickets.map((ticket) => [
      ticket.id,
      ticket.userId,
      ticket.subject,
      ticket.message ?? "",
      ticket.category ?? "",
      ticket.status,
      ticket.createdAt ?? "",
    ]);
    const csv = [
      ["Ticket ID", "User ID", "Subject", "Message", "Category", "Status", "Created At"],
      ...rows,
    ]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `admin-support-tickets-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const getTicketBadge = (status: AdminSupportTicketStatus) => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Open
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Clock className="w-3 h-3 mr-1" />
            In progress
          </Badge>
        );
      case "resolved":
        return (
          <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]">
            <CheckCircle className="w-3 h-3 mr-1" />
            Resolved
          </Badge>
        );
      case "closed":
        return (
          <Badge className="bg-gray-100 text-gray-700 border-gray-200">
            <XCircle className="w-3 h-3 mr-1" />
            Closed
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Support</h1>
          <p className="text-gray-500 mt-1">
            Manage customer and provider support tickets from the admin gateway
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => void loadTickets()} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button className="bg-[#16A34A] hover:bg-[#15803D]" onClick={exportCsv}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#DCFCE7]">
                <MessageSquare className="w-6 h-6 text-[#16A34A]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Open</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.open}</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.inProgress}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Resolved/Closed</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.resolved}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#DCFCE7]">
                <CheckCircle className="w-6 h-6 text-[#16A34A]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search ticket, user, subject, category..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as AdminSupportTicketStatus | "all")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Update</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Loading support tickets...
                    </TableCell>
                  </TableRow>
                ) : filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No support tickets found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <span className="font-mono font-semibold text-[#16A34A]">
                          {ticket.id}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-gray-600">
                        {ticket.userId}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xl">
                          <p className="font-medium text-gray-900">{ticket.subject}</p>
                          {ticket.message && (
                            <p className="text-sm text-gray-500 line-clamp-2">
                              {ticket.message}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {ticket.category ?? "Uncategorized"}
                      </TableCell>
                      <TableCell>{getTicketBadge(ticket.status)}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {ticket.createdAt
                          ? new Date(ticket.createdAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={ticket.status}
                          onValueChange={(value) =>
                            requestStatusChange(ticket, value as AdminSupportTicketStatus)
                          }
                          disabled={updatingTicketId === ticket.id}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Support Ticket Details</DialogTitle>
            <DialogDescription>
              Backend support ticket record from the admin gateway.
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SupportDetail label="Ticket ID" value={selectedTicket.id} mono />
                <SupportDetail label="User ID" value={selectedTicket.userId} mono />
                <SupportDetail label="Category" value={selectedTicket.category ?? "Uncategorized"} />
                <SupportDetail label="Status" value={selectedTicket.status} />
                <SupportDetail
                  label="Created At"
                  value={
                    selectedTicket.createdAt
                      ? new Date(selectedTicket.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "N/A"
                  }
                />
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs text-gray-500">Subject</p>
                <p className="mt-1 font-medium text-gray-900">{selectedTicket.subject}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs text-gray-500">Message</p>
                <p className="mt-1 whitespace-pre-wrap text-gray-900">
                  {selectedTicket.message ?? "No message provided."}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!pendingStatusChange}
        onOpenChange={(open) => !open && setPendingStatusChange(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update ticket status?</AlertDialogTitle>
            <AlertDialogDescription>
              This will update ticket{" "}
              <span className="font-mono">{pendingStatusChange?.ticket.id}</span> from{" "}
              <span className="font-semibold">{pendingStatusChange?.ticket.status}</span> to{" "}
              <span className="font-semibold">{pendingStatusChange?.nextStatus}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!updatingTicketId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void confirmStatusChange();
              }}
              disabled={!!updatingTicketId}
              className="bg-[#16A34A] hover:bg-[#15803D]"
            >
              {updatingTicketId ? "Updating..." : "Confirm Update"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SupportDetail({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`mt-1 break-all font-medium text-gray-900 ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </p>
    </div>
  );
}

export function Broadcasts() {
  const { accessToken } = useAuth();
  const [audience, setAudience] = useState<AdminBroadcastAudience>("customers");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [lastResult, setLastResult] = useState<AdminBroadcastResult | null>(null);

  const canSend = !!accessToken && title.trim().length > 0 && message.trim().length > 0;

  const handleSend = async () => {
    if (!accessToken || !canSend) return;
    setIsSending(true);
    try {
      const result = await sendAdminBroadcast(accessToken, {
        audience,
        title: title.trim(),
        message: message.trim(),
      });
      setLastResult(result);
      setTitle("");
      setMessage("");
      toast.success(`Broadcast sent to ${result.deliveredCount} recipient${result.deliveredCount === 1 ? "" : "s"}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send broadcast.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-gray-900">Broadcasts</h1>
        <p className="text-sm text-gray-500">
          Send operational announcements to active customer, provider, or admin accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Compose broadcast</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Audience</label>
                <Select
                  value={audience}
                  onValueChange={(value) => setAudience(value as AdminBroadcastAudience)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customers">Customers</SelectItem>
                    <SelectItem value="providers">Providers</SelectItem>
                    <SelectItem value="admins">Admins</SelectItem>
                    <SelectItem value="all">All active users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Title</label>
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Service update"
                  maxLength={120}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Message</label>
              <Textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Write the announcement users should receive..."
                rows={6}
                maxLength={1000}
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => void handleSend()}
                disabled={!canSend || isSending}
                className="bg-[#16A34A] hover:bg-[#15803D]"
              >
                {isSending ? "Sending..." : "Send Broadcast"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Last delivery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {lastResult ? (
              <>
                <div>
                  <p className="text-xs text-gray-500">Audience</p>
                  <p className="mt-1 font-medium text-gray-900 capitalize">
                    {lastResult.audience}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-gray-200 p-3">
                    <p className="text-xs text-gray-500">Delivered</p>
                    <p className="mt-1 text-2xl font-semibold text-[#16A34A]">
                      {lastResult.deliveredCount}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-3">
                    <p className="text-xs text-gray-500">Failed</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                      {lastResult.failedCount}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                Delivery results appear after a broadcast is sent.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
