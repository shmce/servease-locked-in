import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  SkeletonBlock,
  SkeletonCard,
  SkeletonCircle,
  SkeletonLine,
} from '../../components/DesignKit';
import { MotionView, StaggeredMotionView } from '../../components/Motion';
import { palette, radius, spacing } from '../../theme/serveaseDesign';

type SkeletonGroupProps = {
  children?: ReactNode;
  label?: string;
};

export function RouteLoadingSurface({
  label = 'Loading screen',
}: {
  label?: string;
}) {
  return (
    <MotionView
      style={styles.routeSurface}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      variant="loading"
    >
      <View style={styles.routeContent}>
        <SkeletonCircle size={54} />
        <SkeletonLine width="54%" height={18} />
        <SkeletonLine width="78%" height={12} />
        <SkeletonCard style={styles.routeCard}>
          <SkeletonLine width="36%" height={12} />
          <SkeletonLine width="72%" height={16} />
          <SkeletonLine width="88%" height={10} />
          <SkeletonBlock height={42} radius={radius.pill} style={styles.routeButton} />
        </SkeletonCard>
        <ListSectionSkeleton count={3} />
      </View>
    </MotionView>
  );
}

export function DashboardScreenSkeleton({
  label = 'Loading dashboard',
}: {
  label?: string;
}) {
  return (
    <MotionView
      style={styles.screenGroup}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      variant="loading"
    >
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <SkeletonLine width="56%" height={20} />
          <SkeletonLine width="38%" height={12} />
        </View>
        <SkeletonCircle size={52} />
      </View>
      <SkeletonBlock height={56} radius={radius.lg} />
      <SkeletonCard style={styles.dashboardCard}>
        <SkeletonLine width="44%" height={12} />
        <SkeletonLine width="72%" height={24} />
        <SkeletonLine width="52%" height={12} />
      </SkeletonCard>
      <ListSectionSkeleton count={2} />
    </MotionView>
  );
}

export function DetailScreenSkeleton({
  label = 'Loading details',
}: {
  label?: string;
}) {
  return (
    <MotionView
      style={styles.screenGroup}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      variant="loading"
    >
      <SkeletonLine width="46%" height={22} />
      <SkeletonLine width="64%" height={12} />
      <SkeletonCard style={styles.detailCard}>
        <SkeletonLine width="38%" height={12} />
        <SkeletonLine width="84%" height={22} />
        <SkeletonLine width="72%" height={12} />
        <View style={styles.inlineRow}>
          <SkeletonCircle size={34} />
          <View style={styles.inlineCopy}>
            <SkeletonLine width="78%" />
            <SkeletonLine width="48%" />
          </View>
        </View>
      </SkeletonCard>
      <ListSectionSkeleton count={3} />
    </MotionView>
  );
}

export function ListSectionSkeleton({
  count = 3,
  label,
}: {
  count?: number;
  label?: string;
}) {
  return (
    <View
      style={styles.listGroup}
      accessibilityRole={label ? 'progressbar' : undefined}
      accessibilityLabel={label}
    >
      {Array.from({ length: count }).map((_, index) => (
        <StaggeredMotionView key={index} index={index} variant="loading">
          <SkeletonCard style={styles.listCard}>
            <SkeletonCircle size={40} />
            <View style={styles.inlineCopy}>
              <SkeletonLine width="72%" height={13} />
              <SkeletonLine width="54%" height={10} />
            </View>
          </SkeletonCard>
        </StaggeredMotionView>
      ))}
    </View>
  );
}

export function InlineRefreshHint({
  label = 'Refreshing',
}: {
  label?: string;
}) {
  return (
    <MotionView
      style={styles.refreshHint}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      variant="loading"
    >
      <SkeletonLine width={52} height={8} />
      <Text style={styles.refreshText}>{label}</Text>
    </MotionView>
  );
}

export function LoadingGroup({ children, label }: SkeletonGroupProps) {
  return (
    <MotionView
      style={styles.screenGroup}
      accessibilityRole={label ? 'progressbar' : undefined}
      accessibilityLabel={label}
      variant="loading"
    >
      {children}
    </MotionView>
  );
}

const styles = StyleSheet.create({
  routeSurface: {
    backgroundColor: palette.cream,
    flex: 1,
    justifyContent: 'center',
    minHeight: 420,
    padding: spacing.lg,
  },
  routeContent: {
    alignSelf: 'stretch',
    gap: spacing.md,
  },
  routeCard: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  routeButton: {
    marginTop: spacing.sm,
  },
  screenGroup: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  headerCopy: {
    flex: 1,
    gap: spacing.sm,
  },
  dashboardCard: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  detailCard: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  listGroup: {
    gap: spacing.md,
  },
  listCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  inlineRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  inlineCopy: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  refreshHint: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  refreshText: {
    color: palette.mintDeep,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 16,
  },
});
