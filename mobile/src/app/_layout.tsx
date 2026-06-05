import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { palette } from '../theme/serveaseDesign';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          animation: 'fade',
          contentStyle: { backgroundColor: palette.white },
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(customer)" />
        <Stack.Screen name="(provider)" />
      </Stack>
    </>
  );
}
