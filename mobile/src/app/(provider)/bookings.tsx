import { Redirect } from 'expo-router';
import { legacyShellHref } from '../../navigation/expoRouteCompatibility';

export default function ProviderBookingsRoute() {
  return <Redirect href={legacyShellHref({ role: 'provider', screen: 'bookings' })} />;
}
