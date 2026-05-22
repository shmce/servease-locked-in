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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Clock,
  CheckCircle,
  XCircle,
  Search,
  ThumbsUp,
  ThumbsDown,
  Wallet,
  History,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  approveAdminSettlement,
  listAdminSettlementHistory,
  listAdminSettlements,
  reconcileAdminSettlement,
  rejectAdminSettlement,
  type AdminPayoutEventSummary,
  type AdminPayoutStatus,
  type AdminPayoutSummary,
} from "../../services/serveaseAdminApi";
import { toast } from "sonner";

const payoutStatuses: AdminPayoutStatus[] = [
  "requested",
  "processing",
  "paid",
  "cancelled",
];

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

function statusLabel(status: AdminPayoutStatus) {
  switch (status) {
    case "requested":
      return "Requested";
    case "processing":
      return "Processing";
    case "paid":
      return "Released";
    case "cancelled":
      return "Cancelled";
  }
}

export function PayoutRequests() {
  const { accessToken } = useAuth();
  const [payoutRequests, setPayoutRequests] = useState<AdminPayoutSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminPayoutStatus | "all">("all");
  const [selectedPayout, setSelectedPayout] = useState<string | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showReconcileDialog, setShowReconcileDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [settlementHistory, setSettlementHistory] = useState<AdminPayoutEventSummary[]>([]);
  const [historySettlement, setHistorySettlement] = useState<AdminPayoutSummary | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [bankReference, setBankReference] = useState("");
  const [reconcileNote, setReconcileNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [updatingPayoutId, setUpdatingPayoutId] = useState<string | null>(null);

  const loadPayouts = useCallback(async () => {
    if (!accessToken) return;

    setIsLoading(true);
    setLoadError(null);

    try {
      setPayoutRequests(
        await listAdminSettlements(
          accessToken,
          statusFilter === "all" ? null : statusFilter,
        ),
      );
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to load payouts.");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, statusFilter]);

  useEffect(() => {
    void loadPayouts();
  }, [loadPayouts]);

  const filteredPayouts = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    return payoutRequests.filter((payout) => {
      const matchesSearch =
        payout.id.toLowerCase().includes(normalizedSearch) ||
        payout.providerId.toLowerCase().includes(normalizedSearch) ||
        payout.reference?.toLowerCase().includes(normalizedSearch) ||
        payout.accountLabel?.toLowerCase().includes(normalizedSearch);

      return matchesSearch;
    });
  }, [payoutRequests, searchTerm]);

  const stats = useMemo(() => {
    const pending = payoutRequests.filter((p) => p.status === "requested");
    const approved = payoutRequests.filter((p) => p.status === "processing");
    const released = payoutRequests.filter((p) => p.status === "paid");
    const rejected = payoutRequests.filter((p) => p.status === "cancelled");

    const pendingAmount = pending.reduce((sum, p) => sum + p.amount, 0);
    const approvedAmount = approved.reduce((sum, p) => sum + p.amount, 0);

    return {
      pendingCount: pending.length,
      approvedCount: approved.length,
      releasedCount: released.length,
      rejectedCount: rejected.length,
      pendingAmount,
      approvedAmount,
    };
  }, [payoutRequests]);

  const replacePayout = (updated: AdminPayoutSummary) => {
    setPayoutRequests((current) =>
      current.map((payout) => (payout.id === updated.id ? updated : payout)),
    );
  };

  const closeActionDialogs = () => {
    setSelectedPayout(null);
    setShowApproveDialog(false);
    setShowRejectDialog(false);
    setShowReconcileDialog(false);
    setBankReference("");
    setReconcileNote("");
  };

  const selectedPayoutRecord =
    payoutRequests.find((payout) => payout.id === selectedPayout) ?? null;

  const handleApprove = () => {
    if (!selectedPayout || !accessToken) return;

    setUpdatingPayoutId(selectedPayout);
    approveAdminSettlement(accessToken, selectedPayout)
      .then((updated) => {
        replacePayout(updated);
        toast.success(`Settlement ${updated.reference ?? updated.id} approved for processing.`);
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Unable to approve settlement.");
      })
      .finally(() => {
        setUpdatingPayoutId(null);
        closeActionDialogs();
      });
  };

  const handleReject = () => {
    if (!selectedPayout || !accessToken) return;

    setUpdatingPayoutId(selectedPayout);
    rejectAdminSettlement(accessToken, selectedPayout)
      .then((updated) => {
        replacePayout(updated);
        toast.success(`Settlement ${updated.reference ?? updated.id} rejected.`);
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Unable to reject settlement.");
      })
      .finally(() => {
        setUpdatingPayoutId(null);
        closeActionDialogs();
      });
  };

  const handleReconcile = async () => {
    if (!accessToken) return;
    const settlementId = selectedPayout;
    const reference = bankReference.trim();

    if (!settlementId || !reference) {
      toast.error("Bank reference is required.");
      return;
    }

    setUpdatingPayoutId(settlementId);
    try {
      const updated = await reconcileAdminSettlement(accessToken, settlementId, {
        bankReference: reference,
        note: reconcileNote.trim() || null,
      });
      replacePayout(updated);
      toast.success(`Settlement ${updated.reference ?? updated.id} reconciled.`);
      closeActionDialogs();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to reconcile settlement.");
    } finally {
      setUpdatingPayoutId(null);
    }
  };

  const handleViewHistory = async (payout: AdminPayoutSummary) => {
    if (!accessToken) return;

    setHistorySettlement(payout);
    setSettlementHistory([]);
    setShowHistoryDialog(true);
    setIsLoadingHistory(true);
    try {
      setSettlementHistory(await listAdminSettlementHistory(accessToken, payout.id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load settlement history.");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const getStatusBadge = (status: AdminPayoutStatus) => {
    switch (status) {
      case "requested":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Requested
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Processing
          </Badge>
        );
      case "paid":
        return (
          <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]">
            <CheckCircle className="w-3 h-3 mr-1" />
            Released
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payout Requests</h1>
        <p className="text-gray-500 mt-1">
          Review and approve service provider payout requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingCount}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatPeso(stats.pendingAmount)} total
                </p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.approvedCount}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatPeso(stats.approvedAmount)} total
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Released</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.releasedCount}</p>
                <p className="text-xs text-gray-400 mt-1">This month</p>
              </div>
              <div className="p-3 rounded-lg bg-[#DCFCE7]">
                <Wallet className="w-6 h-6 text-[#16A34A]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Rejected</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.rejectedCount}</p>
                <p className="text-xs text-gray-400 mt-1">This month</p>
              </div>
              <div className="p-3 rounded-lg bg-red-50">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Payout Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by ID, provider name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as AdminPayoutStatus | "all")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {payoutStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {statusLabel(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loadError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {loadError}
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Provider ID</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Amount Requested</TableHead>
                  <TableHead>Payout Method</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Loading payout requests...
                    </TableCell>
                  </TableRow>
                ) : filteredPayouts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No payout requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayouts.map((payout) => {
                    return (
                      <TableRow key={payout.id}>
                        <TableCell>
                          <span className="font-mono font-semibold text-[#16A34A]">
                            {payout.reference ?? payout.id}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-mono text-sm text-gray-900">
                              {payout.providerId}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm text-gray-600">
                            {payout.id}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-gray-900">
                            {formatPeso(payout.amount)}
                          </span>
                          <p className="text-xs text-gray-500">
                            Net: {formatPeso(payout.netAmount)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {payout.accountLabel ?? "N/A"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {payout.methodType ?? "Payout method"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {formatDate(payout.requestedAt ?? payout.createdAt)}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(payout.status)}</TableCell>
                        <TableCell>
                          {payout.status === "requested" && (
                            <div className="flex flex-wrap items-center gap-2">
                              <Button
                                size="sm"
                                disabled={updatingPayoutId === payout.id}
                                onClick={() => {
                                  setSelectedPayout(payout.id);
                                  setShowApproveDialog(true);
                                }}
                                className="bg-[#16A34A] hover:bg-[#15803D]"
                              >
                                <ThumbsUp className="w-3 h-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={updatingPayoutId === payout.id}
                                onClick={() => {
                                  setSelectedPayout(payout.id);
                                  setShowRejectDialog(true);
                                }}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <ThumbsDown className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                          {payout.status === "processing" && (
                            <Button
                              size="sm"
                              disabled={updatingPayoutId === payout.id}
                              onClick={() => {
                                setSelectedPayout(payout.id);
                                setShowReconcileDialog(true);
                              }}
                              className="bg-[#16A34A] hover:bg-[#15803D]"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Reconcile
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void handleViewHistory(payout)}
                            className="mt-2 sm:mt-0 sm:ml-2"
                          >
                            <History className="w-3 h-3 mr-1" />
                            History
                          </Button>
                          {payout.status === "paid" && (
                            <Button size="sm" disabled variant="outline" className="ml-2">
                              Released
                            </Button>
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

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Payout Request</DialogTitle>
            <DialogDescription>
              Approve settlement {selectedPayoutRecord?.reference ?? selectedPayoutRecord?.id} for
              payout processing. This records an approval event and moves the settlement to
              Processing.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowApproveDialog(false);
                setSelectedPayout(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleApprove} className="bg-[#16A34A] hover:bg-[#15803D]">
              Approve Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payout Request</DialogTitle>
            <DialogDescription>
              Reject settlement {selectedPayoutRecord?.reference ?? selectedPayoutRecord?.id}. This
              records a rejection event and cancels the payout request.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setSelectedPayout(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={updatingPayoutId === selectedPayout}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reconcile Dialog */}
      <Dialog open={showReconcileDialog} onOpenChange={setShowReconcileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reconcile Settlement</DialogTitle>
            <DialogDescription>
              Record the external bank or wallet reference after settlement{" "}
              {selectedPayoutRecord?.reference ?? selectedPayoutRecord?.id} has been transferred.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bankReference">Bank Reference *</Label>
              <Input
                id="bankReference"
                value={bankReference}
                onChange={(event) => setBankReference(event.target.value)}
                placeholder="e.g. BDO-20260522-0001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reconcileNote">Note</Label>
              <Textarea
                id="reconcileNote"
                value={reconcileNote}
                onChange={(event) => setReconcileNote(event.target.value)}
                placeholder="Optional reconciliation note"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowReconcileDialog(false);
                setSelectedPayout(null);
                setBankReference("");
                setReconcileNote("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleReconcile()}
              disabled={updatingPayoutId === selectedPayout || !bankReference.trim()}
              className="bg-[#16A34A] hover:bg-[#15803D]"
            >
              Reconcile Settlement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settlement History</DialogTitle>
            <DialogDescription>
              Events recorded for {historySettlement?.reference ?? historySettlement?.id}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isLoadingHistory ? (
              <p className="text-sm text-gray-500">Loading settlement history...</p>
            ) : settlementHistory.length === 0 ? (
              <p className="text-sm text-gray-500">No settlement events recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {settlementHistory.map((event) => (
                  <div key={event.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-gray-900">
                        {event.eventType.replaceAll("_", " ")}
                      </p>
                      <Badge variant="outline">{statusLabel(event.status)}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {event.createdAt ? new Date(event.createdAt).toLocaleString() : "No date"}
                    </p>
                    {event.bankReference && (
                      <p className="mt-2 text-sm text-gray-700">
                        Bank reference:{" "}
                        <span className="font-mono">{event.bankReference}</span>
                      </p>
                    )}
                    {event.note && <p className="mt-1 text-sm text-gray-600">{event.note}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHistoryDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
