import { Stack } from 'expo-router';
import { palette } from '../../theme/serveaseDesign';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: palette.white },
        headerShown: false,
      }}
    />
  );
}
