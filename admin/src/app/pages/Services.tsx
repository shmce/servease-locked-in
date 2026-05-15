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
  DollarSign,
  Package,
  Search,
} from "lucide-react";
import {
  listCatalogCategories,
  listCatalogServices,
  type CatalogCategory,
  type CatalogServiceItem,
} from "../../services/serveaseAdminApi";
import { usePersistentState } from "../../hooks/usePersistentState";

function formatPeso(value: number | null) {
  if (value === null) return "N/A";
  return `₱${value.toLocaleString("en-PH", { maximumFractionDigits: 2 })}`;
}

export function Services() {
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [services, setServices] = useState<CatalogServiceItem[]>([]);
  const [searchTerm, setSearchTerm] = usePersistentState(
    "servease_admin_services_search",
    "",
  );
  const [categoryFilter, setCategoryFilter] = usePersistentState(
    "servease_admin_services_category",
    "all",
  );
  const [statusFilter, setStatusFilter] = usePersistentState(
    "servease_admin_services_status",
    "all",
  );
  const [pricingTypeFilter, setPricingTypeFilter] = usePersistentState(
    "servease_admin_services_pricing",
    "all",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCatalog = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [categoryData, serviceData] = await Promise.all([
          listCatalogCategories(),
          listCatalogServices(),
        ]);
        setCategories(categoryData);
        setServices(serviceData);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load services.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadCatalog();
  }, []);

  const categoryById = useMemo(() => {
    return categories.reduce<Record<string, CatalogCategory>>((index, category) => {
      index[category.id] = category;
      return index;
    }, {});
  }, [categories]);

  const filteredServices = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    return services.filter((service) => {
      const categoryName = service.categoryId ? categoryById[service.categoryId]?.name : "";
      const matchesSearch =
        service.name.toLowerCase().includes(normalizedSearch) ||
        service.id.toLowerCase().includes(normalizedSearch) ||
        service.description?.toLowerCase().includes(normalizedSearch) ||
        categoryName?.toLowerCase().includes(normalizedSearch);
      const matchesCategory =
        categoryFilter === "all" || service.categoryId === categoryFilter;
      const matchesStatus = statusFilter === "all" || statusFilter === "active";
      const matchesPricing =
        pricingTypeFilter === "all" || service.pricingMode === pricingTypeFilter;

      return matchesSearch && matchesCategory && matchesStatus && matchesPricing;
    });
  }, [categoryById, categoryFilter, pricingTypeFilter, searchTerm, services, statusFilter]);

  const averagePrice = useMemo(() => {
    const pricedServices = services.filter((service) => typeof service.price === "number");

    if (pricedServices.length === 0) return 0;

    return Math.round(
      pricedServices.reduce((sum, service) => sum + (service.price ?? 0), 0) /
        pricedServices.length,
    );
  }, [services]);

  const stats = {
    total: services.length,
    active: services.length,
    inactive: 0,
    avgPrice: averagePrice,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Services</h1>
        <p className="text-gray-500 mt-1">
          Backend-backed catalog services. Create, update, delete, and status controls need
          admin catalog endpoints.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Services</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Services</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-[#00BF63]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Inactive Services</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.inactive}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg. Base Price</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatPeso(stats.avgPrice)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
              </SelectContent>
            </Select>

            <Select value={pricingTypeFilter} onValueChange={setPricingTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All pricing types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pricing Types</SelectItem>
                <SelectItem value="flat">Flat</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Pricing Type</TableHead>
                  <TableHead className="text-right">Base Price / Rate</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Loading services...
                    </TableCell>
                  </TableRow>
                ) : filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No services found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{service.name}</p>
                            <p className="text-xs text-gray-500 font-mono">{service.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        {service.categoryId
                          ? categoryById[service.categoryId]?.name ?? "Unknown category"
                          : "Uncategorized"}
                      </TableCell>
                      <TableCell className="max-w-md text-sm text-gray-600">
                        {service.description ?? "No description"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {service.pricingMode}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-gray-900">
                        {formatPeso(service.price)}
                        {service.pricingMode === "hourly" && (
                          <span className="text-xs text-gray-500">/hr</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
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
