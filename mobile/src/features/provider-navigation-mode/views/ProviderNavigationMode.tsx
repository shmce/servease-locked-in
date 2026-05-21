import { Pressable, StyleSheet, Text, View } from 'react-native';
import { InfoRow } from '../../../components/AppDisplay';
import { PrimaryButton } from '../../../components/DesignKit';
import {
  BookingSummary,
  BookingTrackingLocation,
  BookingTrackingSnapshot,
  GeoDirectionsRoute,
  GeoRouteLocation,
} from '../../../shared/models/types';
import { TrackingMapPreview } from '../../../tracking/TrackingMapPreview';
import { palette, radius, spacing, type } from '../../../theme/serveaseDesign';
import { ActionRow } from '../../../shared/components/ScreenLayout';
import {
  ProviderNavigationGuidance,
  ProviderNavigationSheetLevel,
  useProviderNavigationModeViewModel,
} from '../viewModels/useProviderNavigationModeViewModel';

const navigationSheetLevels: ProviderNavigationSheetLevel[] = [
  'peek',
  'half',
  'expanded',
];

type ProviderNavigationModeScreenProps = {
  booking: BookingSummary;
  directions: GeoDirectionsRoute | null;
  fallbackOrigin: BookingTrackingLocation | GeoRouteLocation | null;
  liveLocation: {
    error: string | null;
    isPublishing: boolean;
    location: BookingTrackingLocation | null;
  };
  navigationRouteError: string | null;
  navigationRouteLoading: boolean;
  sheetLevel: ProviderNavigationSheetLevel;
  trackingSnapshot: BookingTrackingSnapshot | null;
  onArrived: () => void;
  onCall: () => void;
  onClose: () => void;
  onMessage: () => void;
  onRefreshRoute: () => void;
  onSheetLevelChange: (level: ProviderNavigationSheetLevel) => void;
};

export function ProviderNavigationModeScreen({
  booking,
  directions,
  fallbackOrigin,
  liveLocation,
  navigationRouteError,
  navigationRouteLoading,
  sheetLevel,
  trackingSnapshot,
  onArrived,
  onCall,
  onClose,
  onMessage,
  onRefreshRoute,
  onSheetLevelChange,
}: ProviderNavigationModeScreenProps) {
  const navigation = useProviderNavigationModeViewModel({
    booking,
    directions,
    fallbackOrigin,
    liveLocation,
    navigationRouteError,
    navigationRouteLoading,
    sheetLevel,
    trackingSnapshot,
  });
  const { data } = navigation;

  return (
    <View style={styles.navigationScreen}>
      <View
        style={styles.mapCanvas}
        accessible
        accessibilityLabel="Provider route map"
      >
        <Pressable
          style={styles.mapCloseButton}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Back to booking details"
        >
          <Text style={styles.mapCloseText}>Close</Text>
        </Pressable>
        <TrackingMapPreview
          tracking={data.tracking}
          mode="navigation"
          title="Head to the service location"
          subtitle={data.routeLabel}
          directions={directions}
          destinationMarkerLabel="Service address"
          navigationOrigin={data.navigationOrigin}
          providerMarkerLabel="You"
        />
        <ProviderNavigationGuidanceBanner guidance={data.guidance} />
      </View>
      <View style={[styles.navBottomSheet, navigationSheetStyle(sheetLevel)]}>
        <NavigationSheetHeader
          level={sheetLevel}
          setLevel={onSheetLevelChange}
          title="Head to the service location"
          subtitle={data.routeLabel}
        />
        <ProviderNavigationDriveStats
          distanceLabel={data.distanceLabel}
          liveLocationLabel={data.liveLocationLabel}
          routeDurationLabel={data.routeDurationLabel}
        />
        {data.isHalfSheet ? (
          <>
            <Text style={styles.cardBody} numberOfLines={data.isExpandedSheet ? 4 : 2}>
              {data.addressLabel}
            </Text>
            <InfoRow label="Route" value={data.routeLabel} />
            <InfoRow label="Live location" value={data.liveLocationLabel} />
          </>
        ) : null}
        {data.routeInstructionRows.length ? (
          <View style={styles.routeInstructionList}>
            {data.routeInstructionRows.map((step) => (
              <View key={step.id} style={styles.routeInstructionRow}>
                <View style={styles.routeInstructionNumber}>
                  <Text style={styles.routeInstructionNumberText}>{step.number}</Text>
                </View>
                <Text style={styles.cardMeta} numberOfLines={2}>
                  {step.instruction}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
        <PrimaryButton label="I've Arrived" onPress={onArrived} />
        <ActionRow>
          <View style={styles.flex}>
            <PrimaryButton label="Call" variant="secondary" onPress={onCall} />
          </View>
          <View style={styles.flex}>
            <PrimaryButton label="Message" variant="secondary" onPress={onMessage} />
          </View>
        </ActionRow>
        {data.isHalfSheet ? (
          <ActionRow>
            <View style={styles.flex}>
              <PrimaryButton
                label={data.refreshRouteLabel}
                variant="secondary"
                onPress={onRefreshRoute}
                disabled={data.refreshRouteDisabled}
              />
            </View>
            <View style={styles.flex}>
              <PrimaryButton label="End" variant="danger" onPress={onClose} />
            </View>
          </ActionRow>
        ) : null}
      </View>
    </View>
  );
}

function NavigationSheetHeader({
  level,
  setLevel,
  title,
  subtitle,
}: {
  level: ProviderNavigationSheetLevel;
  setLevel: (level: ProviderNavigationSheetLevel) => void;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.navigationSheetHeader}>
      <Pressable
        style={styles.dragHandleButton}
        onPress={() => setLevel(nextNavigationSheetLevel(level))}
        accessibilityRole="button"
        accessibilityLabel={`Show ${nextNavigationSheetLabel(level)} navigation details`}
      >
        <View style={styles.dragHandle} />
      </Pressable>
      <View style={styles.rowBetween}>
        <View style={styles.flex}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.cardMeta} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
        <View style={styles.sheetLevelControls}>
          {navigationSheetLevels.map((item) => (
            <Pressable
              key={item}
              style={[
                styles.sheetLevelButton,
                item === level && styles.sheetLevelButtonActive,
              ]}
              onPress={() => setLevel(item)}
              accessibilityRole="button"
              accessibilityLabel={`Set navigation sheet to ${navigationSheetLabel(item)}`}
            >
              <Text
                style={[
                  styles.sheetLevelButtonText,
                  item === level && styles.sheetLevelButtonTextActive,
                ]}
              >
                {navigationSheetShortLabel(item)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

function ProviderNavigationGuidanceBanner({
  guidance,
}: {
  guidance: ProviderNavigationGuidance;
}) {
  return (
    <View style={styles.providerGuidanceBanner}>
      <View style={styles.providerGuidanceIcon}>
        <Text style={styles.providerGuidanceIconText}>{guidance.maneuverSymbol}</Text>
      </View>
      <View style={styles.flex}>
        <Text style={styles.providerGuidanceDistance}>{guidance.distanceLabel}</Text>
        <Text style={styles.providerGuidanceInstruction} numberOfLines={1}>
          {guidance.instruction}
        </Text>
        {guidance.nextInstruction ? (
          <Text style={styles.providerGuidanceNext} numberOfLines={1}>
            Then {guidance.nextInstruction}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function ProviderNavigationDriveStats({
  distanceLabel,
  liveLocationLabel,
  routeDurationLabel,
}: {
  distanceLabel: string;
  liveLocationLabel: string;
  routeDurationLabel: string;
}) {
  return (
    <View style={styles.providerDriveStats}>
      <View style={styles.providerDriveStat}>
        <Text style={styles.providerDriveStatValue}>{routeDurationLabel}</Text>
        <Text style={styles.providerDriveStatLabel}>ETA</Text>
      </View>
      <View style={styles.providerDriveStat}>
        <Text style={styles.providerDriveStatValue}>{distanceLabel}</Text>
        <Text style={styles.providerDriveStatLabel}>Remaining</Text>
      </View>
      <View style={styles.providerDriveStat}>
        <Text style={styles.providerDriveStatValue} numberOfLines={1}>
          {liveLocationLabel}
        </Text>
        <Text style={styles.providerDriveStatLabel}>Live GPS</Text>
      </View>
    </View>
  );
}

function navigationSheetStyle(level: ProviderNavigationSheetLevel) {
  if (level === 'expanded') {
    return styles.navBottomSheetExpanded;
  }
  if (level === 'half') {
    return styles.navBottomSheetHalf;
  }
  return styles.navBottomSheetPeek;
}

function nextNavigationSheetLevel(
  level: ProviderNavigationSheetLevel,
): ProviderNavigationSheetLevel {
  if (level === 'peek') {
    return 'half';
  }
  if (level === 'half') {
    return 'expanded';
  }
  return 'peek';
}

function nextNavigationSheetLabel(level: ProviderNavigationSheetLevel): string {
  return navigationSheetLabel(nextNavigationSheetLevel(level));
}

function navigationSheetLabel(level: ProviderNavigationSheetLevel): string {
  if (level === 'expanded') {
    return 'expanded';
  }
  if (level === 'half') {
    return 'half';
  }
  return 'compact';
}

function navigationSheetShortLabel(level: ProviderNavigationSheetLevel): string {
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
    marginRight: spacing.md,
    marginTop: spacing.md,
    minHeight: 44,
    minWidth: 64,
    justifyContent: 'center',
    paddingHorizontal: spacing.base,
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
  providerGuidanceBanner: {
    alignItems: 'center',
    backgroundColor: '#102A5C',
    borderRadius: radius.lg,
    boxShadow: '0 14px 30px rgba(15,23,42,0.24)',
    flexDirection: 'row',
    gap: spacing.md,
    left: spacing.base,
    padding: spacing.md,
    position: 'absolute',
    right: 100,
    top: spacing.md,
    zIndex: 4,
  },
  providerGuidanceIcon: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    borderRadius: radius.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  providerGuidanceIconText: {
    color: palette.white,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 32,
  },
  providerGuidanceDistance: {
    color: palette.white,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 28,
  },
  providerGuidanceInstruction: {
    color: palette.white,
    fontSize: 13,
    fontWeight: '800',
  },
  providerGuidanceNext: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 12,
    fontWeight: '700',
    marginTop: spacing.xxs,
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
    minHeight: 20,
    justifyContent: 'center',
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
    minHeight: 28,
    justifyContent: 'center',
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
  routeInstructionList: {
    gap: spacing.sm,
  },
  routeInstructionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  routeInstructionNumber: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.pill,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  routeInstructionNumberText: {
    color: palette.mintDark,
    fontSize: 12,
    fontWeight: '900',
  },
  providerDriveStats: {
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  providerDriveStat: {
    backgroundColor: palette.white,
    borderRadius: radius.sm,
    flex: 1,
    minHeight: 56,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  providerDriveStatValue: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  providerDriveStatLabel: {
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
