import { Shield, Bell, FileText, Users, CheckCircle, Clock, MoreVertical, RefreshCw, Copy, Check, Eye, UserX, Lock, Settings, Edit2, UserCheck, Key, Search, Download, Filter, Plug, Wifi, WifiOff, ExternalLink, CreditCard, MapPin, BarChart3 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { AdminRolesComponent } from "../components/AdminRolesComponent";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
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
import { notifyBackendRequired } from "../utils/backendRequired";
import {
  exportAdminAuditLogsCsv,
  getUserPreferences,
  listAdminAuditLogs,
  listAdminIntegrations,
  testAdminIntegration,
  updateAdminIntegrationCredentials,
  updateUserPreferences,
  type AdminAuditActionType,
  type AdminAuditLogSummary,
  type AdminIntegrationSummary,
} from "../../services/serveaseAdminApi";

// Admin type definition
type Admin = {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string;
  lastLogin: string;
  status: "Active" | "Inactive";
};

// Role permissions mapping
const rolePermissions = {
  "Admin": ["Manage Users", "Manage Roles", "Manage Permissions"],
  "Editor": ["Edit Content", "Manage Comments"],
  "Viewer": ["View Content", "View Comments"]
};

// Admin Roles & Permissions - now using the new component
export function AdminRoles() {
  return <AdminRolesComponent />;
}

// Notification Settings
export function NotificationSettings() {
  const { accessToken } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [bookingAlerts, setBookingAlerts] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);
  const [disputeAlerts, setDisputeAlerts] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const loadPreferences = async () => {
      setIsLoading(true);
      try {
        const preferences = await getUserPreferences(accessToken);
        const metadata = preferences.notificationPreferences;
        setPushNotifications(preferences.pushNotificationsEnabled);
        setEmailNotifications(metadata.emailNotifications !== false);
        setSmsNotifications(metadata.smsNotifications === true);
        setBookingAlerts(metadata.bookingAlerts !== false);
        setPaymentAlerts(metadata.paymentAlerts !== false);
        setDisputeAlerts(metadata.disputeAlerts !== false);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load notification settings.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadPreferences();
  }, [accessToken]);

  const handleSave = async () => {
    if (!accessToken) {
      notifyBackendRequired("Saving notification settings", "PUT /v1/me/preferences");
      return;
    }

    setIsSaving(true);
    try {
      await updateUserPreferences(accessToken, {
        pushNotificationsEnabled: pushNotifications,
        notificationPreferences: {
          emailNotifications,
          smsNotifications,
          bookingAlerts,
          paymentAlerts,
          disputeAlerts,
        },
      });
      toast.success("Notification settings saved.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save notification settings.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
        <p className="text-gray-500 mt-1">
          Configure how you receive notifications and alerts
        </p>
        {isLoading && (
          <p className="text-sm text-gray-500 mt-2">Loading saved preferences...</p>
        )}
      </div>

      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#00BF63]" />
            Notification Channels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div>
              <p className="text-sm font-medium text-gray-900">Email Notifications</p>
              <p className="text-xs text-gray-500 mt-1">
                Receive notifications via email
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div>
              <p className="text-sm font-medium text-gray-900">SMS Notifications</p>
              <p className="text-xs text-gray-500 mt-1">
                Receive notifications via SMS
              </p>
            </div>
            <Switch
              checked={smsNotifications}
              onCheckedChange={setSmsNotifications}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div>
              <p className="text-sm font-medium text-gray-900">Push Notifications</p>
              <p className="text-xs text-gray-500 mt-1">
                Receive notifications in your browser
              </p>
            </div>
            <Switch
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Alert Types */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div>
              <p className="text-sm font-medium text-gray-900">Booking Alerts</p>
              <p className="text-xs text-gray-500 mt-1">
                New bookings, cancellations, and updates
              </p>
            </div>
            <Switch
              checked={bookingAlerts}
              onCheckedChange={setBookingAlerts}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div>
              <p className="text-sm font-medium text-gray-900">Payment Alerts</p>
              <p className="text-xs text-gray-500 mt-1">
                Payment confirmations, refunds, and failures
              </p>
            </div>
            <Switch
              checked={paymentAlerts}
              onCheckedChange={setPaymentAlerts}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div>
              <p className="text-sm font-medium text-gray-900">Dispute Alerts</p>
              <p className="text-xs text-gray-500 mt-1">
                New disputes and resolution updates
              </p>
            </div>
            <Switch
              checked={disputeAlerts}
              onCheckedChange={setDisputeAlerts}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          className="bg-[#00BF63] hover:bg-[#00A055]"
          disabled={isSaving}
          onClick={() => void handleSave()}
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}

// Security Settings
export function SecuritySettings() {
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [ipWhitelisting, setIpWhitelisting] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage security and access control settings
        </p>
      </div>

      {/* Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#00BF63]" />
            Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div>
              <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
              <p className="text-xs text-gray-500 mt-1">
                Require 2FA for all admin logins
              </p>
            </div>
            <Switch
              checked={twoFactorAuth}
              onCheckedChange={setTwoFactorAuth}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
            <Input
              id="sessionTimeout"
              type="number"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className="max-w-xs"
            />
            <p className="text-xs text-gray-500">
              Auto-logout after period of inactivity
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Access Control */}
      <Card>
        <CardHeader>
          <CardTitle>Access Control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div>
              <p className="text-sm font-medium text-gray-900">IP Whitelisting</p>
              <p className="text-xs text-gray-500 mt-1">
                Only allow access from approved IP addresses
              </p>
            </div>
            <Switch
              checked={ipWhitelisting}
              onCheckedChange={setIpWhitelisting}
            />
          </div>

          {ipWhitelisting && (
            <div className="space-y-2">
              <Label htmlFor="ipAddresses">Allowed IP Addresses</Label>
              <Input
                id="ipAddresses"
                placeholder="e.g., 192.168.1.1, 192.168.1.2"
              />
              <p className="text-xs text-gray-500">
                Enter comma-separated IP addresses
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="bg-[#00BF63] hover:bg-[#00A055]">
          Save Security Settings
        </Button>
      </div>
    </div>
  );
}

function getDateRangeBounds(range: string): { from: Date | null; to: Date | null } {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);
  endOfToday.setMilliseconds(endOfToday.getMilliseconds() - 1);

  if (range === "today") {
    return { from: startOfToday, to: endOfToday };
  }

  if (range === "yesterday") {
    const from = new Date(startOfToday);
    from.setDate(from.getDate() - 1);
    const to = new Date(startOfToday);
    to.setMilliseconds(to.getMilliseconds() - 1);
    return { from, to };
  }

  if (range === "last7days" || range === "last30days") {
    const from = new Date(startOfToday);
    from.setDate(from.getDate() - (range === "last7days" ? 6 : 29));
    return { from, to: endOfToday };
  }

  if (range === "thismonth") {
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: endOfToday,
    };
  }

  if (range === "lastmonth") {
    return {
      from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      to: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999),
    };
  }

  return { from: null, to: null };
}

function isWithinDateRange(value: string | null, range: string): boolean {
  if (!value) return false;
  const { from, to } = getDateRangeBounds(range);
  const date = new Date(value);
  return (!from || date >= from) && (!to || date <= to);
}

function actionTypeLabel(type: AdminAuditActionType): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function relativeActivity(value: string | null): string {
  if (!value) return "No activity";
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 1) return "Now";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr`;
  return `${Math.floor(hours / 24)} day`;
}

// Audit Trail
export function AuditTrail() {
  const { accessToken } = useAuth();
  const [selectedDateRange, setSelectedDateRange] = useState("today");
  const [selectedAdminUser, setSelectedAdminUser] = useState("all");
  const [selectedActionType, setSelectedActionType] = useState("all");
  const [selectedEntityType, setSelectedEntityType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!accessToken) return;

    const loadAuditLogs = async () => {
      setIsLoading(true);
      try {
        setAuditLogs(await listAdminAuditLogs(accessToken, { limit: 500 }));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load audit logs.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadAuditLogs();
  }, [accessToken]);

  // Filter audit logs based on filters and search
  const filteredLogs = auditLogs.filter((log) => {
    if (!isWithinDateRange(log.createdAt, selectedDateRange)) {
      return false;
    }

    // Filter by admin user
    if (selectedAdminUser !== "all" && log.adminUserId !== selectedAdminUser) {
      return false;
    }

    // Filter by action type
    if (selectedActionType !== "all" && log.actionType !== selectedActionType) {
      return false;
    }

    // Filter by entity type
    if (selectedEntityType !== "all" && log.entityType !== selectedEntityType) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        log.id.toLowerCase().includes(query) ||
        (log.adminName ?? "").toLowerCase().includes(query) ||
        (log.adminEmail ?? "").toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.entityType.toLowerCase().includes(query) ||
        (log.details ?? "").toLowerCase().includes(query) ||
        (log.ipAddress ?? "").includes(query)
      );
    }

    return true;
  });

  const adminUserOptions = useMemo(() => {
    const unique = new Map<string, string>();
    auditLogs.forEach((log) => {
      unique.set(log.adminUserId, log.adminName ?? log.adminEmail ?? log.adminUserId);
    });
    return Array.from(unique.entries());
  }, [auditLogs]);

  const entityOptions = useMemo(() => {
    return Array.from(new Set(auditLogs.map((log) => log.entityType))).sort();
  }, [auditLogs]);

  const todayCount = auditLogs.filter((log) => isWithinDateRange(log.createdAt, "today")).length;
  const recentActivity = relativeActivity(auditLogs[0]?.createdAt ?? null);

  const handleExportLogs = async () => {
    if (!accessToken) {
      notifyBackendRequired("Exporting audit logs", "GET /v1/admin/audit-logs/export");
      return;
    }

    try {
      const csv = await exportAdminAuditLogsCsv(accessToken, {
        actionType: selectedActionType === "all" ? null : (selectedActionType as AdminAuditActionType),
        entityType: selectedEntityType === "all" ? null : selectedEntityType,
        query: searchQuery || null,
        limit: 500,
      });
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `servease-admin-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Audit logs exported.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to export audit logs.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Audit Trail</h1>
        <p className="text-gray-500 mt-1">
          Track all admin actions and system changes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Total Actions Today</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{todayCount}</p>
                <p className="text-xs text-gray-400 mt-1">From backend audit log</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Active Admin Users</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{adminUserOptions.length}</p>
                <p className="text-xs text-gray-400 mt-1">Seen in current log window</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-[#DCFCE7]">
                <Clock className="w-6 h-6 text-[#00BF63]" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Recent Activity</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{recentActivity}</p>
                <p className="text-xs text-gray-400 mt-1">Last action</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#00BF63]" />
              Filters
            </CardTitle>
            <Button
              onClick={handleExportLogs}
              className="bg-[#00BF63] hover:bg-[#00A055]"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search Logs */}
            <div className="space-y-2">
              <Label htmlFor="searchLogs">Search Logs</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="searchLogs"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                <SelectTrigger id="dateRange">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="last7days">Last 7 Days</SelectItem>
                  <SelectItem value="last30days">Last 30 Days</SelectItem>
                  <SelectItem value="thismonth">This Month</SelectItem>
                  <SelectItem value="lastmonth">Last Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Admin User */}
            <div className="space-y-2">
              <Label htmlFor="adminUser">Admin User</Label>
              <Select value={selectedAdminUser} onValueChange={setSelectedAdminUser}>
                <SelectTrigger id="adminUser">
                  <SelectValue placeholder="Select admin user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Admin Users</SelectItem>
                  {adminUserOptions.map(([id, label]) => (
                    <SelectItem key={id} value={id}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Type */}
            <div className="space-y-2">
              <Label htmlFor="actionType">Action Type</Label>
              <Select value={selectedActionType} onValueChange={setSelectedActionType}>
                <SelectTrigger id="actionType">
                  <SelectValue placeholder="Select action type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="approve">Approve</SelectItem>
                  <SelectItem value="reject">Reject</SelectItem>
                  <SelectItem value="resolve">Resolve</SelectItem>
                  <SelectItem value="export">Export</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Entity Type */}
            <div className="space-y-2">
              <Label htmlFor="entityType">Entity Type</Label>
              <Select value={selectedEntityType} onValueChange={setSelectedEntityType}>
                <SelectTrigger id="entityType">
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  {entityOptions.map((entity) => (
                    <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredLogs.length}</span> of{" "}
              <span className="font-semibold text-gray-900">{auditLogs.length}</span> logs
              {isLoading ? " · Loading..." : ""}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table - Desktop */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Log ID</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Admin User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <span className="font-mono font-semibold text-[#00BF63]">{log.id.slice(0, 8)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }) : "Not recorded"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-gray-900">{log.adminName ?? log.adminEmail ?? log.adminUserId}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                      {actionTypeLabel(log.actionType)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-gray-300 text-gray-700">
                      {log.entityType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-700">{log.details ?? log.action}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-gray-600">{log.ipAddress ?? "Unknown"}</span>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-gray-500">
                    No backend audit logs match the selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Audit Log Table - Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredLogs.map((log) => (
          <Card key={log.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="font-mono text-xs text-[#00BF63]">{log.id.slice(0, 8)}</span>
                  <p className="font-medium text-gray-900 mt-1">{log.adminName ?? log.adminEmail ?? log.adminUserId}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }) : "Not recorded"}
                  </p>
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                  {actionTypeLabel(log.actionType)}
                </Badge>
              </div>
              <div className="space-y-2">
                <Badge variant="outline" className="border-gray-300 text-gray-700">
                  {log.entityType}
                </Badge>
                <p className="text-sm text-gray-700">{log.details ?? log.action}</p>
                <p className="font-mono text-xs text-gray-600">IP: {log.ipAddress ?? "Unknown"}</p>
              </div>
            </CardContent>
          </Card>
        ))}
        {!isLoading && filteredLogs.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-sm text-gray-500">
              No backend audit logs match the selected filters.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Integrations
const categoryStyles: Record<
  string,
  { icon: typeof CreditCard; label: string; badgeColor: string }
> = {
  payment: { icon: CreditCard, label: "Payment Gateway", badgeColor: "blue" },
  messaging: { icon: Bell, label: "Messaging", badgeColor: "red" },
  maps: { icon: MapPin, label: "Maps & Location", badgeColor: "yellow" },
  analytics: { icon: BarChart3, label: "Analytics", badgeColor: "purple" },
  push: { icon: Bell, label: "Push Notifications", badgeColor: "orange" },
};

export function Integrations() {
  const { accessToken } = useAuth();
  const [integrations, setIntegrations] = useState<AdminIntegrationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingProvider, setPendingProvider] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const list = await listAdminIntegrations(accessToken);
      setIntegrations(list);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Could not load integrations.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const handleToggle = async (
    provider: string,
    nextEnabled: boolean,
  ) => {
    if (!accessToken) return;
    setPendingProvider(provider);
    try {
      const updated = await updateAdminIntegrationCredentials(
        accessToken,
        provider,
        { isEnabled: nextEnabled },
      );
      setIntegrations((current) =>
        current.map((item) =>
          item.provider === provider ? updated : item,
        ),
      );
      toast.success(
        `${updated.displayName} ${nextEnabled ? "enabled" : "disabled"}.`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update integration.",
      );
    } finally {
      setPendingProvider(null);
    }
  };

  const handleTest = async (provider: string) => {
    if (!accessToken) return;
    setPendingProvider(provider);
    try {
      const updated = await testAdminIntegration(accessToken, provider, {
        success: true,
      });
      setIntegrations((current) =>
        current.map((item) =>
          item.provider === provider ? updated : item,
        ),
      );
      if (updated.status === "error") {
        toast.error(updated.lastError ?? "Integration test failed.");
      } else {
        toast.success(`${updated.displayName} test passed.`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not run integration test.",
      );
    } finally {
      setPendingProvider(null);
    }
  };

  const handleUpdateCredentials = async (
    integration: AdminIntegrationSummary,
  ) => {
    if (!accessToken) return;
    const webhookUrl = window.prompt(
      `Webhook URL for ${integration.displayName}`,
      integration.webhookUrl ?? "",
    );
    if (webhookUrl === null) return;
    const apiKeyPreview = window.prompt(
      `API key preview for ${integration.displayName} (last 4 characters)`,
      integration.apiKeyPreview ?? "",
    );
    if (apiKeyPreview === null) return;
    setPendingProvider(integration.provider);
    try {
      const updated = await updateAdminIntegrationCredentials(
        accessToken,
        integration.provider,
        {
          webhookUrl: webhookUrl.trim() || null,
          apiKeyPreview: apiKeyPreview.trim() || null,
        },
      );
      setIntegrations((current) =>
        current.map((item) =>
          item.provider === integration.provider ? updated : item,
        ),
      );
      toast.success(`${updated.displayName} credentials updated.`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update credentials.",
      );
    } finally {
      setPendingProvider(null);
    }
  };

  const activeCount = integrations.filter((item) => item.status === "active").length;
  const totalCount = integrations.length;
  const errorCount = integrations.filter((item) => item.status === "error").length;
  const lastTestedAt = integrations
    .map((item) => item.lastTestedAt)
    .filter((value): value is string => Boolean(value))
    .sort()
    .pop();

  const grouped = useMemo(() => {
    const buckets = new Map<string, AdminIntegrationSummary[]>();
    for (const item of integrations) {
      const key = item.category;
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key)!.push(item);
    }
    return Array.from(buckets.entries());
  }, [integrations]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-500 mt-1">
            Manage third-party services and API integrations
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void refresh()}
          disabled={isLoading}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {isLoading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {loadError && (
        <Card>
          <CardContent className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {loadError}
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-[#DCFCE7]">
                <Plug className="w-6 h-6 text-[#00BF63]" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Active Integrations</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {activeCount}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Out of {totalCount} total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-lg ${errorCount > 0 ? "bg-red-50" : "bg-green-50"}`}
              >
                {errorCount > 0 ? (
                  <WifiOff className="w-6 h-6 text-red-600" />
                ) : (
                  <Wifi className="w-6 h-6 text-green-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Healthy Services</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {totalCount === 0
                    ? "0%"
                    : `${Math.round(((totalCount - errorCount) / totalCount) * 100)}%`}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {errorCount > 0
                    ? `${errorCount} service(s) reporting errors`
                    : "All services healthy"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Last Health Check</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {lastTestedAt
                    ? new Date(lastTestedAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Never"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Updated via test button
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {grouped.map(([category, items]) => {
        const style = categoryStyles[category] ?? {
          icon: Plug,
          label: category,
          badgeColor: "gray",
        };
        const Icon = style.icon;
        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-[#00BF63]" />
                {style.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((integration) => (
                <IntegrationCard
                  key={integration.provider}
                  integration={integration}
                  pending={pendingProvider === integration.provider}
                  onToggle={(next) => void handleToggle(integration.provider, next)}
                  onTest={() => void handleTest(integration.provider)}
                  onUpdateCredentials={() =>
                    void handleUpdateCredentials(integration)
                  }
                />
              ))}
            </CardContent>
          </Card>
        );
      })}

      {!isLoading && integrations.length === 0 && !loadError && (
        <Card>
          <CardContent className="p-6 text-center text-sm text-gray-500">
            No integrations have been registered yet.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function IntegrationCard({
  integration,
  pending,
  onToggle,
  onTest,
  onUpdateCredentials,
}: {
  integration: AdminIntegrationSummary;
  pending: boolean;
  onToggle: (next: boolean) => void;
  onTest: () => void;
  onUpdateCredentials: () => void;
}) {
  const statusBadge =
    integration.status === "active"
      ? "bg-green-100 text-green-700 border-green-200"
      : integration.status === "error"
        ? "bg-red-100 text-red-700 border-red-200"
        : "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-[#0F172A] flex items-center justify-center">
            <Plug className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">
              {integration.displayName}
            </h4>
            <p className="text-sm text-gray-500 capitalize">
              {integration.category} integration
            </p>
            {integration.webhookUrl && (
              <p className="text-xs text-gray-400 mt-1 truncate max-w-md">
                Webhook: {integration.webhookUrl}
              </p>
            )}
            {integration.lastError && integration.status === "error" && (
              <p className="text-xs text-red-600 mt-1">
                {integration.lastError}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={statusBadge}>
            {integration.status === "active" ? (
              <>
                <Wifi className="w-3 h-3 mr-1" />
                Active
              </>
            ) : integration.status === "error" ? (
              <>
                <WifiOff className="w-3 h-3 mr-1" />
                Error
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 mr-1" />
                Inactive
              </>
            )}
          </Badge>
          <Switch
            checked={integration.isEnabled}
            disabled={pending}
            onCheckedChange={(checked) => onToggle(checked)}
          />
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Button
          variant="outline"
          onClick={onTest}
          disabled={pending}
          className="flex-1"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          {pending ? "Working..." : "Test Integration"}
        </Button>
        <Button
          onClick={onUpdateCredentials}
          disabled={pending}
          className="flex-1 bg-[#00BF63] hover:bg-[#00A055]"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Update Credentials
        </Button>
      </div>
    </div>
  );
}
