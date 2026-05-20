import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Badge,
  Card,
  EmptyState,
  PrimaryButton,
  Section,
  TopBar,
} from '../../../components/DesignKit';
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
    <>
      <TopBar
        title="Calendar"
        subtitle="Block dates and review active bookings"
        right={
          <PrimaryButton
            label={calendar.isLoading ? 'Loading' : 'Refresh'}
            variant="secondary"
            onPress={() => void calendar.loadSchedule()}
            disabled={calendar.isLoading}
          />
        }
      />
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.content}>
          <Section>
            <MonthCalendar
              selectedDate={null}
              onSelectDate={onSelectDate}
              markers={calendar.data.calendarMarkers}
            />
            <View style={styles.legendRow}>
              <LegendDot color={palette.red} label="Whole day off" />
              <LegendDot color={palette.amber} label="Partial block" />
              <LegendDot color={palette.blue} label="Active booking" />
            </View>
          </Section>

          <Section title="Upcoming bookings">
            {calendar.data.upcomingRows.length ? (
              calendar.data.upcomingRows.map((item) => (
                <Card
                  key={item.booking.id}
                  onPress={() => openBooking(item.booking)}
                >
                  <View style={styles.rowBetween}>
                    <View style={styles.flex}>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <Text style={styles.cardMeta}>{item.scheduledAtLabel}</Text>
                    </View>
                    <Badge label={item.statusLabel} tone="warning" />
                  </View>
                </Card>
              ))
            ) : (
              <EmptyState
                title="No active bookings"
                body="Confirmed bookings will show a blue calendar marker."
              />
            )}
          </Section>
        </View>
      </ScrollView>
    </>
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
  withBottomNav: {
    backgroundColor: palette.cream,
    flexGrow: 1,
    paddingBottom: 108,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.xl,
  },
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
    color: palette.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  cardMeta: {
    color: palette.faint,
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
});
