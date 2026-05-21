import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
  addressVerifiedNotice,
  buildCustomerBookingAvailability,
  providerUnavailableSlotPickerCopy,
  providerUnavailableSlotPickerMessage,
  promotionNotice,
  toManilaBookingIso,
} from '../../../domain/booking';
import { bookingTimeSlots, defaultScheduledAt } from '../../../constants/appContent';
import { readError } from '../../../navigation/routeHelpers';
import type { AppRole, AppScreen } from '../../../navigation/types';
import type {
  ApiOptions,
  BookingSummary,
  CatalogServiceItem,
  CreateBookingRequest,
  CustomerPaymentMethodSummary,
  GeoAddressResult,
  PricingQuoteSummary,
  PromotionValidationSummary,
  ProviderAvailabilitySchedule,
  ProviderListing,
  UploadSummary,
} from '../../../shared/models/types';
import {
  createBooking,
  createPricingQuote,
  geocodeAddress,
  reverseGeocode,
  validatePromotion,
} from '../../../shared/models/apiService';

type CustomerBookingFlowViewModelInput = {
  apiOptions: ApiOptions;
  hasSession: boolean;
  onBookingCreated: (booking: BookingSummary) => void;
  onRefreshProviderAvailability: (providerId: string) => void;
  selectedBooking: BookingSummary | null;
  selectedCustomerPaymentMethod: CustomerPaymentMethodSummary | null;
  selectedProvider: ProviderListing | null;
  selectedProviderAvailability: ProviderAvailabilitySchedule | null;
  selectedService: CatalogServiceItem | null;
  setBusyAction: (busyAction: string | null) => void;
  setNotice: (notice: string) => void;
  setRoute: (route: { role: AppRole | null; screen: AppScreen }) => void;
};

export function useCustomerBookingFlowViewModel({
  apiOptions,
  hasSession,
  onBookingCreated,
  onRefreshProviderAvailability,
  selectedBooking,
  selectedCustomerPaymentMethod,
  selectedProvider,
  selectedProviderAvailability,
  selectedService,
  setBusyAction,
  setNotice,
  setRoute,
}: CustomerBookingFlowViewModelInput) {
  const [bookingSlotError, setBookingSlotError] = useState('');
  const [address, setAddress] = useState('Unit 12B Greenfield Residences');
  const [scheduledAt, setScheduledAt] = useState(defaultScheduledAt);
  const [hoursRequired, setHoursRequired] = useState('2');
  const [notes, setNotes] = useState('');
  const [bookingReferencePhotoUri, setBookingReferencePhotoUri] =
    useState<string | null>(null);
  const [bookingReferencePhotoUrl, setBookingReferencePhotoUrl] =
    useState<string | null>(null);
  const [bookingReferenceUpload, setBookingReferenceUpload] =
    useState<UploadSummary | null>(null);
  const [addressGeoResult, setAddressGeoResult] =
    useState<GeoAddressResult | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promotionValidation, setPromotionValidation] =
    useState<PromotionValidationSummary | null>(null);
  const [pricingQuote, setPricingQuote] = useState<PricingQuoteSummary | null>(null);

  useEffect(() => {
    setPromoCode('');
    setPromotionValidation(null);
  }, [selectedBooking?.id]);

  function setServiceAddress(value: string) {
    setAddress(value);
    setAddressGeoResult(null);
  }

  function setBookingReferenceUploadResult(uri: string, upload: UploadSummary) {
    setBookingReferencePhotoUri(uri);
    setBookingReferencePhotoUrl(upload.publicUrl);
    setBookingReferenceUpload(upload);
  }

  function resetBookingReferenceUpload() {
    setBookingReferencePhotoUri(null);
    setBookingReferencePhotoUrl(null);
    setBookingReferenceUpload(null);
  }

  async function submitBooking() {
    if (!hasSession) {
      setNotice('Sign in before creating a booking.');
      setRoute({ role: null, screen: 'loginRole' });
      return;
    }

    const scheduledAtIso = toManilaBookingIso(scheduledAt);

    if (!selectedProvider || !address.trim() || !scheduledAtIso) {
      setNotice('Choose a service provider, address, and schedule.');
      return;
    }

    if (!selectedProviderAvailability) {
      setNotice('Provider availability is still loading.');
      setRoute({ role: 'customer', screen: 'customerBookingForm' });
      return;
    }

    if (
      !isSelectedBookingSlotAvailable(
        selectedProviderAvailability,
        scheduledAt,
        Number(hoursRequired) || 1,
      )
    ) {
      setBookingSlotError(providerUnavailableSlotPickerCopy);
      setNotice(providerUnavailableSlotPickerCopy);
      onRefreshProviderAvailability(selectedProvider.providerId);
      setRoute({ role: 'customer', screen: 'customerBookingForm' });
      return;
    }

    setBusyAction('create-booking');
    try {
      const serviceId = selectedService?.id ?? selectedProvider.serviceId;
      const quote =
        serviceId && selectedProvider.providerId
          ? await createPricingQuote(
              {
                providerId: selectedProvider.providerId,
                serviceId,
                serviceAddress: address.trim(),
                scheduledAt: scheduledAtIso,
                hoursRequired: Number(hoursRequired) || 1,
                bookingUrgency: 'standard',
                region: 'default',
                destination: addressGeoResult
                  ? {
                      latitude: addressGeoResult.latitude,
                      longitude: addressGeoResult.longitude,
                    }
                  : null,
              },
              apiOptions,
            )
          : null;
      setPricingQuote(quote);
      const request: CreateBookingRequest = {
        providerId: selectedProvider.providerId,
        serviceId,
        serviceTitle: selectedProvider.title,
        serviceName: selectedService?.name ?? selectedProvider.title,
        serviceDescription: selectedProvider.description,
        serviceAddress: address.trim(),
        scheduledAt: scheduledAtIso,
        hoursRequired: Number(hoursRequired) || 1,
        serviceAmount:
          quote?.estimatedTotal ?? selectedProvider.price ?? selectedService?.price ?? 0,
        pricingMode: selectedProvider.pricingMode,
        acceptedQuoteId: quote?.quoteId ?? null,
        paymentMethod: selectedCustomerPaymentMethod?.methodType ?? 'cash_on_service',
        customerNotes: notes.trim() || null,
        attachments: bookingReferenceUpload
          ? [
              {
                ...mediaAttachmentFromUpload(bookingReferenceUpload),
                mediaKind: 'booking_reference',
              },
            ]
          : [],
      };
      const booking = await createBooking(request, apiOptions);
      onBookingCreated(booking);
      resetBookingReferenceUpload();
      setRoute({ role: 'customer', screen: 'customerBookingConfirmation' });
      setNotice(`Booking ${booking.bookingReference} created.`);
    } catch (error) {
      const message = readError(error);
      const slotMessage = providerUnavailableSlotPickerMessage(error, message);
      if (slotMessage && selectedProvider) {
        setBookingSlotError(slotMessage);
        setNotice(slotMessage);
        onRefreshProviderAvailability(selectedProvider.providerId);
        setRoute({ role: 'customer', screen: 'customerBookingForm' });
      } else {
        setNotice(message);
      }
    } finally {
      setBusyAction(null);
    }
  }

  async function previewPricingQuote() {
    if (!hasSession) {
      setNotice('Sign in before requesting a fair estimate.');
      return null;
    }

    const scheduledAtIso = toManilaBookingIso(scheduledAt);
    const serviceId = selectedService?.id ?? selectedProvider?.serviceId ?? null;
    if (!selectedProvider || !serviceId || !address.trim() || !scheduledAtIso) {
      setNotice('Choose a service provider, address, and schedule first.');
      return null;
    }

    setBusyAction('pricing-quote');
    try {
      const quote = await createPricingQuote(
        {
          providerId: selectedProvider.providerId,
          serviceId,
          serviceAddress: address.trim(),
          scheduledAt: scheduledAtIso,
          hoursRequired: Number(hoursRequired) || 1,
          bookingUrgency: 'standard',
          region: 'default',
          destination: addressGeoResult
            ? {
                latitude: addressGeoResult.latitude,
                longitude: addressGeoResult.longitude,
              }
            : null,
        },
        apiOptions,
      );
      setPricingQuote(quote);
      return quote;
    } catch (error) {
      setNotice(readError(error));
      return null;
    } finally {
      setBusyAction(null);
    }
  }

  async function applyPromotionCode() {
    if (!selectedBooking) {
      setNotice('Select a booking first.');
      return false;
    }

    const code = promoCode.trim();
    if (!code) {
      setPromotionValidation(null);
      setNotice('Enter a promo code first.');
      return false;
    }

    setBusyAction('promo');
    try {
      const promotion = await validatePromotion(selectedBooking.id, code, apiOptions);
      setPromotionValidation(promotion);
      setNotice(promotionNotice(promotion));
      return promotion.valid;
    } catch (error) {
      setNotice(readError(error));
      return false;
    } finally {
      setBusyAction(null);
    }
  }

  async function verifyServiceAddress(): Promise<void> {
    const trimmed = address.trim();
    if (!trimmed) {
      setNotice('Enter a service address first.');
      return;
    }

    setBusyAction('geo-address');
    try {
      const result = await geocodeAddress(trimmed, {
        ...apiOptions,
        language: 'en',
        region: 'PH',
      });
      setAddress(result.formattedAddress);
      setAddressGeoResult(result);
      setNotice(addressVerifiedNotice(result));
    } catch (error) {
      setAddressGeoResult(null);
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function useCurrentServiceLocation(): Promise<void> {
    setBusyAction('geo-current-location');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== Location.PermissionStatus.GRANTED) {
        setNotice('Location permission is required to use your current address.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const result = await reverseGeocode(
        position.coords.latitude,
        position.coords.longitude,
        {
          ...apiOptions,
          language: 'en',
        },
      );

      setAddress(result.formattedAddress);
      setAddressGeoResult(result);
      setNotice('Current location added as your service address.');
    } catch (error) {
      setAddressGeoResult(null);
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  return {
    data: {
      address,
      addressGeoResult,
      bookingReferencePhotoUri,
      bookingReferencePhotoUrl,
      bookingSlotError,
      hoursRequired,
      notes,
      pricingQuote,
      promoCode,
      promotionValidation,
      scheduledAt,
    },
    actions: {
      applyPromotionCode,
      previewPricingQuote,
      setAddress: setServiceAddress,
      setBookingReferenceUploadResult,
      setBookingSlotError,
      setHoursRequired,
      setNotes,
      setPricingQuote,
      setPromoCode,
      setPromotionValidation,
      setScheduledAt,
      submitBooking,
      useCurrentServiceLocation,
      verifyServiceAddress,
    },
    isLoading: false,
    error: null,
  };
}

function isSelectedBookingSlotAvailable(
  providerAvailability: ProviderAvailabilitySchedule,
  scheduledAt: string,
  durationHours: number,
): boolean {
  const dateOnly = scheduledAt.slice(0, 10);
  const timeOnly = scheduledAt.slice(11, 16);
  if (!dateOnly || !timeOnly) {
    return false;
  }

  const availability = buildCustomerBookingAvailability(
    providerAvailability,
    durationHours,
    bookingTimeSlots,
    new Date(),
    dateOnly,
  );
  const selectedDateOption = availability.dateOptions.find(
    (date) => date.value === dateOnly,
  );
  const selectedTimeOption = availability.timeOptions.find(
    (slot) => slot.time === timeOnly,
  );

  return selectedDateOption?.isAvailable === true && selectedTimeOption?.isAvailable === true;
}

function mediaAttachmentFromUpload(upload: UploadSummary) {
  return {
    fileUrl: upload.publicUrl,
    fileName: upload.path.split('/').pop() ?? null,
    mimeType: upload.contentType,
    storagePath: upload.path,
    fileSize: upload.size,
    caption: null,
  };
}
