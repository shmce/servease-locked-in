import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { InfoRow } from '../../../components/AppDisplay';
import { PrimaryButton } from '../../../components/DesignKit';
import {
  BookingSummary,
  BookingTrackingSnapshot,
  GeoDirectionsRoute,
} from '../../../shared/models/types';
import { TrackingMapPreview } from '../../../tracking/TrackingMapPreview';
import { palette, radius, spacing, type } from '../../../theme/serveaseDesign';
import { ActionRow } from '../../../shared/components/ScreenLayout';
import {
  CustomerTrackingSheetLevel,
  useCustomerTrackProviderViewModel,
} from '../viewModels/useCustomerTrackProviderViewModel';

const sheetLevels: CustomerTrackingSheetLevel[] = ['peek', 'half', 'expanded'];
const sheetDragVelocityThreshold = 0.55;
const sheetSpringConfig = {
  damping: 24,
  mass: 0.9,
  stiffness: 190,
  useNativeDriver: false,
};

type CustomerTrackProviderScreenProps = {
  booking: BookingSummary;
  directions: GeoDirectionsRoute | null;
  navigationRouteError: string | null;
  navigationRouteLoading: boolean;
  trackingSnapshot: BookingTrackingSnapshot | null;
  sheetLevel: CustomerTrackingSheetLevel;
  onSheetLevelChange: (level: CustomerTrackingSheetLevel) => void;
  onClose: () => void;
  onRefresh: () => void;
  onMessage: () => void;
};

export function CustomerTrackProviderScreen({
  booking,
  directions,
  navigationRouteError,
  navigationRouteLoading,
  trackingSnapshot,
  sheetLevel,
  onSheetLevelChange,
  onClose,
  onRefresh,
  onMessage,
}: CustomerTrackProviderScreenProps) {
  const trackingViewModel = useCustomerTrackProviderViewModel({
    booking,
    directions,
    navigationRouteError,
    navigationRouteLoading,
    trackingSnapshot,
    sheetLevel,
  });
  const { data } = trackingViewModel;
  const { height: screenHeight } = useWindowDimensions();
  const sheetHeight = useRef(
    new Animated.Value(sheetHeightForLevel(sheetLevel, screenHeight)),
  ).current;
  const sheetDragStartHeight = useRef(sheetHeightForLevel(sheetLevel, screenHeight));

  useEffect(() => {
    Animated.spring(sheetHeight, {
      ...sheetSpringConfig,
      toValue: sheetHeightForLevel(sheetLevel, screenHeight),
    }).start();
  }, [screenHeight, sheetHeight, sheetLevel]);

  const customerSheetPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dy) > 8 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderGrant: () => {
          sheetHeight.stopAnimation((value) => {
            sheetDragStartHeight.current = value;
          });
        },
        onPanResponderMove: (_, gestureState) => {
          sheetHeight.setValue(
            clampSheetHeight(
              sheetDragStartHeight.current - gestureState.dy,
              screenHeight,
            ),
          );
        },
        onPanResponderRelease: (_, gestureState) => {
          const releasedHeight = clampSheetHeight(
            sheetDragStartHeight.current - gestureState.dy,
            screenHeight,
          );
          const nextLevel = nearestSheetLevel(
            sheetLevel,
            releasedHeight,
            gestureState.vy,
            screenHeight,
          );
          if (nextLevel !== sheetLevel) {
            onSheetLevelChange(nextLevel);
            return;
          }
          Animated.spring(sheetHeight, {
            ...sheetSpringConfig,
            toValue: sheetHeightForLevel(nextLevel, screenHeight),
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(sheetHeight, {
            ...sheetSpringConfig,
            toValue: sheetHeightForLevel(sheetLevel, screenHeight),
          }).start();
        },
      }),
    [onSheetLevelChange, screenHeight, sheetHeight, sheetLevel],
  );

  return (
    <View style={styles.navigationScreen}>
      <View style={styles.mapCanvas}>
        <Pressable
          style={styles.mapCloseButton}
          onPress={onClose}
          accessibilityRole="button"
        >
          <Text style={styles.mapCloseText}>Close</Text>
        </Pressable>
        <TrackingMapPreview
          tracking={data.tracking}
          mode="navigation"
          title="Track your provider"
          subtitle={data.routeLabel}
          directions={directions}
          destinationMarkerLabel="Service address"
          navigationOrigin={data.navigationOrigin}
          providerMarkerLabel="Provider"
        />
      </View>
      <Animated.View
        style={[
          styles.navBottomSheet,
          sheetStyle(sheetLevel),
          { height: sheetHeight },
        ]}
        {...customerSheetPanResponder.panHandlers}
      >
        <NavigationSheetHeader
          level={sheetLevel}
          title={data.phaseTitle}
          subtitle={data.routeLabel}
          onChangeLevel={onSheetLevelChange}
        />
        <CustomerTrackingRouteStats
          distanceLabel={data.distanceLabel}
          providerLocationLabel={data.providerLocationLabel}
          routeDurationLabel={data.routeDurationLabel}
        />
        {data.isHalfSheet ? (
          <>
            <Text style={styles.cardBody} numberOfLines={data.isExpandedSheet ? 4 : 2}>
              {data.addressLabel}
            </Text>
            <InfoRow label="Schedule" value={data.scheduleLabel} />
            <InfoRow label="Last update" value={data.lastUpdateLabel} />
            <InfoRow label="Provider GPS" value={data.providerLocationLabel} />
          </>
        ) : null}
        <ActionRow>
          <View style={styles.flex}>
            <PrimaryButton label="Refresh" variant="secondary" onPress={onRefresh} />
          </View>
          <View style={styles.flex}>
            <PrimaryButton label="Message" onPress={onMessage} />
          </View>
        </ActionRow>
      </Animated.View>
    </View>
  );
}

function CustomerTrackingRouteStats({
  distanceLabel,
  providerLocationLabel,
  routeDurationLabel,
}: {
  distanceLabel: string;
  providerLocationLabel: string;
  routeDurationLabel: string;
}) {
  return (
    <View style={styles.customerRouteStats}>
      <View style={styles.customerRouteStat}>
        <Text style={styles.customerRouteStatValue}>{routeDurationLabel}</Text>
        <Text style={styles.customerRouteStatLabel}>ETA</Text>
      </View>
      <View style={styles.customerRouteStat}>
        <Text style={styles.customerRouteStatValue}>{distanceLabel}</Text>
        <Text style={styles.customerRouteStatLabel}>Away</Text>
      </View>
      <View style={styles.customerRouteStat}>
        <Text style={styles.customerRouteStatValue} numberOfLines={1}>
          {providerLocationLabel}
        </Text>
        <Text style={styles.customerRouteStatLabel}>Provider GPS</Text>
      </View>
    </View>
  );
}

function NavigationSheetHeader({
  level,
  title,
  subtitle,
  onChangeLevel,
}: {
  level: CustomerTrackingSheetLevel;
  title: string;
  subtitle: string;
  onChangeLevel: (level: CustomerTrackingSheetLevel) => void;
}) {
  return (
    <View style={styles.navigationSheetHeader}>
      <Pressable
        style={styles.dragHandleButton}
        onPress={() => onChangeLevel(nextSheetLevel(level))}
        accessibilityRole="button"
        accessibilityLabel="Adjust tracking details"
      >
        <View style={styles.dragHandle} />
      </Pressable>
      <View style={styles.flex}>
        <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.cardMeta} numberOfLines={1}>{subtitle}</Text>
      </View>
    </View>
  );
}

function sheetStyle(level: CustomerTrackingSheetLevel) {
  if (level === 'expanded') {
    return styles.navBottomSheetExpanded;
  }
  if (level === 'half') {
    return styles.navBottomSheetHalf;
  }
  return styles.navBottomSheetPeek;
}

function nextSheetLevel(level: CustomerTrackingSheetLevel): CustomerTrackingSheetLevel {
  if (level === 'peek') {
    return 'half';
  }
  if (level === 'half') {
    return 'expanded';
  }
  return 'peek';
}

function nearestSheetLevel(
  level: CustomerTrackingSheetLevel,
  height: number,
  velocityY: number,
  screenHeight: number,
): CustomerTrackingSheetLevel {
  if (velocityY <= -sheetDragVelocityThreshold) {
    return adjacentSheetLevel(level, 1);
  }
  if (velocityY >= sheetDragVelocityThreshold) {
    return adjacentSheetLevel(level, -1);
  }

  return sheetLevels.reduce((nearest, item) => {
    const currentDistance = Math.abs(height - sheetHeightForLevel(item, screenHeight));
    const nearestDistance = Math.abs(
      height - sheetHeightForLevel(nearest, screenHeight),
    );
    return currentDistance < nearestDistance ? item : nearest;
  }, level);
}

function adjacentSheetLevel(
  level: CustomerTrackingSheetLevel,
  direction: -1 | 1,
): CustomerTrackingSheetLevel {
  const nextIndex = Math.max(
    0,
    Math.min(sheetLevels.indexOf(level) + direction, sheetLevels.length - 1),
  );
  return sheetLevels[nextIndex];
}

function sheetHeightForLevel(
  level: CustomerTrackingSheetLevel,
  screenHeight: number,
): number {
  if (level === 'peek') {
    return Math.max(112, Math.min(148, screenHeight * 0.18));
  }
  if (level === 'half') {
    return screenHeight * 0.42;
  }
  return screenHeight * 0.72;
}

function clampSheetHeight(height: number, screenHeight: number): number {
  return Math.max(
    sheetHeightForLevel('peek', screenHeight),
    Math.min(height, sheetHeightForLevel('expanded', screenHeight)),
  );
}

const styles = StyleSheet.create({
  navigationScreen: {
    backgroundColor: palette.white,
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  mapCanvas: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#DDEFE4',
  },
  mapCloseButton: {
    alignSelf: 'flex-end',
    backgroundColor: palette.white,
    borderRadius: radius.pill,
    justifyContent: 'center',
    marginRight: spacing.md,
    marginTop: spacing.md,
    minHeight: 44,
    minWidth: 64,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 5,
    boxShadow: '0 8px 18px rgba(17,24,39,0.14)',
  },
  mapCloseText: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  navBottomSheet: {
    backgroundColor: palette.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    bottom: 0,
    gap: spacing.md,
    left: 0,
    overflow: 'hidden',
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.base,
    position: 'absolute',
    right: 0,
    zIndex: 4,
    boxShadow: '0 -12px 28px rgba(17,24,39,0.14)',
  },
  navBottomSheetPeek: {
    minHeight: 112,
  },
  navBottomSheetHalf: {
    minHeight: 240,
  },
  navBottomSheetExpanded: {
    minHeight: 360,
  },
  navigationSheetHeader: {
    gap: spacing.sm,
  },
  dragHandleButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 20,
  },
  dragHandle: {
    alignSelf: 'center',
    backgroundColor: palette.line,
    borderRadius: radius.pill,
    height: 5,
    width: 48,
  },
  customerRouteStats: {
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  customerRouteStat: {
    backgroundColor: palette.white,
    borderRadius: radius.sm,
    flex: 1,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: spacing.sm,
  },
  customerRouteStatValue: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  customerRouteStatLabel: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: '800',
    marginTop: spacing.xxs,
  },
  flex: {
    flex: 1,
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  cardMeta: {
    ...type.caption,
    color: palette.muted,
  },
  cardBody: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
});
