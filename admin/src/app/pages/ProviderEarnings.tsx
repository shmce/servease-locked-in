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
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Search,
  CreditCard,
  Eye,
} from "lucide-react";
import { useData } from "../../contexts/DataContext";

export function ProviderEarnings() {
  const { serviceProviders, calculateProviderEarnings, getCategoryById, getBookingsByProvider } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const providerEarningsData = useMemo(() => {
    return serviceProviders.map((provider) => {
      const earnings = calculateProviderEarnings(provider.id);
      const category = getCategoryById(provider.categoryId);
      const bookings = getBookingsByProvider(provider.id);
      const completedBookings = bookings.filter((b) => b.status === "Completed");

      return {
        provider,
        earnings,
        category: category?.name || "N/A",
        completedBookingsCount: completedBookings.length,
      };
    });
  }, [serviceProviders, calculateProviderEarnings, getCategoryById, getBookingsByProvider]);

  const filteredProviders = useMemo(() => {
    return providerEarningsData.filter((item) => {
      const matchesSearch =
        item.provider.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.provider.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || item.provider.categoryId === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [providerEarningsData, searchTerm, categoryFilter]);

  const stats = useMemo(() => {
    const totalEarnings = providerEarningsData.reduce(
      (sum, item) => sum + item.earnings.totalEarnings,
      0
    );
    const totalPending = providerEarningsData.reduce(
      (sum, item) => sum + item.earnings.pendingEarnings,
      0
    );
    const totalPaid = providerEarningsData.reduce(
      (sum, item) => sum + item.earnings.paidEarnings,
      0
    );
    const totalBookings = providerEarningsData.reduce(
      (sum, item) => sum + item.earnings.totalBookings,
      0
    );

    return {
      totalEarnings,
      totalPending,
      totalPaid,
      totalBookings,
    };
  }, [providerEarningsData]);

  return (
    <div className="space-y-6">
      {/* Header */}
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
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₱{(stats.totalEarnings / 1000).toFixed(1)}K
                </p>
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
                <p className="text-sm text-gray-500">Pending Earnings</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₱{(stats.totalPending / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-gray-400 mt-1">Not yet paid</p>
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
                <p className="text-sm text-gray-500">Paid Earnings</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₱{(stats.totalPaid / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-gray-400 mt-1">Already settled</p>
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
                <p className="text-sm text-gray-500">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalBookings}</p>
                <p className="text-xs text-gray-400 mt-1">Completed</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <CardTitle>Provider Earnings Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by provider name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="CAT-001">Home Maintenance & Repair</SelectItem>
                <SelectItem value="CAT-002">Beauty, Wellness & Personal Care</SelectItem>
                <SelectItem value="CAT-003">Domestic & Cleaning Services</SelectItem>
                <SelectItem value="CAT-004">Pet Services</SelectItem>
                <SelectItem value="CAT-005">Events & Entertainment</SelectItem>
                <SelectItem value="CAT-006">Automotive & Tech Support</SelectItem>
                <SelectItem value="CAT-007">Education & Professional Services</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider ID</TableHead>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Total Earnings</TableHead>
                  <TableHead>Pending Earnings</TableHead>
                  <TableHead>Paid Earnings</TableHead>
                  <TableHead>Completed Bookings</TableHead>
                  <TableHead>Last Payout</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProviders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No providers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProviders.map(({ provider, earnings, category, completedBookingsCount }) => (
                    <TableRow key={provider.id}>
                      <TableCell>
                        <span className="font-mono font-semibold text-[#16A34A]">
                          {provider.id}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{provider.businessName}</p>
                          <p className="text-xs text-gray-500">{provider.contactPerson}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{category}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-gray-900">
                          ₱{earnings.totalEarnings.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-yellow-600">
                          ₱{earnings.pendingEarnings.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-[#16A34A]">
                          ₱{earnings.paidEarnings.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                          {completedBookingsCount} bookings
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {earnings.lastPayoutDate ? (
                          <span className="text-sm text-gray-600">
                            {new Date(earnings.lastPayoutDate).toLocaleDateString("en-US", {
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
                        <Button size="sm" variant="outline">
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
