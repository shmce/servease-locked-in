import type {
  CustomerAddressSummary,
  GeoAddressResult,
} from '../shared/models/types';

export type CustomerBookingLocationSource =
  | 'current'
  | 'search'
  | 'saved'
  | 'manual';

export type CustomerBookingLocationStatus =
  | 'unconfirmed'
  | 'pending'
  | 'confirmed'
  | 'stale'
  | 'error';

export interface CustomerBookingMapPin {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  source: CustomerBookingLocationSource;
}

export interface CustomerBookingLocationState {
  addressText: string;
  confirmedPin: CustomerBookingMapPin | null;
  pendingPin: CustomerBookingMapPin | null;
  manualDetails: string;
  source: CustomerBookingLocationSource;
  status: CustomerBookingLocationStatus;
  errorMessage: string | null;
}

export const customerMapPinRequiredCopy =
  'Choose or confirm the service location on the map.';

export const customerMapPinFallbackCopy =
  'Location could not be verified. You can still type the address, but the pin is not confirmed.';

export function createCustomerBookingLocationState(
  addressText = '',
): CustomerBookingLocationState {
  return {
    addressText,
    confirmedPin: null,
    pendingPin: null,
    manualDetails: '',
    source: 'manual',
    status: addressText.trim() ? 'unconfirmed' : 'unconfirmed',
    errorMessage: null,
  };
}

export function customerBookingLocationFromGeoResult(
  result: GeoAddressResult,
  source: CustomerBookingLocationSource,
): CustomerBookingLocationState {
  return confirmCustomerBookingPin(
    {
      ...createCustomerBookingLocationState(result.formattedAddress),
      pendingPin: pinFromGeoResult(result, source),
      source,
      status: 'pending',
    },
    result.formattedAddress,
  );
}

export function customerBookingLocationFromSavedAddress(
  address: CustomerAddressSummary,
): CustomerBookingLocationState {
  const state = createCustomerBookingLocationState(address.address);
  if (address.latitude === null || address.longitude === null) {
    return state;
  }

  return confirmCustomerBookingPin(
    {
      ...state,
      pendingPin: {
        formattedAddress: address.address,
        latitude: address.latitude,
        longitude: address.longitude,
        source: 'saved',
      },
      source: 'saved',
      status: 'pending',
    },
    address.address,
  );
}

export function startCustomerBookingPendingPin(
  state: CustomerBookingLocationState,
  result: GeoAddressResult,
  source: CustomerBookingLocationSource,
): CustomerBookingLocationState {
  return {
    ...state,
    addressText: result.formattedAddress,
    pendingPin: pinFromGeoResult(result, source),
    source,
    status: 'pending',
    errorMessage: null,
  };
}

export function moveCustomerBookingPendingPin(
  state: CustomerBookingLocationState,
  latitude: number,
  longitude: number,
  formattedAddress = state.pendingPin?.formattedAddress || state.addressText,
): CustomerBookingLocationState {
  if (
    state.pendingPin &&
    state.pendingPin.latitude === latitude &&
    state.pendingPin.longitude === longitude &&
    state.pendingPin.formattedAddress === formattedAddress
  ) {
    return state;
  }

  return {
    ...state,
    pendingPin: {
      formattedAddress,
      latitude,
      longitude,
      source: state.source === 'saved' ? 'manual' : state.source,
    },
    source: state.source === 'saved' ? 'manual' : state.source,
    status: 'pending',
    errorMessage: null,
  };
}

export function confirmCustomerBookingPin(
  state: CustomerBookingLocationState,
  addressText = state.pendingPin?.formattedAddress ?? state.addressText,
): CustomerBookingLocationState {
  if (!state.pendingPin) {
    return state;
  }

  return {
    ...state,
    addressText,
    confirmedPin: {
      ...state.pendingPin,
      formattedAddress: addressText,
    },
    pendingPin: null,
    status: 'confirmed',
    errorMessage: null,
  };
}

export function updateCustomerBookingLocationAddress(
  state: CustomerBookingLocationState,
  addressText: string,
): CustomerBookingLocationState {
  if (addressText === state.addressText) {
    return state;
  }

  return {
    ...state,
    addressText,
    confirmedPin: null,
    pendingPin: null,
    source: 'manual',
    status: state.confirmedPin ? 'stale' : 'unconfirmed',
    errorMessage: state.confirmedPin ? customerMapPinRequiredCopy : null,
  };
}

export function failCustomerBookingLocationResolution(
  state: CustomerBookingLocationState,
  message: string,
): CustomerBookingLocationState {
  return {
    ...state,
    pendingPin: null,
    status: 'error',
    errorMessage: message || customerMapPinFallbackCopy,
  };
}

export function customerBookingLocationCanContinue(
  state: CustomerBookingLocationState,
): boolean {
  return state.status === 'confirmed' && state.confirmedPin !== null;
}

export function customerBookingLocationNotice(
  state: CustomerBookingLocationState,
): string | null {
  if (state.status === 'error') {
    return customerMapPinFallbackCopy;
  }
  if (state.status === 'stale' || state.status === 'unconfirmed') {
    return customerMapPinRequiredCopy;
  }
  return null;
}

function pinFromGeoResult(
  result: GeoAddressResult,
  source: CustomerBookingLocationSource,
): CustomerBookingMapPin {
  return {
    formattedAddress: result.formattedAddress,
    latitude: result.latitude,
    longitude: result.longitude,
    source,
  };
}
