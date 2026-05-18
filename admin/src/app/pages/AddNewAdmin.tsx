import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import {
  createAdminUser,
  type AdminAccessRoleId,
} from "../../services/serveaseAdminApi";
import {
  ArrowLeft,
  UserPlus,
  Mail,
  Phone,
  Shield,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";

type AdminRoleOption = {
  id: AdminAccessRoleId;
  name: string;
  permissions: string[];
};

const roles: AdminRoleOption[] = [
  {
    id: "super-admin",
    name: "Super Admin",
    permissions: [
      "Full system access",
      "User management",
      "Role management",
      "Financial operations",
      "Platform settings",
      "Audit logs access",
      "Service provider approval",
      "Content moderation",
    ],
  },
  {
    id: "finance-manager",
    name: "Finance Manager",
    permissions: [
      "View all transactions",
      "Process payouts",
      "Manage refunds",
      "Export financial reports",
      "View commission data",
      "Failed payment resolution",
    ],
  },
  {
    id: "operations-manager",
    name: "Operations Manager",
    permissions: [
      "View all bookings",
      "Monitor ongoing services",
      "Resolve disputes",
      "Manage service providers",
      "Category management",
      "Service management",
    ],
  },
  {
    id: "customer-support",
    name: "Customer Support",
    permissions: [
      "View bookings",
      "View customer details",
      "Basic dispute resolution",
      "Send notifications",
      "View transactions (read-only)",
    ],
  },
  {
    id: "content-moderator",
    name: "Content Moderator",
    permissions: [
      "Review service provider applications",
      "Approve/reject KYC documents",
      "Moderate product listings",
      "Manage categories",
      "Manage promotions",
    ],
  },
];

export function AddNewAdmin() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedRole, setSelectedRole] = useState<AdminAccessRoleId | "">("");
  const [password, setPassword] = useState(generatePassword());
  const [sendInvitation, setSendInvitation] = useState(true);
  const [require2FA, setRequire2FA] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function generatePassword() {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  const handleRegeneratePassword = () => {
    const newPassword = generatePassword();
    setPassword(newPassword);
    setPasswordCopied(false);
    toast.success("New password generated");
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(password);
    setPasswordCopied(true);
    toast.success("Password copied to clipboard");
    setTimeout(() => setPasswordCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!firstName || !lastName || !email || !phone || !selectedRole) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Phone validation (Philippine format)
    const phoneRegex = /^(\+63|0)?9\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      toast.error("Please enter a valid Philippine phone number");
      return;
    }

    if (!accessToken) {
      toast.error("Admin session is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const createdAdmin = await createAdminUser(accessToken, {
        email: email.trim().toLowerCase(),
        password,
        fullName: `${firstName.trim()} ${lastName.trim()}`.trim(),
        contactNumber: phone.trim(),
        accessRole: selectedRole,
        sendInvitation,
        requireTwoFactor: require2FA,
      });
      if (sendInvitation && !createdAdmin.invitationSent) {
        toast.warning("Admin user created, but invitation email was not sent");
      } else {
        toast.success(
          sendInvitation
            ? "Admin user created and invitation sent"
            : "Admin user created",
        );
      }
      navigate("/admin-roles");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create admin user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRoleData = roles.find((role) => role.id === selectedRole);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/admin-roles")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Admin</h1>
          <p className="text-gray-500 mt-1">Create a new administrator account</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#00BF63]" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="Juan"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Dela Cruz"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="juan.delacruz@servease.ph"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+63 912 345 6789"
                    className="pl-10"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Philippine mobile number format
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Role & Access */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#00BF63]" />
                Role & Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">
                  Role <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedRole}
                  onValueChange={(value) =>
                    setSelectedRole(value as AdminAccessRoleId)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedRoleData && (
                <div className="space-y-2">
                  <Label>Permissions Preview</Label>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {selectedRoleData.permissions.map((permission, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-white border-gray-300 text-gray-700"
                        >
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-[#00BF63]" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Initial Password</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      readOnly
                      className="pr-10 font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCopyPassword}
                  >
                    {passwordCopied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRegeneratePassword}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Auto-generated secure password. User will be prompted to change
                  on first login.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="sendInvitation"
                    checked={sendInvitation}
                    onCheckedChange={(checked) =>
                      setSendInvitation(checked as boolean)
                    }
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="sendInvitation"
                      className="font-normal cursor-pointer"
                    >
                      Send invitation email
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      User will receive an email with login credentials and
                      instructions
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="require2FA"
                    checked={require2FA}
                    onCheckedChange={(checked) =>
                      setRequire2FA(checked as boolean)
                    }
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="require2FA"
                      className="font-normal cursor-pointer"
                    >
                      Require two-factor authentication
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      User must set up 2FA on first login for enhanced security
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin-roles")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#00BF63] hover:bg-[#00A055]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? "Creating..." : "Create Admin User"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
