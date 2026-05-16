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
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import {
  approveAdminRefund,
  listAdminRefunds,
  rejectAdminRefund,
  type AdminRefundStatus,
  type AdminRefundSummary,
} from "../../services/serveaseAdminApi";

const refundStatuses: AdminRefundStatus[] = [
  "requested",
  "approved",
  "processed",
  "rejected",
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

function statusLabel(status: AdminRefundStatus) {
  switch (status) {
    case "requested":
      return "Requested";
    case "approved":
      return "Approved";
    case "processed":
      return "Processed";
    case "rejected":
      return "Rejected";
  }
}

export function RefundManagement() {
  const { accessToken } = useAuth();
  const [refunds, setRefunds] = useState<AdminRefundSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminRefundStatus | "all">("all");
  const [selectedRefund, setSelectedRefund] = useState<string | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [updatingRefundId, setUpdatingRefundId] = useState<string | null>(null);

  const loadRefunds = useCallback(async () => {
    if (!accessToken) return;

    setIsLoading(true);
    setLoadError(null);

    try {
      setRefunds(
        await listAdminRefunds(
          accessToken,
          statusFilter === "all" ? null : statusFilter,
        ),
      );
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to load refunds.");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, statusFilter]);

  useEffect(() => {
    void loadRefunds();
  }, [loadRefunds]);

  const filteredRefunds = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    return refunds.filter((refund) => {
      return (
        refund.id.toLowerCase().includes(normalizedSearch) ||
        refund.bookingId.toLowerCase().includes(normalizedSearch) ||
        refund.paymentId.toLowerCase().includes(normalizedSearch) ||
        refund.customerId?.toLowerCase().includes(normalizedSearch) ||
        refund.reason.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [refunds, searchTerm]);

  const stats = useMemo(() => {
    const requested = refunds.filter((r) => r.status === "requested");
    const approved = refunds.filter((r) => r.status === "approved");
    const processed = refunds.filter((r) => r.status === "processed");
    const rejected = refunds.filter((r) => r.status === "rejected");

    return {
      pendingCount: requested.length,
      approvedCount: approved.length,
      processedCount: processed.length,
      rejectedCount: rejected.length,
      pendingAmount: requested.reduce((sum, r) => sum + r.amount, 0),
      approvedAmount: approved.reduce((sum, r) => sum + r.amount, 0),
      processedAmount: processed.reduce((sum, r) => sum + r.amount, 0),
    };
  }, [refunds]);

  const updateRefund = async (
    refundId: string,
    decision: "approve" | "reject",
    reason?: string,
  ) => {
    if (!accessToken) return;

    setUpdatingRefundId(refundId);
    try {
      const updated =
        decision === "approve"
          ? await approveAdminRefund(accessToken, refundId, "Refund request approved.")
          : await rejectAdminRefund(accessToken, refundId, reason ?? "");
      setRefunds((current) =>
        current.map((refund) => (refund.id === updated.id ? updated : refund)),
      );
      toast.success(`Refund ${updated.id} updated to ${statusLabel(updated.status)}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update refund.");
    } finally {
      setUpdatingRefundId(null);
      setSelectedRefund(null);
      setShowApproveDialog(false);
      setShowRejectDialog(false);
      setRejectReason("");
    }
  };

  const handleApprove = () => {
    if (selectedRefund) {
      void updateRefund(selectedRefund, "approve");
    }
  };

  const handleReject = () => {
    if (selectedRefund && rejectReason.trim()) {
      void updateRefund(selectedRefund, "reject", rejectReason.trim());
    }
  };

  const getStatusBadge = (status: AdminRefundStatus) => {
    switch (status) {
      case "requested":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Requested
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "processed":
        return (
          <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]">
            <CheckCircle className="w-3 h-3 mr-1" />
            Processed
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
        <h1 className="text-3xl font-bold text-gray-900">Refund Management</h1>
        <p className="text-gray-500 mt-1">
          Review and process customer refund requests
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Refunds</p>
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
                <p className="text-sm text-gray-500">Processed</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.processedCount}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatPeso(stats.processedAmount)} refunded
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#DCFCE7]">
                <DollarSign className="w-6 h-6 text-[#16A34A]" />
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
                <p className="text-xs text-gray-400 mt-1">Backend decisions</p>
              </div>
              <div className="p-3 rounded-lg bg-red-50">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Refund Requests</CardTitle>
          {loadError ? <p className="text-sm text-red-600 mt-2">{loadError}</p> : null}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by ID, booking, payment, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as AdminRefundStatus | "all")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {refundStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {statusLabel(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Refund ID</TableHead>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Loading refund requests...
                    </TableCell>
                  </TableRow>
                ) : filteredRefunds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No refund requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRefunds.map((refund) => (
                    <TableRow key={refund.id}>
                      <TableCell>
                        <span className="font-mono font-semibold text-[#16A34A]">
                          {refund.id}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm text-gray-600">
                          {refund.bookingId}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {refund.customerId ?? "N/A"}
                          </p>
                          <p className="text-xs text-gray-500">Payment {refund.paymentId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-gray-900">
                          {formatPeso(refund.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{refund.reason}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {formatDate(refund.requestedAt ?? refund.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(refund.status)}</TableCell>
                      <TableCell>
                        {refund.status === "requested" ? (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              disabled={updatingRefundId === refund.id}
                              onClick={() => {
                                setSelectedRefund(refund.id);
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
                              disabled={updatingRefundId === refund.id}
                              onClick={() => {
                                setSelectedRefund(refund.id);
                                setShowRejectDialog(true);
                              }}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <ThumbsDown className="w-3 h-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Refund Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this refund? The related payment will be marked as refunded.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowApproveDialog(false);
                setSelectedRefund(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleApprove} className="bg-[#16A34A] hover:bg-[#15803D]">
              Approve Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Refund Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this refund request.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setSelectedRefund(null);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={!rejectReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
