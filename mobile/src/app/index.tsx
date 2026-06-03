import { useLocalSearchParams } from 'expo-router';
import LegacyApp from '../App';
import { resolveLegacyShellRoute } from '../navigation/expoRouteCompatibility';

export default function LegacyAppRoute() {
  const { legacyRole, legacyScreen } = useLocalSearchParams<{
    legacyRole?: string | string[];
    legacyScreen?: string | string[];
  }>();
  const initialRoute = resolveLegacyShellRoute(legacyRole, legacyScreen);

  return <LegacyApp initialRoute={initialRoute} />;
}
