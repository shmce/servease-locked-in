import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet";
import {
  Users,
  CheckCircle,
  Clock,
  Shield,
  MoreVertical,
  RefreshCw,
  Copy,
  Check,
  Eye,
  UserX,
  Key,
  Edit2,
  UserCheck,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import {
  deleteAdminUser,
  listAdminUsers,
  updateAdminUserAccess,
  updateAdminUserStatus,
  type AdminAccessRoleId,
  type AdminUserSummary,
} from "../../services/serveaseAdminApi";

// Role permissions mapping
const rolePermissions = {
  "Super Admin": [
    "admin.full_access",
    "users.manage",
    "roles.manage",
    "bookings.manage",
    "disputes.manage",
    "finance.manage",
    "marketplace.manage",
    "reports.view",
    "settings.manage",
    "audit_logs.view",
  ],
  "Finance Manager": [
    "finance.manage",
    "transactions.view",
    "payouts.manage",
    "refunds.manage",
    "reports.financial",
  ],
  "Operations Manager": [
    "bookings.manage",
    "disputes.manage",
    "providers.view",
    "customers.view",
    "marketplace.manage",
  ],
  "Customer Support": [
    "support.manage",
    "bookings.view",
    "customers.view",
    "disputes.basic",
    "notifications.send",
    "transactions.view_limited",
  ],
  "Content Moderator": [
    "provider_applications.manage",
    "kyc.review",
    "marketplace.moderate",
    "categories.manage",
    "promotions.manage",
  ],
};

type RoleType = keyof typeof rolePermissions;

const roleAccessIds: Record<RoleType, AdminAccessRoleId> = {
  "Super Admin": "super-admin",
  "Finance Manager": "finance-manager",
  "Operations Manager": "operations-manager",
  "Customer Support": "customer-support",
  "Content Moderator": "content-moderator",
};

const roleLabelsByAccessId = Object.fromEntries(
  Object.entries(roleAccessIds).map(([label, id]) => [id, label]),
) as Record<AdminAccessRoleId, RoleType>;

type AdminType = {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string;
  lastLogin: string;
  status: "Active" | "Inactive";
};

function toRoleLabel(user: AdminUserSummary): RoleType {
  if (user.accessRole && roleLabelsByAccessId[user.accessRole]) {
    return roleLabelsByAccessId[user.accessRole];
  }

  if (user.accessRoleLabel && user.accessRoleLabel in rolePermissions) {
    return user.accessRoleLabel as RoleType;
  }

  return "Super Admin";
}

function toAdminRow(user: AdminUserSummary): AdminType {
  const role = toRoleLabel(user);
  const permissions = user.permissions?.length
    ? user.permissions.join(", ")
    : rolePermissions[role].join(", ");

  return {
    id: user.id,
    name: user.fullName || user.email,
    email: user.email,
    role,
    permissions,
    lastLogin: user.createdAt ?? new Date(0).toISOString(),
    status: user.status === "active" ? "Active" : "Inactive",
  };
}

export function AdminRolesComponent() {
  const navigate = useNavigate();
  const { accessToken, admin: currentAdmin } = useAuth();
  const [admins, setAdmins] = useState<AdminType[]>([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
  const [adminLoadError, setAdminLoadError] = useState<string | null>(null);

  const loadAdmins = useCallback(async () => {
    if (!accessToken) {
      setAdminLoadError("Admin session is required.");
      setAdmins([]);
      return;
    }

    setIsLoadingAdmins(true);
    setAdminLoadError(null);
    try {
      const users = await listAdminUsers(accessToken, { role: "admin" });
      setAdmins(users.map(toAdminRow));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load admin users.";
      setAdminLoadError(message);
      toast.error(message);
    } finally {
      setIsLoadingAdmins(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadAdmins();
  }, [loadAdmins]);

  // Add New Admin modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<RoleType | "">("");
  const [tempPassword, setTempPassword] = useState("ServEase@2026!");
  const [requirePasswordChange, setRequirePasswordChange] = useState(true);
  const [sendInviteEmail, setSendInviteEmail] = useState(true);

  // Success dialog state
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [generatedAdmin, setGeneratedAdmin] = useState({ email: "", password: "" });
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // View Details modal
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminType | null>(null);

  // Edit Role modal
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminType | null>(null);
  const [editRole, setEditRole] = useState<RoleType | "">("");

  // Reset Password modal
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [resetPasswordAdmin, setResetPasswordAdmin] = useState<AdminType | null>(null);
  const [showResetSuccess, setShowResetSuccess] = useState(false);

  // Deactivate/Activate modal
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [isActivateOpen, setIsActivateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [actionAdmin, setActionAdmin] = useState<AdminType | null>(null);

  // Form validation errors
  const [errors, setErrors] = useState({ fullName: "", email: "", role: "" });

  // Count Super Admins
  const superAdminCount = admins.filter((a) => a.role === "Super Admin" && a.status === "Active").length;

  // Functions
  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTempPassword(password);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const validateForm = () => {
    const newErrors = { fullName: "", email: "", role: "" };

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!role) {
      newErrors.role = "Role is required";
    }

    setErrors(newErrors);
    return !newErrors.fullName && !newErrors.email && !newErrors.role;
  };

  const handleCreateAdmin = () => {
    if (!validateForm()) {
      return;
    }

    setGeneratedAdmin({ email: email, password: tempPassword });

    // Reset form
    setFullName("");
    setEmail("");
    setRole("");
    setTempPassword("ServEase@2026!");
    setRequirePasswordChange(true);
    setSendInviteEmail(true);
    setErrors({ fullName: "", email: "", role: "" });

    setIsAddModalOpen(false);
    setIsSuccessDialogOpen(true);
  };

  const handleOpenAddModal = () => {
    setFullName("");
    setEmail("");
    setRole("");
    setTempPassword("ServEase@2026!");
    setRequirePasswordChange(true);
    setSendInviteEmail(true);
    setErrors({ fullName: "", email: "", role: "" });
    setIsAddModalOpen(true);
  };

  // Overflow Menu Actions
  const handleViewDetails = (admin: AdminType) => {
    setSelectedAdmin(admin);
    setIsViewDetailsOpen(true);
  };

  const handleEditRole = (admin: AdminType) => {
    setEditingAdmin(admin);
    setEditRole(admin.role as RoleType);
    setIsEditRoleOpen(true);
  };

  const handleSaveEditRole = async () => {
    if (!editingAdmin || !editRole || !accessToken) {
      return;
    }

    try {
      const updated = await updateAdminUserAccess(accessToken, editingAdmin.id, {
        accessRole: roleAccessIds[editRole],
      });
      const updatedRow = toAdminRow(updated);
      setAdmins((prev) =>
        prev.map((admin) => (admin.id === updatedRow.id ? updatedRow : admin)),
      );
      setIsEditRoleOpen(false);
      setEditingAdmin(null);
      setEditRole("");
      toast.success("Admin permissions updated");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update admin permissions",
      );
    }
  };

  const handleResetPassword = (admin: AdminType) => {
    setResetPasswordAdmin(admin);
    setIsResetPasswordOpen(true);
  };

  const handleSendResetLink = () => {
    setIsResetPasswordOpen(false);
    setShowResetSuccess(true);
    setTimeout(() => setShowResetSuccess(false), 3000);
  };

  const handleDeactivate = (admin: AdminType) => {
    setActionAdmin(admin);
    setIsDeactivateOpen(true);
  };

  const handleConfirmDeactivate = async () => {
    if (!actionAdmin || !accessToken) return;

    try {
      const updated = await updateAdminUserStatus(
        accessToken,
        actionAdmin.id,
        "inactive",
      );
      const updatedRow = toAdminRow(updated);
      setAdmins((prev) =>
        prev.map((admin) => (admin.id === updatedRow.id ? updatedRow : admin)),
      );
      setIsDeactivateOpen(false);
      setActionAdmin(null);
      toast.success("Admin deactivated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to deactivate admin",
      );
    }
  };

  const handleActivate = (admin: AdminType) => {
    setActionAdmin(admin);
    setIsActivateOpen(true);
  };

  const handleConfirmActivate = async () => {
    if (!actionAdmin || !accessToken) return;

    try {
      const updated = await updateAdminUserStatus(
        accessToken,
        actionAdmin.id,
        "active",
      );
      const updatedRow = toAdminRow(updated);
      setAdmins((prev) =>
        prev.map((admin) => (admin.id === updatedRow.id ? updatedRow : admin)),
      );
      setIsActivateOpen(false);
      setActionAdmin(null);
      toast.success("Admin activated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to activate admin",
      );
    }
  };

  const canDeactivate = (admin: AdminType) => {
    if (admin.role === "Super Admin" && admin.status === "Active" && superAdminCount === 1) {
      return false;
    }
    return true;
  };

  const canDelete = (admin: AdminType) => {
    if (currentAdmin?.id === admin.id) {
      return false;
    }
    return canDeactivate(admin);
  };

  const handleDelete = (admin: AdminType) => {
    setActionAdmin(admin);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!actionAdmin || !accessToken) return;

    try {
      const deleted = await deleteAdminUser(accessToken, actionAdmin.id);
      setAdmins((prev) => prev.filter((admin) => admin.id !== deleted.id));
      setIsDeleteOpen(false);
      setActionAdmin(null);
      toast.success("Admin deleted");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete admin",
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Roles & Permissions</h1>
          <p className="text-gray-500 mt-1">
            Manage admin users and their access permissions
          </p>
        </div>
        <Button
          className="bg-[#00BF63] hover:bg-[#00A055] w-full sm:w-auto"
          onClick={() => navigate("/add-new-admin")}
        >
          <Users className="w-4 h-4 mr-2" />
          Add New Admin
        </Button>
      </div>

      {adminLoadError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-red-700">{adminLoadError}</p>
            <Button variant="outline" size="sm" onClick={() => void loadAdmins()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-[#DCFCE7]">
                <Users className="w-6 h-6 text-[#00BF63]" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Total Admins</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{admins.length}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {admins.filter((a) => a.status === "Active").length} active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Super Admins</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{superAdminCount}</p>
                <p className="text-xs text-gray-400 mt-1">Full access</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Active Sessions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {admins.filter((a) => a.status === "Active").length}
                </p>
                <p className="text-xs text-gray-400 mt-1">Currently online</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Table - Desktop */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Admin Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingAdmins ? (
            <div className="py-10 text-center text-sm text-gray-500">
              Loading admin users...
            </div>
          ) : admins.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500">
              No admin users found.
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <span className="font-mono font-semibold text-[#00BF63]">{admin.id}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-gray-900">{admin.name}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{admin.email}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                      {admin.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-700">{admin.permissions}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {new Date(admin.lastLogin).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </TableCell>
                  <TableCell>
                    {admin.status === "Active" ? (
                      <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 p-0"
                          type="button"
                        >
                          <MoreVertical className="w-4 h-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onClick={() => handleViewDetails(admin)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Admin Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditRole(admin)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit Role & Permissions
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResetPassword(admin)}>
                          <Key className="w-4 h-4 mr-2" />
                          Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {admin.status === "Active" ? (
                          <DropdownMenuItem
                            onClick={() => handleDeactivate(admin)}
                            disabled={!canDeactivate(admin)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            <div className="flex flex-col">
                              <span>Deactivate Admin</span>
                              {!canDeactivate(admin) && (
                                <span className="text-xs text-gray-500 font-normal mt-0.5">
                                  Can't deactivate the last Super Admin
                                </span>
                              )}
                            </div>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleActivate(admin)}
                            className="text-green-600 focus:text-green-600"
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            Activate Admin
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDelete(admin)}
                          disabled={!canDelete(admin)}
                          className="text-red-700 focus:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          <div className="flex flex-col">
                            <span>Delete Admin</span>
                            {!canDelete(admin) && (
                              <span className="text-xs text-gray-500 font-normal mt-0.5">
                                {currentAdmin?.id === admin.id
                                  ? "You can't delete your own account"
                                  : "Can't delete the last Super Admin"}
                              </span>
                            )}
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      {/* Admin Table - Mobile Cards */}
      <div className="md:hidden space-y-4">
        {admins.map((admin) => (
          <Card key={admin.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-gray-900">{admin.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{admin.email}</p>
                  <span className="font-mono text-xs text-[#00BF63] mt-1 inline-block">
                    {admin.id}
                  </span>
                </div>
                <Sheet>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={() => handleViewDetails(admin)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Admin Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditRole(admin)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Role & Permissions
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleResetPassword(admin)}>
                        <Key className="w-4 h-4 mr-2" />
                        Reset Password
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {admin.status === "Active" ? (
                        <DropdownMenuItem
                          onClick={() => handleDeactivate(admin)}
                          disabled={!canDeactivate(admin)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <UserX className="w-4 h-4 mr-2" />
                          <div className="flex flex-col">
                            <span>Deactivate Admin</span>
                            {!canDeactivate(admin) && (
                              <span className="text-xs text-gray-500 font-normal mt-0.5">
                                Can't deactivate the last Super Admin
                              </span>
                            )}
                          </div>
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => handleActivate(admin)}
                          className="text-green-600 focus:text-green-600"
                        >
                          <UserCheck className="w-4 h-4 mr-2" />
                          Activate Admin
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleDelete(admin)}
                        disabled={!canDelete(admin)}
                        className="text-red-700 focus:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        <div className="flex flex-col">
                          <span>Delete Admin</span>
                          {!canDelete(admin) && (
                            <span className="text-xs text-gray-500 font-normal mt-0.5">
                              {currentAdmin?.id === admin.id
                                ? "You can't delete your own account"
                                : "Can't delete the last Super Admin"}
                            </span>
                          )}
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Sheet>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                  {admin.role}
                </Badge>
                {admin.status === "Active" ? (
                  <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-700 border-gray-200">Inactive</Badge>
                )}
              </div>
              <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                Last login:{" "}
                {new Date(admin.lastLogin).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Admin Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-[96%] sm:max-w-[760px] max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-xl">Add New Admin</DialogTitle>
            <DialogDescription>
              Invite a new admin user and assign permissions.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Admin Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Admin Details
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Full Name <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="e.g., Ana Marie Reyes"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors({ ...errors, fullName: "" });
                    }}
                    className={errors.fullName ? "border-red-500" : ""}
                  />
                  {errors.fullName && <p className="text-sm text-red-600">{errors.fullName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email Address <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="e.g., ana.reyes@servease.ph"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">
                    Role <span className="text-red-600">*</span>
                  </Label>
                  <Select
                    value={role}
                    onValueChange={(value: RoleType) => {
                      setRole(value);
                      if (errors.role) setErrors({ ...errors, role: "" });
                    }}
                  >
                    <SelectTrigger id="role" className={errors.role ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Super Admin">Super Admin (full access)</SelectItem>
                      <SelectItem value="Finance Manager">
                        Finance Manager (transactions + payouts + refunds)
                      </SelectItem>
                      <SelectItem value="Operations Manager">
                        Operations Manager (bookings + disputes)
                      </SelectItem>
                      <SelectItem value="Customer Support">
                        Customer Support (tickets + customer workflows)
                      </SelectItem>
                      <SelectItem value="Content Moderator">
                        Content Moderator (applications + marketplace)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}
                </div>
              </div>

              {/* Right Column: Access & Security */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Access & Security
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="tempPassword">Temporary Password</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tempPassword"
                      value={tempPassword}
                      readOnly
                      className="flex-1 font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={generatePassword}
                      title="Regenerate password"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Click the refresh icon to generate a new password
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Require password change on first login
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      User must change password after first login
                    </p>
                  </div>
                  <Switch
                    checked={requirePasswordChange}
                    onCheckedChange={setRequirePasswordChange}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Send invite email</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Send credentials via email automatically
                    </p>
                  </div>
                  <Switch checked={sendInviteEmail} onCheckedChange={setSendInviteEmail} />
                </div>
              </div>
            </div>

            {/* Permissions Summary - Full Width */}
            {role && (
              <div className="space-y-3 mt-6 pt-6 border-t">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Permissions Included
                </h3>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {rolePermissions[role].map((permission, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-[#00BF63] flex-shrink-0 mt-0.5" />
                        <span>{permission}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-gray-50">
            <div className="flex flex-col-reverse sm:flex-row gap-3 w-full sm:w-auto sm:ml-auto">
              <Button
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                className="bg-[#00BF63] hover:bg-[#00A055] w-full sm:w-auto"
                onClick={handleCreateAdmin}
              >
                Create Admin
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-[#00BF63]" />
              Admin Created Successfully
            </DialogTitle>
            <DialogDescription>
              The admin user has been created.{" "}
              {sendInviteEmail
                ? "An invite email has been sent."
                : "Please share these credentials manually."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-gray-50 rounded-lg border space-y-3">
              <div>
                <Label className="text-xs text-gray-500">Email Address</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={generatedAdmin.email}
                    readOnly
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleCopy(generatedAdmin.email, "email")}
                  >
                    {copiedField === "email" ? (
                      <Check className="w-4 h-4 text-[#00BF63]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-xs text-gray-500">Temporary Password</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={generatedAdmin.password}
                    readOnly
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleCopy(generatedAdmin.password, "password")}
                  >
                    {copiedField === "password" ? (
                      <Check className="w-4 h-4 text-[#00BF63]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {sendInviteEmail && (
              <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-5 h-5 text-[#00BF63] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  Invite email sent to <span className="font-medium">{generatedAdmin.email}</span>
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              className="bg-[#00BF63] hover:bg-[#00A055] w-full sm:w-auto"
              onClick={() => setIsSuccessDialogOpen(false)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Admin Details Modal */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Admin Details</DialogTitle>
            <DialogDescription>View complete admin information</DialogDescription>
          </DialogHeader>

          {selectedAdmin && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Admin ID</Label>
                  <p className="text-sm font-mono font-semibold text-[#00BF63] mt-1">
                    {selectedAdmin.id}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Status</Label>
                  <div className="mt-1">
                    {selectedAdmin.status === "Active" ? (
                      <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs text-gray-500">Full Name</Label>
                <p className="text-sm font-medium text-gray-900 mt-1">{selectedAdmin.name}</p>
              </div>

              <div>
                <Label className="text-xs text-gray-500">Email Address</Label>
                <p className="text-sm text-gray-900 mt-1">{selectedAdmin.email}</p>
              </div>

              <div>
                <Label className="text-xs text-gray-500">Role</Label>
                <div className="mt-1">
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                    {selectedAdmin.role}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-xs text-gray-500">Permissions</Label>
                <p className="text-sm text-gray-900 mt-1">{selectedAdmin.permissions}</p>
              </div>

              <div>
                <Label className="text-xs text-gray-500">Last Login</Label>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(selectedAdmin.lastLogin).toLocaleString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Modal */}
      <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Role & Permissions</DialogTitle>
            <DialogDescription>
              Update the admin role and associated permissions for {editingAdmin?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editRole">
                Role <span className="text-red-600">*</span>
              </Label>
              <Select value={editRole} onValueChange={(value: RoleType) => setEditRole(value)}>
                <SelectTrigger id="editRole">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Super Admin">Super Admin (full access)</SelectItem>
                  <SelectItem value="Finance Manager">
                    Finance Manager (transactions + payouts + refunds)
                  </SelectItem>
                  <SelectItem value="Operations Manager">
                    Operations Manager (bookings + disputes)
                  </SelectItem>
                  <SelectItem value="Customer Support">
                    Customer Support (tickets + customer workflows)
                  </SelectItem>
                  <SelectItem value="Content Moderator">
                    Content Moderator (applications + marketplace)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editRole && (
              <div className="space-y-3 mt-4 pt-4 border-t">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Permissions Included
                </h3>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <ul className="space-y-2">
                    {rolePermissions[editRole].map((permission, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-[#00BF63] flex-shrink-0 mt-0.5" />
                        <span>{permission}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditRoleOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#00BF63] hover:bg-[#00A055]"
              onClick={handleSaveEditRole}
              disabled={!editRole}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Send a password reset link to this admin user
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-gray-700">
              Send password reset link to{" "}
              <span className="font-medium">{resetPasswordAdmin?.email}</span>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              The admin will receive an email with instructions to reset their password.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetPasswordOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-[#00BF63] hover:bg-[#00A055]" onClick={handleSendResetLink}>
              Send Reset Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Success Toast-like Dialog */}
      <Dialog open={showResetSuccess} onOpenChange={setShowResetSuccess}>
        <DialogContent className="sm:max-w-[400px]">
          <div className="flex items-center gap-3 p-4">
            <CheckCircle className="w-6 h-6 text-[#00BF63]" />
            <div>
              <p className="font-medium text-gray-900">Reset link sent!</p>
              <p className="text-sm text-gray-600">
                Password reset email sent to {resetPasswordAdmin?.email}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deactivate Admin Modal */}
      <Dialog open={isDeactivateOpen} onOpenChange={setIsDeactivateOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Deactivate Admin</DialogTitle>
            <DialogDescription>
              This admin will no longer be able to sign in
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-gray-700">
              Deactivate <span className="font-medium">{actionAdmin?.name}</span>? They will no
              longer be able to sign in or access the admin panel.
            </p>
            <p className="text-sm text-gray-500 mt-2">You can reactivate them later if needed.</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeactivateOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleConfirmDeactivate}
            >
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activate Admin Modal */}
      <Dialog open={isActivateOpen} onOpenChange={setIsActivateOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Activate Admin</DialogTitle>
            <DialogDescription>
              Restore admin access for this user
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-gray-700">
              Activate <span className="font-medium">{actionAdmin?.name}</span>? They will be able
              to sign in and access the admin panel again.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActivateOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-[#00BF63] hover:bg-[#00A055]" onClick={handleConfirmActivate}>
              Activate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Admin Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-red-700">Delete Admin</DialogTitle>
            <DialogDescription>
              Permanently remove this admin account
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-2">
            <p className="text-sm text-gray-700">
              Delete <span className="font-medium">{actionAdmin?.name}</span>? This removes their
              admin account and cannot be undone.
            </p>
            <p className="text-sm text-gray-500">
              Use deactivate instead when you only need to temporarily block access.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-700 hover:bg-red-800 text-white"
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Warning tooltip for last Super Admin */}
      {superAdminCount === 1 && (
        <div className="mt-4">
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> You can't deactivate the last Super Admin. At least one Super
              Admin must remain active.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
