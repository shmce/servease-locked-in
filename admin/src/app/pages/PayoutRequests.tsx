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
  Wallet,
} from "lucide-react";
import { useData } from "../../contexts/DataContext";
import type { PayoutStatus } from "../../types";
import { notifyBackendRequired } from "../utils/backendRequired";

export function PayoutRequests() {
  const { payoutRequests, getProviderById, calculateProviderEarnings } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPayout, setSelectedPayout] = useState<string | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const filteredPayouts = useMemo(() => {
    return payoutRequests.filter((payout) => {
      const provider = getProviderById(payout.providerId);
      
      const matchesSearch =
        payout.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider?.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider?.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || payout.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [payoutRequests, searchTerm, statusFilter, getProviderById]);

  const stats = useMemo(() => {
    const pending = payoutRequests.filter((p) => p.status === "Pending");
    const approved = payoutRequests.filter((p) => p.status === "Approved");
    const released = payoutRequests.filter((p) => p.status === "Released");
    const rejected = payoutRequests.filter((p) => p.status === "Rejected");

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

  const handleApprove = () => {
    if (selectedPayout) {
      notifyBackendRequired(
        "Approving payout requests",
        "POST /v1/admin/payout-requests/:id/approve",
      );
    }
  };

  const getStatusBadge = (status: PayoutStatus) => {
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
      case "Released":
        return (
          <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]">
            <CheckCircle className="w-3 h-3 mr-1" />
            Released
          </Badge>
        );
      case "Rejected":
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Released">Released</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Business ID</TableHead>
                  <TableHead>Amount Requested</TableHead>
                  <TableHead>Bank Details</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayouts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No payout requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayouts.map((payout) => {
                    const provider = getProviderById(payout.providerId);
                    const earnings = calculateProviderEarnings(payout.providerId);

                    return (
                      <TableRow key={payout.id}>
                        <TableCell>
                          <span className="font-mono font-semibold text-[#16A34A]">
                            {payout.id}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">
                              {provider?.businessName || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500">
                              Available: ₱{earnings.pendingEarnings.toLocaleString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm text-gray-600">
                            {provider?.id || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-gray-900">
                            ₱{payout.amount.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {payout.bankDetails.accountName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {payout.bankDetails.bankName} - ****
                              {payout.bankDetails.accountNumber.slice(-4)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {new Date(payout.requestedDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(payout.status)}</TableCell>
                        <TableCell>
                          {payout.status === "Pending" && (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
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
              Are you sure you want to approve this payout request? The funds will be processed
              for transfer to the provider's bank account.
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
              Please provide a reason for rejecting this payout request.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input placeholder="Reason for rejection..." />
          </div>
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
              onClick={() => {
                notifyBackendRequired(
                  "Rejecting payout requests",
                  "POST /v1/admin/payout-requests/:id/reject",
                );
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
