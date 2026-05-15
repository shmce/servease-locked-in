import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  AlertCircle,
  CheckCircle,
  Package,
  Search,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  listCatalogServices,
  listProviderListings,
  type CatalogServiceItem,
  type ProviderServiceListing,
} from "../../services/serveaseAdminApi";
import { usePersistentState } from "../../hooks/usePersistentState";

function formatPeso(value: number | null) {
  if (value === null) return "N/A";
  return `₱${value.toLocaleString("en-PH", { maximumFractionDigits: 2 })}`;
}

export function ServiceProviders() {
  const [providers, setProviders] = useState<ProviderServiceListing[]>([]);
  const [services, setServices] = useState<CatalogServiceItem[]>([]);
  const [searchTerm, setSearchTerm] = usePersistentState(
    "servease_admin_providers_search",
    "",
  );
  const [serviceFilter, setServiceFilter] = usePersistentState(
    "servease_admin_providers_service",
    "all",
  );
  const [verificationFilter, setVerificationFilter] = usePersistentState(
    "servease_admin_providers_verification",
    "all",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProviders = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [providerData, serviceData] = await Promise.all([
          listProviderListings(),
          listCatalogServices(),
        ]);
        setProviders(providerData);
        setServices(serviceData);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load providers.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadProviders();
  }, []);

  const serviceById = useMemo(() => {
    return services.reduce<Record<string, CatalogServiceItem>>((index, service) => {
      index[service.id] = service;
      return index;
    }, {});
  }, [services]);

  const filteredProviders = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    return providers.filter((provider) => {
      const serviceName = provider.serviceId ? serviceById[provider.serviceId]?.name : "";
      const matchesSearch =
        provider.id.toLowerCase().includes(normalizedSearch) ||
        provider.providerId.toLowerCase().includes(normalizedSearch) ||
        provider.providerBusinessName?.toLowerCase().includes(normalizedSearch) ||
        provider.title.toLowerCase().includes(normalizedSearch) ||
        serviceName?.toLowerCase().includes(normalizedSearch);
      const matchesService =
        serviceFilter === "all" || provider.serviceId === serviceFilter;
      const matchesVerification =
        verificationFilter === "all" || provider.verificationStatus === verificationFilter;

      return matchesSearch && matchesService && matchesVerification;
    });
  }, [providers, searchTerm, serviceById, serviceFilter, verificationFilter]);

  const providerIds = useMemo(() => {
    return new Set(providers.map((provider) => provider.providerId));
  }, [providers]);

  const stats = useMemo(() => {
    const averageRating =
      providers.length > 0
        ? providers.reduce((sum, provider) => sum + provider.averageRating, 0) /
          providers.length
        : 0;
    const approved = providers.filter(
      (provider) => provider.verificationStatus === "approved",
    ).length;

    return {
      providerCount: providerIds.size,
      listingCount: providers.length,
      averageRating,
      approved,
    };
  }, [providerIds.size, providers]);

  const getVerificationBadge = (status: ProviderServiceListing["verificationStatus"]) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Service Providers</h1>
        <p className="text-gray-500 mt-1">
          Backend-backed provider service listings. Admin provider status updates need a
          provider admin endpoint.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Providers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.providerCount}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#DCFCE7]">
                <Users className="w-6 h-6 text-[#16A34A]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Service Listings</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.listingCount}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.averageRating.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Approved Listings</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.approved}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#DCFCE7]">
                <TrendingUp className="w-6 h-6 text-[#16A34A]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Provider Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search provider, listing, service..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={verificationFilter} onValueChange={setVerificationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Verification</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
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
                  <TableHead>Provider</TableHead>
                  <TableHead>Listing</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Verification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Loading providers...
                    </TableCell>
                  </TableRow>
                ) : filteredProviders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No provider listings found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProviders.map((provider) => (
                    <TableRow key={provider.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">
                            {provider.providerBusinessName ?? "Unnamed provider"}
                          </p>
                          <p className="font-mono text-xs text-gray-500">
                            {provider.providerId}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{provider.title}</p>
                          <p className="font-mono text-xs text-gray-500">{provider.id}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {provider.serviceId
                          ? serviceById[provider.serviceId]?.name ?? "Unknown service"
                          : "Unassigned"}
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900">
                        {formatPeso(provider.price)}
                        {provider.pricingMode === "hourly" && (
                          <span className="text-xs text-gray-500">/hr</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {provider.averageRating.toFixed(1)}
                          <span className="text-gray-400">({provider.reviewCount})</span>
                        </div>
                      </TableCell>
                      <TableCell>{getVerificationBadge(provider.verificationStatus)}</TableCell>
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
