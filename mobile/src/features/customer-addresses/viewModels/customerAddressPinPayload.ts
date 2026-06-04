import type { CustomerBookingLocationState } from '../../../domain/customerBookingLocation';

const defaultAddressLabel = 'Home';

export type CustomerAddressPinPayload = {
  address: string;
  label: string;
  latitude: number;
  longitude: number;
};

export function buildCustomerAddressPinPayload({
  draftLabel,
  serviceLocation,
}: {
  draftLabel: string;
  serviceLocation: CustomerBookingLocationState;
}): CustomerAddressPinPayload | null {
  const confirmedPin = serviceLocation.confirmedPin;
  if (!confirmedPin) {
    return null;
  }

  const address =
    serviceLocation.addressText.trim() || confirmedPin.formattedAddress.trim();
  if (!address) {
    return null;
  }

  return {
    address,
    label: draftLabel.trim() || defaultAddressLabel,
    latitude: confirmedPin.latitude,
    longitude: confirmedPin.longitude,
  };
}
