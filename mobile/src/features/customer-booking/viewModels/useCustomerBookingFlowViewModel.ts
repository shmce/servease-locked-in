import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
  addressVerifiedNotice,
  providerUnavailableSlotPickerMessage,
  promotionNotice,
  toManilaBookingIso,
} from '../../../domain/booking';
import { defaultScheduledAt } from '../../../constants/appContent';
import { readError } from '../../../navigation/routeHelpers';
import type { AppRole, AppScreen } from '../../../navigation/types';
import type {
  ApiOptions,
  BookingSummary,
  CatalogServiceItem,
  CustomerAddressSummary,
  CreateBookingRequest,
  CustomerPaymentMethodSummary,
  GeoAddressResult,
  PricingQuoteSummary,
  PromotionValidationSummary,
  ProviderListing,
  UploadSummary,
} from '../../../shared/models/types';
import {
  createCustomerAddress,
  createBooking,
  createPricingQuote,
  geocodeAddress,
  reverseGeocode,
  validatePromotion,
} from '../../../shared/models/apiService';

type CustomerBookingFlowViewModelInput = {
  apiOptions: ApiOptions;
  customerAddresses: CustomerAddressSummary[];
  hasSession: boolean;
  onCustomerAddressSaved: (address: CustomerAddressSummary) => void;
  onBookingCreated: (booking: BookingSummary) => void;
  onRefreshProviderAvailability: (providerId: string) => void;
  selectedBooking: BookingSummary | null;
  selectedCustomerPaymentMethod: CustomerPaymentMethodSummary | null;
  selectedProvider: ProviderListing | null;
  selectedService: CatalogServiceItem | null;
  setBusyAction: (busyAction: string | null) => void;
  setNotice: (notice: string) => void;
  setRoute: (route: { role: AppRole | null; screen: AppScreen }) => void;
};

export function useCustomerBookingFlowViewModel({
  apiOptions,
  customerAddresses,
  hasSession,
  onCustomerAddressSaved,
  onBookingCreated,
  onRefreshProviderAvailability,
  selectedBooking,
  selectedCustomerPaymentMethod,
  selectedProvider,
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
  const [selectedSavedAddressId, setSelectedSavedAddressId] =
    useState<string | null>(null);

  useEffect(() => {
    if (
      selectedSavedAddressId ||
      (address.trim() && address.trim() !== 'Unit 12B Greenfield Residences')
    ) {
      return;
    }

    const defaultAddress =
      customerAddresses.find((item) => item.isDefault) ?? customerAddresses[0];
    if (defaultAddress) {
      applySavedAddress(defaultAddress);
    }
  }, [address, customerAddresses, selectedSavedAddressId]);

  useEffect(() => {
    setPromoCode('');
    setPromotionValidation(null);
  }, [selectedBooking?.id]);

  useEffect(() => {
    setPricingQuote(null);
  }, [
    address,
    hoursRequired,
    scheduledAt,
    selectedProvider?.providerId,
    selectedService?.id,
  ]);

  function setServiceAddress(value: string) {
    setAddress(value);
    setAddressGeoResult(null);
    setSelectedSavedAddressId(null);
  }

  function applySavedAddress(savedAddress: CustomerAddressSummary) {
    setSelectedSavedAddressId(savedAddress.id);
    setAddress(savedAddress.address);
    setPricingQuote(null);
    setAddressGeoResult(
      savedAddress.latitude !== null && savedAddress.longitude !== null
        ? {
            formattedAddress: savedAddress.address,
            latitude: savedAddress.latitude,
            longitude: savedAddress.longitude,
            provider: 'mock',
          }
        : null,
    );
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

  async function submitBooking(
    options: { navigateOnSuccess?: boolean; showSuccessNotice?: boolean } = {},
  ): Promise<BookingSummary | null> {
    if (!hasSession) {
      setNotice('Sign in before creating a booking.');
      setRoute({ role: null, screen: 'loginRole' });
      return null;
    }

    const scheduledAtIso = toManilaBookingIso(scheduledAt);

    if (!selectedProvider || !address.trim() || !scheduledAtIso) {
      setNotice('Choose a service provider, address, and schedule.');
      return null;
    }

    setBusyAction('create-booking');
    try {
      const serviceId = selectedService?.id ?? selectedProvider.serviceId;
      let quote = pricingQuote;

      if (serviceId && selectedProvider.providerId) {
        if (!isPricingQuoteFresh(quote)) {
          quote = await fetchPricingQuote();
          setPricingQuote(quote);
          setNotice('Pricing estimate refreshed. Review the updated total before confirming.');
          return null;
        }
      } else {
        quote = null;
      }

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
      if (options.navigateOnSuccess ?? true) {
        setRoute({ role: 'customer', screen: 'customerBookingConfirmation' });
      }
      if (options.showSuccessNotice ?? true) {
        setNotice(`Booking ${booking.bookingReference} created.`);
      }
      return booking;
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
      return null;
    } finally {
      setBusyAction(null);
    }
  }

  async function fetchPricingQuote(): Promise<PricingQuoteSummary> {
    const scheduledAtIso = toManilaBookingIso(scheduledAt);
    const serviceId = selectedService?.id ?? selectedProvider?.serviceId ?? null;
    if (!selectedProvider || !serviceId || !address.trim() || !scheduledAtIso) {
      throw new Error('Choose a service provider, address, and schedule first.');
    }

    return createPricingQuote(
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
  }

  async function prepareBookingReview() {
    if (!hasSession) {
      setNotice('Sign in before requesting a fair estimate.');
      return false;
    }

    setBusyAction('pricing-quote');
    try {
      const quote = await fetchPricingQuote();
      setPricingQuote(quote);
      return true;
    } catch (error) {
      setPricingQuote(null);
      setNotice(
        `${readError(error)} Review the provider rate now; confirmation will need a fresh pricing estimate.`,
      );
      return true;
    } finally {
      setBusyAction(null);
    }
  }

  async function previewPricingQuote() {
    if (!hasSession) {
      setNotice('Sign in before requesting a fair estimate.');
      return null;
    }

    setBusyAction('pricing-quote');
    try {
      const quote = await fetchPricingQuote();
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

  async function saveCurrentAddressAsHome(): Promise<void> {
    const trimmed = address.trim();
    if (!hasSession) {
      setNotice('Sign in before saving an address.');
      return;
    }
    if (!trimmed) {
      setNotice('Enter a service address before saving it.');
      return;
    }

    setBusyAction('save-address');
    try {
      const savedAddress = await createCustomerAddress(
        {
          label: 'Home',
          address: trimmed,
          latitude: addressGeoResult?.latitude ?? null,
          longitude: addressGeoResult?.longitude ?? null,
          isDefault: true,
        },
        apiOptions,
      );
      applySavedAddress(savedAddress);
      onCustomerAddressSaved(savedAddress);
      setNotice('Home address saved.');
    } catch (error) {
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
      savedAddresses: customerAddresses,
      selectedSavedAddressId,
    },
    actions: {
      applySavedAddress,
      applyPromotionCode,
      prepareBookingReview,
      previewPricingQuote,
      saveCurrentAddressAsHome,
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

export function isPricingQuoteFresh(
  quote: PricingQuoteSummary | null,
  now: number = Date.now(),
): quote is PricingQuoteSummary {
  if (!quote) {
    return false;
  }

  const expiresAt = new Date(quote.expiresAt).getTime();
  return Number.isFinite(expiresAt) && expiresAt > now;
}
