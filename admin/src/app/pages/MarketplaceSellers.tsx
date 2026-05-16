import { useState, useEffect } from "react";
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
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  DollarSign,
  Package,
  TrendingUp,
  UserX,
  Ban,
  ArrowUpDown,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useAuth } from "../contexts/AuthContext";
import {
  listAdminManagedProviders,
  updateAdminManagedProviderStatus,
  AdminProviderSummary,
} from "../../services/serveaseAdminApi";


export function MarketplaceSellers() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [providers, setProviders] = useState<AdminProviderSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  useEffect(() => {
    if (!accessToken) return;
    listAdminManagedProviders(accessToken).then(setProviders).catch(() => {});
  }, [accessToken]);

  const getApprovalStatus = (p: AdminProviderSummary) => {
    if (!p.isActive) return "suspended";
    if (p.verificationStatus === "approved") return "approved";
    if (p.verificationStatus === "pending") return "pending";
    return "suspended";
  };

  const handleStatusChange = async (
    providerId: string,
    status: "active" | "suspended",
  ) => {
    if (!accessToken) return;
    try {
      const updated = await updateAdminManagedProviderStatus(accessToken, providerId, status);
      setProviders((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch {
      // silently ignore; user sees no change
    }
  };

  let filteredProviders = providers.filter((provider) => {
    const approvalStatus = getApprovalStatus(provider);
    const matchesSearch =
      (provider.businessName ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || approvalStatus === statusFilter;
    const matchesCategory =
      categoryFilter === "all";
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Sort providers
  filteredProviders = [...filteredProviders].sort((a, b) => {
    if (sortBy === "rating-desc") return b.averageRating - a.averageRating;
    if (sortBy === "rating-asc") return a.averageRating - b.averageRating;
    if (sortBy === "jobs-desc") return b.reviewCount - a.reviewCount;
    if (sortBy === "jobs-asc") return a.reviewCount - b.reviewCount;
    if (sortBy === "date-desc") return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
    if (sortBy === "date-asc") return new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime();
    return 0;
  });

  const getStatusBadge = (status: string) => {
    if (status === "approved") {
      return <Badge className="bg-green-100 text-green-700 border-green-200">Approved</Badge>;
    }
    if (status === "pending") {
      return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Pending</Badge>;
    }
    if (status === "suspended") {
      return <Badge className="bg-red-100 text-red-700 border-red-200">Suspended</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Service Providers</h1>
        <p className="text-gray-500 mt-1">
          Manage provider onboarding, verification, and performance across all service categories
        </p>
      </div>

      {/* Service Category Filter - Top Level */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
              Service Category:
            </label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full max-w-md bg-white">
                <SelectValue placeholder="Select service category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Home Maintenance & Repair">Home Maintenance & Repair</SelectItem>
                <SelectItem value="Beauty Wellness & Personal Care">Beauty Wellness & Personal Care</SelectItem>
                <SelectItem value="Education & Professional Services">Education & Professional Services</SelectItem>
                <SelectItem value="Domestic & Cleaning Services">Domestic & Cleaning Services</SelectItem>
                <SelectItem value="Pet Services">Pet Services</SelectItem>
                <SelectItem value="Events & Entertainment">Events & Entertainment</SelectItem>
                <SelectItem value="Automotive & Tech Support">Automotive & Tech Support</SelectItem>
              </SelectContent>
            </Select>
            {categoryFilter !== "all" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCategoryFilter("all")}
                className="text-gray-600 hover:text-gray-900"
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Total Providers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{providers.length.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">{providers.filter((p) => p.isActive).length} active</p>
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
                <p className="text-sm text-gray-500">Verified Providers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {providers.filter((p) => p.verificationStatus === "approved").length.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {providers.filter((p) => p.verificationStatus === "pending").length} pending verification
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {providers.length > 0
                    ? (providers.reduce((s, p) => s + p.averageRating, 0) / providers.length).toFixed(1)
                    : "—"}
                </p>
                <p className="text-xs text-gray-400 mt-1">across all providers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Service Providers</CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter className="w-4 h-4" />
              {filteredProviders.length} of {providers.length} providers
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search business name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending Approval</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating-desc">Rating: High to Low</SelectItem>
                <SelectItem value="rating-asc">Rating: Low to High</SelectItem>
                <SelectItem value="jobs-desc">Jobs: High to Low</SelectItem>
                <SelectItem value="jobs-asc">Jobs: Low to High</SelectItem>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business ID</TableHead>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Service Category</TableHead>
                  <TableHead>Approval Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Completed Jobs</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProviders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No providers found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProviders.map((provider) => {
                    const approvalStatus = getApprovalStatus(provider);
                    return (
                    <TableRow key={provider.id}>
                      <TableCell>
                        <span className="font-mono font-semibold text-gray-900 text-xs">{provider.id.slice(0, 8)}…</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-gray-900">{provider.businessName ?? "—"}</p>
                          <p className="text-xs text-gray-500">{provider.userFullName ?? provider.userEmail ?? ""}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700">{provider.serviceArea ?? "—"}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(approvalStatus)}</TableCell>
                      <TableCell>
                        {provider.averageRating > 0 ? (
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-600">★</span>
                            <span className="font-medium">{provider.averageRating.toFixed(1)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No rating</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{provider.reviewCount.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{provider.serviceArea ?? "—"}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {provider.createdAt
                            ? new Date(provider.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            title="View Details"
                            onClick={() => navigate(`/sellers/marketplace/${provider.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {approvalStatus === "approved" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-orange-600 hover:text-orange-700"
                              title="Suspend"
                              onClick={() => handleStatusChange(provider.id, "suspended")}
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          )}
                          {approvalStatus === "suspended" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700"
                              title="Reactivate"
                              onClick={() => handleStatusChange(provider.id, "active")}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          {approvalStatus !== "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              title="Deactivate"
                              onClick={() => handleStatusChange(provider.id, "suspended")}
                            >
                              <UserX className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
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
    </div>
  );
}