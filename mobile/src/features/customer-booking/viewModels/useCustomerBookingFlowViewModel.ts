import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  addressVerifiedNotice,
  canSubmitBookingAfterPricingRefresh,
  canSubmitBookingWithServerScheduleValidation,
  isPricingQuoteFresh,
  providerUnavailableSlotPickerMessage,
  promotionNotice,
  validateCustomerBookingScheduleSelection,
} from '../../../domain/booking';
import {
  confirmCustomerBookingPin,
  createCustomerBookingLocationState,
  customerBookingLocationCanContinue,
  customerBookingLocationFromSavedAddress,
  customerBookingLocationNotice,
  customerMapPinFallbackCopy,
  customerMapPinRequiredCopy,
  failCustomerBookingLocationResolution,
  moveCustomerBookingPendingPin,
  startCustomerBookingPendingPin,
  updateCustomerBookingLocationAddress,
} from '../../../domain/customerBookingLocation';
import type { CustomerBookingMapPin } from '../../../domain/customerBookingLocation';
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
  ProviderAvailabilitySchedule,
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

const initialServiceAddress = 'Unit 12B Greenfield Residences';
const autoReverseGeocodeDebounceMs = 750;
const autoReverseGeocodeDistanceThresholdMeters = 20;

type PinAddressStatus = 'idle' | 'scheduled' | 'resolving' | 'failed';

type CustomerBookingFlowViewModelInput = {
  apiOptions: ApiOptions;
  customerAddresses: CustomerAddressSummary[];
  hasSession: boolean;
  onCustomerAddressSaved: (address: CustomerAddressSummary) => void;
  onBookingCreated: (booking: BookingSummary) => void;
  onRefreshProviderAvailability: (providerId: string) => void;
  providerAvailability: ProviderAvailabilitySchedule | null;
  selectedBooking: BookingSummary | null;
  selectedCustomerPaymentMethod: CustomerPaymentMethodSummary | null;
  selectedProvider: ProviderListing | null;
  selectedService: CatalogServiceItem | null;
  setBusyAction: (busyAction: string | null) => void;
  setNotice: (notice: string) => void;
  setRoute: (route: { role: AppRole | null; screen: AppScreen }) => void;
  timeSlots: string[];
  now?: () => Date;
};

export function useCustomerBookingFlowViewModel({
  apiOptions,
  customerAddresses,
  hasSession,
  onCustomerAddressSaved,
  onBookingCreated,
  onRefreshProviderAvailability,
  providerAvailability,
  selectedBooking,
  selectedCustomerPaymentMethod,
  selectedProvider,
  selectedService,
  setBusyAction,
  setNotice,
  setRoute,
  timeSlots,
  now,
}: CustomerBookingFlowViewModelInput) {
  const [bookingSlotError, setBookingSlotError] = useState('');
  const [address, setAddress] = useState(initialServiceAddress);
  const [serviceLocation, setServiceLocation] = useState(() =>
    createCustomerBookingLocationState(initialServiceAddress),
  );
  const [mapPickerVisible, setMapPickerVisible] = useState(false);
  const [mapSearchQuery, setMapSearchQuery] = useState(initialServiceAddress);
  const [mapSearchError, setMapSearchError] = useState<string | null>(null);
  const [mapSearchBusy, setMapSearchBusy] = useState(false);
  const [scheduledAt, setScheduledAt] = useState(defaultScheduledAt);
  const [hoursRequired, setHoursRequired] = useState('2');
  const [notes, setNotes] = useState('');
  const [bookingReferencePhotoUri, setBookingReferencePhotoUri] = useState<
    string | null
  >(null);
  const [bookingReferencePhotoUrl, setBookingReferencePhotoUrl] = useState<
    string | null
  >(null);
  const [bookingReferenceUpload, setBookingReferenceUpload] =
    useState<UploadSummary | null>(null);
  const [addressGeoResult, setAddressGeoResult] =
    useState<GeoAddressResult | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promotionValidation, setPromotionValidation] =
    useState<PromotionValidationSummary | null>(null);
  const [pricingQuote, setPricingQuote] = useState<PricingQuoteSummary | null>(
    null,
  );
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<
    string | null
  >(null);
  const [pinAddressStatus, setPinAddressStatus] =
    useState<PinAddressStatus>('idle');
  const [lastResolvedPin, setLastResolvedPin] = useState<Pick<
    CustomerBookingMapPin,
    'latitude' | 'longitude'
  > | null>(null);
  const reverseGeocodeRequestRef = useRef(0);
  const latestServiceLocationRef = useRef(serviceLocation);

  const resolveServiceLocationPinAddress = useCallback(
    async (
      pin: CustomerBookingMapPin,
      mode: 'auto' | 'manual',
    ): Promise<void> => {
      const requestId = reverseGeocodeRequestRef.current + 1;
      reverseGeocodeRequestRef.current = requestId;
      setPinAddressStatus('resolving');
      if (mode === 'manual') {
        setBusyAction('geo-reverse-pin');
      }

      try {
        const result = await reverseGeocode(pin.latitude, pin.longitude, {
          ...apiOptions,
          language: 'en',
        });
        if (requestId !== reverseGeocodeRequestRef.current) {
          return;
        }

        const activePin =
          latestServiceLocationRef.current.pendingPin ??
          latestServiceLocationRef.current.confirmedPin;
        if (!isActivePinCoordinate(pin, activePin)) {
          return;
        }

        setServiceLocation((current) =>
          moveCustomerBookingPendingPin(
            current,
            result.latitude,
            result.longitude,
            result.formattedAddress,
          ),
        );
        setLastResolvedPin({
          latitude: result.latitude,
          longitude: result.longitude,
        });
        setMapSearchQuery(result.formattedAddress);
        setMapSearchError(null);
        setPinAddressStatus('idle');
        if (mode === 'manual') {
          setNotice('Pin address refreshed.');
        }
      } catch (error) {
        if (requestId !== reverseGeocodeRequestRef.current) {
          return;
        }
        const message = readError(error);
        setServiceLocation((current) => ({
          ...current,
          errorMessage: message,
        }));
        setPinAddressStatus('failed');
        if (mode === 'manual') {
          setNotice(message);
        }
      } finally {
        if (mode === 'manual') {
          setBusyAction(null);
        }
      }
    },
    [apiOptions, setBusyAction, setNotice],
  );

  useEffect(() => {
    latestServiceLocationRef.current = serviceLocation;
  }, [serviceLocation]);

  const pendingServicePin = serviceLocation.pendingPin;

  useEffect(() => {
    const pin = pendingServicePin;
    if (!mapPickerVisible || !pin) {
      setPinAddressStatus('idle');
      return undefined;
    }

    if (
      lastResolvedPin &&
      distanceBetweenCoordinatesMeters(pin, lastResolvedPin) <
        autoReverseGeocodeDistanceThresholdMeters
    ) {
      setPinAddressStatus('idle');
      return undefined;
    }

    setPinAddressStatus('scheduled');
    const timeout = setTimeout(() => {
      void resolveServiceLocationPinAddress(pin, 'auto');
    }, autoReverseGeocodeDebounceMs);

    return () => {
      clearTimeout(timeout);
    };
  }, [
    lastResolvedPin,
    mapPickerVisible,
    pendingServicePin,
    resolveServiceLocationPinAddress,
  ]);

  useEffect(() => {
    if (
      selectedSavedAddressId ||
      (address.trim() && address.trim() !== initialServiceAddress)
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
    setLastResolvedPin(null);
    setMapSearchQuery(value);
    setMapSearchError(null);
    setPinAddressStatus('idle');
    reverseGeocodeRequestRef.current += 1;
    setServiceLocation((current) =>
      updateCustomerBookingLocationAddress(current, value),
    );
  }

  function applySavedAddress(savedAddress: CustomerAddressSummary) {
    const nextLocation = customerBookingLocationFromSavedAddress(savedAddress);
    setSelectedSavedAddressId(savedAddress.id);
    setAddress(savedAddress.address);
    setMapSearchQuery(savedAddress.address);
    setMapSearchError(null);
    setPricingQuote(null);
    setServiceLocation(nextLocation);
    setLastResolvedPin(
      nextLocation.confirmedPin
        ? {
            latitude: nextLocation.confirmedPin.latitude,
            longitude: nextLocation.confirmedPin.longitude,
          }
        : null,
    );
    setPinAddressStatus('idle');
    setAddressGeoResult(
      nextLocation.confirmedPin
        ? {
            formattedAddress: nextLocation.confirmedPin.formattedAddress,
            latitude: nextLocation.confirmedPin.latitude,
            longitude: nextLocation.confirmedPin.longitude,
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
    options: {
      navigateOnScheduleFailure?: boolean;
      navigateOnSuccess?: boolean;
      showSuccessNotice?: boolean;
    } = {},
  ): Promise<BookingSummary | null> {
    if (!hasSession) {
      setNotice('Sign in before creating a booking.');
      setRoute({ role: null, screen: 'loginRole' });
      return null;
    }

    const scheduleValidation = validateSelectedSchedule();

    if (
      !selectedProvider ||
      !address.trim() ||
      !scheduleValidation.scheduledAtIso
    ) {
      setNotice('Choose a service provider, address, and schedule.');
      return null;
    }

    if (!canSubmitBookingWithServerScheduleValidation(scheduleValidation)) {
      handleScheduleValidationFailure(
        scheduleValidation.message,
        options.navigateOnScheduleFailure ?? true,
      );
      return null;
    }

    if (!validateServiceLocationForReview()) {
      return null;
    }

    setBookingSlotError('');
    setBusyAction('create-booking');
    try {
      const serviceId = selectedService?.id ?? selectedProvider.serviceId;
      const paymentMethod =
        selectedCustomerPaymentMethod?.methodType ?? 'cash_on_service';
      let quote = pricingQuote;

      if (serviceId && selectedProvider.providerId) {
        if (
          !isPricingQuoteFresh(quote, Date.now(), {
            providerId: selectedProvider.providerId,
            serviceId,
            serviceAddress: address,
            scheduledAt: scheduleValidation.scheduledAtIso,
            hoursRequired: Number(hoursRequired) || 1,
            pricingMode: selectedProvider.pricingMode,
          })
        ) {
          try {
            quote = await fetchPricingQuote();
            setPricingQuote(quote);
          } catch (error) {
            if (!canSubmitBookingAfterPricingRefresh(paymentMethod)) {
              throw error;
            }
            quote = null;
            setPricingQuote(null);
          }
          if (!canSubmitBookingAfterPricingRefresh(paymentMethod)) {
            setNotice(
              'Pricing estimate refreshed. Review the updated breakdown before confirming.',
            );
            return null;
          }
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
        serviceLatitude: serviceLocation.confirmedPin?.latitude ?? null,
        serviceLongitude: serviceLocation.confirmedPin?.longitude ?? null,
        scheduledAt: scheduleValidation.scheduledAtIso,
        hoursRequired: Number(hoursRequired) || 1,
        serviceAmount:
          selectedProvider.price ??
          selectedService?.price ??
          quote?.estimatedTotal ??
          0,
        pricingMode: selectedProvider.pricingMode,
        acceptedQuoteId: null,
        paymentMethod,
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
        if (options.navigateOnScheduleFailure ?? true) {
          setRoute({ role: 'customer', screen: 'customerBookingForm' });
        }
      } else {
        setNotice(message);
      }
      return null;
    } finally {
      setBusyAction(null);
    }
  }

  async function fetchPricingQuote(): Promise<PricingQuoteSummary> {
    const scheduleValidation = validateSelectedSchedule();
    const serviceId =
      selectedService?.id ?? selectedProvider?.serviceId ?? null;
    if (
      !selectedProvider ||
      !serviceId ||
      !address.trim() ||
      !scheduleValidation.scheduledAtIso
    ) {
      throw new Error(
        'Choose a service provider, address, and schedule first.',
      );
    }
    if (!scheduleValidation.isValid) {
      throw new Error(
        scheduleValidation.message ?? 'Choose an available future schedule.',
      );
    }

    return createPricingQuote(
      {
        providerId: selectedProvider.providerId,
        serviceId,
        serviceAddress: address.trim(),
        scheduledAt: scheduleValidation.scheduledAtIso,
        hoursRequired: Number(hoursRequired) || 1,
        bookingUrgency: 'standard',
        region: 'default',
        destination: serviceLocation.confirmedPin
          ? {
              latitude: serviceLocation.confirmedPin.latitude,
              longitude: serviceLocation.confirmedPin.longitude,
            }
          : addressGeoResult
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
      setNotice('Sign in before reviewing the price estimate.');
      return false;
    }

    const scheduleValidation = validateSelectedSchedule();
    if (!scheduleValidation.isValid) {
      handleScheduleValidationFailure(scheduleValidation.message);
      return false;
    }

    if (!validateServiceLocationForReview()) {
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
        `${readError(error)} Review the fallback breakdown now; final pricing refreshes on confirmation.`,
      );
      return true;
    } finally {
      setBusyAction(null);
    }
  }

  async function previewPricingQuote() {
    if (!hasSession) {
      setNotice('Sign in before requesting a price estimate.');
      return null;
    }

    const scheduleValidation = validateSelectedSchedule();
    if (!scheduleValidation.isValid) {
      handleScheduleValidationFailure(scheduleValidation.message);
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
      const promotion = await validatePromotion(
        selectedBooking.id,
        code,
        apiOptions,
      );
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

    setBusyAction('geo-map-search');
    try {
      const result = await geocodeAddress(trimmed, {
        ...apiOptions,
        language: 'en',
        region: 'PH',
      });
      const nextLocation = startCustomerBookingPendingPin(
        serviceLocation,
        result,
        'search',
      );
      setAddress(result.formattedAddress);
      setAddressGeoResult(result);
      setServiceLocation(nextLocation);
      setMapSearchQuery(result.formattedAddress);
      setMapSearchError(null);
      setLastResolvedPin({
        latitude: result.latitude,
        longitude: result.longitude,
      });
      setPinAddressStatus('idle');
      setMapPickerVisible(true);
      setNotice(addressVerifiedNotice(result));
    } catch (error) {
      setAddressGeoResult(null);
      setServiceLocation((current) =>
        failCustomerBookingLocationResolution(current, readError(error)),
      );
      setNotice(`${readError(error)} ${customerMapPinFallbackCopy}`);
    } finally {
      setBusyAction(null);
    }
  }

  async function searchServiceLocationPin(): Promise<void> {
    const trimmed = mapSearchQuery.trim();
    if (!trimmed) {
      setMapSearchError('Enter an address or place to search.');
      return;
    }

    setMapSearchBusy(true);
    setBusyAction('geo-picker-search');
    setMapSearchError(null);
    try {
      const result = await geocodeAddress(trimmed, {
        ...apiOptions,
        language: 'en',
        region: 'PH',
      });
      reverseGeocodeRequestRef.current += 1;
      const nextLocation = startCustomerBookingPendingPin(
        latestServiceLocationRef.current,
        result,
        'search',
      );
      setSelectedSavedAddressId(null);
      setAddress(result.formattedAddress);
      setAddressGeoResult(result);
      setServiceLocation(nextLocation);
      setMapSearchQuery(result.formattedAddress);
      setLastResolvedPin({
        latitude: result.latitude,
        longitude: result.longitude,
      });
      setPinAddressStatus('idle');
      setMapPickerVisible(true);
      setNotice('Search result pinned. Confirm the service pin before review.');
    } catch (error) {
      const message = readError(error);
      setMapSearchError(message);
      setNotice(message);
    } finally {
      setMapSearchBusy(false);
      setBusyAction(null);
    }
  }

  async function useCurrentServiceLocation(): Promise<void> {
    setBusyAction('geo-current-location');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== Location.PermissionStatus.GRANTED) {
        setNotice(
          'Location permission is required to use your current address.',
        );
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

      const nextLocation = startCustomerBookingPendingPin(
        serviceLocation,
        result,
        'current',
      );
      setAddress(result.formattedAddress);
      setAddressGeoResult(result);
      setServiceLocation(nextLocation);
      setMapSearchQuery(result.formattedAddress);
      setMapSearchError(null);
      setLastResolvedPin({
        latitude: result.latitude,
        longitude: result.longitude,
      });
      setPinAddressStatus('idle');
      setMapPickerVisible(true);
      setNotice(
        'Current location found. Confirm the service pin before review.',
      );
    } catch (error) {
      setAddressGeoResult(null);
      setServiceLocation((current) =>
        failCustomerBookingLocationResolution(current, readError(error)),
      );
      setNotice(`${readError(error)} ${customerMapPinFallbackCopy}`);
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
          latitude:
            serviceLocation.confirmedPin?.latitude ??
            addressGeoResult?.latitude ??
            null,
          longitude:
            serviceLocation.confirmedPin?.longitude ??
            addressGeoResult?.longitude ??
            null,
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

  async function openServiceLocationPicker(): Promise<void> {
    const existingPin =
      serviceLocation.pendingPin ?? serviceLocation.confirmedPin ?? null;
    if (existingPin) {
      setLastResolvedPin({
        latitude: existingPin.latitude,
        longitude: existingPin.longitude,
      });
      setPinAddressStatus('idle');
      setServiceLocation((current) => ({
        ...current,
        pendingPin: existingPin,
        status: 'pending',
        errorMessage: null,
      }));
      setMapSearchQuery(existingPin.formattedAddress || address);
      setMapSearchError(null);
      setMapPickerVisible(true);
      return;
    }

    await verifyServiceAddress();
  }

  function closeServiceLocationPicker() {
    reverseGeocodeRequestRef.current += 1;
    setPinAddressStatus('idle');
    setMapSearchError(null);
    setMapPickerVisible(false);
  }

  function setServiceLocationManualDetails(value: string) {
    setServiceLocation((current) => ({
      ...current,
      manualDetails: value,
    }));
  }

  function moveServiceLocationPin(
    latitude: number,
    longitude: number,
    formattedAddress?: string,
  ) {
    setMapSearchError(null);
    setServiceLocation((current) =>
      moveCustomerBookingPendingPin(
        current,
        latitude,
        longitude,
        formattedAddress,
      ),
    );
  }

  async function reverseGeocodeServiceLocationPin(): Promise<void> {
    const pin = serviceLocation.pendingPin ?? serviceLocation.confirmedPin;
    if (!pin) {
      setNotice('Choose a map pin first.');
      return;
    }

    await resolveServiceLocationPinAddress(pin, 'manual');
  }

  function confirmServiceLocationPin() {
    const pin = serviceLocation.pendingPin ?? serviceLocation.confirmedPin;
    if (!pin) {
      setNotice(customerMapPinRequiredCopy);
      return;
    }

    reverseGeocodeRequestRef.current += 1;
    const detail = serviceLocation.manualDetails.trim();
    const confirmedAddress = detail
      ? `${pin.formattedAddress} - ${detail}`
      : pin.formattedAddress;
    const nextLocation = confirmCustomerBookingPin(
      {
        ...serviceLocation,
        pendingPin: pin,
      },
      confirmedAddress,
    );

    setServiceLocation(nextLocation);
    setAddress(nextLocation.addressText);
    setLastResolvedPin(
      nextLocation.confirmedPin
        ? {
            latitude: nextLocation.confirmedPin.latitude,
            longitude: nextLocation.confirmedPin.longitude,
          }
        : null,
    );
    setPinAddressStatus('idle');
    setAddressGeoResult(
      nextLocation.confirmedPin
        ? {
            formattedAddress: nextLocation.confirmedPin.formattedAddress,
            latitude: nextLocation.confirmedPin.latitude,
            longitude: nextLocation.confirmedPin.longitude,
            provider: 'mock',
          }
        : null,
    );
    setPricingQuote(null);
    setMapPickerVisible(false);
    setNotice('Service pin confirmed.');
  }

  function validateServiceLocationForReview(): boolean {
    if (customerBookingLocationCanContinue(serviceLocation)) {
      return true;
    }

    if (serviceLocation.status === 'error') {
      setNotice(
        customerBookingLocationNotice(serviceLocation) ??
          customerMapPinFallbackCopy,
      );
      return true;
    }

    setNotice(
      customerBookingLocationNotice(serviceLocation) ??
        customerMapPinRequiredCopy,
    );
    return false;
  }

  function validateSelectedSchedule() {
    return validateCustomerBookingScheduleSelection({
      providerAvailability,
      scheduledAt,
      durationHours: Number(hoursRequired) || 1,
      timeSlots,
      now: now?.() ?? new Date(),
    });
  }

  function handleScheduleValidationFailure(
    message: string | null,
    navigateOnScheduleFailure = true,
  ) {
    const scheduleMessage = message ?? 'Choose an available future schedule.';
    setBookingSlotError(scheduleMessage);
    setNotice(scheduleMessage);
    if (selectedProvider) {
      onRefreshProviderAvailability(selectedProvider.providerId);
    }
    if (navigateOnScheduleFailure) {
      setRoute({ role: 'customer', screen: 'customerBookingForm' });
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
      mapSearchBusy,
      mapSearchError,
      mapSearchQuery,
      mapPickerVisible,
      notes,
      pinAddressStatus,
      pricingQuote,
      promoCode,
      promotionValidation,
      scheduledAt,
      savedAddresses: customerAddresses,
      selectedSavedAddressId,
      serviceLocation,
    },
    actions: {
      applySavedAddress,
      applyPromotionCode,
      closeServiceLocationPicker,
      confirmServiceLocationPin,
      moveServiceLocationPin,
      openServiceLocationPicker,
      prepareBookingReview,
      previewPricingQuote,
      reverseGeocodeServiceLocationPin,
      saveCurrentAddressAsHome,
      searchServiceLocationPin,
      setAddress: setServiceAddress,
      setBookingReferenceUploadResult,
      setBookingSlotError,
      setHoursRequired,
      setMapSearchQuery,
      setServiceLocationManualDetails,
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

function isActivePinCoordinate(
  requestedPin: Pick<CustomerBookingMapPin, 'latitude' | 'longitude'>,
  activePin: Pick<CustomerBookingMapPin, 'latitude' | 'longitude'> | null,
): boolean {
  if (!activePin) {
    return false;
  }

  return (
    Math.abs(requestedPin.latitude - activePin.latitude) < 0.000001 &&
    Math.abs(requestedPin.longitude - activePin.longitude) < 0.000001
  );
}

function distanceBetweenCoordinatesMeters(
  first: Pick<CustomerBookingMapPin, 'latitude' | 'longitude'>,
  second: Pick<CustomerBookingMapPin, 'latitude' | 'longitude'>,
): number {
  const earthRadiusMeters = 6371000;
  const firstLatitude = toRadians(first.latitude);
  const secondLatitude = toRadians(second.latitude);
  const latitudeDelta = toRadians(second.latitude - first.latitude);
  const longitudeDelta = toRadians(second.longitude - first.longitude);
  const haversine =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDelta / 2) *
      Math.sin(longitudeDelta / 2);

  return (
    2 *
    earthRadiusMeters *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}
