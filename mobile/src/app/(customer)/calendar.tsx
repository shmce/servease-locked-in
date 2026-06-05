import { Redirect } from 'expo-router';
import { legacyShellHref } from '../../navigation/expoRouteCompatibility';

export default function CustomerCalendarRoute() {
  return <Redirect href={legacyShellHref({ role: 'customer', screen: 'calendar' })} />;
}
