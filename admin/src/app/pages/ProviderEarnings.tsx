import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
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
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Search,
  Eye,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  listAdminManagedProviders,
  listAdminSettlements,
  AdminProviderSummary,
  AdminPayoutSummary,
} from "../../services/serveaseAdminApi";

export function ProviderEarnings() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [providers, setProviders] = useState<AdminProviderSummary[]>([]);
  const [payouts, setPayouts] = useState<AdminPayoutSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);

    Promise.all([
      listAdminManagedProviders(accessToken),
      listAdminSettlements(accessToken),
    ])
      .then(([provs, pays]) => {
        if (cancelled) return;
        setProviders(provs);
        setPayouts(pays);
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadError(
          error instanceof Error ? error.message : "Unable to load provider earnings.",
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const payoutsByProvider = useMemo(() => {
    const map = new Map<string, AdminPayoutSummary[]>();
    for (const p of payouts) {
      const existing = map.get(p.providerId) ?? [];
      map.set(p.providerId, [...existing, p]);
    }
    return map;
  }, [payouts]);

  const providerEarningsData = useMemo(() => {
    return providers.map((provider) => {
      const provPayouts = payoutsByProvider.get(provider.id) ?? [];
      const totalEarnings = provPayouts.reduce((s, p) => s + p.amount, 0);
      const pendingEarnings = provPayouts
        .filter((p) => p.status === "requested")
        .reduce((s, p) => s + p.amount, 0);
      const paidEarnings = provPayouts
        .filter((p) => p.status === "paid")
        .reduce((s, p) => s + p.amount, 0);
      const lastPayout = provPayouts
        .filter((p) => p.paidAt)
        .sort((a, b) => new Date(b.paidAt!).getTime() - new Date(a.paidAt!).getTime())[0]
        ?.paidAt ?? null;
      return { provider, totalEarnings, pendingEarnings, paidEarnings, lastPayout };
    });
  }, [providers, payoutsByProvider]);

  const filteredData = useMemo(() => {
    return providerEarningsData.filter((item) => {
      return (
        (item.provider.businessName ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.provider.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [providerEarningsData, searchTerm]);

  const totalEarnings = payouts.reduce((s, p) => s + p.amount, 0);
  const totalPending = payouts.filter((p) => p.status === "requested").reduce((s, p) => s + p.amount, 0);
  const totalPaid = payouts.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const totalPayoutCount = payouts.length;

  const fmt = (n: number) => `₱${(n / 1000).toFixed(1)}K`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Service Provider Earnings</h1>
        <p className="text-gray-500 mt-1">
          Monitor earnings and settlements for all service providers
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{fmt(totalEarnings)}</p>
                <p className="text-xs text-gray-400 mt-1">All providers</p>
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
                <p className="text-sm text-gray-500">Pending Payouts</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{fmt(totalPending)}</p>
                <p className="text-xs text-gray-400 mt-1">Awaiting processing</p>
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
                <p className="text-sm text-gray-500">Paid Out</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{fmt(totalPaid)}</p>
                <p className="text-xs text-gray-400 mt-1">Successfully settled</p>
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
                <p className="text-sm text-gray-500">Total Payouts</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalPayoutCount}</p>
                <p className="text-xs text-gray-400 mt-1">All-time transactions</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Provider Earnings Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by provider name or ID…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {loadError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {loadError}
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Service Area</TableHead>
                  <TableHead>Total Earnings</TableHead>
                  <TableHead>Pending</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Reviews</TableHead>
                  <TableHead>Last Payout</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Loading provider earnings...
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No providers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map(({ provider, totalEarnings, pendingEarnings, paidEarnings, lastPayout }) => (
                    <TableRow key={provider.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{provider.businessName ?? "—"}</p>
                          <p className="text-xs text-gray-500 font-mono">{provider.id.slice(0, 8)}…</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{provider.serviceArea ?? "—"}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-gray-900">
                          ₱{totalEarnings.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-yellow-600">
                          ₱{pendingEarnings.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-[#16A34A]">
                          ₱{paidEarnings.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                          {provider.reviewCount} reviews
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {lastPayout ? (
                          <span className="text-sm text-gray-600">
                            {new Date(lastPayout).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">No payout yet</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/service-providers/${provider.id}`)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View Details
                        </Button>
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
