import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
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
  MessageSquare,
  Mail,
  RefreshCw,
  Search,
  Smartphone,
  TrendingUp,
  Users,
  XCircle,
  DollarSign,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  addAdminSupportTicketReply,
  getAdminUsersSummary,
  listAdminSupportTicketReplies,
  listAdminBroadcasts,
  listAdminSupportTickets,
  listAdminUsers,
  sendAdminBroadcast,
  type AdminBroadcastChannel,
  updateAdminSupportTicketStatus,
  updateAdminUserStatus,
  type AdminBroadcastAudience,
  type AdminBroadcastRepeatRule,
  type AdminBroadcastSummary,
  type AdminSupportTicketReplySummary,
  type AdminSupportTicketStatus,
  type AdminSupportTicketSummary,
  type AdminUserStatus,
  type AdminUserSummary,
  type AdminUsersSummaryStats,
} from "../../services/serveaseAdminApi";
import { toast } from "sonner";
import { usePersistentState } from "../../hooks/usePersistentState";

const broadcastChannelOptions: Array<{
  value: AdminBroadcastChannel;
  label: string;
  icon: typeof MessageSquare;
}> = [
  { value: "in_app", label: "In-app", icon: MessageSquare },
  { value: "email", label: "Email", icon: Mail },
  { value: "sms", label: "SMS", icon: Smartphone },
];

export function Customers() {
  const { accessToken } = useAuth();
  const [customers, setCustomers] = useState<AdminUserSummary[]>([]);
  const [summary, setSummary] = useState<AdminUsersSummaryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
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
    setSummaryError(null);
    Promise.all([
      listAdminUsers(accessToken, { role: "customer" }),
      getAdminUsersSummary(accessToken)
        .then((nextSummary) => ({ summary: nextSummary, error: null }))
        .catch((error: unknown) => ({
          summary: null,
          error:
            error instanceof Error
              ? error.message
              : "Unable to load customer summary.",
        })),
    ])
      .then(([nextCustomers, summaryResult]) => {
        if (cancelled) return;
        setCustomers(nextCustomers);
        setSummary(summaryResult.summary);
        setSummaryError(summaryResult.error);
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

      {summaryError ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Customer list loaded, but summary totals could not be refreshed: {summaryError}
        </div>
      ) : null}

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

export function Support() {
  const { accessToken, admin } = useAuth();
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
  const [ticketReplies, setTicketReplies] = useState<AdminSupportTicketReplySummary[]>([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
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

  const openTicketConversation = useCallback(
    async (ticket: AdminSupportTicketSummary) => {
      setSelectedTicket(ticket);
      setTicketReplies([]);
      setReplyMessage("");
      setReplyError(null);

      if (!accessToken) return;

      setIsLoadingReplies(true);
      try {
        setTicketReplies(await listAdminSupportTicketReplies(accessToken, ticket.id));
      } catch (loadError) {
        setReplyError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load ticket replies.",
        );
      } finally {
        setIsLoadingReplies(false);
      }
    },
    [accessToken],
  );

  const closeTicketConversation = () => {
    setSelectedTicket(null);
    setTicketReplies([]);
    setReplyMessage("");
    setReplyError(null);
  };

  const sendTicketReply = async () => {
    if (!accessToken || !selectedTicket) return;

    const message = replyMessage.trim();
    if (!message) {
      setReplyError("Enter a reply before sending.");
      return;
    }

    setIsSendingReply(true);
    setReplyError(null);

    try {
      const reply = await addAdminSupportTicketReply(accessToken, selectedTicket.id, {
        repliedBy: admin?.id ?? admin?.email ?? "admin",
        message,
      });
      setTicketReplies((current) => [...current, reply]);
      setReplyMessage("");
      toast.success(`Reply sent for ticket ${selectedTicket.id}.`);
    } catch (sendError) {
      setReplyError(
        sendError instanceof Error ? sendError.message : "Unable to send reply.",
      );
    } finally {
      setIsSendingReply(false);
    }
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
                          onClick={() => void openTicketConversation(ticket)}
                        >
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Reply
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

      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && closeTicketConversation()}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Support Conversation</DialogTitle>
            <DialogDescription>
              Review the ticket and send replies through the admin support thread.
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
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="font-medium text-gray-900">Reply Thread</p>
                  {isLoadingReplies && (
                    <span className="text-xs text-gray-500">Loading replies...</span>
                  )}
                </div>
                {replyError && (
                  <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {replyError}
                  </div>
                )}
                <div className="max-h-72 space-y-3 overflow-y-auto">
                  {isLoadingReplies ? (
                    <p className="text-sm text-gray-500">Loading ticket conversation...</p>
                  ) : ticketReplies.length === 0 ? (
                    <p className="text-sm text-gray-500">No replies yet.</p>
                  ) : (
                    ticketReplies.map((reply) => (
                      <div
                        key={reply.id}
                        className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] p-3"
                      >
                        <div className="mb-1 flex items-center justify-between gap-3">
                          <span className="break-all font-medium text-gray-900">
                            {reply.repliedBy}
                          </span>
                          <span className="text-xs text-gray-500">
                            {reply.createdAt
                              ? new Date(reply.createdAt).toLocaleString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Just now"}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap text-gray-800">{reply.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Admin reply
                </label>
                <Textarea
                  value={replyMessage}
                  onChange={(event) => setReplyMessage(event.target.value)}
                  placeholder="Type a reply to the customer or provider..."
                  className="min-h-28"
                />
                <div className="mt-3 flex justify-end">
                  <Button
                    onClick={() => void sendTicketReply()}
                    disabled={isSendingReply || !replyMessage.trim()}
                    className="bg-[#16A34A] hover:bg-[#15803D]"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {isSendingReply ? "Sending..." : "Send Reply"}
                  </Button>
                </div>
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
  const [audienceCohort, setAudienceCohort] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [repeatRule, setRepeatRule] = useState<AdminBroadcastRepeatRule>("none");
  const [channels, setChannels] = useState<AdminBroadcastChannel[]>(["in_app"]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [history, setHistory] = useState<AdminBroadcastSummary[]>([]);
  const [historyLoadError, setHistoryLoadError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<AdminBroadcastSummary | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    setHistoryLoadError(null);
    listAdminBroadcasts(accessToken, 25)
      .then(setHistory)
      .catch((error) => {
        setHistoryLoadError(
          error instanceof Error ? error.message : "Unable to load broadcast history.",
        );
      });
  }, [accessToken]);

  const canSend =
    !!accessToken &&
    title.trim().length > 0 &&
    message.trim().length > 0 &&
    channels.length > 0;

  const toggleChannel = (channel: AdminBroadcastChannel) => {
    setChannels((current) => {
      if (current.includes(channel)) {
        return current.length === 1
          ? current
          : current.filter((item) => item !== channel);
      }
      return [...current, channel];
    });
  };

  const handleSend = async () => {
    if (!accessToken || !canSend) return;
    setIsSending(true);
    try {
      const result = await sendAdminBroadcast(accessToken, {
        audience,
        audienceCohort: audienceCohort.trim() || null,
        channels,
        title: title.trim(),
        message: message.trim(),
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        repeatRule,
      });
      setLastResult(result);
      setHistory((current) => [result, ...current.filter((item) => item.id !== result.id)]);
      setTitle("");
      setMessage("");
      setScheduledAt("");
      setChannels(["in_app"]);
      toast.success(
        result.status === "scheduled"
          ? "Broadcast scheduled."
          : `Broadcast sent to ${result.deliveredCount} recipient${result.deliveredCount === 1 ? "" : "s"}.`,
      );
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
                <label className="text-sm font-medium text-gray-700">Cohort filter</label>
                <Input
                  value={audienceCohort}
                  onChange={(event) => setAudienceCohort(event.target.value)}
                  placeholder="Optional name or email filter"
                  maxLength={120}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="broadcast-title" className="text-sm font-medium text-gray-700">Title</label>
                <Input
                  id="broadcast-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Service update"
                  maxLength={120}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Schedule</label>
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(event) => setScheduledAt(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Repeat</label>
                <Select
                  value={repeatRule}
                  onValueChange={(value) => setRepeatRule(value as AdminBroadcastRepeatRule)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No repeat</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Delivery channels</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {broadcastChannelOptions.map((option) => {
                    const Icon = option.icon;
                    const checked = channels.includes(option.value);
                    return (
                      <label
                        key={option.value}
                        htmlFor={`broadcast-channel-${option.value}`}
                        className={`flex items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors ${
                          checked
                            ? "border-[#16A34A] bg-[#F0FDF4] text-gray-900"
                            : "border-gray-200 bg-white text-gray-700"
                        }`}
                      >
                        <Checkbox
                          id={`broadcast-channel-${option.value}`}
                          checked={checked}
                          onCheckedChange={() => toggleChannel(option.value)}
                          aria-label={option.label}
                        />
                        <Icon className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="broadcast-message" className="text-sm font-medium text-gray-700">Message</label>
              <Textarea
                id="broadcast-message"
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
                    {lastResult.audience} - {lastResult.status}
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
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Broadcast history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {historyLoadError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {historyLoadError}
            </p>
          ) : history.length === 0 ? (
            <p className="text-sm text-gray-500">No broadcasts recorded yet.</p>
          ) : (
            history.map((broadcast) => (
              <div key={broadcast.id} className="rounded-lg border border-gray-200 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900">{broadcast.title}</p>
                    <p className="text-xs text-gray-500">
                      {broadcast.audience} - {broadcast.status} - {broadcast.repeatRule}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {broadcast.scheduledAt ?? broadcast.sentAt ?? broadcast.createdAt ?? "Not dated"}
                  </p>
                </div>
                <p className="mt-2 text-sm text-gray-600">{broadcast.message}</p>
                <p className="mt-2 text-xs text-gray-500">
                  Delivered {broadcast.deliveredCount} - Failed {broadcast.failedCount}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
