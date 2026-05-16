import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Bell, Globe, Palette, Database, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import {
  getUserPreferences,
  updateUserPreferences,
  type UserPreferenceSummary,
} from "../../services/serveaseAdminApi";

const defaultSettings = {
  emailNotifications: true,
  pushNotifications: false,
  bookingAlerts: true,
  paymentAlerts: true,
  disputeAlerts: true,
  language: "en",
  timezone: "Asia/Manila",
  theme: "light",
  dataRetention: "90",
};

function fromPreferenceSummary(preferences: UserPreferenceSummary) {
  const metadata = preferences.notificationPreferences;
  return {
    emailNotifications:
      typeof metadata.emailNotifications === "boolean"
        ? metadata.emailNotifications
        : defaultSettings.emailNotifications,
    pushNotifications: preferences.pushNotificationsEnabled,
    bookingAlerts:
      typeof metadata.bookingAlerts === "boolean"
        ? metadata.bookingAlerts
        : defaultSettings.bookingAlerts,
    paymentAlerts:
      typeof metadata.paymentAlerts === "boolean"
        ? metadata.paymentAlerts
        : defaultSettings.paymentAlerts,
    disputeAlerts:
      typeof metadata.disputeAlerts === "boolean"
        ? metadata.disputeAlerts
        : defaultSettings.disputeAlerts,
    language: preferences.language || defaultSettings.language,
    timezone:
      typeof metadata.timezone === "string"
        ? metadata.timezone
        : defaultSettings.timezone,
    theme: preferences.darkModeEnabled
      ? "dark"
      : typeof metadata.theme === "string"
        ? metadata.theme
        : defaultSettings.theme,
    dataRetention:
      typeof metadata.dataRetention === "string"
        ? metadata.dataRetention
        : defaultSettings.dataRetention,
  };
}

export function Settings() {
  const { accessToken } = useAuth();
  const [settings, setSettings] = useState(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    if (!accessToken) return;

    try {
      setSettings(fromPreferenceSummary(await getUserPreferences(accessToken)));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load settings.");
    }
  }, [accessToken]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    if (!accessToken) return;

    setIsSaving(true);
    try {
      const updated = await updateUserPreferences(accessToken, {
        pushNotificationsEnabled: settings.pushNotifications,
        darkModeEnabled: settings.theme === "dark",
        language: settings.language,
        notificationPreferences: {
          emailNotifications: settings.emailNotifications,
          bookingAlerts: settings.bookingAlerts,
          paymentAlerts: settings.paymentAlerts,
          disputeAlerts: settings.disputeAlerts,
          timezone: settings.timezone,
          theme: settings.theme,
          dataRetention: settings.dataRetention,
        },
      });
      setSettings(fromPreferenceSummary(updated));
      toast.success("Settings saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your account preferences and notification settings
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#00BF63]" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notif">Email Notifications</Label>
                <p className="text-sm text-gray-500">
                  Receive email updates about platform activity
                </p>
              </div>
              <Switch
                id="email-notif"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, emailNotifications: checked })
                }
              />
            </div>

            {/* Push Notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notif">Push Notifications</Label>
                <p className="text-sm text-gray-500">
                  Get real-time browser notifications
                </p>
              </div>
              <Switch
                id="push-notif"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, pushNotifications: checked })
                }
              />
            </div>

            {/* Booking Alerts */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="booking-alerts">Booking Alerts</Label>
                <p className="text-sm text-gray-500">
                  Notify about new bookings and updates
                </p>
              </div>
              <Switch
                id="booking-alerts"
                checked={settings.bookingAlerts}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, bookingAlerts: checked })
                }
              />
            </div>

            {/* Payment Alerts */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="payment-alerts">Payment Alerts</Label>
                <p className="text-sm text-gray-500">
                  Get notified about payments and payouts
                </p>
              </div>
              <Switch
                id="payment-alerts"
                checked={settings.paymentAlerts}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, paymentAlerts: checked })
                }
              />
            </div>

            {/* Dispute Alerts */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dispute-alerts">Dispute Alerts</Label>
                <p className="text-sm text-gray-500">
                  Alert when disputes are filed
                </p>
              </div>
              <Switch
                id="dispute-alerts"
                checked={settings.disputeAlerts}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, disputeAlerts: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Regional & Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#00BF63]" />
              Regional & Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Language */}
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={settings.language}
                onValueChange={(value) =>
                  setSettings({ ...settings, language: value })
                }
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fil">Filipino</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Timezone */}
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={settings.timezone}
                onValueChange={(value) =>
                  setSettings({ ...settings, timezone: value })
                }
              >
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Manila">
                    (GMT+8) Manila, Philippines
                  </SelectItem>
                  <SelectItem value="Asia/Singapore">
                    (GMT+8) Singapore
                  </SelectItem>
                  <SelectItem value="Asia/Tokyo">
                    (GMT+9) Tokyo, Japan
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-[#00BF63]" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme */}
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={settings.theme}
                onValueChange={(value) =>
                  setSettings({ ...settings, theme: value })
                }
              >
                <SelectTrigger id="theme">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="auto">Auto (System)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Choose your preferred color theme
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[#00BF63]" />
              Data & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Data Retention */}
            <div className="space-y-2">
              <Label htmlFor="retention">Data Retention Period</Label>
              <Select
                value={settings.dataRetention}
                onValueChange={(value) =>
                  setSettings({ ...settings, dataRetention: value })
                }
              >
                <SelectTrigger id="retention">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                How long to keep historical data
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          disabled={isSaving}
          onClick={() => void handleSave()}
          className="bg-[#00BF63] hover:bg-[#00A055]"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
