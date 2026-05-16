"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { CalendarClock, MapPin, Send } from "lucide-react";
import {
  createBookingRequest,
  type CreateBookingInput,
} from "../lib/bookings";
import type { ProviderServiceListing } from "../lib/catalog";
import { createSupabaseBrowserClient } from "../lib/supabase-browser";

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

export function BookingRequestForm({
  listing,
}: {
  listing: ProviderServiceListing;
}) {
  const [{ supabase, setupError }] = useState(createSupabaseState);
  const [serviceAddress, setServiceAddress] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [hoursRequired, setHoursRequired] = useState("1");
  const [paymentMethod, setPaymentMethod] = useState("cash_on_service");
  const [customerNotes, setCustomerNotes] = useState("");
  const [feedback, setFeedback] = useState(setupError);
  const [isError, setIsError] = useState(Boolean(setupError));
  const [requiresSignIn, setRequiresSignIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback("");
    setIsError(false);
    setRequiresSignIn(false);

    if (!supabase) {
      setFeedback(setupError || "Supabase login is not configured.");
      setIsError(true);
      return;
    }

    setIsSubmitting(true);
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session?.access_token) {
      setFeedback("Please sign in before requesting this booking.");
      setRequiresSignIn(true);
      setIsError(true);
      setIsSubmitting(false);
      return;
    }

    const parsedHours = Number(hoursRequired);
    const body: CreateBookingInput = {
      providerId: listing.providerId,
      serviceId: listing.serviceId,
      serviceTitle: listing.title,
      serviceName: listing.title,
      serviceDescription: listing.description,
      serviceAddress,
      scheduledAt: new Date(scheduledAt).toISOString(),
      hoursRequired: Number.isFinite(parsedHours) ? parsedHours : null,
      serviceAmount: listing.price,
      pricingMode: listing.pricingMode,
      paymentMethod,
      customerNotes: customerNotes || null,
    };

    try {
      const booking = await createBookingRequest(
        sessionData.session.access_token,
        body,
      );

      setServiceAddress("");
      setScheduledAt("");
      setHoursRequired("1");
      setPaymentMethod("cash_on_service");
      setCustomerNotes("");
      setFeedback(
        `Booking request ${booking.bookingReference} was created and is pending.`,
      );
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "Could not create your booking request.",
      );
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="font-['Poppins',sans-serif] text-sm text-gray-700 block mb-1">
          Service Address
        </span>
        <div className="relative">
          <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />
          <input
            type="text"
            required
            value={serviceAddress}
            onChange={(event) => setServiceAddress(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 font-['Poppins',sans-serif] text-sm focus:border-[#00BF63] focus:outline-none"
            placeholder="Street, barangay, city"
          />
        </div>
      </label>

      <label className="block">
        <span className="font-['Poppins',sans-serif] text-sm text-gray-700 block mb-1">
          Preferred Schedule
        </span>
        <div className="relative">
          <CalendarClock className="absolute left-3 top-3.5 text-gray-400" size={18} />
          <input
            type="datetime-local"
            required
            value={scheduledAt}
            onChange={(event) => setScheduledAt(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 font-['Poppins',sans-serif] text-sm focus:border-[#00BF63] focus:outline-none"
          />
        </div>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="font-['Poppins',sans-serif] text-sm text-gray-700 block mb-1">
            Estimated Hours
          </span>
          <input
            type="number"
            min="1"
            step="1"
            value={hoursRequired}
            onChange={(event) => setHoursRequired(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-['Poppins',sans-serif] text-sm focus:border-[#00BF63] focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="font-['Poppins',sans-serif] text-sm text-gray-700 block mb-1">
            Payment Method
          </span>
          <select
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-['Poppins',sans-serif] text-sm focus:border-[#00BF63] focus:outline-none"
          >
            <option value="cash_on_service">Cash on service</option>
            <option value="gcash">GCash</option>
            <option value="paymaya">PayMaya</option>
            <option value="card">Card</option>
          </select>
        </label>
      </div>

      <label className="block">
        <span className="font-['Poppins',sans-serif] text-sm text-gray-700 block mb-1">
          Notes
        </span>
        <textarea
          rows={4}
          value={customerNotes}
          onChange={(event) => setCustomerNotes(event.target.value)}
          className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 font-['Poppins',sans-serif] text-sm focus:border-[#00BF63] focus:outline-none"
          placeholder="Add instructions or access details"
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#00BF63] px-5 py-3 font-['Poppins',sans-serif] text-sm font-semibold text-white disabled:opacity-70"
      >
        <Send size={17} />
        {isSubmitting ? "Requesting..." : "Request Booking"}
      </button>

      {feedback && (
        <div
          className={`rounded-xl border p-4 ${
            isError ? "border-red-200 bg-red-50" : "border-[#00BF63]/20 bg-[#00BF63]/10"
          }`}
        >
          <p
            className={`font-['Poppins',sans-serif] text-sm ${
              isError ? "text-red-700" : "text-[#007A3F]"
            }`}
          >
            {feedback}
          </p>
          {requiresSignIn && (
            <Link
              href="/login"
              className="mt-2 inline-block font-['Poppins',sans-serif] text-sm text-[#00BF63] underline underline-offset-4"
            >
              Sign in to continue
            </Link>
          )}
        </div>
      )}
    </form>
  );
}
