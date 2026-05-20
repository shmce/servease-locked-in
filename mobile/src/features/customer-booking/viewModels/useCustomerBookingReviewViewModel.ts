import { useMemo } from 'react';
import {
  formatBookingDuration,
  formatDateTime,
  formatMoney,
  pricingConfidenceLabel,
  pricingFairnessLabel,
  pricingModeLabel,
  toManilaBookingIso,
} from '../../../shared/utils/booking';
import {
  CatalogServiceItem,
  PricingQuoteSummary,
  PromotionValidationSummary,
  ProviderListing,
} from '../../../shared/models/types';

type CustomerBookingReviewViewModelInput = {
  provider: ProviderListing;
  selectedService: CatalogServiceItem | null;
  scheduledAt: string;
  hoursRequired: string;
  address: string;
  notes: string;
  bookingReferencePhotoUrl: string | null;
  pricingQuote: PricingQuoteSummary | null;
  promotionValidation: PromotionValidationSummary | null;
  promoCode: string;
  busyAction: string | null;
};

export function useCustomerBookingReviewViewModel({
  provider,
  selectedService,
  scheduledAt,
  hoursRequired,
  address,
  notes,
  bookingReferencePhotoUrl,
  pricingQuote,
  promotionValidation,
  promoCode,
  busyAction,
}: CustomerBookingReviewViewModelInput) {
  return useMemo(
    () =>
      buildCustomerBookingReviewViewModel({
        provider,
        selectedService,
        scheduledAt,
        hoursRequired,
        address,
        notes,
        bookingReferencePhotoUrl,
        pricingQuote,
        promotionValidation,
        promoCode,
        busyAction,
      }),
    [
      address,
      bookingReferencePhotoUrl,
      busyAction,
      hoursRequired,
      notes,
      pricingQuote,
      promoCode,
      promotionValidation,
      provider,
      scheduledAt,
      selectedService,
    ],
  );
}

export function buildCustomerBookingReviewViewModel({
  provider,
  selectedService,
  scheduledAt,
  hoursRequired,
  address,
  notes,
  bookingReferencePhotoUrl,
  pricingQuote,
  promotionValidation,
  promoCode,
  busyAction,
}: CustomerBookingReviewViewModelInput) {
  const baseAmount = provider.price ?? selectedService?.price ?? 0;
  const duration = Number(hoursRequired) || 1;
  const subtotal = provider.pricingMode === 'hourly' ? baseAmount * duration : baseAmount;
  const processingFee = Math.max(25, Math.round(subtotal * 0.05));
  const bookingCost = subtotal + processingFee;
  const scheduledAtIso = toManilaBookingIso(scheduledAt);
  const displayedTotal = pricingQuote?.estimatedTotal ?? bookingCost;
  const providerName = provider.providerBusinessName ?? provider.title;
  const priceBreakdownRows = pricingQuote
    ? [
        {
          key: 'fair-range',
          label: 'Fair range',
          value: `${formatMoney(pricingQuote.fairRangeMin)} - ${formatMoney(
            pricingQuote.fairRangeMax,
          )}`,
        },
        {
          key: 'fairness',
          label: 'Fairness',
          value: pricingFairnessLabel(pricingQuote.fairnessStatus),
        },
        {
          key: 'confidence',
          label: 'Confidence',
          value: pricingConfidenceLabel(pricingQuote.confidence),
        },
        ...pricingQuote.lineItems.map((item) => ({
          key: item.code,
          label: item.label,
          value: formatMoney(item.amount),
        })),
      ]
    : [
        {
          key: 'subtotal',
          label: 'Sub-total',
          value: formatMoney(subtotal),
        },
        {
          key: 'processing-fee',
          label: 'Processing fee',
          value: formatMoney(processingFee),
        },
      ];

  return {
    data: {
      providerInitial: providerName.slice(0, 1),
      providerName,
      providerRatingLabel: `${provider.averageRating.toFixed(1)} rating - ${
        provider.reviewCount
      } reviews`,
      serviceRows: [
        {
          key: 'service',
          label: 'Service',
          value: selectedService?.name ?? provider.title,
        },
        {
          key: 'date-time',
          label: 'Date and time',
          value: scheduledAtIso ? formatDateTime(scheduledAtIso) : 'Schedule required',
        },
        {
          key: 'duration',
          label: 'Estimated duration',
          value: formatBookingDuration(duration),
        },
        {
          key: 'pricing',
          label: 'Pricing',
          value: pricingModeLabel(provider.pricingMode),
        },
        {
          key: 'address',
          label: 'Address',
          value: address || 'Address required',
        },
        {
          key: 'reference-photo',
          label: 'Reference photo',
          value: bookingReferencePhotoUrl ? 'Attached' : 'None',
        },
      ],
      notesLabel: notes.trim() || 'None provided',
      priceBreakdownRows,
      promoCodeLabel: promotionValidation?.valid
        ? `${promotionValidation.code} applied`
        : promoCode.trim()
          ? 'Enter on payment step'
          : 'No promo applied',
      displayedTotalLabel: formatMoney(displayedTotal),
      quoteExplanation:
        pricingQuote?.explanation ??
        "Get a fair estimate before confirming. You won't be charged until the service is completed.",
      confirmLabel: busyAction === 'create-booking' ? 'Creating...' : 'Confirm Booking',
      estimateLabel:
        busyAction === 'pricing-quote' ? 'Getting fair estimate...' : 'Get fair estimate',
      confirmDisabled:
        busyAction === 'create-booking' ||
        busyAction === 'pricing-quote' ||
        !address.trim() ||
        !scheduledAtIso,
    },
    isLoading: false,
    error: null,
  };
}
