import { Redirect } from 'expo-router';
import { legacyShellHref } from '../../navigation/expoRouteCompatibility';

export default function ProviderMessagesRoute() {
  return <Redirect href={legacyShellHref({ role: 'provider', screen: 'messages' })} />;
}
