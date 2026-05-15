"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Phone,
  RefreshCw,
  UserRound,
  XCircle,
} from "lucide-react";
import type {
  BookingServiceUpdateSummary,
  BookingSummary,
} from "../lib/bookings";
import type { CurrentUserProfile } from "../lib/current-user";
import { createSupabaseBrowserClient } from "../lib/supabase-browser";

interface ApiResponse<T> {
  data?: T;
  error?: {
    message?: string;
  };
}

interface TransitionAction {
  label: string;
  nextStatus: BookingSummary["status"];
  reason?: string;
  tone: "primary" | "danger" | "neutral";
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

export function BookingDetailPage({ bookingId }: { bookingId: string }) {
  const [{ supabase, setupError }] = useState(createSupabaseState);
  const [profile, setProfile] = useState<CurrentUserProfile | null>(null);
  const [booking, setBooking] = useState<BookingSummary | null>(null);
  const [updates, setUpdates] = useState<BookingServiceUpdateSummary[]>([]);
  const [error, setError] = useState(setupError);
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(!setupError);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const loadBooking = async () => {
    if (!supabase) {
      setError(setupError || "Supabase login is not configured.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session?.access_token) {
      setError("Please sign in to view this booking.");
      setIsLoading(false);
      return;
    }

    const headers = {
      authorization: `Bearer ${sessionData.session.access_token}`,
    };
    const [bookingResponse, profileResponse, updatesResponse] = await Promise.all([
      fetch(`/api/bookings/${bookingId}`, { headers }),
      fetch("/api/me", { headers }),
      fetch(`/api/bookings/${bookingId}/service-updates`, { headers }),
    ]);
    const bookingPayload = (await bookingResponse.json().catch(() => null)) as
      | ApiResponse<BookingSummary>
      | null;
    const profilePayload = (await profileResponse.json().catch(() => null)) as
      | ApiResponse<CurrentUserProfile>
      | null;
    const updatesPayload = (await updatesResponse.json().catch(() => null)) as
      | ApiResponse<BookingServiceUpdateSummary[]>
      | null;

    if (!bookingResponse.ok || !bookingPayload?.data) {
      setError(bookingPayload?.error?.message ?? "Could not load this booking.");
      setIsLoading(false);
      return;
    }

    setBooking(bookingPayload.data);

    if (profileResponse.ok && profilePayload?.data) {
      setProfile(profilePayload.data);
    }

    if (updatesResponse.ok && updatesPayload?.data) {
      setUpdates(updatesPayload.data);
    } else {
      setUpdates([]);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    void loadBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId, supabase]);

  const transitionBooking = async (action: TransitionAction) => {
    if (!supabase || !booking) {
      return;
    }

    setIsTransitioning(true);
    setError("");
    setSuccess("");

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session?.access_token) {
      setError("Please sign in to update this booking.");
      setIsTransitioning(false);
      return;
    }

    const response = await fetch(`/api/bookings/${booking.id}`, {
      method: "PATCH",
      headers: {
        authorization: `Bearer ${sessionData.session.access_token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        currentStatus: booking.status,
        nextStatus: action.nextStatus,
        reason: action.reason ?? null,
        explanation: null,
      }),
    }).catch(() => null);

    if (!response) {
      setError("Could not reach the booking service.");
      setIsTransitioning(false);
      return;
    }

    const payload = (await response.json().catch(() => null)) as
      | ApiResponse<BookingSummary>
      | null;

    if (!response.ok || !payload?.data) {
      setError(payload?.error?.message ?? "Could not update this booking.");
      setIsTransitioning(false);
      return;
    }

    setBooking(payload.data);
    setSuccess(`Booking moved to ${formatStatus(payload.data.status)}.`);
    setIsTransitioning(false);
  };

  const actions = booking && profile ? getAvailableActions(booking, profile) : [];

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/account"
          className="mb-8 inline-flex items-center gap-2 font-['Poppins',sans-serif] text-sm text-gray-600"
        >
          <ArrowLeft size={17} />
          Back to account
        </Link>

        {isLoading && (
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <p className="font-['Poppins',sans-serif] text-gray-600">Loading booking...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="font-['Poppins',sans-serif] text-sm text-red-700">{error}</p>
          </div>
        )}

        {booking && !isLoading && (
          <div className="space-y-6">
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-['Poppins',sans-serif] text-sm text-[#00BF63]">
                    {booking.bookingReference}
                  </p>
                  <h1 className="mt-2 font-['Poppins',sans-serif] text-3xl text-gray-900 md:text-4xl">
                    {booking.serviceTitle ?? "ServEase Booking"}
                  </h1>
                  <p className="mt-3 font-['Poppins',sans-serif] text-base text-gray-600">
                    Status: <span className="capitalize">{formatStatus(booking.status)}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadBooking}
                  disabled={isLoading || isTransitioning}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-['Poppins',sans-serif] text-sm text-gray-700 disabled:opacity-60"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>

              {success && (
                <div className="mt-6 rounded-xl border border-[#00BF63]/20 bg-[#00BF63]/10 p-4">
                  <p className="font-['Poppins',sans-serif] text-sm text-[#007A3F]">
                    {success}
                  </p>
                </div>
              )}

              {actions.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {actions.map((action) => (
                    <button
                      key={`${action.label}-${action.nextStatus}`}
                      type="button"
                      onClick={() => transitionBooking(action)}
                      disabled={isTransitioning}
                      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-['Poppins',sans-serif] text-sm text-white disabled:opacity-60 ${
                        action.tone === "danger"
                          ? "bg-red-600"
                          : action.tone === "neutral"
                            ? "bg-black"
                            : "bg-[#00BF63]"
                      }`}
                    >
                      {action.tone === "danger" ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                      {isTransitioning ? "Updating..." : action.label}
                    </button>
                  ))}
                </div>
              )}
            </section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <section className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="mb-5 font-['Poppins',sans-serif] text-xl text-gray-900">
                  Booking Details
                </h2>
                <dl className="space-y-4">
                  <DetailRow icon={CalendarClock} label="Schedule" value={formatDateTime(booking.scheduledAt)} />
                  <DetailRow icon={MapPin} label="Address" value={booking.serviceAddress ?? "Not provided"} />
                  <DetailRow icon={UserRound} label="Customer" value={booking.customerFullName ?? booking.customerId} />
                  <DetailRow icon={Phone} label="Contact" value={booking.customerContactNumber ?? "Not provided"} />
                  <DetailRow label="Total" value={formatPrice(booking.totalAmount)} />
                </dl>
              </section>

              <section className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="mb-5 font-['Poppins',sans-serif] text-xl text-gray-900">
                  Attachments
                </h2>
                {booking.attachments?.length ? (
                  <div className="space-y-3">
                    {booking.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={attachment.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-xl border border-gray-200 p-4 font-['Poppins',sans-serif] text-sm text-gray-700"
                      >
                        {attachment.fileName ?? attachment.mediaKind}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="font-['Poppins',sans-serif] text-sm text-gray-600">
                    No attachments have been added.
                  </p>
                )}
              </section>
            </div>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00BF63]/10">
                  <ClipboardList className="text-[#00BF63]" size={24} />
                </div>
                <div>
                  <h2 className="font-['Poppins',sans-serif] text-xl text-gray-900">
                    Service Updates
                  </h2>
                  <p className="font-['Poppins',sans-serif] text-sm text-gray-500">
                    Progress notes from the provider.
                  </p>
                </div>
              </div>

              {updates.length === 0 ? (
                <p className="font-['Poppins',sans-serif] text-sm text-gray-600">
                  No service updates yet.
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {updates.map((update) => (
                    <article key={update.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="font-['Poppins',sans-serif] text-base text-gray-900 capitalize">
                          {update.updateType}
                        </h3>
                        <p className="font-['Poppins',sans-serif] text-xs text-gray-400">
                          {formatDateTime(update.createdAt)}
                        </p>
                      </div>
                      {update.message && (
                        <p className="mt-2 font-['Poppins',sans-serif] text-sm text-gray-600">
                          {update.message}
                        </p>
                      )}
                    </article>
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

function getAvailableActions(
  booking: BookingSummary,
  profile: CurrentUserProfile,
): TransitionAction[] {
  const isCustomer = profile.user.id === booking.customerId;
  const isProvider = profile.providerProfile?.id === booking.providerId;

  if (isProvider) {
    if (booking.status === "pending") {
      return [
        { label: "Confirm", nextStatus: "confirmed", tone: "primary" },
        { label: "Reject", nextStatus: "rejected", reason: "provider_rejected", tone: "danger" },
      ];
    }

    if (booking.status === "confirmed") {
      return [
        { label: "Start Service", nextStatus: "in_progress", tone: "primary" },
        { label: "Cancel", nextStatus: "cancelled", reason: "provider_cancelled", tone: "danger" },
      ];
    }

    if (booking.status === "in_progress") {
      return [
        { label: "Complete", nextStatus: "completed", tone: "primary" },
        { label: "Cancel", nextStatus: "cancelled", reason: "provider_cancelled", tone: "danger" },
      ];
    }
  }

  if (isCustomer && ["pending", "confirmed", "in_progress"].includes(booking.status)) {
    return [
      { label: "Cancel Booking", nextStatus: "cancelled", reason: "customer_cancelled", tone: "danger" },
    ];
  }

  return [];
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof CalendarClock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-gray-100 pb-3 last:border-b-0">
      {Icon && <Icon className="mt-0.5 text-[#00BF63]" size={18} />}
      <div className="flex-1">
        <dt className="font-['Poppins',sans-serif] text-sm text-gray-500">{label}</dt>
        <dd className="font-['Poppins',sans-serif] text-sm text-gray-900">{value}</dd>
      </div>
    </div>
  );
}

function formatStatus(status: BookingSummary["status"]) {
  return status.replace("_", " ");
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);
}
