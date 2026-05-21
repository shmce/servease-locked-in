import { Pressable, StyleSheet, Text, View } from 'react-native';
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
      <View style={[styles.navBottomSheet, sheetStyle(sheetLevel)]}>
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
      </View>
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
        accessibilityLabel={`Show ${sheetLabel(nextSheetLevel(level))} navigation details`}
      >
        <View style={styles.dragHandle} />
      </Pressable>
      <View style={styles.rowBetween}>
        <View style={styles.flex}>
          <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
          <Text style={styles.cardMeta} numberOfLines={1}>{subtitle}</Text>
        </View>
        <View style={styles.sheetLevelControls}>
          {sheetLevels.map((item) => (
            <Pressable
              key={item}
              style={[
                styles.sheetLevelButton,
                item === level && styles.sheetLevelButtonActive,
              ]}
              onPress={() => onChangeLevel(item)}
              accessibilityRole="button"
              accessibilityLabel={`Set navigation sheet to ${sheetLabel(item)}`}
            >
              <Text
                style={[
                  styles.sheetLevelButtonText,
                  item === level && styles.sheetLevelButtonTextActive,
                ]}
              >
                {sheetShortLabel(item)}
              </Text>
            </Pressable>
          ))}
        </View>
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

function sheetLabel(level: CustomerTrackingSheetLevel): string {
  if (level === 'expanded') {
    return 'expanded';
  }
  if (level === 'half') {
    return 'half';
  }
  return 'compact';
}

function sheetShortLabel(level: CustomerTrackingSheetLevel): string {
  if (level === 'expanded') {
    return 'Full';
  }
  if (level === 'half') {
    return 'Half';
  }
  return 'Peek';
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
    maxHeight: '34%',
  },
  navBottomSheetHalf: {
    maxHeight: '43%',
  },
  navBottomSheetExpanded: {
    maxHeight: '49%',
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
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  sheetLevelControls: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.xxs,
    padding: 3,
  },
  sheetLevelButton: {
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: 28,
    paddingHorizontal: spacing.sm,
  },
  sheetLevelButtonActive: {
    backgroundColor: palette.mint,
  },
  sheetLevelButtonText: {
    color: palette.mint,
    fontSize: 11,
    fontWeight: '900',
  },
  sheetLevelButtonTextActive: {
    color: palette.white,
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
