import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Badge } from "../components/ui/badge";
import {
  Shield,
  Lock,
  Smartphone,
  Monitor,
  Eye,
  EyeOff,
  Key,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import {
  disableCurrentUserTwoFactor,
  enableCurrentUserTwoFactor,
  listCurrentUserSessions,
  updateCurrentUserPassword,
  verifyCurrentUserTwoFactor,
  type CurrentUserSessionSummary,
  type TwoFactorProvisioningResponse,
} from "../../services/serveaseAdminApi";

export function Security() {
  const { accessToken } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] =
    useState<TwoFactorProvisioningResponse | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isUpdating2FA, setIsUpdating2FA] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (!accessToken) return;

    setIsSavingPassword(true);
    try {
      await updateCurrentUserPassword(accessToken, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update password.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleToggle2FA = async () => {
    if (!accessToken) return;
    setIsUpdating2FA(true);
    try {
      if (twoFactorEnabled) {
        await disableCurrentUserTwoFactor(accessToken, twoFactorCode);
        setTwoFactorEnabled(false);
        setTwoFactorSetup(null);
        setTwoFactorCode("");
        toast.success("Two-factor authentication disabled.");
      } else {
        setTwoFactorSetup(await enableCurrentUserTwoFactor(accessToken));
        toast.success("Scan the QR code and enter the verification code.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update 2FA.");
    } finally {
      setIsUpdating2FA(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!accessToken || !twoFactorCode.trim()) return;
    setIsUpdating2FA(true);
    try {
      const result = await verifyCurrentUserTwoFactor(accessToken, twoFactorCode);
      setTwoFactorEnabled(result.enabled);
      setTwoFactorSetup(null);
      setTwoFactorCode("");
      toast.success("Two-factor authentication enabled.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid verification code.");
    } finally {
      setIsUpdating2FA(false);
    }
  };

  const [sessions, setSessions] = useState<CurrentUserSessionSummary[]>([]);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!accessToken) {
        setIsLoadingSessions(false);
        return;
      }
      setIsLoadingSessions(true);
      setSessionsError(null);
      try {
        const data = await listCurrentUserSessions(accessToken);
        if (!cancelled) setSessions(data);
      } catch (error) {
        if (!cancelled) {
          setSessionsError(
            error instanceof Error
              ? error.message
              : "Could not load active sessions.",
          );
        }
      } finally {
        if (!cancelled) setIsLoadingSessions(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const formatSessionTime = (value: string | null) => {
    if (!value) return "Never";
    return new Date(value).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your password, two-factor authentication, and active sessions
        </p>
      </div>

      {/* Security Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#00BF63]" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Must be at least 8 characters with letters and numbers
                </p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSavingPassword}
                className="w-full bg-[#00BF63] hover:bg-[#00A055]"
              >
                <Key className="w-4 h-4 mr-2" />
                {isSavingPassword ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Two-Factor Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#00BF63]" />
              Two-Factor Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium">Enhanced Security</p>
                <p className="text-blue-700 mt-1">
                  Add an extra layer of security by requiring a code from your phone
                  when signing in.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="2fa" className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Enable 2FA
                </Label>
                <p className="text-sm text-gray-500">
                  {twoFactorEnabled ? "2FA is currently enabled" : "2FA is currently disabled"}
                </p>
              </div>
              <Switch
                id="2fa"
                checked={twoFactorEnabled}
                disabled={isUpdating2FA}
                onCheckedChange={handleToggle2FA}
              />
            </div>

            {twoFactorSetup && (
              <div className="space-y-3 pt-4 border-t">
                <img
                  alt="Two-factor setup QR code"
                  src={twoFactorSetup.qrCodeDataUrl}
                  className="h-40 w-40 rounded border border-gray-200"
                />
                <p className="font-mono text-xs text-gray-500 break-all">
                  {twoFactorSetup.secret}
                </p>
                <Input
                  value={twoFactorCode}
                  onChange={(event) => setTwoFactorCode(event.target.value)}
                  placeholder="Enter 6-digit code"
                  inputMode="numeric"
                  maxLength={6}
                />
                <Button
                  className="w-full bg-[#00BF63] hover:bg-[#00A055]"
                  disabled={isUpdating2FA || !twoFactorCode.trim()}
                  onClick={() => void handleVerify2FA()}
                >
                  Verify Code
                </Button>
              </div>
            )}

            {twoFactorEnabled && (
              <div className="space-y-3 pt-4 border-t">
                <p className="text-sm font-medium text-gray-900">Disable 2FA</p>
                <p className="text-sm text-gray-500">
                  Enter a current authenticator code before disabling 2FA.
                </p>
                <Input
                  value={twoFactorCode}
                  onChange={(event) => setTwoFactorCode(event.target.value)}
                  placeholder="Enter 6-digit code"
                  inputMode="numeric"
                  maxLength={6}
                />
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={isUpdating2FA || !twoFactorCode.trim()}
                  onClick={() => void handleToggle2FA()}
                >
                  Disable 2FA
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-[#00BF63]" />
            Active Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Manage devices where you're currently signed in
          </p>

          {sessionsError && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {sessionsError}
            </div>
          )}

          <div className="space-y-3">
            {isLoadingSessions && (
              <p className="text-sm text-gray-500">Loading sessions...</p>
            )}
            {!isLoadingSessions && sessions.length === 0 && !sessionsError && (
              <p className="text-sm text-gray-500">
                No active sessions detected.
              </p>
            )}
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#00BF63] transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Monitor className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">
                        {session.email || "Active session"}
                      </p>
                      {session.isCurrent && (
                        <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Last sign-in: {formatSessionTime(session.lastSignInAt)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Account created: {formatSessionTime(session.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Multi-device session listing requires a dedicated session store.
            Today this view shows the active Supabase Auth session derived from
            <code> auth.users.last_sign_in_at</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
