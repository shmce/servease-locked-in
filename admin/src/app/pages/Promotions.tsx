import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
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
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import {
  createAdminPromotion,
  deleteAdminPromotion,
  listAdminPromotions,
  updateAdminPromotion,
  type AdminPromotionDiscountType,
  type AdminPromotionStatus,
  type AdminPromotionSummary,
  type UpsertAdminPromotionRequest,
} from "../../services/serveaseAdminApi";

type PromotionFormData = {
  code: string;
  description: string;
  type: "Percent" | "Fixed";
  value: string;
  maxDiscountAmount: string;
  startDate: string;
  endDate: string;
  minBasket: string;
  status: "Active" | "Disabled";
};

const emptyForm: PromotionFormData = {
  code: "",
  description: "",
  type: "Percent",
  value: "",
  maxDiscountAmount: "",
  startDate: "",
  endDate: "",
  minBasket: "",
  status: "Active",
};

function formatPeso(value: number) {
  return `₱${value.toLocaleString("en-PH", { maximumFractionDigits: 2 })}`;
}

function formatDate(value: string | null) {
  if (!value) return "No limit";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toDateInput(value: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function toDateTime(value: string, endOfDay = false) {
  if (!value) return null;
  return `${value}T${endOfDay ? "23:59:59.000" : "00:00:00.000"}Z`;
}

function discountTypeLabel(type: AdminPromotionDiscountType) {
  return type === "percent" ? "Percent" : "Fixed";
}

function getStatusBadge(status: AdminPromotionStatus) {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </Badge>
      );
    case "scheduled":
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
          <Clock className="w-3 h-3 mr-1" />
          Scheduled
        </Badge>
      );
    case "expired":
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          Expired
        </Badge>
      );
    case "disabled":
      return (
        <Badge className="bg-gray-100 text-gray-700 border-gray-200">
          <XCircle className="w-3 h-3 mr-1" />
          Disabled
        </Badge>
      );
  }
}

function promotionToForm(promotion: AdminPromotionSummary): PromotionFormData {
  return {
    code: promotion.code,
    description: promotion.description ?? "",
    type: discountTypeLabel(promotion.discountType),
    value: String(promotion.discountValue),
    maxDiscountAmount:
      promotion.maxDiscountAmount === null ? "" : String(promotion.maxDiscountAmount),
    startDate: toDateInput(promotion.startsAt),
    endDate: toDateInput(promotion.endsAt),
    minBasket: String(promotion.minOrderAmount),
    status: promotion.isActive ? "Active" : "Disabled",
  };
}

function formToRequest(formData: PromotionFormData): UpsertAdminPromotionRequest {
  return {
    code: formData.code.trim().toUpperCase(),
    description: formData.description.trim() || null,
    discountType: formData.type === "Percent" ? "percent" : "fixed",
    discountValue: Number(formData.value),
    maxDiscountAmount: formData.maxDiscountAmount
      ? Number(formData.maxDiscountAmount)
      : null,
    minOrderAmount: formData.minBasket ? Number(formData.minBasket) : 0,
    startsAt: toDateTime(formData.startDate),
    endsAt: toDateTime(formData.endDate, true),
    isActive: formData.status === "Active",
  };
}

export function Promotions() {
  const { accessToken } = useAuth();
  const [promotions, setPromotions] = useState<AdminPromotionSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<AdminPromotionDiscountType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<AdminPromotionStatus | "all">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] =
    useState<AdminPromotionSummary | null>(null);
  const [formData, setFormData] = useState<PromotionFormData>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadPromotions = useCallback(async () => {
    if (!accessToken) return;

    setIsLoading(true);
    setLoadError(null);

    try {
      setPromotions(
        await listAdminPromotions(
          accessToken,
          statusFilter === "all" ? null : statusFilter,
        ),
      );
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Unable to load promotions.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, statusFilter]);

  useEffect(() => {
    void loadPromotions();
  }, [loadPromotions]);

  const filteredPromotions = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    return promotions.filter((promo) => {
      const matchesSearch =
        promo.code.toLowerCase().includes(normalizedSearch) ||
        promo.id.toLowerCase().includes(normalizedSearch) ||
        promo.description?.toLowerCase().includes(normalizedSearch);
      const matchesType = typeFilter === "all" || promo.discountType === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [promotions, searchTerm, typeFilter]);

  const stats = useMemo(
    () => ({
      total: promotions.length,
      active: promotions.filter((p) => p.status === "active").length,
      scheduled: promotions.filter((p) => p.status === "scheduled").length,
      expired: promotions.filter((p) => p.status === "expired").length,
    }),
    [promotions],
  );

  const handleAdd = () => {
    setSelectedPromotion(null);
    setFormData(emptyForm);
    setIsDialogOpen(true);
  };

  const handleEdit = (promotion: AdminPromotionSummary) => {
    setSelectedPromotion(promotion);
    setFormData(promotionToForm(promotion));
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!accessToken) return;

    const request = formToRequest(formData);
    if (
      !request.code ||
      !Number.isFinite(request.discountValue) ||
      request.discountValue <= 0 ||
      !Number.isFinite(request.minOrderAmount ?? 0)
    ) {
      toast.error("Enter a code, discount value, and valid minimum booking amount.");
      return;
    }

    setSaving(true);
    try {
      const saved = selectedPromotion
        ? await updateAdminPromotion(accessToken, selectedPromotion.id, request)
        : await createAdminPromotion(accessToken, request);
      setPromotions((current) => [
        saved,
        ...current.filter((promotion) => promotion.id !== saved.id),
      ]);
      setIsDialogOpen(false);
      setSelectedPromotion(null);
      toast.success(`Promotion ${saved.code} saved.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save promotion.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (promotion: AdminPromotionSummary) => {
    setSelectedPromotion(promotion);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!accessToken || !selectedPromotion) return;

    setSaving(true);
    try {
      const deleted = await deleteAdminPromotion(accessToken, selectedPromotion.id);
      setPromotions((current) =>
        current.filter((promotion) => promotion.id !== deleted.id),
      );
      toast.success(`Promotion ${deleted.code} deleted.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete promotion.");
    } finally {
      setSaving(false);
      setDeleteDialogOpen(false);
      setSelectedPromotion(null);
    }
  };

  const disablePromotion = async (promotion: AdminPromotionSummary) => {
    if (!accessToken) return;

    setSaving(true);
    try {
      const updated = await updateAdminPromotion(accessToken, promotion.id, {
        ...promotionToRequest(promotion),
        isActive: false,
      });
      setPromotions((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      toast.success(`Promotion ${updated.code} disabled.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to disable promotion.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Promotions</h1>
        <p className="text-gray-500 mt-1">
          Create and manage promotional codes, discounts, and special offers
        </p>
      </div>

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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Promotions List</CardTitle>
            <Button
              className="bg-[#00BF63] hover:bg-[#00A055] text-white"
              onClick={handleAdd}
              disabled={!accessToken || saving}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Promotion
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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

            <Select
              value={typeFilter}
              onValueChange={(value) =>
                setTypeFilter(value as AdminPromotionDiscountType | "all")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="percent">Percentage Discount</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as AdminPromotionStatus | "all")
              }
            >
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

          {loadError ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {loadError}
            </div>
          ) : null}

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">Minimum</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
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
                          <p className="text-xs text-gray-500">{promotion.description ?? promotion.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          promotion.discountType === "percent"
                            ? "bg-orange-50 text-orange-700 border-orange-200"
                            : "bg-green-50 text-green-700 border-green-200"
                        }
                      >
                        {promotion.discountType === "percent" ? (
                          <Percent className="w-3 h-3 mr-1" />
                        ) : (
                          <DollarSign className="w-3 h-3 mr-1" />
                        )}
                        {discountTypeLabel(promotion.discountType)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-gray-900">
                      {promotion.discountType === "percent"
                        ? `${promotion.discountValue}%`
                        : formatPeso(promotion.discountValue)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-gray-600">
                      {formatPeso(promotion.minOrderAmount)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(promotion.startsAt)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(promotion.endsAt)}
                    </TableCell>
                    <TableCell>{getStatusBadge(promotion.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(promotion)}
                          disabled={saving}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {promotion.status === "active" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void disablePromotion(promotion)}
                            disabled={saving}
                          >
                            Disable
                          </Button>
                        ) : null}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(promotion)}
                          disabled={saving}
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

          {filteredPromotions.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {isLoading ? "Loading promotions..." : "No promotions found"}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

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
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Internal note or customer-facing promo detail"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value as "Percent" | "Fixed" })
                  }
                >
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
                <Label htmlFor="minBasket">Minimum Booking (₱)</Label>
                <Input
                  id="minBasket"
                  type="number"
                  placeholder="0"
                  value={formData.minBasket}
                  onChange={(e) =>
                    setFormData({ ...formData, minBasket: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxDiscount">Max Discount (₱)</Label>
                <Input
                  id="maxDiscount"
                  type="number"
                  placeholder="No cap"
                  value={formData.maxDiscountAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxDiscountAmount: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as "Active" | "Disabled" })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.minBasket ? (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Minimum Booking Requirement
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    This promotion only applies to bookings of at least ₱
                    {formData.minBasket}.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#00BF63] hover:bg-[#00A055]"
              onClick={() => void handleSave()}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : selectedPromotion
                  ? "Update Promotion"
                  : "Create Promotion"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Promotion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete promotion code "{selectedPromotion?.code}"?
              Users will no longer be able to use this code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void confirmDelete()}
              className="bg-red-600 hover:bg-red-700"
              disabled={saving}
            >
              Delete Promotion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function promotionToRequest(
  promotion: AdminPromotionSummary,
): UpsertAdminPromotionRequest {
  return {
    code: promotion.code,
    description: promotion.description,
    discountType: promotion.discountType,
    discountValue: promotion.discountValue,
    maxDiscountAmount: promotion.maxDiscountAmount,
    minOrderAmount: promotion.minOrderAmount,
    startsAt: promotion.startsAt,
    endsAt: promotion.endsAt,
    isActive: promotion.isActive,
  };
}
