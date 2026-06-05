import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar, type StatusBarStyle } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { ReactNode, Suspense, useEffect } from 'react';
import {
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { shouldShowGlobalBusyPill } from '../domain/mobileLoading';
import { RouteLoadingSurface } from '../shared/components/LoadingStates';
import { palette } from '../theme/serveaseDesign';

type AppShellProps = {
  busyAction: string | null;
  children: ReactNode;
  backgroundColor?: string;
  statusBarStyle?: StatusBarStyle;
};

export function AppShell({
  busyAction,
  children,
  backgroundColor,
  statusBarStyle,
}: AppShellProps) {
  const shellBackground = backgroundColor ?? palette.white;
  const showGlobalBusy = shouldShowGlobalBusyPill(busyAction);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(shellBackground).catch(() => undefined);

    if (Platform.OS === 'android') {
      void NavigationBar.setPositionAsync('absolute').catch(() => undefined);
      void NavigationBar.setBackgroundColorAsync('transparent').catch(() => undefined);
      void NavigationBar.setButtonStyleAsync('dark').catch(() => undefined);
    }
  }, [shellBackground]);

  return (
    <SafeAreaView
      edges={backgroundColor ? [] : ['top']}
      style={[styles.safeArea, { backgroundColor: shellBackground }]}
    >
      <StatusBar
        backgroundColor="transparent"
        style={statusBarStyle ?? (backgroundColor ? 'light' : 'dark')}
        translucent
      />
      {children}
      {showGlobalBusy ? <RouteLoadingSurface label="Loading app state" /> : null}
    </SafeAreaView>
  );
}

export function RouteSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteLoading />}>{children}</Suspense>;
}

export function RouteLoading() {
  return <RouteLoadingSurface />;
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: palette.white,
    flex: 1,
  },
});
