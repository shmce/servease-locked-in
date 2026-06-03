import { Redirect } from 'expo-router';
import { legacyShellHref } from '../../navigation/expoRouteCompatibility';

export default function ProviderMoreRoute() {
  return <Redirect href={legacyShellHref({ role: 'provider', screen: 'more' })} />;
}
