import { Redirect } from 'expo-router';
import { legacyShellHref } from '../../navigation/expoRouteCompatibility';

export default function CustomerBookingsRoute() {
  return <Redirect href={legacyShellHref({ role: 'customer', screen: 'bookings' })} />;
}
