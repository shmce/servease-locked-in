"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  Star,
  UserRound,
  XCircle,
} from "lucide-react";
import {
  getBookingTrackingSnapshot,
  getCustomerBooking,
  listBookingServiceUpdates,
  transitionBookingStatus,
  type BookingServiceUpdateSummary,
  type BookingSummary,
  type BookingTrackingSnapshot,
} from "../lib/bookings";
import {
  getCurrentUserProfile,
  type CurrentUserProfile,
} from "../lib/current-user";
import { createReview, type ReviewSummary } from "../lib/reviews";
import {
  createPayment,
  listCustomerPaymentMethods,
  type CustomerPaymentMethodSummary,
  type PaymentSummary,
} from "../lib/payments";
import { createBookingIssueSupportTicket } from "../lib/support-tickets";
import { createSupabaseBrowserClient } from "../lib/supabase-browser";

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
  const [tracking, setTracking] = useState<BookingTrackingSnapshot | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<CustomerPaymentMethodSummary[]>([]);
  const [error, setError] = useState(setupError);
  const [trackingError, setTrackingError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(!setupError);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [submittedReview, setSubmittedReview] = useState<ReviewSummary | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cash_on_service");
  const [promoCode, setPromoCode] = useState("");
  const [isReservingPayment, setIsReservingPayment] = useState(false);
  const [reservedPayment, setReservedPayment] = useState<PaymentSummary | null>(null);
  const [issueMessage, setIssueMessage] = useState("");
  const [issueError, setIssueError] = useState("");
  const [isReportingIssue, setIsReportingIssue] = useState(false);
  const [reportedIssueId, setReportedIssueId] = useState("");

  const loadBooking = async () => {
    if (!supabase) {
      setError(setupError || "Supabase login is not configured.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");
    setTrackingError("");
    setPaymentError("");
    setIssueError("");
    setSuccess("");

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session?.access_token) {
      setError("Please sign in to view this booking.");
      setIsLoading(false);
      return;
    }

    const accessToken = sessionData.session.access_token;
    const [
      bookingResponse,
      profileResponse,
      updatesResponse,
      trackingResponse,
      paymentMethodsResponse,
    ] = await Promise.all([
        getCustomerBooking(bookingId, accessToken)
          .then((data) => ({ data }))
          .catch((error: unknown) => ({ error })),
        getCurrentUserProfile(accessToken)
          .then((data) => ({ data }))
          .catch((error: unknown) => ({ error })),
        listBookingServiceUpdates(bookingId, accessToken)
          .then((data) => ({ data }))
          .catch((error: unknown) => ({ error })),
        getBookingTrackingSnapshot(bookingId, accessToken)
          .then((data) => ({ data }))
          .catch((error: unknown) => ({ error })),
        listCustomerPaymentMethods(accessToken)
          .then((data) => ({ data }))
          .catch((error: unknown) => ({ error })),
      ]);

    if ("error" in bookingResponse) {
      setError(
        bookingResponse.error instanceof Error
          ? bookingResponse.error.message
          : "Could not load this booking.",
      );
      setIsLoading(false);
      return;
    }

    setBooking(bookingResponse.data);

    if ("data" in profileResponse) {
      setProfile(profileResponse.data);
    }

    if ("data" in updatesResponse) {
      setUpdates(updatesResponse.data);
    } else {
      setUpdates([]);
    }

    if ("data" in trackingResponse) {
      setTracking(trackingResponse.data);
    } else {
      setTracking(null);
      setTrackingError(
        trackingResponse.error instanceof Error
          ? trackingResponse.error.message
          : "Could not load booking tracking.",
      );
    }

    if ("data" in paymentMethodsResponse) {
      setPaymentMethods(paymentMethodsResponse.data);
      const defaultMethod =
        paymentMethodsResponse.data.find((method) => method.isDefault) ??
        paymentMethodsResponse.data[0];
      if (defaultMethod) {
        setSelectedPaymentMethod(defaultMethod.methodType);
      }
    } else {
      setPaymentMethods([]);
      setPaymentError(
        paymentMethodsResponse.error instanceof Error
          ? paymentMethodsResponse.error.message
          : "Could not load payment methods.",
      );
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

    try {
      const updated = await transitionBookingStatus(
        sessionData.session.access_token,
        {
          bookingId: booking.id,
          currentStatus: booking.status,
          nextStatus: action.nextStatus,
          reason: action.reason ?? null,
          explanation: null,
        },
      );
      setBooking(updated);
      setSuccess(`Booking moved to ${formatStatus(updated.status)}.`);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not update this booking.",
      );
    } finally {
      setIsTransitioning(false);
    }
  };

  const actions = booking && profile ? getAvailableActions(booking, profile) : [];
  const canReviewBooking =
    Boolean(booking && profile?.user.id === booking.customerId) &&
    booking?.status === "completed" &&
    !submittedReview;
  const canReservePayment =
    Boolean(booking && profile?.user.id === booking.customerId) &&
    Boolean(booking && !["cancelled", "rejected"].includes(booking.status)) &&
    !reservedPayment;

  const submitReview = async () => {
    if (!supabase || !booking) {
      return;
    }

    setIsSubmittingReview(true);
    setReviewError("");
    setSuccess("");

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session?.access_token) {
      setReviewError("Please sign in to leave a review.");
      setIsSubmittingReview(false);
      return;
    }

    try {
      const review = await createReview(sessionData.session.access_token, {
        bookingId: booking.id,
        rating: reviewRating,
        reviewText: reviewText.trim() || null,
      });
      setSubmittedReview(review);
      setReviewText("");
      setReviewRating(review.rating);
      setSuccess("Review submitted.");
    } catch (error) {
      setReviewError(
        error instanceof Error ? error.message : "Could not submit your review.",
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const reservePayment = async () => {
    if (!supabase || !booking) {
      return;
    }

    setIsReservingPayment(true);
    setPaymentError("");
    setSuccess("");

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session?.access_token) {
      setPaymentError("Please sign in to reserve payment.");
      setIsReservingPayment(false);
      return;
    }

    try {
      const payment = await createPayment(sessionData.session.access_token, {
        bookingId: booking.id,
        paymentMethod: selectedPaymentMethod,
        promoCode: promoCode.trim() || null,
      });
      setReservedPayment(payment);
      setPromoCode("");
      setSuccess("Payment reserved.");
    } catch (error) {
      setPaymentError(
        error instanceof Error ? error.message : "Could not reserve payment.",
      );
    } finally {
      setIsReservingPayment(false);
    }
  };

  const reportIssue = async () => {
    if (!supabase || !booking) {
      return;
    }

    if (!issueMessage.trim()) {
      setIssueError("Describe the issue before submitting.");
      return;
    }

    setIsReportingIssue(true);
    setIssueError("");
    setSuccess("");

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session?.access_token) {
      setIssueError("Please sign in to report an issue.");
      setIsReportingIssue(false);
      return;
    }

    try {
      const ticket = await createBookingIssueSupportTicket(
        sessionData.session.access_token,
        {
          bookingId: booking.id,
          bookingReference: booking.bookingReference,
          message: issueMessage.trim(),
        },
      );
      setReportedIssueId(ticket.id);
      setIssueMessage("");
      setSuccess("Issue report submitted.");
    } catch (error) {
      setIssueError(
        error instanceof Error ? error.message : "Could not submit issue report.",
      );
    } finally {
      setIsReportingIssue(false);
    }
  };

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

            {(canReservePayment || reservedPayment) && (
              <section className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00BF63]/10">
                    <CreditCard className="text-[#00BF63]" size={24} />
                  </div>
                  <div>
                    <h2 className="font-['Poppins',sans-serif] text-xl text-gray-900">
                      Payment
                    </h2>
                    <p className="font-['Poppins',sans-serif] text-sm text-gray-500">
                      Reserve payment for this booking through ServEase.
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

                {reservedPayment ? (
                  <div className="rounded-xl border border-[#00BF63]/20 bg-[#00BF63]/10 p-4">
                    <p className="font-['Poppins',sans-serif] text-sm text-[#007A3F]">
                      {formatPrice(reservedPayment.amount)} reserved with{" "}
                      {reservedPayment.paymentMethod ?? "payment method"}.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-[1fr_180px_auto]">
                    <label className="block">
                      <span className="mb-1 block font-['Poppins',sans-serif] text-sm text-gray-700">
                        Payment Method
                      </span>
                      <select
                        value={selectedPaymentMethod}
                        onChange={(event) => setSelectedPaymentMethod(event.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-['Poppins',sans-serif] text-sm focus:border-[#00BF63] focus:outline-none"
                      >
                        <option value="cash_on_service">Cash on service</option>
                        {paymentMethods.map((method) => (
                          <option key={method.id} value={method.methodType}>
                            {method.label}
                          </option>
                        ))}
                        <option value="gcash">GCash</option>
                        <option value="paymaya">PayMaya</option>
                        <option value="card">Card</option>
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1 block font-['Poppins',sans-serif] text-sm text-gray-700">
                        Promo Code
                      </span>
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(event) => setPromoCode(event.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-['Poppins',sans-serif] text-sm focus:border-[#00BF63] focus:outline-none"
                        placeholder="Optional"
                      />
                    </label>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={reservePayment}
                        disabled={isReservingPayment}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#00BF63] px-5 py-3 font-['Poppins',sans-serif] text-sm text-white disabled:opacity-60"
                      >
                        <CreditCard size={16} />
                        {isReservingPayment ? "Reserving..." : "Reserve"}
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00BF63]/10">
                  <Navigation className="text-[#00BF63]" size={24} />
                </div>
                <div>
                  <h2 className="font-['Poppins',sans-serif] text-xl text-gray-900">
                    Tracking
                  </h2>
                  <p className="font-['Poppins',sans-serif] text-sm text-gray-500">
                    Live booking status from the ServEase gateway.
                  </p>
                </div>
              </div>

              {trackingError ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="font-['Poppins',sans-serif] text-sm text-amber-800">
                    {trackingError}
                  </p>
                </div>
              ) : !tracking ? (
                <p className="font-['Poppins',sans-serif] text-sm text-gray-600">
                  Tracking is not available yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <TrackingMetric label="Phase" value={formatPhase(tracking.phase)} />
                  <TrackingMetric
                    label="ETA"
                    value={
                      tracking.etaMinutes === null
                        ? "Not available"
                        : `${tracking.etaMinutes} min`
                    }
                  />
                  <TrackingMetric
                    label="Distance"
                    value={
                      tracking.distanceKm === null
                        ? "Not available"
                        : `${tracking.distanceKm.toFixed(1)} km`
                    }
                  />
                  <TrackingMetric
                    label="Traffic"
                    value={tracking.trafficLevel ?? "Not available"}
                  />
                  <div className="rounded-xl border border-gray-200 p-4 md:col-span-2">
                    <p className="font-['Poppins',sans-serif] text-sm text-gray-500">
                      Destination
                    </p>
                    <p className="mt-1 font-['Poppins',sans-serif] text-sm text-gray-900">
                      {tracking.destinationAddress ?? "Address unavailable"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4 md:col-span-2">
                    <p className="font-['Poppins',sans-serif] text-sm text-gray-500">
                      Last Updated
                    </p>
                    <p className="mt-1 font-['Poppins',sans-serif] text-sm text-gray-900">
                      {formatDateTime(tracking.lastUpdatedAt)}
                    </p>
                  </div>
                </div>
              )}
            </section>

            {(canReviewBooking || submittedReview) && (
              <section className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00BF63]/10">
                    <Star className="text-[#00BF63]" size={24} />
                  </div>
                  <div>
                    <h2 className="font-['Poppins',sans-serif] text-xl text-gray-900">
                      Leave a Review
                    </h2>
                    <p className="font-['Poppins',sans-serif] text-sm text-gray-500">
                      Share feedback for this completed service.
                    </p>
                  </div>
                </div>

                {submittedReview ? (
                  <div className="rounded-xl border border-[#00BF63]/20 bg-[#00BF63]/10 p-4">
                    <p className="font-['Poppins',sans-serif] text-sm text-[#007A3F]">
                      Your {submittedReview.rating}-star review has been submitted.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 font-['Poppins',sans-serif] text-sm text-gray-600">
                        Rating
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => setReviewRating(rating)}
                            className={`inline-flex h-11 w-11 items-center justify-center rounded-lg border font-['Poppins',sans-serif] text-sm ${
                              reviewRating === rating
                                ? "border-[#00BF63] bg-[#00BF63] text-white"
                                : "border-gray-200 bg-white text-gray-700"
                            }`}
                            aria-label={`${rating} star rating`}
                          >
                            {rating}
                          </button>
                        ))}
                      </div>
                    </div>

                    <label className="block">
                      <span className="mb-2 block font-['Poppins',sans-serif] text-sm text-gray-600">
                        Review
                      </span>
                      <textarea
                        value={reviewText}
                        onChange={(event) => setReviewText(event.target.value)}
                        rows={4}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 font-['Poppins',sans-serif] text-sm text-gray-900 outline-none focus:border-[#00BF63]"
                        placeholder="What went well?"
                      />
                    </label>

                    {reviewError && (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                        <p className="font-['Poppins',sans-serif] text-sm text-red-700">
                          {reviewError}
                        </p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={submitReview}
                      disabled={isSubmittingReview}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#00BF63] px-5 py-3 font-['Poppins',sans-serif] text-sm text-white disabled:opacity-60"
                    >
                      <Star size={16} />
                      {isSubmittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                )}
              </section>
            )}

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00BF63]/10">
                  <AlertTriangle className="text-[#00BF63]" size={24} />
                </div>
                <div>
                  <h2 className="font-['Poppins',sans-serif] text-xl text-gray-900">
                    Report an Issue
                  </h2>
                  <p className="font-['Poppins',sans-serif] text-sm text-gray-500">
                    Send this booking issue to ServEase support.
                  </p>
                </div>
              </div>

              {reportedIssueId ? (
                <div className="rounded-xl border border-[#00BF63]/20 bg-[#00BF63]/10 p-4">
                  <p className="font-['Poppins',sans-serif] text-sm text-[#007A3F]">
                    Support ticket {reportedIssueId} was created.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <textarea
                    value={issueMessage}
                    onChange={(event) => setIssueMessage(event.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 font-['Poppins',sans-serif] text-sm text-gray-900 outline-none focus:border-[#00BF63]"
                    placeholder="Describe what happened with this booking"
                  />

                  {issueError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                      <p className="font-['Poppins',sans-serif] text-sm text-red-700">
                        {issueError}
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={reportIssue}
                    disabled={isReportingIssue}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 font-['Poppins',sans-serif] text-sm text-white disabled:opacity-60"
                  >
                    <AlertTriangle size={16} />
                    {isReportingIssue ? "Submitting..." : "Submit Issue"}
                  </button>
                </div>
              )}
            </section>

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

function TrackingMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <p className="font-['Poppins',sans-serif] text-sm text-gray-500">{label}</p>
      <p className="mt-1 font-['Poppins',sans-serif] text-sm text-gray-900 capitalize">
        {value}
      </p>
    </div>
  );
}

function formatStatus(status: BookingSummary["status"]) {
  return status.replace("_", " ");
}

function formatPhase(phase: BookingTrackingSnapshot["phase"]) {
  return phase.replace("_", " ");
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
