import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  confirmCustomerBookingPin,
  createCustomerBookingLocationState,
  customerBookingLocationFromSavedAddress,
  customerMapPinRequiredCopy,
  moveCustomerBookingPendingPin,
  startCustomerBookingPendingPin,
} from '../../../domain/customerBookingLocation';
import type {
  CustomerBookingLocationState,
  CustomerBookingMapPin,
} from '../../../domain/customerBookingLocation';
import { readError } from '../../../navigation/routeHelpers';
import type {
  ApiOptions,
  CustomerAddressSummary,
  GeoAddressResult,
} from '../../../shared/models/types';
import {
  createCustomerAddress,
  geocodeAddress,
  reverseGeocode,
  updateCustomerAddress,
} from '../../../shared/models/apiService';
import type { CustomerPinAddressStatus } from '../../customer-location/components/CustomerMapPinPickerModal';
import { buildCustomerAddressPinPayload } from './customerAddressPinPayload';

const autoReverseGeocodeDebounceMs = 750;
const autoReverseGeocodeDistanceThresholdMeters = 20;
const defaultAddressLabel = 'Home';

type CustomerAddressPinFlowInput = {
  addresses: CustomerAddressSummary[];
  apiOptions: ApiOptions;
  hasSession: boolean;
  onCustomerAddressSaved: (address: CustomerAddressSummary) => void;
  setBusyAction: (busyAction: string | null) => void;
  setNotice: (notice: string) => void;
};

export function useCustomerAddressPinFlow({
  addresses,
  apiOptions,
  hasSession,
  onCustomerAddressSaved,
  setBusyAction,
  setNotice,
}: CustomerAddressPinFlowInput) {
  const [draftLabel, setDraftLabel] = useState(defaultAddressLabel);
  const [serviceLocation, setServiceLocation] =
    useState<CustomerBookingLocationState>(() =>
      createCustomerBookingLocationState(''),
    );
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const [mapPickerVisible, setMapPickerVisible] = useState(false);
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [mapSearchError, setMapSearchError] = useState<string | null>(null);
  const [mapSearchBusy, setMapSearchBusy] = useState(false);
  const [pinAddressStatus, setPinAddressStatus] =
    useState<CustomerPinAddressStatus>('idle');
  const [lastResolvedPin, setLastResolvedPin] = useState<Pick<
    CustomerBookingMapPin,
    'latitude' | 'longitude'
  > | null>(null);
  const reverseGeocodeRequestRef = useRef(0);
  const latestServiceLocationRef = useRef(serviceLocation);

  const resolvePinAddress = useCallback(
    async (
      pin: CustomerBookingMapPin,
      mode: 'auto' | 'manual',
    ): Promise<void> => {
      const requestId = reverseGeocodeRequestRef.current + 1;
      reverseGeocodeRequestRef.current = requestId;
      setPinAddressStatus('resolving');
      if (mode === 'manual') {
        setBusyAction('customer-address-reverse-pin');
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

  const pendingPin = serviceLocation.pendingPin;

  useEffect(() => {
    const pin = pendingPin;
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
      void resolvePinAddress(pin, 'auto');
    }, autoReverseGeocodeDebounceMs);

    return () => {
      clearTimeout(timeout);
    };
  }, [lastResolvedPin, mapPickerVisible, pendingPin, resolvePinAddress]);

  function resetDraft() {
    reverseGeocodeRequestRef.current += 1;
    setDraftLabel(defaultAddressLabel);
    setServiceLocation(createCustomerBookingLocationState(''));
    setEditTargetId(null);
    setMapPickerVisible(false);
    setMapSearchQuery('');
    setMapSearchError(null);
    setMapSearchBusy(false);
    setPinAddressStatus('idle');
    setLastResolvedPin(null);
  }

  function openNewAddressPinPicker() {
    setMapSearchError(null);
    setMapPickerVisible(true);
  }

  function openExistingAddressPinPicker(address: CustomerAddressSummary) {
    const nextLocation = customerBookingLocationFromSavedAddress(address);
    setDraftLabel(address.label || defaultAddressLabel);
    setEditTargetId(address.id);
    setServiceLocation(nextLocation);
    setMapSearchQuery(address.address);
    setMapSearchError(null);
    setMapPickerVisible(true);
    setLastResolvedPin(
      nextLocation.confirmedPin
        ? {
            latitude: nextLocation.confirmedPin.latitude,
            longitude: nextLocation.confirmedPin.longitude,
          }
        : null,
    );
    setPinAddressStatus('idle');
  }

  function closeMapPicker() {
    reverseGeocodeRequestRef.current += 1;
    setMapPickerVisible(false);
    setMapSearchError(null);
    setPinAddressStatus('idle');
  }

  function setManualDetails(value: string) {
    setServiceLocation((current) => ({
      ...current,
      manualDetails: value,
    }));
  }

  function movePin(
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

  async function searchMapPin(): Promise<void> {
    const trimmed = mapSearchQuery.trim();
    if (!trimmed) {
      setMapSearchError('Enter an address or place to search.');
      return;
    }

    setMapSearchBusy(true);
    setBusyAction('customer-address-map-search');
    setMapSearchError(null);
    try {
      const result = await geocodeAddress(trimmed, {
        ...apiOptions,
        language: 'en',
        region: 'PH',
      });
      reverseGeocodeRequestRef.current += 1;
      applyGeoResult(result, 'search');
      setNotice('Search result pinned. Confirm the saved address pin.');
    } catch (error) {
      const message = readError(error);
      setMapSearchError(message);
      setNotice(message);
    } finally {
      setMapSearchBusy(false);
      setBusyAction(null);
    }
  }

  async function useCurrentLocation(): Promise<void> {
    setBusyAction('customer-address-current-location');
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
      applyGeoResult(result, 'current');
      setMapPickerVisible(true);
      setNotice('Current location found. Confirm the saved address pin.');
    } catch (error) {
      setMapSearchError(readError(error));
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function refreshPinAddress(): Promise<void> {
    const pin = serviceLocation.pendingPin ?? serviceLocation.confirmedPin;
    if (!pin) {
      setNotice('Choose a map pin first.');
      return;
    }

    await resolvePinAddress(pin, 'manual');
  }

  function confirmPin() {
    const pin = serviceLocation.pendingPin ?? serviceLocation.confirmedPin;
    if (!pin) {
      setNotice(customerMapPinRequiredCopy);
      return;
    }
    if (!pin.formattedAddress.trim()) {
      setNotice('Wait for the pin address to load or tap Refresh.');
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
    setMapSearchQuery(confirmedAddress);
    setLastResolvedPin(
      nextLocation.confirmedPin
        ? {
            latitude: nextLocation.confirmedPin.latitude,
            longitude: nextLocation.confirmedPin.longitude,
          }
        : null,
    );
    setMapPickerVisible(false);
    setPinAddressStatus('idle');
    setNotice(
      editTargetId
        ? 'Address pin ready to update.'
        : 'Address pin ready to save.',
    );
  }

  async function saveAddress(): Promise<void> {
    if (!hasSession) {
      setNotice('Sign in before saving an address.');
      return;
    }

    const payload = buildCustomerAddressPinPayload({
      draftLabel,
      serviceLocation,
    });
    if (!payload) {
      setNotice('Confirm the map pin before saving this address.');
      return;
    }
    setBusyAction(
      editTargetId
        ? `update-customer-address-${editTargetId}`
        : 'save-customer-address',
    );
    try {
      const savedAddress = editTargetId
        ? await updateCustomerAddress(editTargetId, payload, apiOptions)
        : await createCustomerAddress(
            {
              ...payload,
              isDefault: addresses.length === 0,
            },
            apiOptions,
          );
      onCustomerAddressSaved(savedAddress);
      resetDraft();
      setNotice(editTargetId ? 'Address pin updated.' : 'Address saved.');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  function applyGeoResult(
    result: GeoAddressResult,
    source: 'current' | 'search',
  ) {
    const nextLocation = startCustomerBookingPendingPin(
      latestServiceLocationRef.current,
      result,
      source,
    );
    setServiceLocation(nextLocation);
    setMapSearchQuery(result.formattedAddress);
    setMapSearchError(null);
    setLastResolvedPin({
      latitude: result.latitude,
      longitude: result.longitude,
    });
    setPinAddressStatus('idle');
    setMapPickerVisible(true);
  }

  return {
    data: {
      draftAddress: serviceLocation.addressText,
      draftLabel,
      editTargetId,
      isEditing: Boolean(editTargetId),
      mapPickerVisible,
      mapSearchBusy,
      mapSearchError,
      mapSearchQuery,
      pinAddressStatus,
      serviceLocation,
    },
    actions: {
      closeMapPicker,
      confirmPin,
      movePin,
      openExistingAddressPinPicker,
      openNewAddressPinPicker,
      refreshPinAddress,
      resetDraft,
      saveAddress,
      searchMapPin,
      setDraftLabel,
      setManualDetails,
      setMapSearchQuery,
      useCurrentLocation,
    },
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
  const centralAngle =
    2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return earthRadiusMeters * centralAngle;
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}
