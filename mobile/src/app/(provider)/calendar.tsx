import { Redirect } from 'expo-router';
import { legacyShellHref } from '../../navigation/expoRouteCompatibility';

export default function ProviderCalendarRoute() {
  return <Redirect href={legacyShellHref({ role: 'provider', screen: 'calendar' })} />;
}
