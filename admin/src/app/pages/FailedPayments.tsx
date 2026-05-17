import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  XCircle,
  Search,
  AlertTriangle,
  CreditCard,
  DollarSign,
  RotateCw,
  PencilLine,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import {
  listAdminPaymentFailures,
  recordAdminPaymentFailure,
  retryAdminPayment,
  type AdminPaymentSummary,
} from "../../services/serveaseAdminApi";

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

export function FailedPayments() {
  const { accessToken } = useAuth();
  const [payments, setPayments] = useState<AdminPaymentSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogPayment, setDialogPayment] = useState<AdminPaymentSummary | null>(null);
  const [failureReason, setFailureReason] = useState("");
  const [failureCode, setFailureCode] = useState("");
  const [disputeId, setDisputeId] = useState("");
  const [isSavingFailure, setIsSavingFailure] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const loadPayments = useCallback(async () => {
    if (!accessToken) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await listAdminPaymentFailures(accessToken);
      setPayments(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load payments.");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  const openFailureDialog = (payment: AdminPaymentSummary) => {
    setDialogPayment(payment);
    setFailureReason(payment.failureReason ?? "");
    setFailureCode(payment.failureCode ?? "");
    setDisputeId(payment.disputeId ?? "");
  };

  const closeFailureDialog = () => {
    setDialogPayment(null);
    setFailureReason("");
    setFailureCode("");
    setDisputeId("");
  };

  const saveFailureMetadata = async () => {
    if (!accessToken || !dialogPayment) return;
    if (!failureReason.trim()) {
      toast.error("Please provide a failure reason.");
      return;
    }
    setIsSavingFailure(true);
    try {
      const updated = await recordAdminPaymentFailure(accessToken, dialogPayment.id, {
        failureReason: failureReason.trim(),
        failureCode: failureCode.trim() || null,
        disputeId: disputeId.trim() || null,
      });
      setPayments((prev) =>
        prev.map((payment) => (payment.id === updated.id ? updated : payment)),
      );
      toast.success("Failure details saved.");
      closeFailureDialog();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save failure details.");
    } finally {
      setIsSavingFailure(false);
    }
  };

  const handleRetry = async (payment: AdminPaymentSummary) => {
    if (!accessToken) return;
    setRetryingId(payment.id);
    try {
      const updated = await retryAdminPayment(accessToken, payment.id);
      // After retry payment is back to 'pending' so drop it from the failures view
      setPayments((prev) => prev.filter((item) => item.id !== payment.id));
      toast.success(`Retry #${updated.retryCount} scheduled.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not retry payment.");
    } finally {
      setRetryingId(null);
    }
  };

  const filteredPayments = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    return payments.filter((payment) => {
      const haystack = [
        payment.id,
        payment.bookingId,
        payment.customerId ?? "",
        payment.providerId ?? "",
        payment.failureReason ?? "",
        payment.failureCode ?? "",
        payment.disputeId ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [payments, searchTerm]);

  const stats = useMemo(() => {
    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const uniqueCustomers = new Set(payments.map((payment) => payment.customerId).filter(Boolean));
    const retried = payments.filter((payment) => (payment.retryCount ?? 0) > 0).length;
    const linkedDisputes = payments.filter((payment) => payment.disputeId).length;

    return {
      totalFailed: payments.length,
      totalAmount,
      uniqueCustomers: uniqueCustomers.size,
      refunded: payments.filter((payment) => payment.status === "refunded").length,
      cancelled: payments.filter((payment) => payment.status === "cancelled").length,
      retried,
      linkedDisputes,
    };
  }, [payments]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Failed Payments</h1>
        <p className="text-gray-500 mt-1">
          Cancelled and refunded payments with editable failure reason, gateway code,
          retry history, and dispute linkage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Exception Payments</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalFailed}</p>
                <p className="text-xs text-gray-400 mt-1">Cancelled + refunded</p>
              </div>
              <div className="p-3 rounded-lg bg-red-50">
                <XCircle className="w-6 h-6 text-red-600" />
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
                <p className="text-xs text-gray-400 mt-1">Affected revenue</p>
              </div>
              <div className="p-3 rounded-lg bg-red-50">
                <DollarSign className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Retries Attempted</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.retried}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {stats.linkedDisputes} linked dispute{stats.linkedDisputes === 1 ? "" : "s"}
                </p>
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
                <p className="text-sm text-gray-500">Refunded</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.refunded}</p>
                <p className="text-xs text-gray-400 mt-1">{stats.cancelled} cancelled</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Exceptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by ID, booking, customer, provider, reason, code, dispute..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-9"
              />
            </div>
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
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Failure</TableHead>
                  <TableHead>Retries</TableHead>
                  <TableHead>Dispute</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      Loading payment exceptions...
                    </TableCell>
                  </TableRow>
                ) : filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      No cancelled or refunded payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <span className="font-mono font-semibold text-[#16A34A]">
                          {payment.id.slice(0, 8)}…
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-gray-600">
                        {payment.bookingId.slice(0, 8)}…
                      </TableCell>
                      <TableCell className="font-bold text-gray-900">
                        {formatPeso(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {payment.paymentMethod ?? "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-red-100 text-red-700 border-red-200">
                          <XCircle className="w-3 h-3 mr-1" />
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {payment.failureReason ? (
                          <div className="text-sm">
                            <p className="text-gray-900 truncate" title={payment.failureReason}>
                              {payment.failureReason}
                            </p>
                            {payment.failureCode && (
                              <p className="text-xs font-mono text-gray-500">
                                {payment.failureCode}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No reason recorded</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{payment.retryCount ?? 0}</p>
                          {payment.lastRetryAt && (
                            <p className="text-xs text-gray-500">
                              {formatDate(payment.lastRetryAt)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {payment.disputeId ? (
                          <span className="font-mono text-xs text-gray-600">
                            {payment.disputeId.slice(0, 8)}…
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(payment.paidAt ?? payment.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openFailureDialog(payment)}
                          >
                            <PencilLine className="w-3.5 h-3.5 mr-1" />
                            Details
                          </Button>
                          <Button
                            size="sm"
                            className="bg-[#00BF63] hover:bg-[#00A055]"
                            onClick={() => handleRetry(payment)}
                            disabled={retryingId === payment.id}
                          >
                            <RotateCw className="w-3.5 h-3.5 mr-1" />
                            {retryingId === payment.id ? "Retrying..." : "Retry"}
                          </Button>
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

      <Dialog open={dialogPayment !== null} onOpenChange={(open) => !open && closeFailureDialog()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Record failure details</DialogTitle>
            <DialogDescription>
              {dialogPayment
                ? `Payment ${dialogPayment.id.slice(0, 8)}… for booking ${dialogPayment.bookingId.slice(0, 8)}…`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="failure-reason">Failure Reason *</Label>
              <Textarea
                id="failure-reason"
                placeholder="e.g. Card declined by issuer"
                value={failureReason}
                onChange={(event) => setFailureReason(event.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="failure-code">Gateway Code</Label>
              <Input
                id="failure-code"
                placeholder="e.g. insufficient_funds"
                value={failureCode}
                onChange={(event) => setFailureCode(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dispute-id">Linked Dispute ID</Label>
              <Input
                id="dispute-id"
                placeholder="UUID of related dispute (optional)"
                value={disputeId}
                onChange={(event) => setDisputeId(event.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeFailureDialog} disabled={isSavingFailure}>
              Cancel
            </Button>
            <Button
              className="bg-[#00BF63] hover:bg-[#00A055]"
              onClick={saveFailureMetadata}
              disabled={isSavingFailure}
            >
              {isSavingFailure ? "Saving..." : "Save details"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
