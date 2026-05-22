import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
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
  Save,
  X,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import {
  type CurrentUserSessionSummary,
  getCurrentUser,
  listCurrentUserSessions,
  updateCurrentUserPassword,
  updateCurrentUserProfile,
} from "../../services/serveaseAdminApi";

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

function formatSessionTime(value: string | null) {
  if (!value) return "No sign-in recorded";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function Profile() {
  const { accessToken, admin } = useAuth();
  const navigate = useNavigate();

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

  // Activity Log Modal
  const [isActivityLogOpen, setIsActivityLogOpen] = useState(false);

  const [profileData, setProfileData] = useState({
    name: admin?.name ?? "Admin User",
    email: admin?.email ?? "",
    phone: "",
    role: "Super Admin",
    accountCreated: "January 15, 2025",
    lastLogin: "No sign-in recorded",
  });
  const [sessions, setSessions] = useState<CurrentUserSessionSummary[]>([]);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

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

  useEffect(() => {
    if (!accessToken) {
      setSessions([]);
      setIsLoadingSessions(false);
      return;
    }

    let cancelled = false;
    setIsLoadingSessions(true);
    setSessionsError(null);

    listCurrentUserSessions(accessToken)
      .then((data) => {
        if (cancelled) return;
        setSessions(data);
        const latest = data[0]?.lastSignInAt ?? data[0]?.createdAt ?? null;
        setProfileData((current) => ({
          ...current,
          lastLogin: formatSessionTime(latest),
        }));
      })
      .catch((error) => {
        if (!cancelled) {
          setSessionsError(
            error instanceof Error
              ? error.message
              : "Unable to load session history.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingSessions(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const permissions =
    rolePermissions[profileData.role as keyof typeof rolePermissions] || [];
  const sessionRows = sessions.map((session) => ({
    id: session.id,
    occurredAt: session.lastSignInAt ?? session.createdAt,
    device: session.isCurrent ? "Current admin session" : "Admin web session",
    account: session.email || profileData.email || "Admin account",
    status: session.isCurrent ? "Current" : "Active",
  }));

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
                <div className="p-3 rounded-lg bg-green-50">
                  <ShieldCheck className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    Two-Factor Authentication
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Use Security to enable, verify, or disable authenticator-based 2FA.
                  </p>
                  <Badge className="mt-2 bg-green-100 text-green-700 border-green-200">
                    Wired in Security
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
                  onClick={() => navigate("/security")}
                  variant="outline"
                  className="justify-start"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Manage 2FA
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
                Recent Session History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessionsError ? (
                <p className="mb-3 text-sm text-red-600">{sessionsError}</p>
              ) : null}
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingSessions ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center text-sm text-gray-500">
                          Loading session history...
                        </TableCell>
                      </TableRow>
                    ) : sessionRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center text-sm text-gray-500">
                          No session history found
                        </TableCell>
                      </TableRow>
                    ) : (
                      sessionRows.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900">
                                {formatSessionTime(session.occurredAt)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Monitor className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700">
                                {session.device}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-700">
                              {session.account}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {session.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {isLoadingSessions ? (
                  <p className="py-6 text-center text-sm text-gray-500">
                    Loading session history...
                  </p>
                ) : sessionRows.length === 0 ? (
                  <p className="py-6 text-center text-sm text-gray-500">
                    No session history found
                  </p>
                ) : (
                  sessionRows.map((session) => (
                    <div
                      key={session.id}
                      className="p-4 border rounded-lg space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {session.device}
                          </span>
                        </div>
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {session.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-3 h-3" />
                        {formatSessionTime(session.occurredAt)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-3 h-3" />
                        {session.account}
                      </div>
                    </div>
                  ))
                )}
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

      {/* Activity Log Modal */}
      <Dialog open={isActivityLogOpen} onOpenChange={setIsActivityLogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#00BF63]" />
              Session Activity
            </DialogTitle>
            <DialogDescription>
              Recent backend session records for your admin account
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 overflow-y-auto max-h-[500px]">
            <div className="space-y-3">
              {isLoadingSessions ? (
                <p className="py-6 text-center text-sm text-gray-500">
                  Loading session activity...
                </p>
              ) : sessionRows.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-500">
                  No session activity found
                </p>
              ) : (
                sessionRows.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Monitor className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-gray-900">
                            {session.device}
                          </p>
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {session.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{session.account}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatSessionTime(session.occurredAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
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
