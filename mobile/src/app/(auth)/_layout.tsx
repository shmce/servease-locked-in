import { Stack } from 'expo-router';
import { palette } from '../../theme/serveaseDesign';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        animation: 'fade',
        contentStyle: { backgroundColor: palette.white },
        headerShown: false,
      }}
    />
  );
}
