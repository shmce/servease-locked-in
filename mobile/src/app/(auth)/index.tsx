import { Redirect } from 'expo-router';
import { legacyShellHref } from '../../navigation/expoRouteCompatibility';

export default function AuthIndexRoute() {
  return <Redirect href={legacyShellHref({ role: null, screen: 'authGate' })} />;
}
