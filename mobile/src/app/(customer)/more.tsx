import { Redirect } from 'expo-router';
import { legacyShellHref } from '../../navigation/expoRouteCompatibility';

export default function CustomerMoreRoute() {
  return <Redirect href={legacyShellHref({ role: 'customer', screen: 'more' })} />;
}
