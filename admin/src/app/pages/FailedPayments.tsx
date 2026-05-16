import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
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
  XCircle,
  Search,
  AlertTriangle,
  CreditCard,
  DollarSign,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  listAdminPaymentFailures,
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

  const filteredPayments = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    return payments.filter((payment) => {
      return (
        payment.id.toLowerCase().includes(normalizedSearch) ||
        payment.bookingId.toLowerCase().includes(normalizedSearch) ||
        payment.customerId?.toLowerCase().includes(normalizedSearch) ||
        payment.providerId?.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [payments, searchTerm]);

  const stats = useMemo(() => {
    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const uniqueCustomers = new Set(payments.map((payment) => payment.customerId).filter(Boolean));

    return {
      totalFailed: payments.length,
      totalAmount,
      uniqueCustomers: uniqueCustomers.size,
      refunded: payments.filter((payment) => payment.status === "refunded").length,
      cancelled: payments.filter((payment) => payment.status === "cancelled").length,
    };
  }, [payments]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Failed Payments</h1>
        <p className="text-gray-500 mt-1">
          Shows gateway-backed cancelled and refunded payment records. Failure reason
          detail still needs a backend contract.
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
                <p className="text-sm text-gray-500">Affected Customers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.uniqueCustomers}
                </p>
                <p className="text-xs text-gray-400 mt-1">Unique customer IDs</p>
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
                placeholder="Search by ID, booking, customer, provider..."
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
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Provider ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Loading payment exceptions...
                    </TableCell>
                  </TableRow>
                ) : filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No cancelled or refunded payments found
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
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(payment.paidAt ?? payment.createdAt)}
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
