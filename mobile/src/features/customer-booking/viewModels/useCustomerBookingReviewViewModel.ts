import { useMemo } from 'react';
import {
  formatBookingDuration,
  formatDateTime,
  formatMoney,
  pricingModeLabel,
  customerPastSlotPickerCopy,
  isFutureManilaBookingDateTime,
  toManilaBookingIso,
} from '../../../shared/utils/booking';
import {
  CatalogServiceItem,
  CustomerPaymentMethodSummary,
  PricingQuoteSummary,
  PromotionValidationSummary,
  ProviderListing,
} from '../../../shared/models/types';
import { paymentMethodMeta } from '../../../shared/utils/paymentMethods';
import type { CustomerBookingLocationState } from '../../../domain/customerBookingLocation';
import {
  customerBookingLocationCanContinue,
  customerBookingLocationNotice,
  customerMapPinRequiredCopy,
} from '../../../domain/customerBookingLocation';

type CustomerBookingReviewViewModelInput = {
  provider: ProviderListing;
  selectedService: CatalogServiceItem | null;
  scheduledAt: string;
  hoursRequired: string;
  bookingSlotError?: string;
  address: string;
  serviceLocation: CustomerBookingLocationState;
  notes: string;
  bookingReferencePhotoUrl: string | null;
  pricingQuote: PricingQuoteSummary | null;
  promotionValidation: PromotionValidationSummary | null;
  promoCode: string;
  customerPaymentMethods: CustomerPaymentMethodSummary[];
  selectedPaymentMethodId: string | null;
  busyAction: string | null;
  now?: Date;
};

export function useCustomerBookingReviewViewModel({
  provider,
  selectedService,
  scheduledAt,
  hoursRequired,
  bookingSlotError = '',
  address,
  serviceLocation,
  notes,
  bookingReferencePhotoUrl,
  pricingQuote,
  promotionValidation,
  promoCode,
  customerPaymentMethods,
  selectedPaymentMethodId,
  busyAction,
  now,
}: CustomerBookingReviewViewModelInput) {
  return useMemo(
    () =>
      buildCustomerBookingReviewViewModel({
        provider,
        selectedService,
        scheduledAt,
        hoursRequired,
        bookingSlotError,
        address,
        serviceLocation,
        notes,
        bookingReferencePhotoUrl,
        pricingQuote,
        promotionValidation,
        promoCode,
        customerPaymentMethods,
        selectedPaymentMethodId,
        busyAction,
        now,
      }),
    [
      address,
      bookingSlotError,
      serviceLocation,
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
      customerPaymentMethods,
      selectedPaymentMethodId,
      now,
    ],
  );
}

export function buildCustomerBookingReviewViewModel({
  provider,
  selectedService,
  scheduledAt,
  hoursRequired,
  bookingSlotError,
  address,
  serviceLocation,
  notes,
  bookingReferencePhotoUrl,
  pricingQuote,
  promotionValidation,
  promoCode,
  customerPaymentMethods,
  selectedPaymentMethodId,
  busyAction,
  now = new Date(),
}: CustomerBookingReviewViewModelInput) {
  const baseAmount = provider.price ?? selectedService?.price ?? 0;
  const duration = Number(hoursRequired) || 1;
  const subtotal =
    provider.pricingMode === 'hourly' ? baseAmount * duration : baseAmount;
  const scheduledAtIso = toManilaBookingIso(scheduledAt);
  const localScheduleMessage =
    scheduledAtIso && !isFutureManilaBookingDateTime(scheduledAt, now)
      ? customerPastSlotPickerCopy
      : null;
  const scheduleMessage = bookingSlotError || localScheduleMessage;
  const pricingPreview = buildBookingPriceBreakdownPreview({
    subtotal,
    pricingQuote,
  });
  const displayedTotal = pricingPreview.total;
  const totalLabel = 'Booking total estimate';
  const providerName = provider.providerBusinessName ?? provider.title;
  const selectedPaymentMethod =
    customerPaymentMethods.find(
      (method) => method.id === selectedPaymentMethodId,
    ) ??
    customerPaymentMethods.find((method) => method.isDefault) ??
    customerPaymentMethods[0] ??
    null;
  const isCashPayment =
    !selectedPaymentMethod ||
    selectedPaymentMethod.methodType === 'cash_on_service';
  const locationCanConfirm =
    customerBookingLocationCanContinue(serviceLocation) ||
    serviceLocation.status === 'error';
  const locationBlockingMessage = locationCanConfirm
    ? null
    : (customerBookingLocationNotice(serviceLocation) ??
      customerMapPinRequiredCopy);
  const paymentMethodRows = customerPaymentMethods.map((method) => ({
    method,
    label: paymentMethodLabel(method.methodType),
    meta: paymentMethodMeta(method),
    selected: method.id === selectedPaymentMethod?.id,
  }));
  const priceBreakdownRows = pricingPreview.rows.map(
    ({ key, label, amount }) => ({
      key,
      label,
      value: formatMoney(amount),
    }),
  );

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
          value: scheduledAtIso
            ? formatDateTime(scheduledAtIso)
            : 'Schedule required',
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
          key: 'service-pin',
          label: 'Service pin',
          value:
            customerBookingLocationCanContinue(serviceLocation) &&
            serviceLocation.confirmedPin
              ? `Confirmed - ${serviceLocation.confirmedPin.latitude.toFixed(5)}, ${serviceLocation.confirmedPin.longitude.toFixed(5)}`
              : serviceLocation.status === 'error'
                ? 'Manual address fallback'
                : 'Pin not confirmed',
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
          ? 'Applied after confirmation'
          : 'No promo applied',
      displayedTotalLabel: formatMoney(displayedTotal),
      totalLabel,
      paymentMethodRows,
      paymentNotice: isCashPayment
        ? 'Cash is due directly to the provider after the service is completed.'
        : 'APICenter will collect wallet or card details in secure checkout after you confirm.',
      quoteExplanation:
        locationBlockingMessage ??
        scheduleMessage ??
        pricingQuote?.explanation ??
        (isCashPayment
          ? 'Travel and fuel is estimated for now. Final pricing is stored when the booking is created.'
          : 'Review this breakdown first. Secure checkout opens after the booking is created.'),
      confirmLabel:
        busyAction === 'create-booking' || busyAction === 'payment'
          ? isCashPayment
            ? 'Confirming...'
            : 'Opening checkout...'
          : isCashPayment
            ? 'Confirm cash booking'
            : 'Pay and confirm booking',
      estimateLabel:
        busyAction === 'pricing-quote'
          ? 'Getting price estimate...'
          : 'Get price estimate',
      confirmDisabled:
        busyAction === 'create-booking' ||
        busyAction === 'payment' ||
        busyAction === 'pricing-quote' ||
        Boolean(locationBlockingMessage) ||
        !address.trim() ||
        !scheduledAtIso ||
        Boolean(localScheduleMessage),
    },
    isLoading: false,
    error: null,
  };
}

function paymentMethodLabel(
  methodType: CustomerPaymentMethodSummary['methodType'],
): string {
  switch (methodType) {
    case 'cash_on_service':
      return 'Cash on service';
    case 'gcash':
      return 'GCash checkout';
    case 'paymaya':
      return 'Maya checkout';
    case 'card':
      return 'Card checkout';
  }
}

function buildBookingPriceBreakdownPreview({
  subtotal,
  pricingQuote,
}: {
  subtotal: number;
  pricingQuote: PricingQuoteSummary | null;
}) {
  const serviceSubtotal =
    pricingQuote?.lineItems.find((item) => item.code === 'labor')?.amount ??
    subtotal;
  const travelFee =
    pricingQuote?.lineItems.find((item) => item.code === 'travel_fuel')
      ?.amount ?? 120;
  const serviceFee = Math.max(
    25,
    Math.round((serviceSubtotal + travelFee) * 0.05),
  );
  const total = serviceSubtotal + travelFee + serviceFee;
  const travelLabel =
    pricingQuote?.signals.fallbackUsed === false
      ? 'Travel and fuel'
      : 'Travel and fuel estimate';

  return {
    total,
    rows: [
      {
        key: 'service-subtotal',
        label: 'Service subtotal',
        amount: serviceSubtotal,
      },
      {
        key: 'travel-fuel',
        label: travelLabel,
        amount: travelFee,
      },
      {
        key: 'service-fee',
        label: 'Service fee',
        amount: serviceFee,
      },
    ],
  };
}
