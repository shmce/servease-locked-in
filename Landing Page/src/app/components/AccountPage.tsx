"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Edit3,
  LogOut,
  RefreshCw,
  Save,
  ShieldCheck,
  CalendarCheck,
  Ticket,
  UserRound,
  X,
} from "lucide-react";
import type { BookingSummary } from "../lib/bookings";
import { createSupabaseBrowserClient } from "../lib/supabase-browser";
import type {
  CurrentUserProfile,
  UpdateCurrentUserProfileInput,
} from "../lib/current-user";
import type { SupportTicketSummary } from "../lib/support-tickets";

interface ProfileResponse {
  data?: CurrentUserProfile;
  error?: {
    message?: string;
  };
}

interface TicketResponse {
  data?: SupportTicketSummary[];
  error?: {
    message?: string;
  };
}

interface BookingResponse {
  data?: BookingSummary[];
  error?: {
    message?: string;
  };
}

interface ProfileFormState {
  fullName: string;
  contactNumber: string;
  address: string;
  businessName: string;
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
  const [form, setForm] = useState<ProfileFormState>({
    fullName: "",
    contactNumber: "",
    address: "",
    businessName: "",
  });
  const [error, setError] = useState(setupError);
  const [supportError, setSupportError] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(!setupError);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadAccount = async () => {
    if (!supabase) {
      setError(setupError || "Supabase login is not configured.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");
    setSupportError("");
    setBookingError("");
    setSuccess("");

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session?.access_token) {
      router.push("/login");
      return;
    }

    const headers = {
      authorization: `Bearer ${sessionData.session.access_token}`,
    };
    const [profileResponse, ticketsResponse, bookingsResponse] = await Promise.all([
      fetch("/api/me", { headers }),
      fetch("/api/support-tickets", { headers }),
      fetch("/api/bookings", { headers }),
    ]);
    const profilePayload = (await profileResponse.json().catch(() => null)) as
      | ProfileResponse
      | null;
    const ticketsPayload = (await ticketsResponse.json().catch(() => null)) as
      | TicketResponse
      | null;
    const bookingsPayload = (await bookingsResponse.json().catch(() => null)) as
      | BookingResponse
      | null;

    if (!profileResponse.ok || !profilePayload?.data) {
      setError(profilePayload?.error?.message ?? "Could not load your profile.");
      setIsLoading(false);
      return;
    }

    setProfile(profilePayload.data);
    setForm(createProfileForm(profilePayload.data));

    if (!ticketsResponse.ok || !ticketsPayload?.data) {
      setSupportError(
        ticketsPayload?.error?.message ?? "Could not load your support tickets.",
      );
      setTickets([]);
    } else {
      setTickets(ticketsPayload.data);
    }

    if (!bookingsResponse.ok || !bookingsPayload?.data) {
      setBookingError(
        bookingsPayload?.error?.message ?? "Could not load your bookings.",
      );
      setBookings([]);
    } else {
      setBookings(bookingsPayload.data);
    }

    setIsLoading(false);
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

    const body: UpdateCurrentUserProfileInput = {
      fullName: form.fullName,
      contactNumber: form.contactNumber || null,
      address: form.address || null,
      businessName: form.businessName || null,
    };

    const response = await fetch("/api/me", {
      method: "PATCH",
      headers: {
        authorization: `Bearer ${sessionData.session.access_token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    }).catch(() => null);

    if (!response) {
      setError("Could not reach the profile service.");
      setIsSaving(false);
      return;
    }

    const payload = (await response.json().catch(() => null)) as
      | ProfileResponse
      | null;

    if (!response.ok || !payload?.data) {
      setError(payload?.error?.message ?? "Could not update your profile.");
      setIsSaving(false);
      return;
    }

    setProfile(payload.data);
    setForm(createProfileForm(payload.data));
    setIsEditing(false);
    setIsSaving(false);
    setSuccess("Profile updated.");
  };

  const handleCancelEdit = () => {
    if (profile) {
      setForm(createProfileForm(profile));
    }
    setError("");
    setSuccess("");
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/login");
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
                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 py-4 first:pt-0 last:pb-0"
                    >
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
                      <p className="font-['Poppins',sans-serif] text-xs text-gray-400">
                        {ticket.id}
                      </p>
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

function StatusBadge({
  status,
}: {
  status: SupportTicketSummary["status"] | BookingSummary["status"];
}) {
  const label = status.replace("_", " ");
  return (
    <span className="rounded-full bg-[#00BF63]/10 px-3 py-1 font-['Poppins',sans-serif] text-xs text-[#007A3F] capitalize">
      {label}
    </span>
  );
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
