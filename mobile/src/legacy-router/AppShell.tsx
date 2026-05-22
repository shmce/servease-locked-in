import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { ReactNode, Suspense, useEffect } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette, radius, spacing } from '../theme/serveaseDesign';

type AppShellProps = {
  busyAction: string | null;
  children: ReactNode;
  backgroundColor?: string;
};

export function AppShell({ busyAction, children, backgroundColor }: AppShellProps) {
  const shellBackground = backgroundColor ?? palette.white;

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
        style={backgroundColor ? 'light' : 'dark'}
        translucent
      />
      {children}
      {busyAction ? (
        <View style={styles.busyPill}>
          <ActivityIndicator color={palette.white} />
          <Text style={styles.busyText}>Loading...</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

export function RouteSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteLoading />}>{children}</Suspense>;
}

export function RouteLoading() {
  return (
    <View style={styles.routeLoading}>
      <ActivityIndicator color={palette.mint} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: palette.white,
    flex: 1,
  },
  routeLoading: {
    alignItems: 'center',
    backgroundColor: palette.cream,
    flex: 1,
    justifyContent: 'center',
    minHeight: 420,
  },
  busyPill: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: palette.mint,
    borderRadius: radius.pill,
    bottom: 112,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    position: 'absolute',
  },
  busyText: {
    color: palette.white,
    fontSize: 12,
    fontWeight: '800',
  },
});
