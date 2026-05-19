import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Badge,
  Card,
  EmptyState,
  PrimaryButton,
  Section,
  TopBar,
} from '../components/DesignKit';
import {
  MonthCalendar,
  MonthCalendarMarkers,
  formatApiDate,
} from '../components/MonthCalendar';
import { formatDateTime } from '../domain/booking';
import { palette, radius, spacing } from '../theme/serveaseDesign';
import {
  ApiOptions,
  BookingStatus,
  BookingSummary,
  ProviderAvailabilitySchedule,
  getProviderAvailability,
} from '../../services/serveaseApi';

type ProviderCalendarScreenProps = {
  availability: ProviderAvailabilitySchedule | null;
  bookings: BookingSummary[];
  apiOptions: ApiOptions;
  onScheduleLoaded: (schedule: ProviderAvailabilitySchedule) => void;
  onSelectDate: (date: string) => void;
  openBooking: (booking: BookingSummary) => void;
};

const activeBookingStatuses: BookingStatus[] = [
  'pending',
  'confirmed',
  'in_progress',
];

export function ProviderCalendarScreen({
  availability,
  bookings,
  apiOptions,
  onScheduleLoaded,
  onSelectDate,
  openBooking,
}: ProviderCalendarScreenProps) {
  const [isLoading, setIsLoading] = useState(false);

  const loadSchedule = useCallback(async () => {
    setIsLoading(true);
    try {
      onScheduleLoaded(await getProviderAvailability(apiOptions));
    } finally {
      setIsLoading(false);
    }
  }, [apiOptions, onScheduleLoaded]);

  useEffect(() => {
    void loadSchedule();
  }, [loadSchedule]);

  const dayOffDates = useMemo(
    () => new Set(availability?.daysOff.map((day) => day.offDate) ?? []),
    [availability],
  );
  const timeOffDates = useMemo(
    () =>
      new Set((availability?.timeOffWindows ?? []).map((window) => window.offDate)),
    [availability],
  );
  const activeBookingsByDate = useMemo(() => {
    const dates = new Set<string>();
    bookings.forEach((booking) => {
      if (activeBookingStatuses.includes(booking.status)) {
        dates.add(formatApiDate(new Date(booking.scheduledAt)));
      }
    });
    return dates;
  }, [bookings]);
  const calendarMarkers = useMemo<MonthCalendarMarkers>(() => {
    const markers: MonthCalendarMarkers = {};
    dayOffDates.forEach((date) => {
      markers[date] = appendMarker(markers[date], 'full');
    });
    timeOffDates.forEach((date) => {
      if (!dayOffDates.has(date)) {
        markers[date] = appendMarker(markers[date], 'partial');
      }
    });
    activeBookingsByDate.forEach((date) => {
      markers[date] = appendMarker(markers[date], 'booking');
    });
    return markers;
  }, [activeBookingsByDate, dayOffDates, timeOffDates]);
  const upcoming = bookings
    .filter((booking) => activeBookingStatuses.includes(booking.status))
    .slice()
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    )
    .slice(0, 5);

  return (
    <>
      <TopBar
        title="Calendar"
        subtitle="Block dates and review active bookings"
        right={
          <PrimaryButton
            label={isLoading ? 'Loading' : 'Refresh'}
            variant="secondary"
            onPress={() => void loadSchedule()}
            disabled={isLoading}
          />
        }
      />
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.content}>
          <Section>
            <MonthCalendar
              selectedDate={null}
              onSelectDate={onSelectDate}
              markers={calendarMarkers}
            />
            <View style={styles.legendRow}>
              <LegendDot color={palette.red} label="Whole day off" />
              <LegendDot color={palette.amber} label="Partial block" />
              <LegendDot color={palette.blue} label="Active booking" />
            </View>
          </Section>

          <Section title="Upcoming bookings">
            {upcoming.length ? (
              upcoming.map((booking) => (
                <Card key={booking.id} onPress={() => openBooking(booking)}>
                  <View style={styles.rowBetween}>
                    <View style={styles.flex}>
                      <Text style={styles.cardTitle}>
                        {booking.serviceTitle ?? 'Service booking'}
                      </Text>
                      <Text style={styles.cardMeta}>
                        {formatDateTime(booking.scheduledAt)}
                      </Text>
                    </View>
                    <Badge label={booking.status.replace('_', ' ')} tone="warning" />
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

function appendMarker(
  marker: MonthCalendarMarkers[string],
  next: 'full' | 'partial' | 'booking',
): MonthCalendarMarkers[string] {
  if (!marker) {
    return next;
  }

  return Array.isArray(marker) ? [...marker, next] : [marker, next];
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
