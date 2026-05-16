import { useState, useEffect } from "react";
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
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  AlertCircle,
  Download,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  listAdminSettlements,
  approveAdminSettlement,
  rejectAdminSettlement,
  updateAdminPayoutStatus,
  AdminPayoutSummary,
  AdminPayoutStatus,
} from "../../services/serveaseAdminApi";

type DisplayStatus = "requested" | "processing" | "paid" | "cancelled";

export function SettlementsPayouts() {
  const { accessToken } = useAuth();
  const [payouts, setPayouts] = useState<AdminPayoutSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<DisplayStatus | "all">("all");

  useEffect(() => {
    if (!accessToken) return;
    listAdminSettlements(accessToken).then(setPayouts).catch(() => {});
  }, [accessToken]);

  const handleUpdateStatus = async (payoutId: string, status: AdminPayoutStatus) => {
    if (!accessToken) return;
    try {
      const updated =
        status === "processing"
          ? await approveAdminSettlement(accessToken, payoutId)
          : status === "cancelled"
            ? await rejectAdminSettlement(accessToken, payoutId)
          : await updateAdminPayoutStatus(accessToken, payoutId, status);
      setPayouts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch {
      // silently ignore; row stays unchanged
    }
  };

  const filteredPayouts = payouts.filter((p) => {
    const matchesSearch =
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.providerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.accountLabel ?? "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingPayouts = payouts.filter((p) => p.status === "requested");
  const processingPayouts = payouts.filter((p) => p.status === "processing");
  const paidPayouts = payouts.filter((p) => p.status === "paid");

  const getStatusBadge = (status: AdminPayoutStatus) => {
    if (status === "requested") {
      return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Requested</Badge>;
    }
    if (status === "processing") {
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Processing</Badge>;
    }
    if (status === "paid") {
      return <Badge className="bg-green-100 text-green-700 border-green-200">Paid</Badge>;
    }
    if (status === "cancelled") {
      return <Badge className="bg-red-100 text-red-700 border-red-200">Cancelled</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAmount = (amount: number) =>
    `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settlements & Payouts</h1>
          <p className="text-gray-500 mt-1">
            Review and process payout requests from service providers
          </p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-50">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Pending Payouts</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{pendingPayouts.length}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatAmount(pendingPayouts.reduce((s, p) => s + p.amount, 0))} total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Processing</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{processingPayouts.length}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatAmount(processingPayouts.reduce((s, p) => s + p.amount, 0))} total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-50">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Paid</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{paidPayouts.length}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatAmount(paidPayouts.reduce((s, p) => s + p.amount, 0))} total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <AlertCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Total Payouts</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{payouts.length}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatAmount(payouts.reduce((s, p) => s + p.amount, 0))} total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payouts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payout Requests</CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter className="w-4 h-4" />
              {filteredPayouts.length} of {payouts.length} payouts
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by payout ID, provider ID, or account…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as DisplayStatus | "all")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="requested">Requested</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(searchTerm || statusFilter !== "all") && (
            <div className="mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                Clear all filters
              </Button>
            </div>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payout ID</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Method / Account</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Net Amount</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayouts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No payouts found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell>
                        <span className="font-mono text-xs text-gray-900">
                          {payout.id.slice(0, 8)}…
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-gray-600">
                          {payout.providerId.slice(0, 8)}…
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium text-gray-900 capitalize">
                            {payout.methodType ?? "—"}
                          </p>
                          <p className="text-gray-500">{payout.accountLabel ?? "—"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-green-600">
                          {formatAmount(payout.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-gray-900">
                          {formatAmount(payout.netAmount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {formatDate(payout.requestedAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-gray-500">
                          {payout.periodStart ? (
                            <>
                              <p>{formatDate(payout.periodStart)}</p>
                              <p>→ {formatDate(payout.periodEnd)}</p>
                            </>
                          ) : (
                            "—"
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(payout.status)}</TableCell>
                      <TableCell>
                        {payout.status === "requested" ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              title="Mark as Processing"
                              onClick={() => handleUpdateStatus(payout.id, "processing")}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              title="Reject settlement"
                              onClick={() => handleUpdateStatus(payout.id, "cancelled")}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : payout.status === "processing" ? (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            title="Mark as Paid"
                            onClick={() => handleUpdateStatus(payout.id, "paid")}
                          >
                            <DollarSign className="w-4 h-4" />
                          </Button>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total Pending Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatAmount(
                      filteredPayouts
                        .filter((p) => p.status === "requested")
                        .reduce((s, p) => s + p.amount, 0),
                    )}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total Processing Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatAmount(
                      filteredPayouts
                        .filter((p) => p.status === "processing")
                        .reduce((s, p) => s + p.amount, 0),
                    )}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Payout Processing Guidelines</p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                <li>Review provider transaction history before approving payouts</li>
                <li>Verify bank account details match registered provider information</li>
                <li>Process approved payouts within 2–3 business days</li>
                <li>Mark as "Processing" to move to the settlement queue, then "Paid" on completion</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
