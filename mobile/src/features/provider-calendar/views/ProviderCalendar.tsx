import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  ProviderBadge,
  ProviderButton,
  ProviderCard,
  ProviderContent,
  ProviderEmptyState,
  ProviderHeader,
  ProviderScreen,
  ProviderSection,
  providerText,
} from '../../../shared/components/ProviderUI';
import { MonthCalendar } from '../../../components/MonthCalendar';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import {
  ApiOptions,
  BookingSummary,
  ProviderAvailabilitySchedule,
} from '../../../shared/models/types';
import { useProviderCalendarViewModel } from '../viewModels/useProviderCalendarViewModel';

type ProviderCalendarScreenProps = {
  availability: ProviderAvailabilitySchedule | null;
  bookings: BookingSummary[];
  apiOptions: ApiOptions;
  onScheduleLoaded: (schedule: ProviderAvailabilitySchedule) => void;
  onSelectDate: (date: string) => void;
  openBooking: (booking: BookingSummary) => void;
};

export function ProviderCalendarScreen({
  availability,
  bookings,
  apiOptions,
  onScheduleLoaded,
  onSelectDate,
  openBooking,
}: ProviderCalendarScreenProps) {
  const calendar = useProviderCalendarViewModel({
    availability,
    bookings,
    apiOptions,
    onScheduleLoaded,
  });

  return (
    <ProviderScreen>
      <ProviderContent>
        <ProviderHeader
          title="Calendar"
          subtitle="Block dates and review active bookings"
          right={
            <ProviderButton
              label={calendar.isLoading ? 'Loading' : 'Refresh'}
              variant="secondary"
              onPress={() => void calendar.loadSchedule()}
              disabled={calendar.isLoading}
            />
          }
        />
        <ProviderSection>
          <MonthCalendar
            selectedDate={null}
            onSelectDate={onSelectDate}
            markers={calendar.data.calendarMarkers}
          />
          <View style={styles.legendRow}>
            <LegendDot color={palette.alert} label="Whole day off" />
            <LegendDot color="#C96B00" label="Partial block" />
            <LegendDot color={palette.mintDeep} label="Active booking" />
          </View>
        </ProviderSection>

        <ProviderSection
          title="Upcoming bookings"
          action={
            <Pressable
              onPress={() => onSelectDate(calendar.data.todayDate)}
              accessibilityRole="button"
              accessibilityLabel="Set availability for today"
            >
              <Text style={styles.sectionAction}>Set availability</Text>
            </Pressable>
          }
        >
          {calendar.data.upcomingRows.length ? (
            calendar.data.upcomingRows.map((item) => (
              <ProviderCard
                key={item.booking.id}
                onPress={() => openBooking(item.booking)}
              >
                <View style={styles.rowBetween}>
                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardMeta}>{item.scheduledAtLabel}</Text>
                  </View>
                  <ProviderBadge label={item.statusLabel} tone="warning" />
                </View>
              </ProviderCard>
            ))
          ) : (
            <ProviderEmptyState
              title="No active bookings"
              body="Confirmed bookings will show a blue calendar marker."
            />
          )}
        </ProviderSection>
      </ProviderContent>
    </ProviderScreen>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  legendDot: {
    borderRadius: radius.pill,
    height: 8,
    width: 8,
  },
  legendLabel: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  flex: {
    flex: 1,
  },
  cardTitle: {
    ...providerText.title,
    fontSize: 15,
    lineHeight: 20,
  },
  cardMeta: {
    ...providerText.meta,
    marginTop: spacing.xs,
  },
  sectionAction: {
    ...providerText.action,
  },
});
