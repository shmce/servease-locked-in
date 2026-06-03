import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
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
  CheckCircle,
  MapPin,
  RefreshCw,
  Search,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import {
  listAdminManagedProviders,
  type AdminProviderSummary,
} from "../../services/serveaseAdminApi";

interface ServiceArea {
  id: string;
  name: string;
  city: string;
  region: string;
  status: "Active" | "Inactive";
  providersAvailable: number;
  latitude: number;
  longitude: number;
}

const mapBounds = {
  north: 14.75,
  south: 14.45,
  east: 121.15,
  west: 120.9,
};

const metroManilaPoints: Record<string, { latitude: number; longitude: number }> = {
  caloocan: { latitude: 14.6507, longitude: 120.9676 },
  makati: { latitude: 14.5547, longitude: 121.0244 },
  malabon: { latitude: 14.668, longitude: 120.9563 },
  mandaluyong: { latitude: 14.5794, longitude: 121.0359 },
  manila: { latitude: 14.5995, longitude: 120.9842 },
  marikina: { latitude: 14.6507, longitude: 121.1029 },
  muntinlupa: { latitude: 14.4081, longitude: 121.0415 },
  navotas: { latitude: 14.6667, longitude: 120.9417 },
  paranaque: { latitude: 14.4793, longitude: 121.0198 },
  pasay: { latitude: 14.5378, longitude: 121.0014 },
  pasig: { latitude: 14.5764, longitude: 121.0851 },
  pateros: { latitude: 14.5448, longitude: 121.0671 },
  "quezon city": { latitude: 14.676, longitude: 121.0437 },
  sanjuan: { latitude: 14.6042, longitude: 121.0298 },
  taguig: { latitude: 14.5176, longitude: 121.0509 },
  valenzuela: { latitude: 14.7011, longitude: 120.983 },
};

function normalizeAreaName(value: string | null) {
  const trimmed = value?.trim();
  return trimmed || "Unassigned Coverage";
}

function cityFromAreaName(name: string) {
  const firstPart = name.split(/[-,]/)[0]?.trim() || name;
  return firstPart.replace(/\s+/g, " ");
}

function coordinateForCity(city: string, index: number) {
  const key = city.toLowerCase().replace(/[^a-z ]/g, "").trim();
  const known = metroManilaPoints[key] ?? metroManilaPoints[key.replace(/\s+/g, "")];
  if (known) return known;

  const angle = (index / 12) * Math.PI * 2;
  return {
    latitude: 14.59 + Math.sin(angle) * 0.08,
    longitude: 121.02 + Math.cos(angle) * 0.08,
  };
}

function getCoveragePoint(area: ServiceArea) {
  const left =
    ((area.longitude - mapBounds.west) / (mapBounds.east - mapBounds.west)) * 100;
  const top =
    ((mapBounds.north - area.latitude) / (mapBounds.north - mapBounds.south)) * 100;

  return {
    left: `${Math.min(94, Math.max(6, left))}%`,
    top: `${Math.min(90, Math.max(10, top))}%`,
  };
}

function buildServiceAreas(providers: AdminProviderSummary[]): ServiceArea[] {
  const grouped = new Map<string, AdminProviderSummary[]>();

  for (const provider of providers) {
    const name = normalizeAreaName(provider.serviceArea);
    grouped.set(name, [...(grouped.get(name) ?? []), provider]);
  }

  return [...grouped.entries()]
    .map(([name, areaProviders], index) => {
      const city = name === "Unassigned Coverage" ? "Unassigned" : cityFromAreaName(name);
      const coordinates = coordinateForCity(city, index);
      const activeCount = areaProviders.filter((provider) => provider.isActive).length;

      return {
        id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        name,
        city,
        region: city === "Unassigned" ? "N/A" : "NCR",
        status: activeCount > 0 ? "Active" : "Inactive",
        providersAvailable: activeCount,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      } satisfies ServiceArea;
    })
    .sort((a, b) => b.providersAvailable - a.providersAvailable || a.name.localeCompare(b.name));
}

export function ServiceAreas() {
  const { accessToken } = useAuth();
  const [providers, setProviders] = useState<AdminProviderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadProviders = useCallback(async () => {
    if (!accessToken) {
      setProviders([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    try {
      setProviders(await listAdminManagedProviders(accessToken, { status: null }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load service coverage.";
      setLoadError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadProviders();
  }, [loadProviders]);

  const serviceAreas = useMemo(() => buildServiceAreas(providers), [providers]);
  const cities = useMemo(
    () => Array.from(new Set(serviceAreas.map((area) => area.city))).sort(),
    [serviceAreas],
  );

  const filteredAreas = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return serviceAreas.filter((area) => {
      const matchesSearch =
        !query ||
        area.name.toLowerCase().includes(query) ||
        area.city.toLowerCase().includes(query);
      const matchesCity = cityFilter === "all" || area.city === cityFilter;
      const matchesStatus =
        statusFilter === "all" || area.status.toLowerCase() === statusFilter;
      return matchesSearch && matchesCity && matchesStatus;
    });
  }, [cityFilter, searchTerm, serviceAreas, statusFilter]);

  const stats = useMemo(
    () => ({
      total: serviceAreas.length,
      active: serviceAreas.filter((area) => area.status === "Active").length,
      inactive: serviceAreas.filter((area) => area.status === "Inactive").length,
      totalProviders: serviceAreas.reduce(
        (sum, area) => sum + area.providersAvailable,
        0,
      ),
    }),
    [serviceAreas],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Areas</h1>
          <p className="text-gray-500 mt-1">
            Read-only coverage view derived from live provider listings.
          </p>
        </div>
        <Button variant="outline" onClick={() => void loadProviders()} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Service Areas</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Areas</p>
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
                <p className="text-sm text-gray-500">Inactive Areas</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.inactive}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Providers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProviders}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coverage Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-80 overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-sky-50 via-emerald-50 to-slate-100">
            <div className="absolute inset-x-0 top-1/4 h-px bg-white/80" />
            <div className="absolute inset-x-0 top-1/2 h-px bg-white/80" />
            <div className="absolute inset-x-0 top-3/4 h-px bg-white/80" />
            <div className="absolute inset-y-0 left-1/4 w-px bg-white/80" />
            <div className="absolute inset-y-0 left-1/2 w-px bg-white/80" />
            <div className="absolute inset-y-0 left-3/4 w-px bg-white/80" />
            <div className="absolute left-4 top-4 rounded-md bg-white/90 px-3 py-2 shadow-sm">
              <p className="text-sm font-semibold text-gray-900">Metro Manila coverage</p>
              <p className="text-xs text-gray-500">
                {filteredAreas.length} visible areas, {stats.totalProviders} providers
              </p>
            </div>
            {filteredAreas.map((area) => {
              const point = getCoveragePoint(area);

              return (
                <div
                  key={area.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={point}
                  title={`${area.name} - ${area.providersAvailable} active providers`}
                >
                  <div className="relative">
                    <div className="absolute inset-0 h-10 w-10 -translate-x-2 -translate-y-2 rounded-full bg-[#00BF63]/15" />
                    <div className="relative flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#00BF63] shadow-md">
                      <MapPin className="h-3.5 w-3.5 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-2 md:grid-cols-4">
              {cities.slice(0, 4).map((city) => (
                <div key={city} className="rounded-md bg-white/90 px-3 py-2 shadow-sm">
                  <p className="text-xs font-medium text-gray-900">{city}</p>
                  <p className="text-xs text-gray-500">
                    {serviceAreas.filter((area) => area.city === city).length} areas
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Area List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search service areas..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
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
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loadError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {loadError}
            </div>
          )}

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Area Name</TableHead>
                  <TableHead>City/Region</TableHead>
                  <TableHead className="text-right">Active Providers</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-gray-500">
                      Loading service coverage...
                    </TableCell>
                  </TableRow>
                ) : filteredAreas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-gray-500">
                      No service areas found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAreas.map((area) => (
                    <TableRow key={area.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-[#00BF63]" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{area.name}</p>
                            <p className="text-xs text-gray-500">{area.id || "unassigned"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm text-gray-900">{area.city}</p>
                          <p className="text-xs text-gray-500">{area.region}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">
                            {area.providersAvailable}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            area.status === "Active"
                              ? "bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]"
                              : "bg-red-100 text-red-700 border-red-200"
                          }
                        >
                          {area.status === "Active" ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {area.status}
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
