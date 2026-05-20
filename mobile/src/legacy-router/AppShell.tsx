import { StatusBar } from 'expo-status-bar';
import { ReactNode, Suspense } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { palette, radius, spacing } from '../theme/serveaseDesign';

type AppShellProps = {
  busyAction: string | null;
  children: ReactNode;
  notice: string;
};

export function AppShell({ busyAction, children, notice }: AppShellProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      {children}
      {busyAction ? (
        <View style={styles.busyPill}>
          <ActivityIndicator color={palette.white} />
          <Text style={styles.busyText}>{notice}</Text>
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
