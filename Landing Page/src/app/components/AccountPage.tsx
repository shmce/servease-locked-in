"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Bell,
  CheckCircle2,
  CreditCard,
  Edit3,
  Gift,
  LogOut,
  RefreshCw,
  Save,
  Send,
  ShieldCheck,
  CalendarCheck,
  Ticket,
  UserRound,
  X,
} from "lucide-react";
import {
  listCustomerBookings,
  type BookingSummary,
} from "../lib/bookings";
import { createSupabaseBrowserClient } from "../lib/supabase-browser";
import {
  getCurrentUserProfile,
  updateCurrentUserProfile,
  updateCurrentUserPassword,
  type CurrentUserProfile,
} from "../lib/current-user";
import {
  createSupportTicketReply,
  listSupportTicketReplies,
  listSupportTickets,
  type SupportTicketReplySummary,
  type SupportTicketSummary,
} from "../lib/support-tickets";
import {
  listNotifications,
  markNotificationRead,
  type NotificationSummary,
} from "../lib/notifications";
import {
  getReferralSummary,
  type ReferralSummary,
} from "../lib/referrals";
import {
  deleteCustomerPaymentMethod,
  listCustomerPaymentMethods,
  upsertCustomerPaymentMethod,
  type CustomerPaymentMethodSummary,
  type CustomerPaymentMethodType,
} from "../lib/payments";
import {
  getUserPreferences,
  updateUserPreferences,
  type UserPreferenceSummary,
} from "../lib/preferences";

interface CustomerNotificationSettings {
  bookingConfirmations: boolean;
  bookingReminders: boolean;
  bookingUpdates: boolean;
  providerMessages: boolean;
  paymentReceipts: boolean;
  promotionalOffers: boolean;
  platformUpdates: boolean;
}

const defaultCustomerNotificationSettings: CustomerNotificationSettings = {
  bookingConfirmations: true,
  bookingReminders: true,
  bookingUpdates: true,
  providerMessages: true,
  paymentReceipts: true,
  promotionalOffers: false,
  platformUpdates: true,
};

function readCustomerNotificationPreferences(
  value: Record<string, unknown> | null | undefined,
): CustomerNotificationSettings {
  const next: CustomerNotificationSettings = {
    ...defaultCustomerNotificationSettings,
  };

  if (!value) {
    return next;
  }

  for (const key of Object.keys(defaultCustomerNotificationSettings) as Array<
    keyof CustomerNotificationSettings
  >) {
    const current = value[key];
    if (typeof current === "boolean") {
      next[key] = current;
    }
  }

  return next;
}

interface ProfileFormState {
  fullName: string;
  contactNumber: string;
  address: string;
  businessName: string;
}

interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PaymentMethodFormState {
  methodType: CustomerPaymentMethodType;
  label: string;
  brand: string;
  last4: string;
  isDefault: boolean;
}

function createSupabaseState() {
  try {
    return {
      supabase: createSupabaseBrowserClient(),
      setupError: "",
    };
  } catch (setupError) {
    return {
      supabase: null,
      setupError:
        setupError instanceof Error
          ? setupError.message
          : "Supabase login is not configured.",
    };
  }
}

function createProfileForm(profile: CurrentUserProfile): ProfileFormState {
  return {
    fullName: profile.user.fullName ?? "",
    contactNumber: profile.user.contactNumber ?? "",
    address: profile.customerProfile?.address ?? "",
    businessName: profile.providerProfile?.businessName ?? "",
  };
}

export function AccountPage() {
  const router = useRouter();
  const [{ supabase, setupError }] = useState(createSupabaseState);
  const [profile, setProfile] = useState<CurrentUserProfile | null>(null);
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [tickets, setTickets] = useState<SupportTicketSummary[]>([]);
  const [ticketReplies, setTicketReplies] = useState<SupportTicketReplySummary[]>([]);
  const [notifications, setNotifications] = useState<NotificationSummary[]>([]);
  const [referral, setReferral] = useState<ReferralSummary | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<CustomerPaymentMethodSummary[]>([]);
  const [form, setForm] = useState<ProfileFormState>({
    fullName: "",
    contactNumber: "",
    address: "",
    businessName: "",
  });
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(setupError);
  const [supportError, setSupportError] = useState("");
  const [replyError, setReplyError] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [notificationError, setNotificationError] = useState("");
  const [referralError, setReferralError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(!setupError);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [markingNotificationId, setMarkingNotificationId] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [paymentForm, setPaymentForm] = useState<PaymentMethodFormState>({
    methodType: "cash_on_service",
    label: "Cash on service",
    brand: "",
    last4: "",
    isDefault: true,
  });
  const [isSavingPaymentMethod, setIsSavingPaymentMethod] = useState(false);
  const [deletingPaymentMethodId, setDeletingPaymentMethodId] = useState("");
  const [preferences, setPreferences] = useState<UserPreferenceSummary | null>(
    null,
  );
  const [notificationSettings, setNotificationSettings] =
    useState<CustomerNotificationSettings>(defaultCustomerNotificationSettings);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
  const [preferenceError, setPreferenceError] = useState("");
  const [preferenceSuccess, setPreferenceSuccess] = useState("");
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  const loadAccount = async () => {
    if (!supabase) {
      setError(setupError || "Supabase login is not configured.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");
    setSupportError("");
    setReplyError("");
    setBookingError("");
    setNotificationError("");
    setReferralError("");
    setPaymentError("");
    setPasswordError("");
    setSuccess("");

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session?.access_token) {
      router.push("/login");
      return;
    }

    const accessToken = sessionData.session.access_token;
    const [
      profileResponse,
      ticketsResponse,
      bookingsResponse,
      notificationsResponse,
      referralResponse,
      paymentMethodsResponse,
      preferencesResponse,
    ] = await Promise.all([
      getCurrentUserProfile(accessToken)
        .then((data) => ({ data }))
        .catch((error: unknown) => ({ error })),
      listSupportTickets(accessToken)
        .then((data) => ({ data }))
        .catch((error: unknown) => ({ error })),
      listCustomerBookings(accessToken)
        .then((data) => ({ data }))
        .catch((error: unknown) => ({ error })),
      listNotifications(accessToken)
        .then((data) => ({ data }))
        .catch((error: unknown) => ({ error })),
      getReferralSummary(accessToken)
        .then((data) => ({ data }))
        .catch((error: unknown) => ({ error })),
      listCustomerPaymentMethods(accessToken)
        .then((data) => ({ data }))
        .catch((error: unknown) => ({ error })),
      getUserPreferences(accessToken)
        .then((data) => ({ data }))
        .catch((error: unknown) => ({ error })),
    ]);

    if ("error" in profileResponse) {
      setError(
        profileResponse.error instanceof Error
          ? profileResponse.error.message
          : "Could not load your profile.",
      );
      setIsLoading(false);
      return;
    }

    setProfile(profileResponse.data);
    setForm(createProfileForm(profileResponse.data));

    if ("error" in ticketsResponse) {
      setSupportError(
        ticketsResponse.error instanceof Error
          ? ticketsResponse.error.message
          : "Could not load your support tickets.",
      );
      setTickets([]);
    } else {
      setTickets(ticketsResponse.data);
    }

    if ("error" in bookingsResponse) {
      setBookingError(
        bookingsResponse.error instanceof Error
          ? bookingsResponse.error.message
          : "Could not load your bookings.",
      );
      setBookings([]);
    } else {
      setBookings(bookingsResponse.data);
    }

    if ("error" in notificationsResponse) {
      setNotificationError(
        notificationsResponse.error instanceof Error
          ? notificationsResponse.error.message
          : "Could not load your notifications.",
      );
      setNotifications([]);
    } else {
      setNotifications(notificationsResponse.data);
    }

    if ("error" in referralResponse) {
      setReferralError(
        referralResponse.error instanceof Error
          ? referralResponse.error.message
          : "Could not load your referral summary.",
      );
      setReferral(null);
    } else {
      setReferral(referralResponse.data);
    }

    if ("error" in paymentMethodsResponse) {
      setPaymentError(
        paymentMethodsResponse.error instanceof Error
          ? paymentMethodsResponse.error.message
          : "Could not load your payment methods.",
      );
      setPaymentMethods([]);
    } else {
      setPaymentMethods(paymentMethodsResponse.data);
    }

    if ("error" in preferencesResponse) {
      setPreferenceError(
        preferencesResponse.error instanceof Error
          ? preferencesResponse.error.message
          : "Could not load your notification preferences.",
      );
      setPreferences(null);
      setNotificationSettings(defaultCustomerNotificationSettings);
      setPushNotificationsEnabled(true);
    } else {
      setPreferences(preferencesResponse.data);
      setNotificationSettings(
        readCustomerNotificationPreferences(
          preferencesResponse.data.notificationPreferences,
        ),
      );
      setPushNotificationsEnabled(
        preferencesResponse.data.pushNotificationsEnabled,
      );
    }

    setIsLoading(false);
  };

  const handleSavePreferences = async () => {
    if (!supabase) {
      setPreferenceError(setupError || "Supabase login is not configured.");
      return;
    }

    setIsSavingPreferences(true);
    setPreferenceError("");
    setPreferenceSuccess("");

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError || !sessionData.session?.access_token) {
      router.push("/login");
      return;
    }

    try {
      const updated = await updateUserPreferences(
        sessionData.session.access_token,
        {
          pushNotificationsEnabled,
          notificationPreferences: { ...notificationSettings },
        },
      );
      setPreferences(updated);
      setNotificationSettings(
        readCustomerNotificationPreferences(updated.notificationPreferences),
      );
      setPushNotificationsEnabled(updated.pushNotificationsEnabled);
      setPreferenceSuccess("Notification preferences saved.");
    } catch (error) {
      setPreferenceError(
        error instanceof Error
          ? error.message
          : "Could not save your notification preferences.",
      );
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const toggleNotificationSetting = (
    key: keyof CustomerNotificationSettings,
  ) => {
    setNotificationSettings((current) => ({
      ...current,
      [key]: !current[key],
    }));
    setPreferenceSuccess("");
  };

  useEffect(() => {
    void loadAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase) {
      setError(setupError || "Supabase login is not configured.");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session?.access_token) {
      router.push("/login");
      return;
    }

    try {
      const updated = await updateCurrentUserProfile(
        sessionData.session.access_token,
        {
          fullName: form.fullName,
          contactNumber: form.contactNumber || null,
          address: form.address || null,
          businessName: form.businessName || null,
        },
      );

      setProfile(updated);
      setForm(createProfileForm(updated));
      setIsEditing(false);
      setSuccess("Profile updated.");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not update your profile.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setForm(createProfileForm(profile));
    }
    setError("");
    setSuccess("");
    setIsEditing(false);
  };

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase) {
      setPasswordError(setupError || "Supabase login is not configured.");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    setPasswordError("");
    setSuccess("");

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError || !sessionData.session?.access_token) {
      router.push("/login");
      return;
    }

    try {
      await updateCurrentUserPassword(sessionData.session.access_token, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSuccess("Password updated.");
    } catch (error) {
      setPasswordError(
        error instanceof Error ? error.message : "Could not update your password.",
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/login");
  };

  const handleMarkNotificationRead = async (notificationId: string) => {
    if (!supabase) {
      setNotificationError(setupError || "Supabase login is not configured.");
      return;
    }

    setMarkingNotificationId(notificationId);
    setNotificationError("");

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError || !sessionData.session?.access_token) {
      router.push("/login");
      return;
    }

    try {
      const updated = await markNotificationRead(
        sessionData.session.access_token,
        notificationId,
      );
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId ? updated : notification,
        ),
      );
    } catch (error) {
      setNotificationError(
        error instanceof Error
          ? error.message
          : "Could not mark this notification as read.",
      );
    } finally {
      setMarkingNotificationId("");
    }
  };

  const handleSelectTicket = async (ticketId: string) => {
    if (selectedTicketId === ticketId) {
      setSelectedTicketId("");
      setTicketReplies([]);
      setReplyMessage("");
      setReplyError("");
      return;
    }

    if (!supabase) {
      setReplyError(setupError || "Supabase login is not configured.");
      return;
    }

    setSelectedTicketId(ticketId);
    setTicketReplies([]);
    setReplyMessage("");
    setReplyError("");
    setIsLoadingReplies(true);

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError || !sessionData.session?.access_token) {
      router.push("/login");
      return;
    }

    try {
      const replies = await listSupportTicketReplies(
        sessionData.session.access_token,
        ticketId,
      );
      setTicketReplies(replies);
    } catch (error) {
      setReplyError(
        error instanceof Error
          ? error.message
          : "Could not load support ticket replies.",
      );
    } finally {
      setIsLoadingReplies(false);
    }
  };

  const handleSendTicketReply = async () => {
    if (!selectedTicketId || !replyMessage.trim()) {
      setReplyError("Write a reply before sending.");
      return;
    }

    if (!supabase) {
      setReplyError(setupError || "Supabase login is not configured.");
      return;
    }

    setIsSendingReply(true);
    setReplyError("");

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError || !sessionData.session?.access_token) {
      router.push("/login");
      return;
    }

    try {
      const reply = await createSupportTicketReply(
        sessionData.session.access_token,
        selectedTicketId,
        replyMessage.trim(),
      );
      setTicketReplies((current) => [...current, reply]);
      setReplyMessage("");
    } catch (error) {
      setReplyError(
        error instanceof Error ? error.message : "Could not send your reply.",
      );
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleSavePaymentMethod = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase) {
      setPaymentError(setupError || "Supabase login is not configured.");
      return;
    }

    if (!paymentForm.label.trim()) {
      setPaymentError("Payment method label is required.");
      return;
    }

    setIsSavingPaymentMethod(true);
    setPaymentError("");
    setSuccess("");

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError || !sessionData.session?.access_token) {
      router.push("/login");
      return;
    }

    try {
      const method = await upsertCustomerPaymentMethod(
        sessionData.session.access_token,
        {
          methodType: paymentForm.methodType,
          label: paymentForm.label,
          brand: paymentForm.brand || null,
          last4: paymentForm.last4 || null,
          isDefault: paymentForm.isDefault,
        },
      );
      setPaymentMethods((current) => [
        method,
        ...current.filter((item) => item.id !== method.id),
      ]);
      setPaymentForm({
        methodType: "cash_on_service",
        label: "Cash on service",
        brand: "",
        last4: "",
        isDefault: true,
      });
      setSuccess("Payment method saved.");
    } catch (error) {
      setPaymentError(
        error instanceof Error
          ? error.message
          : "Could not save your payment method.",
      );
    } finally {
      setIsSavingPaymentMethod(false);
    }
  };

  const handleDeletePaymentMethod = async (methodId: string) => {
    if (!supabase) {
      setPaymentError(setupError || "Supabase login is not configured.");
      return;
    }

    setDeletingPaymentMethodId(methodId);
    setPaymentError("");
    setSuccess("");

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError || !sessionData.session?.access_token) {
      router.push("/login");
      return;
    }

    try {
      await deleteCustomerPaymentMethod(sessionData.session.access_token, methodId);
      setPaymentMethods((current) =>
        current.filter((method) => method.id !== methodId),
      );
      setSuccess("Payment method removed.");
    } catch (error) {
      setPaymentError(
        error instanceof Error
          ? error.message
          : "Could not remove this payment method.",
      );
    } finally {
      setDeletingPaymentMethodId("");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-['Poppins',sans-serif] text-3xl md:text-4xl text-gray-900 mb-2">
              Account
            </h1>
            <p className="font-['Poppins',sans-serif] text-base text-gray-600">
              Manage your ServEase profile and support requests.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={loadAccount}
              disabled={isLoading || isSaving}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-['Poppins',sans-serif] text-sm text-gray-700 disabled:opacity-60"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 font-['Poppins',sans-serif] text-sm text-white"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="bg-white rounded-2xl shadow-md p-8">
            <p className="font-['Poppins',sans-serif] text-gray-600">Loading account...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="font-['Poppins',sans-serif] text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && !isLoading && (
          <div className="mb-6 rounded-2xl border border-[#00BF63]/20 bg-[#00BF63]/10 p-6">
            <p className="font-['Poppins',sans-serif] text-sm text-[#007A3F]">
              {success}
            </p>
          </div>
        )}

        {profile && !isLoading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#00BF63]/10 flex items-center justify-center">
                      <UserRound className="text-[#00BF63]" size={24} />
                    </div>
                    <div>
                      <h2 className="font-['Poppins',sans-serif] text-xl text-gray-900">
                        {profile.user.fullName ?? "ServEase User"}
                      </h2>
                      <p className="font-['Poppins',sans-serif] text-sm text-gray-500">
                        {profile.user.email}
                      </p>
                    </div>
                  </div>

                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 font-['Poppins',sans-serif] text-sm text-gray-700"
                    >
                      <Edit3 size={16} />
                      Edit
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <TextInput
                      label="Full Name"
                      value={form.fullName}
                      onChange={(value) => setForm({ ...form, fullName: value })}
                      required
                    />
                    <TextInput
                      label="Contact Number"
                      value={form.contactNumber}
                      onChange={(value) => setForm({ ...form, contactNumber: value })}
                    />
                    {profile.customerProfile && (
                      <TextInput
                        label="Address"
                        value={form.address}
                        onChange={(value) => setForm({ ...form, address: value })}
                      />
                    )}
                    {profile.providerProfile && (
                      <TextInput
                        label="Business Name"
                        value={form.businessName}
                        onChange={(value) => setForm({ ...form, businessName: value })}
                      />
                    )}
                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#00BF63] px-4 py-2 font-['Poppins',sans-serif] text-sm text-white disabled:opacity-70"
                      >
                        <Save size={16} />
                        {isSaving ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-['Poppins',sans-serif] text-sm text-gray-700 disabled:opacity-70"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <dl className="space-y-3">
                    <ProfileRow label="Role" value={profile.user.role} />
                    <ProfileRow label="Status" value={profile.user.status} />
                    <ProfileRow
                      label="Contact"
                      value={profile.user.contactNumber ?? "Not provided"}
                    />
                    {profile.customerProfile && (
                      <ProfileRow
                        label="Address"
                        value={profile.customerProfile.address ?? "Not provided"}
                      />
                    )}
                  </dl>
                )}
              </section>

              <section className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#00BF63]/10 flex items-center justify-center">
                    <ShieldCheck className="text-[#00BF63]" size={24} />
                  </div>
                  <div>
                    <h2 className="font-['Poppins',sans-serif] text-xl text-gray-900">
                      Profile Details
                    </h2>
                    <p className="font-['Poppins',sans-serif] text-sm text-gray-500">
                      Synced from backend services
                    </p>
                  </div>
                </div>

                {profile.providerProfile ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="text-[#00BF63]" size={20} />
                      <p className="font-['Poppins',sans-serif] text-sm text-gray-700">
                        Provider verification: {profile.providerProfile.verificationStatus}
                      </p>
                    </div>
                    <ProfileRow
                      label="Business"
                      value={profile.providerProfile.businessName ?? "Not provided"}
                    />
                    <ProfileRow
                      label="Rating"
                      value={`${profile.providerProfile.averageRating.toFixed(1)} (${profile.providerProfile.reviewCount} reviews)`}
                    />
                  </div>
                ) : (
                  <p className="font-['Poppins',sans-serif] text-sm text-gray-600">
                    Customer profile is active.
                  </p>
                )}
              </section>
            </div>

            <section className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#00BF63]/10 flex items-center justify-center">
                    <Bell className="text-[#00BF63]" size={24} />
                  </div>
                  <div>
                    <h2 className="font-['Poppins',sans-serif] text-xl text-gray-900">
                      Notifications
                    </h2>
                    <p className="font-['Poppins',sans-serif] text-sm text-gray-500">
                      Account and booking updates from ServEase.
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-[#00BF63]/10 px-3 py-1 font-['Poppins',sans-serif] text-xs text-[#007A3F]">
                  {notifications.filter((notification) => !notification.isRead).length} unread
                </span>
              </div>

              {notificationError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="font-['Poppins',sans-serif] text-sm text-red-700">
                    {notificationError}
                  </p>
                </div>
              ) : notifications.length === 0 ? (
                <p className="font-['Poppins',sans-serif] text-sm text-gray-600">
                  No notifications yet.
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.slice(0, 8).map((notification) => {
                    const href = getNotificationHref(notification);
                    const content = (
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-['Poppins',sans-serif] text-base text-gray-900">
                            {notification.title ?? "ServEase update"}
                          </h3>
                          {!notification.isRead && (
                            <span className="rounded-full bg-black px-2 py-0.5 font-['Poppins',sans-serif] text-[11px] text-white">
                              New
                            </span>
                          )}
                        </div>
                        {notification.body && (
                          <p className="mt-1 font-['Poppins',sans-serif] text-sm text-gray-600">
                            {notification.body}
                          </p>
                        )}
                        <p className="mt-1 font-['Poppins',sans-serif] text-xs text-gray-400">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                    );

                    return (
                      <article
                        key={notification.id}
                        className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 md:flex-row md:items-center md:justify-between"
                      >
                        {href ? (
                          <Link href={href} className="flex-1">
                            {content}
                          </Link>
                        ) : (
                          <div className="flex-1">{content}</div>
                        )}
                        {!notification.isRead && (
                          <button
                            type="button"
                            onClick={() =>
                              handleMarkNotificationRead(notification.id)
                            }
                            disabled={markingNotificationId === notification.id}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 font-['Poppins',sans-serif] text-sm text-gray-700 disabled:opacity-60"
                          >
                            <CheckCircle2 size={16} />
                            {markingNotificationId === notification.id
                              ? "Saving..."
                              : "Mark Read"}
                          </button>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#00BF63]/10 flex items-center justify-center">
                    <Bell className="text-[#00BF63]" size={24} />
                  </div>
                  <div>
                    <h2 className="font-['Poppins',sans-serif] text-xl text-gray-900">
                      Notification Preferences
                    </h2>
                    <p className="font-['Poppins',sans-serif] text-sm text-gray-500">
                      Choose which ServEase alerts you want to receive.
                    </p>
                  </div>
                </div>
                {preferences?.updatedAt && (
                  <span className="rounded-full bg-[#00BF63]/10 px-3 py-1 font-['Poppins',sans-serif] text-xs text-[#007A3F]">
                    Last saved {formatDate(preferences.updatedAt)}
                  </span>
                )}
              </div>

              {preferenceError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="font-['Poppins',sans-serif] text-sm text-red-700">
                    {preferenceError}
                  </p>
                </div>
              )}

              {preferenceSuccess && (
                <div className="mb-4 rounded-xl border border-[#00BF63]/20 bg-[#00BF63]/10 p-4">
                  <p className="font-['Poppins',sans-serif] text-sm text-[#007A3F]">
                    {preferenceSuccess}
                  </p>
                </div>
              )}

              <div className="divide-y divide-gray-100">
                <PreferenceToggleRow
                  label="Enable push notifications"
                  description="Master switch for all push alerts on this account."
                  checked={pushNotificationsEnabled}
                  onChange={() => {
                    setPushNotificationsEnabled((current) => !current);
                    setPreferenceSuccess("");
                  }}
                />
                <PreferenceToggleRow
                  label="Booking confirmations"
                  description="Alerts when a provider accepts your booking."
                  checked={notificationSettings.bookingConfirmations}
                  onChange={() => toggleNotificationSetting("bookingConfirmations")}
                />
                <PreferenceToggleRow
                  label="Booking reminders"
                  description="Reminders before your scheduled service."
                  checked={notificationSettings.bookingReminders}
                  onChange={() => toggleNotificationSetting("bookingReminders")}
                />
                <PreferenceToggleRow
                  label="Booking updates"
                  description="Status changes, cancellations, and rescheduling."
                  checked={notificationSettings.bookingUpdates}
                  onChange={() => toggleNotificationSetting("bookingUpdates")}
                />
                <PreferenceToggleRow
                  label="Provider messages"
                  description="Messages and replies from your service providers."
                  checked={notificationSettings.providerMessages}
                  onChange={() => toggleNotificationSetting("providerMessages")}
                />
                <PreferenceToggleRow
                  label="Payment receipts"
                  description="Receipts and refund updates for your payments."
                  checked={notificationSettings.paymentReceipts}
                  onChange={() => toggleNotificationSetting("paymentReceipts")}
                />
                <PreferenceToggleRow
                  label="Promotional offers"
                  description="Discounts, referral rewards, and seasonal offers."
                  checked={notificationSettings.promotionalOffers}
                  onChange={() => toggleNotificationSetting("promotionalOffers")}
                />
                <PreferenceToggleRow
                  label="Platform updates"
                  description="New features and important platform announcements."
                  checked={notificationSettings.platformUpdates}
                  onChange={() => toggleNotificationSetting("platformUpdates")}
                />
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => void handleSavePreferences()}
                  disabled={isSavingPreferences}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#00BF63] px-4 py-2 font-['Poppins',sans-serif] text-sm text-white disabled:opacity-70"
                >
                  <Save size={16} />
                  {isSavingPreferences ? "Saving..." : "Save Preferences"}
                </button>
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-[#00BF63]/10 flex items-center justify-center">
                  <ShieldCheck className="text-[#00BF63]" size={24} />
                </div>
                <div>
                  <h2 className="font-['Poppins',sans-serif] text-xl text-gray-900">
                    Security
                  </h2>
                  <p className="font-['Poppins',sans-serif] text-sm text-gray-500">
                    Update the password for this customer account.
                  </p>
                </div>
              </div>

              {passwordError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="font-['Poppins',sans-serif] text-sm text-red-700">
                    {passwordError}
                  </p>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="grid gap-4 md:grid-cols-3">
                <PasswordInput
                  label="Current Password"
                  value={passwordForm.currentPassword}
                  onChange={(value) =>
                    setPasswordForm({ ...passwordForm, currentPassword: value })
                  }
                />
                <PasswordInput
                  label="New Password"
                  value={passwordForm.newPassword}
                  onChange={(value) =>
                    setPasswordForm({ ...passwordForm, newPassword: value })
                  }
                />
                <PasswordInput
                  label="Confirm New Password"
                  value={passwordForm.confirmPassword}
                  onChange={(value) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: value })
                  }
                />
                <div className="md:col-span-3">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 font-['Poppins',sans-serif] text-sm text-white disabled:opacity-70"
                  >
                    <ShieldCheck size={16} />
                    {isChangingPassword ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </section>

            <section className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-[#00BF63]/10 flex items-center justify-center">
                  <Gift className="text-[#00BF63]" size={24} />
                </div>
                <div>
                  <h2 className="font-['Poppins',sans-serif] text-xl text-gray-900">
                    Referrals
                  </h2>
                  <p className="font-['Poppins',sans-serif] text-sm text-gray-500">
                    Invite customers with your ServEase referral link.
                  </p>
                </div>
              </div>

              {referralError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="font-['Poppins',sans-serif] text-sm text-red-700">
                    {referralError}
                  </p>
                </div>
              ) : !referral ? (
                <p className="font-['Poppins',sans-serif] text-sm text-gray-600">
                  Referral summary is not available yet.
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <ReferralMetric label="Code" value={referral.referralCode} />
                    <ReferralMetric
                      label="Completed"
                      value={String(referral.completedReferrals)}
                    />
                    <ReferralMetric
                      label="Pending"
                      value={String(referral.pendingReferrals)}
                    />
                    <ReferralMetric
                      label="Rewards"
                      value={formatPrice(referral.totalRewards)}
                    />
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="font-['Poppins',sans-serif] text-sm text-gray-500">
                      Referral Link
                    </p>
                    <p className="mt-1 break-all font-['Poppins',sans-serif] text-sm text-gray-900">
                      {getReferralLink(referral)}
                    </p>
                  </div>
                </div>
              )}
            </section>

            <section className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-[#00BF63]/10 flex items-center justify-center">
                  <CreditCard className="text-[#00BF63]" size={24} />
                </div>
                <div>
                  <h2 className="font-['Poppins',sans-serif] text-xl text-gray-900">
                    Payment Methods
                  </h2>
                  <p className="font-['Poppins',sans-serif] text-sm text-gray-500">
                    Manage payment options used for web booking reservations.
                  </p>
                </div>
              </div>

              {paymentError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="font-['Poppins',sans-serif] text-sm text-red-700">
                    {paymentError}
                  </p>
                </div>
              )}

              <form
                onSubmit={handleSavePaymentMethod}
                className="mb-6 grid gap-4 md:grid-cols-[180px_1fr_1fr_120px_auto]"
              >
                <label className="block">
                  <span className="font-['Poppins',sans-serif] text-sm text-gray-700 block mb-1">
                    Type
                  </span>
                  <select
                    value={paymentForm.methodType}
                    onChange={(event) =>
                      setPaymentForm({
                        ...paymentForm,
                        methodType: event.target.value as CustomerPaymentMethodType,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-['Poppins',sans-serif] text-sm focus:border-[#00BF63] focus:outline-none"
                  >
                    <option value="cash_on_service">Cash</option>
                    <option value="gcash">GCash</option>
                    <option value="paymaya">PayMaya</option>
                    <option value="card">Card</option>
                  </select>
                </label>
                <TextInput
                  label="Label"
                  value={paymentForm.label}
                  onChange={(value) =>
                    setPaymentForm({ ...paymentForm, label: value })
                  }
                  required
                />
                <TextInput
                  label="Brand"
                  value={paymentForm.brand}
                  onChange={(value) =>
                    setPaymentForm({ ...paymentForm, brand: value })
                  }
                />
                <TextInput
                  label="Last 4"
                  value={paymentForm.last4}
                  onChange={(value) =>
                    setPaymentForm({ ...paymentForm, last4: value })
                  }
                />
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isSavingPaymentMethod}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#00BF63] px-4 py-3 font-['Poppins',sans-serif] text-sm text-white disabled:opacity-70"
                  >
                    <Save size={16} />
                    {isSavingPaymentMethod ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>

              {paymentMethods.length === 0 ? (
                <p className="font-['Poppins',sans-serif] text-sm text-gray-600">
                  No payment methods yet.
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-['Poppins',sans-serif] text-base text-gray-900">
                            {method.label}
                          </h3>
                          {method.isDefault && <StatusBadge status="default" />}
                        </div>
                        <p className="font-['Poppins',sans-serif] text-sm text-gray-500">
                          {formatPaymentMethodType(method.methodType)}
                          {method.last4 ? ` ending in ${method.last4}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeletePaymentMethod(method.id)}
                        disabled={deletingPaymentMethodId === method.id}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 font-['Poppins',sans-serif] text-sm text-gray-700 disabled:opacity-60"
                      >
                        <X size={16} />
                        {deletingPaymentMethodId === method.id
                          ? "Removing..."
                          : "Remove"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-[#00BF63]/10 flex items-center justify-center">
                  <CalendarCheck className="text-[#00BF63]" size={24} />
                </div>
                <div>
                  <h2 className="font-['Poppins',sans-serif] text-xl text-gray-900">
                    Bookings
                  </h2>
                  <p className="font-['Poppins',sans-serif] text-sm text-gray-500">
                    Customer booking requests from your account.
                  </p>
                </div>
              </div>

              {bookingError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="font-['Poppins',sans-serif] text-sm text-red-700">
                    {bookingError}
                  </p>
                </div>
              ) : bookings.length === 0 ? (
                <p className="font-['Poppins',sans-serif] text-sm text-gray-600">
                  No bookings yet.
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {bookings.map((booking) => (
                    <Link
                      key={booking.id}
                      href={`/bookings/${booking.id}`}
                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 py-4 first:pt-0 last:pb-0"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-['Poppins',sans-serif] text-base text-gray-900">
                            {booking.serviceTitle ?? booking.bookingReference}
                          </h3>
                          <StatusBadge status={booking.status} />
                        </div>
                        <p className="font-['Poppins',sans-serif] text-sm text-gray-500">
                          {formatDate(booking.scheduledAt)} - {formatPrice(booking.totalAmount)}
                        </p>
                      </div>
                      <p className="font-['Poppins',sans-serif] text-xs text-gray-400">
                        {booking.bookingReference}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-[#00BF63]/10 flex items-center justify-center">
                  <Ticket className="text-[#00BF63]" size={24} />
                </div>
                <div>
                  <h2 className="font-['Poppins',sans-serif] text-xl text-gray-900">
                    Support Tickets
                  </h2>
                  <p className="font-['Poppins',sans-serif] text-sm text-gray-500">
                    Requests submitted from your account.
                  </p>
                </div>
              </div>

              {supportError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="font-['Poppins',sans-serif] text-sm text-red-700">
                    {supportError}
                  </p>
                </div>
              ) : tickets.length === 0 ? (
                <p className="font-['Poppins',sans-serif] text-sm text-gray-600">
                  No support tickets yet.
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="py-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-['Poppins',sans-serif] text-base text-gray-900">
                              {ticket.subject}
                            </h3>
                            <StatusBadge status={ticket.status} />
                          </div>
                          <p className="font-['Poppins',sans-serif] text-sm text-gray-500">
                            {ticket.category ?? "general"} - {formatDate(ticket.createdAt)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSelectTicket(ticket.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 font-['Poppins',sans-serif] text-sm text-gray-700"
                        >
                          <Ticket size={16} />
                          {selectedTicketId === ticket.id ? "Hide Replies" : "View Replies"}
                        </button>
                      </div>

                      {selectedTicketId === ticket.id && (
                        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                          {replyError && (
                            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
                              <p className="font-['Poppins',sans-serif] text-sm text-red-700">
                                {replyError}
                              </p>
                            </div>
                          )}

                          {isLoadingReplies ? (
                            <p className="font-['Poppins',sans-serif] text-sm text-gray-600">
                              Loading replies...
                            </p>
                          ) : ticketReplies.length === 0 ? (
                            <p className="font-['Poppins',sans-serif] text-sm text-gray-600">
                              No replies yet.
                            </p>
                          ) : (
                            <div className="mb-4 space-y-3">
                              {ticketReplies.map((reply) => (
                                <div
                                  key={reply.id}
                                  className="rounded-lg bg-white p-3"
                                >
                                  <p className="font-['Poppins',sans-serif] text-sm text-gray-700">
                                    {reply.message}
                                  </p>
                                  <p className="mt-1 font-['Poppins',sans-serif] text-xs text-gray-400">
                                    {formatDate(reply.createdAt)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                            <textarea
                              value={replyMessage}
                              onChange={(event) => setReplyMessage(event.target.value)}
                              rows={3}
                              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-['Poppins',sans-serif] text-sm focus:border-[#00BF63] focus:outline-none"
                              placeholder="Add a reply"
                            />
                            <button
                              type="button"
                              onClick={handleSendTicketReply}
                              disabled={isSendingReply}
                              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#00BF63] px-4 py-2 font-['Poppins',sans-serif] text-sm text-white disabled:opacity-70"
                            >
                              <Send size={16} />
                              {isSendingReply ? "Sending..." : "Send"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="font-['Poppins',sans-serif] text-sm text-gray-700 block mb-1">
        {label}
      </span>
      <input
        type="text"
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-['Poppins',sans-serif] text-sm focus:border-[#00BF63] focus:outline-none"
      />
    </label>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="font-['Poppins',sans-serif] text-sm text-gray-700 block mb-1">
        {label}
      </span>
      <input
        type="password"
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-['Poppins',sans-serif] text-sm focus:border-[#00BF63] focus:outline-none"
      />
    </label>
  );
}

function PreferenceToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div className="flex-1">
        <p className="font-['Poppins',sans-serif] text-sm font-medium text-gray-900">
          {label}
        </p>
        <p className="mt-1 font-['Poppins',sans-serif] text-xs text-gray-500">
          {description}
        </p>
      </div>
      <button
        type="button"
        onClick={onChange}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? "bg-[#00BF63]" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3 last:border-b-0">
      <dt className="font-['Poppins',sans-serif] text-sm text-gray-500">{label}</dt>
      <dd className="font-['Poppins',sans-serif] text-sm text-gray-900 text-right">
        {value}
      </dd>
    </div>
  );
}

function ReferralMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <p className="font-['Poppins',sans-serif] text-sm text-gray-500">{label}</p>
      <p className="mt-1 font-['Poppins',sans-serif] text-sm text-gray-900">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: SupportTicketSummary["status"] | BookingSummary["status"] | "default";
}) {
  const label = status.replace("_", " ");
  return (
    <span className="rounded-full bg-[#00BF63]/10 px-3 py-1 font-['Poppins',sans-serif] text-xs text-[#007A3F] capitalize">
      {label}
    </span>
  );
}

function getNotificationHref(notification: NotificationSummary) {
  const bookingId = notification.metadata?.bookingId;

  if (typeof bookingId === "string" && bookingId) {
    return `/bookings/${encodeURIComponent(bookingId)}`;
  }

  return null;
}

function getReferralLink(referral: ReferralSummary) {
  if (typeof window === "undefined") {
    return referral.referralLinkPath;
  }

  return new URL(referral.referralLinkPath, window.location.origin).toString();
}

function formatDate(value: string | null) {
  if (!value) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPaymentMethodType(methodType: CustomerPaymentMethodType) {
  return methodType.replace("_", " ");
}
