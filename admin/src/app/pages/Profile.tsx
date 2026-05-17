import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../contexts/AuthContext";
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Clock,
  Edit2,
  Key,
  ShieldCheck,
  Activity,
  CheckCircle,
  Monitor,
  Smartphone,
  Chrome,
  MapPin,
  Save,
  X,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import {
  getCurrentUser,
  updateCurrentUserPassword,
  updateCurrentUserProfile,
} from "../../services/serveaseAdminApi";

// Mock data for login history
const loginHistory = [
  {
    id: 1,
    date: "2026-04-01T09:30:00",
    device: "Chrome on Windows",
    location: "Quezon City, Metro Manila",
    ip: "203.177.xxx.xxx",
    status: "Success",
    icon: Chrome,
  },
  {
    id: 2,
    date: "2026-03-31T18:45:00",
    device: "Mobile - Safari on iPhone",
    location: "Makati City, Metro Manila",
    ip: "203.177.xxx.xxx",
    status: "Success",
    icon: Smartphone,
  },
  {
    id: 3,
    date: "2026-03-31T08:15:00",
    device: "Chrome on Windows",
    location: "Quezon City, Metro Manila",
    ip: "203.177.xxx.xxx",
    status: "Success",
    icon: Chrome,
  },
  {
    id: 4,
    date: "2026-03-30T14:20:00",
    device: "Chrome on Windows",
    location: "Quezon City, Metro Manila",
    ip: "203.177.xxx.xxx",
    status: "Success",
    icon: Chrome,
  },
  {
    id: 5,
    date: "2026-03-29T10:30:00",
    device: "Mobile - Safari on iPhone",
    location: "Pasig City, Metro Manila",
    ip: "203.177.xxx.xxx",
    status: "Success",
    icon: Smartphone,
  },
  {
    id: 6,
    date: "2026-03-28T16:00:00",
    device: "Chrome on Windows",
    location: "Quezon City, Metro Manila",
    ip: "203.177.xxx.xxx",
    status: "Success",
    icon: Chrome,
  },
  {
    id: 7,
    date: "2026-03-27T09:15:00",
    device: "Chrome on Windows",
    location: "Quezon City, Metro Manila",
    ip: "203.177.xxx.xxx",
    status: "Success",
    icon: Chrome,
  },
  {
    id: 8,
    date: "2026-03-26T13:45:00",
    device: "Mobile - Chrome on Android",
    location: "Mandaluyong City, Metro Manila",
    ip: "203.177.xxx.xxx",
    status: "Success",
    icon: Smartphone,
  },
  {
    id: 9,
    date: "2026-03-25T11:20:00",
    device: "Chrome on Windows",
    location: "Quezon City, Metro Manila",
    ip: "203.177.xxx.xxx",
    status: "Success",
    icon: Chrome,
  },
  {
    id: 10,
    date: "2026-03-24T15:30:00",
    device: "Chrome on Windows",
    location: "Quezon City, Metro Manila",
    ip: "203.177.xxx.xxx",
    status: "Success",
    icon: Chrome,
  },
];

// Role permissions
const rolePermissions = {
  "Super Admin": [
    "Full system access",
    "User management",
    "Role management",
    "Financial operations",
    "Platform settings",
    "Audit logs access",
  ],
  "Finance Manager": [
    "View all transactions",
    "Process payouts",
    "Manage refunds",
    "Export financial reports",
  ],
  "Operations Manager": [
    "View all bookings",
    "Monitor ongoing services",
    "Resolve disputes",
    "Manage service providers",
  ],
};

export function Profile() {
  const { accessToken, admin } = useAuth();
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);

  // Edit Profile Modal
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: admin?.name ?? "Admin User",
    email: admin?.email ?? "",
    phone: "",
  });

  // Change Password Modal
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 2FA Modal
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);

  // Activity Log Modal
  const [isActivityLogOpen, setIsActivityLogOpen] = useState(false);

  const [profileData, setProfileData] = useState({
    name: admin?.name ?? "Admin User",
    email: admin?.email ?? "",
    phone: "",
    role: "Super Admin",
    accountCreated: "January 15, 2025",
    lastLogin: "April 01, 2026 at 9:30 AM",
  });

  useEffect(() => {
    if (!admin) return;
    setProfileData((current) => ({
      ...current,
      name: admin.name,
      email: admin.email,
    }));
  }, [admin]);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;

    getCurrentUser(accessToken)
      .then((profile) => {
        if (cancelled) return;
        const nextName = profile.user.fullName ?? profile.user.email;
        const nextEmail = profile.user.email;
        const nextPhone = profile.user.contactNumber ?? "";

        setProfileData((current) => ({
          ...current,
          name: nextName,
          email: nextEmail,
          phone: nextPhone,
          role: profile.user.role === "admin" ? "Super Admin" : current.role,
        }));
        setEditFormData((current) => ({
          ...current,
          name: nextName,
          email: nextEmail,
          phone: nextPhone,
        }));
      })
      .catch((error) => {
        if (!cancelled) {
          toast.error(
            error instanceof Error ? error.message : "Unable to load profile.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const permissions =
    rolePermissions[profileData.role as keyof typeof rolePermissions] || [];

  const handleEditProfile = () => {
    setEditFormData({
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
    });
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = async () => {
    // Validate
    if (!editFormData.name || !editFormData.email || !editFormData.phone) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!accessToken) return;

    try {
      const updated = await updateCurrentUserProfile(accessToken, {
        fullName: editFormData.name,
        contactNumber: editFormData.phone,
      });
      setProfileData((current) => ({
        ...current,
        name: updated.user.fullName ?? updated.user.email,
        email: updated.user.email,
        phone: updated.user.contactNumber ?? "",
      }));
      setIsEditProfileOpen(false);
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update profile.");
    }
  };

  const handleChangePassword = async () => {
    // Validate
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (!accessToken) return;

    try {
      await updateCurrentUserPassword(accessToken, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsChangePasswordOpen(false);
      toast.success("Password updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update password.");
    }
  };

  const handleToggle2FA = () => {
    if (is2FAEnabled) {
      toast.info("Two-factor disable still needs backend support.");
    } else {
      toast.info("Two-factor enable still needs backend support.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">
            View and manage your account information
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                {/* Profile Photo */}
                <div className="relative group">
                  <div className="w-32 h-32 bg-gradient-to-br from-[#00BF63] to-[#00A055] rounded-full flex items-center justify-center">
                    <User className="w-16 h-16 text-white" />
                  </div>
                  <button
                    className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    title="Change photo"
                  >
                    <Upload className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mt-4">
                  {profileData.name}
                </h2>
                <Badge className="bg-purple-100 text-purple-700 border-purple-200 mt-2">
                  {profileData.role}
                </Badge>

                {/* Quick Info */}
                <div className="w-full mt-6 pt-6 border-t space-y-4">
                  <div className="flex items-start gap-3 text-left">
                    <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm text-gray-900 break-all">
                        {profileData.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-left">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm text-gray-900">{profileData.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-left">
                    <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Account Created</p>
                      <p className="text-sm text-gray-900">
                        {profileData.accountCreated}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-left">
                    <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Last Login</p>
                      <p className="text-sm text-gray-900">
                        {profileData.lastLogin}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2FA Status Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div
                  className={`p-3 rounded-lg ${
                    is2FAEnabled ? "bg-green-50" : "bg-gray-50"
                  }`}
                >
                  <ShieldCheck
                    className={`w-6 h-6 ${
                      is2FAEnabled ? "text-green-600" : "text-gray-400"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    Two-Factor Authentication
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {is2FAEnabled
                      ? "Your account is protected with 2FA"
                      : "Add an extra layer of security"}
                  </p>
                  <Badge
                    className={`mt-2 ${
                      is2FAEnabled
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-gray-100 text-gray-700 border-gray-200"
                    }`}
                  >
                    {is2FAEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Permissions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#00BF63]" />
                Role & Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-3">Your role grants you access to:</p>
                  <div className="flex flex-wrap gap-2">
                    {permissions.map((permission, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={handleEditProfile}
                  className="bg-[#00BF63] hover:bg-[#00A055] justify-start"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button
                  onClick={() => setIsChangePasswordOpen(true)}
                  variant="outline"
                  className="justify-start"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
                <Button
                  onClick={() => setIs2FAModalOpen(true)}
                  variant="outline"
                  className="justify-start"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  {is2FAEnabled ? "Disable" : "Enable"} 2FA
                </Button>
                <Button
                  onClick={() => setIsActivityLogOpen(true)}
                  variant="outline"
                  className="justify-start"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  View Activity Log
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Login History Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#00BF63]" />
                Recent Login History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loginHistory.map((login) => {
                      const Icon = login.icon;
                      return (
                        <TableRow key={login.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900">
                                {new Date(login.date).toLocaleString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700">
                                {login.device}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700">
                                {login.location}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {login.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {loginHistory.map((login) => {
                  const Icon = login.icon;
                  return (
                    <div
                      key={login.id}
                      className="p-4 border rounded-lg space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {login.device}
                          </span>
                        </div>
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {login.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-3 h-3" />
                        {new Date(login.date).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-3 h-3" />
                        {login.location}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your personal information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Full Name</Label>
              <Input
                id="editName"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editEmail">Email Address</Label>
              <Input
                id="editEmail"
                type="email"
                value={editFormData.email}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editPhone">Phone Number</Label>
              <Input
                id="editPhone"
                value={editFormData.phone}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, phone: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditProfileOpen(false)}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              className="bg-[#00BF63] hover:bg-[#00A055]"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
              />
              <p className="text-xs text-gray-500">
                Must be at least 8 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsChangePasswordOpen(false);
                setPasswordData({
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              className="bg-[#00BF63] hover:bg-[#00A055]"
            >
              <Key className="w-4 h-4 mr-2" />
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA Modal */}
      <Dialog open={is2FAModalOpen} onOpenChange={setIs2FAModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {is2FAEnabled ? "Disable" : "Enable"} Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              {is2FAEnabled
                ? "Are you sure you want to disable 2FA? This will make your account less secure."
                : "Add an extra layer of security to your account."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {is2FAEnabled ? (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-gray-700">
                  Disabling two-factor authentication will reduce your account
                  security. You will only need your password to sign in.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700">
                    Two-factor authentication adds an extra layer of security by
                    requiring a code from your phone in addition to your password.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">
                    Setup Instructions:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                    <li>Download an authenticator app (Google Authenticator, Authy)</li>
                    <li>Scan the QR code with the app</li>
                    <li>Enter the 6-digit code to verify</li>
                  </ol>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIs2FAModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleToggle2FA}
              className={
                is2FAEnabled
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-[#00BF63] hover:bg-[#00A055]"
              }
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              {is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activity Log Modal */}
      <Dialog open={isActivityLogOpen} onOpenChange={setIsActivityLogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#00BF63]" />
              Activity Log
            </DialogTitle>
            <DialogDescription>
              Complete history of your account activities
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 overflow-y-auto max-h-[500px]">
            <div className="space-y-3">
              {loginHistory.map((login) => {
                const Icon = login.icon;
                return (
                  <div
                    key={login.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Icon className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-gray-900">
                            Successful Login
                          </p>
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {login.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{login.device}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(login.date).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {login.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsActivityLogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
