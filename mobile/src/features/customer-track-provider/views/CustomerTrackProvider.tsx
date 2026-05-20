import { Pressable, StyleSheet, Text, View } from 'react-native';
import { InfoRow } from '../../../components/AppDisplay';
import { PrimaryButton } from '../../../components/DesignKit';
import {
  BookingSummary,
  BookingTrackingSnapshot,
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
  trackingSnapshot: BookingTrackingSnapshot | null;
  sheetLevel: CustomerTrackingSheetLevel;
  onSheetLevelChange: (level: CustomerTrackingSheetLevel) => void;
  onClose: () => void;
  onRefresh: () => void;
  onMessage: () => void;
};

export function CustomerTrackProviderScreen({
  booking,
  trackingSnapshot,
  sheetLevel,
  onSheetLevelChange,
  onClose,
  onRefresh,
  onMessage,
}: CustomerTrackProviderScreenProps) {
  const trackingViewModel = useCustomerTrackProviderViewModel({
    booking,
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
          title={data.phaseTitle}
          subtitle={data.routeLabel}
        />
      </View>
      <View style={[styles.navBottomSheet, sheetStyle(sheetLevel)]}>
        <NavigationSheetHeader
          level={sheetLevel}
          title={data.phaseTitle}
          subtitle={data.routeLabel}
          onChangeLevel={onSheetLevelChange}
        />
        {data.isHalfSheet ? (
          <>
            <Text style={styles.cardBody} numberOfLines={data.isExpandedSheet ? 4 : 2}>
              {data.addressLabel}
            </Text>
            <InfoRow label="Schedule" value={data.scheduleLabel} />
            <InfoRow label="Last update" value={data.lastUpdateLabel} />
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
    backgroundColor: '#D9FBE8',
    flex: 1,
  },
  mapCanvas: {
    ...StyleSheet.absoluteFillObject,
  },
  mapCloseButton: {
    backgroundColor: palette.white,
    borderRadius: radius.pill,
    left: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    position: 'absolute',
    top: spacing.md,
    zIndex: 4,
  },
  mapCloseText: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  navBottomSheet: {
    backgroundColor: palette.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    bottom: 0,
    gap: spacing.md,
    left: 0,
    padding: spacing.md,
    position: 'absolute',
    right: 0,
  },
  navBottomSheetPeek: {
    minHeight: 132,
  },
  navBottomSheetHalf: {
    minHeight: 292,
  },
  navBottomSheetExpanded: {
    minHeight: 430,
  },
  navigationSheetHeader: {
    gap: spacing.md,
  },
  dragHandleButton: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  dragHandle: {
    backgroundColor: palette.line,
    borderRadius: radius.pill,
    height: 4,
    width: 54,
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  sheetLevelControls: {
    backgroundColor: palette.lineSoft,
    borderRadius: radius.pill,
    flexDirection: 'row',
    padding: 3,
  },
  sheetLevelButton: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  sheetLevelButtonActive: {
    backgroundColor: palette.white,
  },
  sheetLevelButtonText: {
    color: palette.faint,
    fontSize: 11,
    fontWeight: '900',
  },
  sheetLevelButtonTextActive: {
    color: palette.mint,
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
