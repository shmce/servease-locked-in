import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import {
  AdminProviderApplicationSummary,
  AdminProviderApplicationStatus,
  listAdminProviderApplications,
} from "../../services/serveaseAdminApi";
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
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

type ProviderApplicationRow = {
  applicationId: string;
  reviewId: string;
  businessName: string;
  ownerName: string;
  category: string;
  dateApplied: string;
  location: string;
  status: AdminProviderApplicationStatus;
  providerId: string;
};

export function ProviderApplications() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [backendApplications, setBackendApplications] = useState<
    AdminProviderApplicationSummary[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadApplications() {
      if (!accessToken) {
        setBackendApplications([]);
        return;
      }
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await listAdminProviderApplications(accessToken, {
          status:
            statusFilter === "all"
              ? null
              : (statusFilter as AdminProviderApplicationStatus),
          query: searchTerm.trim() || null,
          limit: 200,
        });
        if (!cancelled) {
          setBackendApplications(data);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Provider applications failed to load.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }
    void loadApplications();
    return () => {
      cancelled = true;
    };
  }, [accessToken, searchTerm, statusFilter]);

  const displayedApplications = useMemo((): ProviderApplicationRow[] => {
    return backendApplications.map(toApplicationRow);
  }, [backendApplications]);
  const categoryOptions = useMemo(
    () => Array.from(new Set(displayedApplications.map((app) => app.category))).sort(),
    [displayedApplications],
  );

  let filteredApplications = displayedApplications.filter((app) => {
    const matchesSearch =
      app.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicationId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || app.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Sort: pending first, then by date (newest first)
  filteredApplications = [...filteredApplications].sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    return new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime();
  });

  const getStatusBadge = (status: string) => {
    if (status === "pending") {
      return (
        <Badge className="bg-amber-100 text-amber-700 border-amber-200">
          Pending Review
        </Badge>
      );
    }
    if (status === "approved") {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200">
          Approved
        </Badge>
      );
    }
    if (status === "rejected") {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>
      );
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const pendingCount = displayedApplications.filter((app) => app.status === "pending").length;
  const approvedCount = displayedApplications.filter((app) => app.status === "approved").length;
  const rejectedCount = displayedApplications.filter((app) => app.status === "rejected").length;
  const statCards = [
    {
      title: "Pending Review",
      value: pendingCount.toString(),
      subtitle: "Awaiting approval",
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Approved",
      value: approvedCount.toString(),
      subtitle: "Backend approvals",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Rejected",
      value: rejectedCount.toString(),
      subtitle: "Declined applications",
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Provider Applications</h1>
        <p className="text-gray-500 mt-1">
          Review and approve new service provider applications
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.subtitle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Application Queue</CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter className="w-4 h-4" />
              {filteredApplications.length} of {displayedApplications.length} applications
            </div>
          </div>
          {loadError ? (
            <p className="text-sm text-red-600 mt-2">{loadError}</p>
          ) : null}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or ID..."
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
                <SelectItem value="pending">
                  Pending Review ({pendingCount})
                </SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoryOptions.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application ID</TableHead>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Owner Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date Applied</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      {isLoading
                        ? "Loading provider applications..."
                        : "No backend applications found matching your filters"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((app) => (
                    <TableRow key={app.applicationId}>
                      <TableCell>
                        <span className="font-mono font-semibold text-gray-900">
                          {app.applicationId}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-gray-900">
                          {app.businessName}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-700">{app.ownerName}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700">{app.category}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {new Date(app.dateApplied).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{app.location}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/provider-applications/${app.reviewId}`)}
                          className="gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Review
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

function toApplicationRow(app: AdminProviderApplicationSummary): ProviderApplicationRow {
  return {
    applicationId: app.applicationReference,
    reviewId: app.id,
    businessName: app.businessName ?? "Unnamed provider",
    ownerName: app.userId,
    category: "Service Marketplace",
    dateApplied: app.createdAt ?? "",
    location: app.serviceArea ?? "Service area not set",
    status: app.verificationStatus,
    providerId: app.id,
  };
}
