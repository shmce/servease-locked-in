import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
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
  CreditCard,
  DollarSign,
  Download,
  Eye,
  Receipt,
  RefreshCw,
  Search,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  listAdminPayments,
  updateAdminPaymentStatus,
  type AdminPaymentStatus,
  type AdminPaymentSummary,
} from "../../services/serveaseAdminApi";
import { toast } from "sonner";
import { usePersistentState } from "../../hooks/usePersistentState";

const paymentStatuses: AdminPaymentStatus[] = ["pending", "paid", "cancelled", "refunded"];

function formatPeso(value: number) {
  return `₱${value.toLocaleString("en-PH", { maximumFractionDigits: 2 })}`;
}

function formatDate(value: string | null) {
  if (!value) return "N/A";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusBadge(status: AdminPaymentStatus) {
  switch (status) {
    case "paid":
      return (
        <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]">
          <CheckCircle className="w-3 h-3 mr-1" />
          Paid
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
          <AlertCircle className="w-3 h-3 mr-1" />
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
    case "refunded":
      return (
        <Badge className="bg-purple-100 text-purple-700 border-purple-200">
          <AlertCircle className="w-3 h-3 mr-1" />
          Refunded
        </Badge>
      );
  }
}

export function Transactions() {
  const { accessToken } = useAuth();
  const [payments, setPayments] = useState<AdminPaymentSummary[]>([]);
  const [searchTerm, setSearchTerm] = usePersistentState(
    "servease_admin_transactions_search",
    "",
  );
  const [statusFilter, setStatusFilter] = usePersistentState<AdminPaymentStatus | "all">(
    "servease_admin_transactions_status",
    "all",
  );
  const [paymentMethodFilter, setPaymentMethodFilter] = usePersistentState(
    "servease_admin_transactions_method",
    "all",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingPaymentId, setUpdatingPaymentId] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<AdminPaymentSummary | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    payment: AdminPaymentSummary;
    nextStatus: AdminPaymentStatus;
  } | null>(null);

  const loadPayments = useCallback(async () => {
    if (!accessToken) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await listAdminPayments(
        accessToken,
        statusFilter === "all" ? null : statusFilter,
      );
      setPayments(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load payments.");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, statusFilter]);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  const paymentMethods = useMemo(() => {
    return Array.from(
      new Set(payments.map((payment) => payment.paymentMethod).filter(Boolean) as string[]),
    ).sort();
  }, [payments]);

  const filteredPayments = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    return payments.filter((payment) => {
      const matchesSearch =
        payment.id.toLowerCase().includes(normalizedSearch) ||
        payment.bookingId.toLowerCase().includes(normalizedSearch) ||
        payment.customerId?.toLowerCase().includes(normalizedSearch) ||
        payment.providerId?.toLowerCase().includes(normalizedSearch);

      const matchesMethod =
        paymentMethodFilter === "all" || payment.paymentMethod === paymentMethodFilter;

      return matchesSearch && matchesMethod;
    });
  }, [payments, paymentMethodFilter, searchTerm]);

  const stats = useMemo(() => {
    const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalCommission = filteredPayments.reduce(
      (sum, payment) => sum + payment.platformFee,
      0,
    );
    const paidCount = filteredPayments.filter((payment) => payment.status === "paid").length;

    return {
      total: filteredPayments.length,
      totalAmount,
      totalCommission,
      successRate:
        filteredPayments.length > 0 ? (paidCount / filteredPayments.length) * 100 : 0,
    };
  }, [filteredPayments]);

  const requestStatusChange = (
    payment: AdminPaymentSummary,
    nextStatus: AdminPaymentStatus,
  ) => {
    if (nextStatus === payment.status) return;
    setPendingStatusChange({ payment, nextStatus });
  };

  const confirmStatusChange = async () => {
    if (!accessToken || !pendingStatusChange) return;

    const { payment, nextStatus } = pendingStatusChange;
    setUpdatingPaymentId(payment.id);

    try {
      const updated = await updateAdminPaymentStatus(accessToken, payment.id, nextStatus);
      setPayments((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      toast.success(`Payment ${updated.id} updated to ${nextStatus}.`);
      setPendingStatusChange(null);
    } catch (updateError) {
      toast.error(
        updateError instanceof Error ? updateError.message : "Unable to update payment.",
      );
    } finally {
      setUpdatingPaymentId(null);
    }
  };

  const exportCsv = () => {
    const rows = filteredPayments.map((payment) => [
      payment.id,
      payment.bookingId,
      payment.customerId ?? "",
      payment.providerId ?? "",
      payment.amount,
      payment.platformFee,
      payment.providerPayout,
      payment.status,
      payment.paymentMethod ?? "",
      payment.paidAt ?? "",
      payment.createdAt ?? "",
    ]);
    const csv = [
      [
        "Payment ID",
        "Booking ID",
        "Customer ID",
        "Provider ID",
        "Amount",
        "Platform Fee",
        "Provider Payout",
        "Status",
        "Payment Method",
        "Paid At",
        "Created At",
      ],
      ...rows,
    ]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `admin-payments-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Transactions</h1>
          <p className="text-gray-500 mt-1">
            Monitor payment transactions from the admin gateway.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => void loadPayments()} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button className="bg-[#16A34A] hover:bg-[#15803D]" onClick={exportCsv}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#DCFCE7]">
                <Receipt className="w-6 h-6 text-[#16A34A]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatPeso(stats.totalAmount)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Platform Fee</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatPeso(stats.totalCommission)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#DCFCE7]">
                <TrendingUp className="w-6 h-6 text-[#16A34A]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Paid Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.successRate.toFixed(1)}%
                </p>
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
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search ID, booking, customer, provider..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as AdminPaymentStatus | "all")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {paymentStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
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
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Platform Fee</TableHead>
                  <TableHead>Provider Payout</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Update</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8 text-gray-500">
                      Loading transactions...
                    </TableCell>
                  </TableRow>
                ) : filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8 text-gray-500">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <span className="font-mono font-semibold text-[#16A34A]">
                          {payment.id}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-gray-600">
                        {payment.bookingId}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-gray-600">
                        {payment.customerId ?? "N/A"}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-gray-600">
                        {payment.providerId ?? "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {payment.paymentMethod ?? "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900">
                        {formatPeso(payment.amount)}
                      </TableCell>
                      <TableCell className="font-semibold text-[#16A34A]">
                        {formatPeso(payment.platformFee)}
                      </TableCell>
                      <TableCell className="font-semibold text-blue-600">
                        {formatPeso(payment.providerPayout)}
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(payment.paidAt ?? payment.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedPayment(payment)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={payment.status}
                          onValueChange={(value) =>
                            requestStatusChange(payment, value as AdminPaymentStatus)
                          }
                          disabled={updatingPaymentId === payment.id}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentStatuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
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

      <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Backend payment record from the admin gateway.
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <Detail label="Payment ID" value={selectedPayment.id} mono />
              <Detail label="Booking ID" value={selectedPayment.bookingId} mono />
              <Detail label="Customer ID" value={selectedPayment.customerId ?? "N/A"} mono />
              <Detail label="Provider ID" value={selectedPayment.providerId ?? "N/A"} mono />
              <Detail label="Amount" value={formatPeso(selectedPayment.amount)} />
              <Detail label="Platform Fee" value={formatPeso(selectedPayment.platformFee)} />
              <Detail label="Provider Payout" value={formatPeso(selectedPayment.providerPayout)} />
              <Detail label="Payment Method" value={selectedPayment.paymentMethod ?? "N/A"} />
              <Detail label="Status" value={selectedPayment.status} />
              <Detail label="Paid At" value={formatDate(selectedPayment.paidAt)} />
              <Detail label="Created At" value={formatDate(selectedPayment.createdAt)} />
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
            <AlertDialogTitle>Update payment status?</AlertDialogTitle>
            <AlertDialogDescription>
              This will update payment{" "}
              <span className="font-mono">{pendingStatusChange?.payment.id}</span> from{" "}
              <span className="font-semibold">{pendingStatusChange?.payment.status}</span> to{" "}
              <span className="font-semibold">{pendingStatusChange?.nextStatus}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!updatingPaymentId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void confirmStatusChange();
              }}
              disabled={!!updatingPaymentId}
              className="bg-[#16A34A] hover:bg-[#15803D]"
            >
              {updatingPaymentId ? "Updating..." : "Confirm Update"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Detail({
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
