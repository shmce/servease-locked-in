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
  Trash2,
  Tag,
  CheckCircle,
  XCircle,
  Clock,
  Percent,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { useData } from "../../contexts/DataContext";
import { notifyBackendRequired } from "../utils/backendRequired";

// Mock Promotions Data
const promotionsData = [
  { id: "PROMO-001", code: "WELCOME50", type: "Percent", value: 50, startDate: "2026-01-01", endDate: "2026-03-31", usageLimit: 1000, usageCount: 342, status: "Active", minBasket: 500, categoryRestriction: "None" },
  { id: "PROMO-002", code: "HOMEFIX100", type: "Fixed", value: 100, startDate: "2026-02-01", endDate: "2026-04-30", usageLimit: 500, usageCount: 187, status: "Active", minBasket: 1000, categoryRestriction: "Home Maintenance" },
  { id: "PROMO-003", code: "BEAUTY20", type: "Percent", value: 20, startDate: "2026-02-15", endDate: "2026-03-15", usageLimit: 300, usageCount: 156, status: "Active", minBasket: 800, categoryRestriction: "Beauty & Wellness" },
  { id: "PROMO-004", code: "FLASH200", type: "Fixed", value: 200, startDate: "2026-03-01", endDate: "2026-03-07", usageLimit: 100, usageCount: 89, status: "Active", minBasket: 2000, categoryRestriction: "None" },
  { id: "PROMO-005", code: "CLEAN15", type: "Percent", value: 15, startDate: "2026-01-15", endDate: "2026-12-31", usageLimit: 2000, usageCount: 512, status: "Active", minBasket: 600, categoryRestriction: "Cleaning Services" },
  { id: "PROMO-006", code: "EXPIRED10", type: "Percent", value: 10, startDate: "2025-12-01", endDate: "2026-01-31", usageLimit: 500, usageCount: 500, status: "Expired", minBasket: 500, categoryRestriction: "None" },
  { id: "PROMO-007", code: "FUTURE25", type: "Percent", value: 25, startDate: "2026-04-01", endDate: "2026-06-30", usageLimit: 800, usageCount: 0, status: "Scheduled", minBasket: 1200, categoryRestriction: "Events" },
  { id: "PROMO-008", code: "DISABLED30", type: "Percent", value: 30, startDate: "2026-02-01", endDate: "2026-03-31", usageLimit: 200, usageCount: 45, status: "Disabled", minBasket: 1500, categoryRestriction: "None" },
];

export function Promotions() {
  const { serviceCategories } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<any>(null);
  const [formData, setFormData] = useState({
    code: "",
    type: "Percent",
    value: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
    minBasket: "",
    categoryRestriction: "None",
    status: "Active",
  });

  // Filter promotions
  const filteredPromotions = promotionsData.filter((promo) => {
    const matchesSearch = promo.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || promo.type === typeFilter;
    const matchesStatus = statusFilter === "all" || promo.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: promotionsData.length,
    active: promotionsData.filter((p) => p.status === "Active").length,
    scheduled: promotionsData.filter((p) => p.status === "Scheduled").length,
    expired: promotionsData.filter((p) => p.status === "Expired").length,
  };

  const handleAdd = () => {
    setSelectedPromotion(null);
    setFormData({
      code: "",
      type: "Percent",
      value: "",
      startDate: "",
      endDate: "",
      usageLimit: "",
      minBasket: "",
      categoryRestriction: "None",
      status: "Active",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (promotion: any) => {
    setSelectedPromotion(promotion);
    setFormData({
      code: promotion.code,
      type: promotion.type,
      value: promotion.value.toString(),
      startDate: promotion.startDate,
      endDate: promotion.endDate,
      usageLimit: promotion.usageLimit.toString(),
      minBasket: promotion.minBasket.toString(),
      categoryRestriction: promotion.categoryRestriction,
      status: promotion.status,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    notifyBackendRequired(
      selectedPromotion ? "Updating promotions" : "Creating promotions",
      selectedPromotion
        ? "PATCH /v1/admin/promotions/:id"
        : "POST /v1/admin/promotions",
    );
  };

  const handleDelete = (promotion: any) => {
    setSelectedPromotion(promotion);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    notifyBackendRequired("Deleting promotions", "DELETE /v1/admin/promotions/:id");
  };

  const disablePromotion = (promotion: any) => {
    notifyBackendRequired("Disabling promotions", "PATCH /v1/admin/promotions/:id/status");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "Scheduled":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Clock className="w-3 h-3 mr-1" />
            Scheduled
          </Badge>
        );
      case "Expired":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Expired
          </Badge>
        );
      case "Disabled":
        return (
          <Badge className="bg-gray-100 text-gray-700 border-gray-200">
            <XCircle className="w-3 h-3 mr-1" />
            Disabled
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Promotions</h1>
        <p className="text-gray-500 mt-1">
          Create and manage promotional codes, discounts, and special offers
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Promotions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Tag className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Promotions</p>
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
                <p className="text-sm text-gray-500">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.scheduled}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Expired</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.expired}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Promotions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Promotions List</CardTitle>
            <Button className="bg-[#00BF63] hover:bg-[#00A055] text-white" onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Create Promotion
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search & Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search promotions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Percent">Percentage Discount</SelectItem>
                <SelectItem value="Fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPromotions.map((promotion) => (
                  <TableRow key={promotion.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Tag className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{promotion.code}</p>
                          <p className="text-xs text-gray-500">{promotion.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          promotion.type === "Percent"
                            ? "bg-orange-50 text-orange-700 border-orange-200"
                            : "bg-green-50 text-green-700 border-green-200"
                        }
                      >
                        {promotion.type === "Percent" ? (
                          <Percent className="w-3 h-3 mr-1" />
                        ) : (
                          <DollarSign className="w-3 h-3 mr-1" />
                        )}
                        {promotion.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-gray-900">
                      {promotion.type === "Percent" ? `${promotion.value}%` : `₱${promotion.value}`}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{promotion.startDate}</TableCell>
                    <TableCell className="text-sm text-gray-600">{promotion.endDate}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {promotion.usageCount} / {promotion.usageLimit}
                        </span>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className={`h-1.5 rounded-full ${
                              (promotion.usageCount / promotion.usageLimit) * 100 > 80
                                ? "bg-orange-500"
                                : "bg-[#00BF63]"
                            }`}
                            style={{
                              width: `${(promotion.usageCount / promotion.usageLimit) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(promotion.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(promotion)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        {promotion.status === "Active" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => disablePromotion(promotion)}
                          >
                            Disable
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(promotion)}
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

          {filteredPromotions.length === 0 && (
            <div className="text-center py-12">
              <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No promotions found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedPromotion ? "Edit Promotion" : "Create New Promotion"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Promotion Code *</Label>
              <Input
                id="code"
                placeholder="e.g., WELCOME50"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Percent">Percentage Discount</SelectItem>
                    <SelectItem value="Fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">
                  Value * {formData.type === "Percent" ? "(%)" : "(₱)"}
                </Label>
                <Input
                  id="value"
                  type="number"
                  placeholder="0"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minBasket">Min Basket Value (₱)</Label>
                <Input
                  id="minBasket"
                  type="number"
                  placeholder="0"
                  value={formData.minBasket}
                  onChange={(e) => setFormData({ ...formData, minBasket: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="usageLimit">Usage Limit *</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  placeholder="100"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryRestriction">Category Restriction (Optional)</Label>
              <Select value={formData.categoryRestriction} onValueChange={(value) => setFormData({ ...formData, categoryRestriction: value })}>
                <SelectTrigger id="categoryRestriction">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">No Restriction</SelectItem>
                  {serviceCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.minBasket && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Minimum Basket Requirement</p>
                  <p className="text-xs text-blue-700 mt-1">
                    This promotion will only apply to bookings with a minimum value of ₱
                    {formData.minBasket}
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-[#00BF63] hover:bg-[#00A055]" onClick={handleSave}>
              {selectedPromotion ? "Update Promotion" : "Create Promotion"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Promotion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete promotion code "{selectedPromotion?.code}"? This
              action cannot be undone. Users will no longer be able to use this code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Promotion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
