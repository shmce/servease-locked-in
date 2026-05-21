import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  Images,
  Star,
} from "lucide-react";
import type { ProviderDetailData } from "../lib/provider-detail";
import { BookingRequestForm } from "./BookingRequestForm";

export function ProviderDetailPage({ detail }: { detail: ProviderDetailData }) {
  const { listing, service, portfolio, availability, relatedListings, reviews } = detail;
  const activeAvailabilityWindows =
    availability?.windows
      .filter((window) => window.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder) ?? [];
  const upcomingDaysOff =
    availability?.daysOff
      .filter((dayOff) => isTodayOrFuture(dayOff.offDate))
      .sort((a, b) => a.offDate.localeCompare(b.offDate)) ?? [];

  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="bg-[#00BF63] px-6 py-12 md:px-16 md:py-16">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 font-['Poppins',sans-serif] text-sm text-white/90"
          >
            <ArrowLeft size={17} />
            Back to providers
          </Link>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-white/15 px-4 py-2 font-['Poppins',sans-serif] text-sm text-white">
                  {service?.name ?? "ServEase service"}
                </span>
                {listing.verificationStatus === "approved" && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-['Poppins',sans-serif] text-sm text-[#00BF63]">
                    <BadgeCheck size={17} />
                    Verified
                  </span>
                )}
              </div>

              <h1 className="font-['Poppins',sans-serif] text-3xl text-white md:text-5xl">
                {listing.title}
              </h1>
              <p className="mt-4 max-w-2xl font-['Poppins',sans-serif] text-base leading-relaxed text-white/90 md:text-lg">
                {listing.description ?? "Book this service from a verified ServEase provider."}
              </p>

              <div className="mt-8 flex flex-wrap gap-5">
                <Metric
                  label="Provider"
                  value={listing.providerBusinessName ?? "Verified Provider"}
                />
                <Metric
                  label="Rating"
                  value={`${listing.averageRating.toFixed(1)} / 5`}
                />
                <Metric
                  label="Price"
                  value={
                    listing.price === null
                      ? "Quote needed"
                      : formatPrice(listing.price, listing.pricingMode)
                  }
                />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <h2 className="mb-2 font-['Poppins',sans-serif] text-xl text-gray-900">
                Request this booking
              </h2>
              <p className="mb-5 font-['Poppins',sans-serif] text-sm text-gray-600">
                Booking requests are created as pending and sent through the ServEase gateway.
              </p>
              <BookingRequestForm listing={listing} />
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-12 md:px-16 md:py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00BF63]/10">
                  <Images className="text-[#00BF63]" size={24} />
                </div>
                <div>
                  <h2 className="font-['Poppins',sans-serif] text-xl text-gray-900">
                    Portfolio
                  </h2>
                  <p className="font-['Poppins',sans-serif] text-sm text-gray-500">
                    Public provider media from the catalog service.
                  </p>
                </div>
              </div>

              {portfolio.length === 0 ? (
                <p className="font-['Poppins',sans-serif] text-sm text-gray-600">
                  No portfolio media has been added yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {portfolio.slice(0, 4).map((item) => (
                    <figure key={item.id} className="overflow-hidden rounded-xl bg-gray-100">
                      <img
                        src={item.fileUrl}
                        alt={item.caption ?? item.fileName ?? "Provider portfolio"}
                        className="h-56 w-full object-cover"
                      />
                      {item.caption && (
                        <figcaption className="p-3 font-['Poppins',sans-serif] text-sm text-gray-600">
                          {item.caption}
                        </figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00BF63]/10">
                  <CalendarDays className="text-[#00BF63]" size={24} />
                </div>
                <div>
                  <h2 className="font-['Poppins',sans-serif] text-xl text-gray-900">
                    Availability
                  </h2>
                  <p className="font-['Poppins',sans-serif] text-sm text-gray-500">
                    Public working hours from the provider schedule.
                  </p>
                </div>
              </div>

              {!availability ? (
                <p className="font-['Poppins',sans-serif] text-sm text-gray-600">
                  Availability is not published yet.
                </p>
              ) : activeAvailabilityWindows.length === 0 ? (
                <p className="font-['Poppins',sans-serif] text-sm text-gray-600">
                  No active working hours are currently listed.
                </p>
              ) : (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {activeAvailabilityWindows.map((window) => (
                      <div
                        key={window.id}
                        className="rounded-xl border border-gray-200 p-4"
                      >
                        <p className="font-['Poppins',sans-serif] text-sm font-semibold capitalize text-gray-900">
                          {window.dayOfWeek}
                        </p>
                        <p className="mt-1 font-['Poppins',sans-serif] text-sm text-gray-600">
                          {formatTime(window.startTime)} - {formatTime(window.endTime)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {upcomingDaysOff.length > 0 && (
                    <div className="rounded-xl bg-gray-50 p-4">
                      <h3 className="font-['Poppins',sans-serif] text-sm font-semibold text-gray-900">
                        Upcoming unavailable dates
                      </h3>
                      <div className="mt-3 space-y-2">
                        {upcomingDaysOff.slice(0, 4).map((dayOff) => (
                          <p
                            key={dayOff.id}
                            className="font-['Poppins',sans-serif] text-sm text-gray-600"
                          >
                            {formatDate(dayOff.offDate)}
                            {dayOff.reason ? ` - ${dayOff.reason}` : ""}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00BF63]/10">
                  <Star className="text-[#00BF63]" size={24} />
                </div>
                <div>
                  <h2 className="font-['Poppins',sans-serif] text-xl text-gray-900">
                    Reviews
                  </h2>
                  <p className="font-['Poppins',sans-serif] text-sm text-gray-500">
                    {listing.reviewCount} review{listing.reviewCount === 1 ? "" : "s"} recorded.
                  </p>
                </div>
              </div>

              {reviews.length === 0 ? (
                <p className="font-['Poppins',sans-serif] text-sm text-gray-600">
                  No public reviews are available yet.
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {reviews.slice(0, 6).map((review) => (
                    <article key={review.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="mb-2 flex items-center gap-2 text-[#00BF63]">
                        {Array.from({ length: review.rating }).map((_, index) => (
                          <Star key={index} size={16} fill="currentColor" />
                        ))}
                      </div>
                      <p className="font-['Poppins',sans-serif] text-sm leading-relaxed text-gray-700">
                        {review.reviewText ?? "No written review."}
                      </p>
                      <p className="mt-2 font-['Poppins',sans-serif] text-xs text-gray-400">
                        {formatDate(review.createdAt)}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00BF63]/10">
                  <BriefcaseBusiness className="text-[#00BF63]" size={24} />
                </div>
                <div>
                  <h2 className="font-['Poppins',sans-serif] text-xl text-gray-900">
                    Provider
                  </h2>
                  <p className="font-['Poppins',sans-serif] text-sm text-gray-500">
                    {listing.providerBusinessName ?? "Verified Provider"}
                  </p>
                </div>
              </div>
              <dl className="space-y-3">
                <DetailRow label="Verification" value={listing.verificationStatus} />
                <DetailRow label="Reviews" value={String(listing.reviewCount)} />
                <DetailRow label="Pricing" value={listing.pricingMode} />
              </dl>
            </section>

            {relatedListings.length > 0 && (
              <section className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 font-['Poppins',sans-serif] text-xl text-gray-900">
                  More from this provider
                </h2>
                <div className="space-y-4">
                  {relatedListings.slice(0, 4).map((item) => (
                    <Link
                      key={item.id}
                      href={`/providers/${item.id}`}
                      className="block rounded-xl border border-gray-200 p-4 transition-colors hover:border-[#00BF63]"
                    >
                      <h3 className="font-['Poppins',sans-serif] text-sm text-gray-900">
                        {item.title}
                      </h3>
                      <p className="mt-1 font-['Poppins',sans-serif] text-sm text-[#00BF63]">
                        {item.price === null
                          ? "Quote needed"
                          : formatPrice(item.price, item.pricingMode)}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/15 px-5 py-4">
      <p className="font-['Poppins',sans-serif] text-xs uppercase text-white/75">{label}</p>
      <p className="font-['Poppins',sans-serif] text-base text-white">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3 last:border-b-0">
      <dt className="font-['Poppins',sans-serif] text-sm text-gray-500">{label}</dt>
      <dd className="font-['Poppins',sans-serif] text-sm text-gray-900 capitalize">
        {value.replace("_", " ")}
      </dd>
    </div>
  );
}

function formatPrice(price: number, pricingMode: "flat" | "hourly") {
  const formatted = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(price);

  return pricingMode === "hourly" ? `${formatted}/hr` : formatted;
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

function formatTime(value: string) {
  const [hour = "0", minute = "0"] = value.split(":");
  const date = new Date();
  date.setHours(Number(hour), Number(minute), 0, 0);

  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function isTodayOrFuture(value: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(value);
  target.setHours(0, 0, 0, 0);

  return target >= today;
}
