import { useState, useMemo } from "react";
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
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { useData } from "../../contexts/DataContext";
import { notifyBackendRequired } from "../utils/backendRequired";

export function RefundManagement() {
  const { refunds, getCustomerById, getBookingById } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRefund, setSelectedRefund] = useState<string | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const filteredRefunds = useMemo(() => {
    return refunds.filter((refund) => {
      const customer = getCustomerById(refund.customerId);
      const booking = getBookingById(refund.bookingId);

      const matchesSearch =
        refund.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        refund.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer?.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || refund.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [refunds, searchTerm, statusFilter, getCustomerById, getBookingById]);

  const stats = useMemo(() => {
    const pending = refunds.filter((r) => r.status === "Pending");
    const approved = refunds.filter((r) => r.status === "Approved");
    const processed = refunds.filter((r) => r.status === "Processed");
    const rejected = refunds.filter((r) => r.status === "Rejected");

    const pendingAmount = pending.reduce((sum, r) => sum + r.amount, 0);
    const approvedAmount = approved.reduce((sum, r) => sum + r.amount, 0);
    const processedAmount = processed.reduce((sum, r) => sum + r.amount, 0);

    return {
      pendingCount: pending.length,
      approvedCount: approved.length,
      processedCount: processed.length,
      rejectedCount: rejected.length,
      pendingAmount,
      approvedAmount,
      processedAmount,
    };
  }, [refunds]);

  const handleApprove = () => {
    if (selectedRefund) {
      notifyBackendRequired("Approving refunds", "POST /v1/admin/refunds/:id/approve");
    }
  };

  const handleReject = () => {
    if (selectedRefund && rejectReason) {
      notifyBackendRequired("Rejecting refunds", "POST /v1/admin/refunds/:id/reject");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "Approved":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "Processed":
        return (
          <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]">
            <CheckCircle className="w-3 h-3 mr-1" />
            Processed
          </Badge>
        );
      case "Rejected":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Refund Management</h1>
        <p className="text-gray-500 mt-1">
          Review and process customer refund requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Refunds</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingCount}</p>
                <p className="text-xs text-gray-400 mt-1">
                  ₱{(stats.pendingAmount / 1000).toFixed(1)}K total
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
                  ₱{(stats.approvedAmount / 1000).toFixed(1)}K total
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
                  ₱{(stats.processedAmount / 1000).toFixed(1)}K refunded
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
          <CardTitle>All Refund Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by ID, booking, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Processed">Processed</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
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
                {filteredRefunds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No refund requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRefunds.map((refund) => {
                    const customer = getCustomerById(refund.customerId);
                    const booking = getBookingById(refund.bookingId);

                    return (
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
                              {customer?.name || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500">{customer?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-gray-900">
                            ₱{refund.amount.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{refund.reason}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {new Date(refund.requestedDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(refund.status)}</TableCell>
                        <TableCell>
                          {refund.status === "Pending" && (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
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
            <DialogTitle>Approve Refund Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this refund? The amount will be returned to the customer's card.
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

      {/* Reject Dialog */}
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
              disabled={!rejectReason}
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
