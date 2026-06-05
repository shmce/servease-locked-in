import { Redirect } from 'expo-router';
import { legacyShellHref } from '../../navigation/expoRouteCompatibility';

export default function ProviderHomeRoute() {
  return <Redirect href={legacyShellHref({ role: 'provider', screen: 'home' })} />;
}
