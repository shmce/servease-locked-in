import { Redirect } from 'expo-router';
import { legacyShellHref } from '../../navigation/expoRouteCompatibility';

export default function CustomerMessagesRoute() {
  return <Redirect href={legacyShellHref({ role: 'customer', screen: 'messages' })} />;
}
