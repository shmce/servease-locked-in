import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  Search,
  Plus,
  Edit,
  Eye,
  EyeOff,
  Trash2,
  MapPin,
  CheckCircle,
  XCircle,
  Users,
} from "lucide-react";
import { notifyBackendRequired } from "../utils/backendRequired";

// Mock Service Areas Data
const serviceAreasData = [
  { id: "AREA-001", name: "Manila - Ermita", city: "Manila", region: "NCR", status: "Active", providersAvailable: 145, coverage: "Full coverage" },
  { id: "AREA-002", name: "Manila - Malate", city: "Manila", region: "NCR", status: "Active", providersAvailable: 132, coverage: "Full coverage" },
  { id: "AREA-003", name: "Quezon City - Diliman", city: "Quezon City", region: "NCR", status: "Active", providersAvailable: 198, coverage: "Full coverage" },
  { id: "AREA-004", name: "Quezon City - Cubao", city: "Quezon City", region: "NCR", status: "Active", providersAvailable: 176, coverage: "Full coverage" },
  { id: "AREA-005", name: "Makati - Poblacion", city: "Makati", region: "NCR", status: "Active", providersAvailable: 211, coverage: "Full coverage" },
  { id: "AREA-006", name: "Makati - Salcedo Village", city: "Makati", region: "NCR", status: "Active", providersAvailable: 189, coverage: "Full coverage" },
  { id: "AREA-007", name: "Pasig - Kapitolyo", city: "Pasig", region: "NCR", status: "Active", providersAvailable: 154, coverage: "Full coverage" },
  { id: "AREA-008", name: "Taguig - BGC", city: "Taguig", region: "NCR", status: "Active", providersAvailable: 223, coverage: "Full coverage" },
  { id: "AREA-009", name: "Pasay - Mall of Asia Area", city: "Pasay", region: "NCR", status: "Active", providersAvailable: 167, coverage: "Full coverage" },
];

export function ServiceAreas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    region: "NCR",
    notes: "",
    status: "Active",
  });

  // Get unique cities
  const cities = Array.from(new Set(serviceAreasData.map((area) => area.city)));

  // Filter service areas
  const filteredAreas = serviceAreasData.filter((area) => {
    const matchesSearch = area.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = cityFilter === "all" || area.city === cityFilter;
    const matchesStatus = statusFilter === "all" || area.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesCity && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: serviceAreasData.length,
    active: serviceAreasData.filter((a) => a.status === "Active").length,
    inactive: serviceAreasData.filter((a) => a.status === "Inactive").length,
    totalProviders: serviceAreasData.reduce((sum, a) => sum + a.providersAvailable, 0),
  };

  const handleAdd = () => {
    setSelectedArea(null);
    setFormData({
      name: "",
      city: "",
      region: "NCR",
      notes: "",
      status: "Active",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (area: any) => {
    setSelectedArea(area);
    setFormData({
      name: area.name,
      city: area.city,
      region: area.region,
      notes: "",
      status: area.status,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    notifyBackendRequired(
      selectedArea ? "Updating service areas" : "Creating service areas",
      selectedArea
        ? "PATCH /v1/admin/service-areas/:id"
        : "POST /v1/admin/service-areas",
    );
  };

  const handleDelete = (area: any) => {
    setSelectedArea(area);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    notifyBackendRequired("Deleting service areas", "DELETE /v1/admin/service-areas/:id");
  };

  const toggleStatus = (area: any) => {
    notifyBackendRequired(
      "Changing service area status",
      "PATCH /v1/admin/service-areas/:id/status",
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Service Areas</h1>
        <p className="text-gray-500 mt-1">
          Manage geographical coverage zones and service availability across Metro Manila
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Service Areas</p>
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
                <p className="text-sm text-gray-500">Total Providers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProviders}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Coverage Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Interactive Map Coming Soon</p>
              <p className="text-sm text-gray-400 mt-1">
                Visual representation of service coverage areas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Service Areas Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Service Area List</CardTitle>
            <Button className="bg-[#00BF63] hover:bg-[#00A055] text-white" onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Service Area
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search & Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search service areas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Area Name</TableHead>
                  <TableHead>City/Region</TableHead>
                  <TableHead>Coverage</TableHead>
                  <TableHead className="text-right">Providers Available</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAreas.map((area) => (
                  <TableRow key={area.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-[#00BF63]" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{area.name}</p>
                          <p className="text-xs text-gray-500">{area.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm text-gray-900">{area.city}</p>
                        <p className="text-xs text-gray-500">{area.region}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {area.coverage}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">{area.providersAvailable}</span>
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
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(area)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleStatus(area)}
                        >
                          {area.status === "Active" ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(area)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredAreas.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No service areas found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedArea ? "Edit Service Area" : "Add New Service Area"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Area Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Manila - Ermita"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                  <SelectTrigger id="city">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manila">Manila</SelectItem>
                    <SelectItem value="Quezon City">Quezon City</SelectItem>
                    <SelectItem value="Makati">Makati</SelectItem>
                    <SelectItem value="Pasig">Pasig</SelectItem>
                    <SelectItem value="Taguig">Taguig</SelectItem>
                    <SelectItem value="Mandaluyong">Mandaluyong</SelectItem>
                    <SelectItem value="Pasay">Pasay</SelectItem>
                    <SelectItem value="Caloocan">Caloocan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Region *</Label>
                <Select value={formData.region} onValueChange={(value) => setFormData({ ...formData, region: value })}>
                  <SelectTrigger id="region">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NCR">NCR - Metro Manila</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about this service area..."
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-[#00BF63] hover:bg-[#00A055]" onClick={handleSave}>
              {selectedArea ? "Update Service Area" : "Create Service Area"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service Area</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedArea?.name}"? This action cannot be undone
              and will affect service availability in this area.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Service Area
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
