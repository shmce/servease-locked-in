import { useCallback, useEffect, useMemo, useState } from "react";
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
  AlertCircle,
  CheckCircle,
  Search,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  getAdminDispute,
  listAdminDisputes,
  resolveAdminDispute,
  type AdminDisputeStatus,
  type AdminDisputeSummary,
} from "../../services/serveaseAdminApi";

function formatPeso(value: number) {
  return `₱${value.toLocaleString("en-PH", { maximumFractionDigits: 2 })}`;
}

function formatDate(value: string | null) {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function shortId(value: string | null) {
  if (!value) return "N/A";
  return value.length > 12 ? `${value.slice(0, 8)}...` : value;
}

function getDisputePriority(dispute: AdminDisputeSummary) {
  if (dispute.amount >= 5000) return "High";
  if (dispute.status === "open" || dispute.amount >= 2000) return "Medium";
  return "Low";
}

function getStatusBadge(status: AdminDisputeStatus) {
  switch (status) {
    case "open":
      return (
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
          <AlertCircle className="w-3 h-3 mr-1" />
          Open
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
          <CheckCircle className="w-3 h-3 mr-1" />
          Closed
        </Badge>
      );
  }
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "High":
      return <Badge className="bg-red-100 text-red-700 border-red-200">High</Badge>;
    case "Medium":
      return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Medium</Badge>;
    case "Low":
      return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Low</Badge>;
    default:
      return null;
  }
}

export function DisputesResolutions() {
  const { accessToken } = useAuth();
  const [disputes, setDisputes] = useState<AdminDisputeSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedDispute, setSelectedDispute] = useState<AdminDisputeSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDisputes = useCallback(async () => {
    if (!accessToken) {
      setDisputes([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await listAdminDisputes(
        accessToken,
        statusFilter === "all" ? null : (statusFilter as AdminDisputeStatus),
      );
      setDisputes(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load disputes.");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, statusFilter]);

  const viewDispute = useCallback(async (disputeId: string) => {
    if (!accessToken) return;

    setError(null);

    try {
      setSelectedDispute(await getAdminDispute(accessToken, disputeId));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load dispute.");
    }
  }, [accessToken]);

  const resolveDispute = useCallback(async (disputeId: string) => {
    if (!accessToken) return;

    setIsResolving(true);
    setError(null);

    try {
      const resolved = await resolveAdminDispute(accessToken, disputeId);
      setSelectedDispute(resolved);
      setDisputes((current) =>
        current.map((dispute) => (dispute.id === resolved.id ? resolved : dispute)),
      );
    } catch (resolveError) {
      setError(resolveError instanceof Error ? resolveError.message : "Unable to resolve dispute.");
    } finally {
      setIsResolving(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadDisputes();
  }, [loadDisputes]);

  const filteredDisputes = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    return disputes.filter((dispute) => {
      const matchesSearch =
        dispute.id.toLowerCase().includes(normalizedSearch) ||
        dispute.bookingId?.toLowerCase().includes(normalizedSearch) ||
        dispute.bookingReference?.toLowerCase().includes(normalizedSearch) ||
        dispute.customerId?.toLowerCase().includes(normalizedSearch) ||
        dispute.providerId?.toLowerCase().includes(normalizedSearch) ||
        dispute.reason?.toLowerCase().includes(normalizedSearch);
      const matchesPriority =
        priorityFilter === "all" || getDisputePriority(dispute) === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [disputes, searchTerm, priorityFilter]);

  const stats = useMemo(() => {
    return {
      total: disputes.length,
      open: disputes.filter((d) => d.status === "open").length,
      closed: disputes.filter((d) => d.status === "closed").length,
      resolved: disputes.filter((d) => d.status === "resolved").length,
    };
  }, [disputes]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Disputes</h1>
        <p className="text-gray-500 mt-1">
          Manage and resolve customer disputes and service issues
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Open Disputes</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.open}</p>
                <p className="text-xs text-gray-400 mt-1">Needs attention</p>
              </div>
              <div className="p-3 rounded-lg bg-red-50">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Closed</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.closed}</p>
                <p className="text-xs text-gray-400 mt-1">Closed without action</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Resolved</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.resolved}</p>
                <p className="text-xs text-gray-400 mt-1">Successfully resolved</p>
              </div>
              <div className="p-3 rounded-lg bg-[#DCFCE7]">
                <CheckCircle className="w-6 h-6 text-[#16A34A]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Disputes</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                <p className="text-xs text-gray-400 mt-1">In disputes</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Disputes</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by ID, booking, customer, provider..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dispute ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Filed Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      Loading disputes...
                    </TableCell>
                  </TableRow>
                ) : filteredDisputes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No disputes found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDisputes.map((dispute) => (
                    <TableRow key={dispute.id}>
                      <TableCell>
                        <span className="font-mono font-semibold text-[#16A34A]">
                          {shortId(dispute.id)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-gray-900">
                          {shortId(dispute.customerId)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {shortId(dispute.providerId)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {dispute.reason || dispute.bookingReference || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-gray-900">
                          {formatPeso(dispute.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {formatDate(dispute.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(dispute.status)}</TableCell>
                      <TableCell>{getPriorityBadge(getDisputePriority(dispute))}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void viewDispute(dispute.id)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {selectedDispute && (
            <div className="mt-6 rounded-md border border-gray-200 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div>
                    <p className="text-xs uppercase text-gray-500">Selected Dispute</p>
                    <p className="font-mono text-sm font-semibold text-[#16A34A]">
                      {selectedDispute.id}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">
                    Booking {selectedDispute.bookingReference || shortId(selectedDispute.bookingId)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedDispute.reason || "No reason provided."}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {getStatusBadge(selectedDispute.status)}
                    {getPriorityBadge(getDisputePriority(selectedDispute))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedDispute(null)}
                  >
                    Close
                  </Button>
                  <Button
                    size="sm"
                    className="bg-[#16A34A] hover:bg-[#15803D]"
                    disabled={selectedDispute.status === "resolved" || isResolving}
                    onClick={() => void resolveDispute(selectedDispute.id)}
                  >
                    Resolve
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
