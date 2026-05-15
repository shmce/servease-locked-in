import { useState } from "react";
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

const providers = [
  {
    id: "SE-HM-001",
    providerName: "Juan Carlos Reyes",
    businessName: "HomeFixPro Manila",
    serviceCategory: "Home Maintenance & Repair",
    approvalStatus: "approved",
    rating: 4.9,
    completedJobs: 1247,
    location: "Makati City, Metro Manila",
    dateJoined: "2024-01-15",
    revenue: "₱2,456,780",
    commission: "₱245,678",
  },
  {
    id: "SE-BW-002",
    providerName: "Maria Elena Santos",
    businessName: "Glow Beauty Spa",
    serviceCategory: "Beauty Wellness & Personal Care",
    approvalStatus: "approved",
    rating: 4.8,
    completedJobs: 982,
    location: "Quezon City, Metro Manila",
    dateJoined: "2024-02-20",
    revenue: "₱1,892,340",
    commission: "₱189,234",
  },
  {
    id: "SE-ED-003",
    providerName: "Roberto Miguel Cruz",
    businessName: "Tutor Excellence Hub",
    serviceCategory: "Education & Professional Services",
    approvalStatus: "pending",
    rating: 0,
    completedJobs: 0,
    location: "Taguig City, Metro Manila",
    dateJoined: "2026-03-01",
    revenue: "₱0",
    commission: "₱0",
  },
  {
    id: "SE-DC-004",
    providerName: "Angela Rose Fernandez",
    businessName: "Sparkle Clean Services",
    serviceCategory: "Domestic & Cleaning Services",
    approvalStatus: "approved",
    rating: 4.7,
    completedJobs: 756,
    location: "Pasig City, Metro Manila",
    dateJoined: "2024-03-10",
    revenue: "₱1,567,890",
    commission: "₱156,789",
  },
  {
    id: "SE-PS-005",
    providerName: "Ricardo Antonio Garcia",
    businessName: "Pawsome Pet Care",
    serviceCategory: "Pet Services",
    approvalStatus: "suspended",
    rating: 3.9,
    completedJobs: 234,
    location: "Mandaluyong City, Metro Manila",
    dateJoined: "2023-11-05",
    revenue: "₱678,900",
    commission: "₱67,890",
  },
  {
    id: "SE-EE-006",
    providerName: "Sofia Isabella Ramos",
    businessName: "Celebrate Events Co.",
    serviceCategory: "Events & Entertainment",
    approvalStatus: "approved",
    rating: 4.9,
    completedJobs: 1456,
    location: "Pasay City, Metro Manila",
    dateJoined: "2023-12-18",
    revenue: "₱2,890,450",
    commission: "₱289,045",
  },
  {
    id: "SE-AT-007",
    providerName: "Miguel Angelo Torres",
    businessName: "TechFix Auto Solutions",
    serviceCategory: "Automotive & Tech Support",
    approvalStatus: "approved",
    rating: 4.6,
    completedJobs: 634,
    location: "Caloocan City, Metro Manila",
    dateJoined: "2024-01-22",
    revenue: "₱1,234,560",
    commission: "₱123,456",
  },
  {
    id: "SE-HM-008",
    providerName: "Jose Emmanuel Diaz",
    businessName: "QuickFix Plumbing",
    serviceCategory: "Home Maintenance & Repair",
    approvalStatus: "approved",
    rating: 4.8,
    completedJobs: 892,
    location: "Paranaque City, Metro Manila",
    dateJoined: "2024-02-15",
    revenue: "₱1,678,900",
    commission: "₱167,890",
  },
  {
    id: "SE-BW-009",
    providerName: "Carmen Grace Alvarez",
    businessName: "Wellness Massage Therapy",
    serviceCategory: "Beauty Wellness & Personal Care",
    approvalStatus: "pending",
    rating: 0,
    completedJobs: 0,
    location: "Manila City, Metro Manila",
    dateJoined: "2026-03-03",
    revenue: "₱0",
    commission: "₱0",
  },
  {
    id: "SE-ED-010",
    providerName: "Daniel Francisco Mendoza",
    businessName: "SkillUp Training Center",
    serviceCategory: "Education & Professional Services",
    approvalStatus: "approved",
    rating: 4.7,
    completedJobs: 543,
    location: "Marikina City, Metro Manila",
    dateJoined: "2024-03-20",
    revenue: "₱1,123,450",
    commission: "₱112,345",
  },
  {
    id: "SE-DC-011",
    providerName: "Patricia Ann Morales",
    businessName: "Crystal Clear Housekeeping",
    serviceCategory: "Domestic & Cleaning Services",
    approvalStatus: "approved",
    rating: 4.9,
    completedJobs: 1124,
    location: "Las Pinas City, Metro Manila",
    dateJoined: "2023-12-05",
    revenue: "₱2,234,670",
    commission: "₱223,467",
  },
  {
    id: "SE-PS-012",
    providerName: "Gabriel Luis Sanchez",
    businessName: "Happy Tails Grooming",
    serviceCategory: "Pet Services",
    approvalStatus: "approved",
    rating: 4.8,
    completedJobs: 678,
    location: "Muntinlupa City, Metro Manila",
    dateJoined: "2024-01-30",
    revenue: "₱987,650",
    commission: "₱98,765",
  },
  {
    id: "SE-EE-013",
    providerName: "Isabella Marie Aquino",
    businessName: "Party Perfect Planners",
    serviceCategory: "Events & Entertainment",
    approvalStatus: "approved",
    rating: 4.6,
    completedJobs: 445,
    location: "San Juan City, Metro Manila",
    dateJoined: "2024-02-28",
    revenue: "₱1,567,890",
    commission: "₱156,789",
  },
  {
    id: "SE-AT-014",
    providerName: "Rafael Vicente Castillo",
    businessName: "GadgetFix Tech Services",
    serviceCategory: "Automotive & Tech Support",
    approvalStatus: "suspended",
    rating: 3.5,
    completedJobs: 189,
    location: "Valenzuela City, Metro Manila",
    dateJoined: "2023-10-12",
    revenue: "₱456,780",
    commission: "₱45,678",
  },
  {
    id: "SE-HM-015",
    providerName: "Antonio Carlos Rivera",
    businessName: "ElectroPro Electricians",
    serviceCategory: "Home Maintenance & Repair",
    approvalStatus: "approved",
    rating: 4.9,
    completedJobs: 1678,
    location: "Malabon City, Metro Manila",
    dateJoined: "2023-11-20",
    revenue: "₱3,456,780",
    commission: "₱345,678",
  },
];

const stats = [
  {
    title: "Total Providers",
    value: "2,456",
    change: "+124 this month",
    icon: Package,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Total Revenue",
    value: "₱45.2M",
    change: "+18% from last month",
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Completed Jobs",
    value: "156,789",
    change: "+12,345 this month",
    icon: TrendingUp,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
];

export function MarketplaceSellers() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  // Filter to show only approved or suspended providers (exclude pending)
  const approvedProviders = providers.filter(
    (provider) => provider.approvalStatus !== "pending"
  );

  let filteredProviders = approvedProviders.filter((provider) => {
    const matchesSearch =
      provider.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || provider.approvalStatus === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || provider.serviceCategory === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Sort providers
  filteredProviders = [...filteredProviders].sort((a, b) => {
    if (sortBy === "rating-desc") return b.rating - a.rating;
    if (sortBy === "rating-asc") return a.rating - b.rating;
    if (sortBy === "jobs-desc") return b.completedJobs - a.completedJobs;
    if (sortBy === "jobs-asc") return a.completedJobs - b.completedJobs;
    if (sortBy === "date-desc") return new Date(b.dateJoined).getTime() - new Date(a.dateJoined).getTime();
    if (sortBy === "date-asc") return new Date(a.dateJoined).getTime() - new Date(b.dateJoined).getTime();
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
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
                  filteredProviders.map((provider) => (
                    <TableRow key={provider.id}>
                      <TableCell>
                        <span className="font-mono font-semibold text-gray-900">{provider.id}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-gray-900">{provider.businessName}</p>
                          <p className="text-xs text-gray-500">{provider.revenue} revenue</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700">{provider.serviceCategory}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(provider.approvalStatus)}</TableCell>
                      <TableCell>
                        {provider.rating > 0 ? (
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-600">★</span>
                            <span className="font-medium">{provider.rating}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No rating</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{provider.completedJobs.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{provider.location}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {new Date(provider.dateJoined).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
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
                          {provider.approvalStatus === "approved" && (
                            <Button size="sm" variant="outline" className="text-orange-600 hover:text-orange-700" title="Suspend">
                              <Ban className="w-4 h-4" />
                            </Button>
                          )}
                          {provider.approvalStatus === "suspended" && (
                            <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700" title="Reactivate">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          {provider.approvalStatus !== "pending" && (
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" title="Deactivate">
                              <UserX className="w-4 h-4" />
                            </Button>
                          )}
                          {provider.approvalStatus === "pending" && (
                            <>
                              <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700" title="Approve">
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="destructive" title="Reject">
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
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
    </div>
  );
}