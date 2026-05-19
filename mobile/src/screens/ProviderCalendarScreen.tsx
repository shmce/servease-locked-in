import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import {
  Badge,
  Card,
  EmptyState,
  PrimaryButton,
  Section,
  TopBar,
} from '../components/DesignKit';
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
const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function ProviderCalendarScreen({
  availability,
  bookings,
  apiOptions,
  onScheduleLoaded,
  onSelectDate,
  openBooking,
}: ProviderCalendarScreenProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
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

  const monthDays = useMemo(() => buildMonthDays(visibleMonth), [visibleMonth]);
  const dayOffDates = new Set(availability?.daysOff.map((day) => day.offDate) ?? []);
  const timeOffDates = new Set(
    (availability?.timeOffWindows ?? []).map((window) => window.offDate),
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
          <Section
            title={visibleMonth.toLocaleDateString('en-PH', {
              month: 'long',
              year: 'numeric',
            })}
            action={
              <View style={styles.monthActions}>
                <Pressable
                  style={styles.iconButton}
                  onPress={() => setVisibleMonth(addMonths(visibleMonth, -1))}
                  accessibilityRole="button"
                  accessibilityLabel="Previous month"
                >
                  <ChevronLeft color={palette.ink} size={18} />
                </Pressable>
                <Pressable
                  style={styles.iconButton}
                  onPress={() => setVisibleMonth(addMonths(visibleMonth, 1))}
                  accessibilityRole="button"
                  accessibilityLabel="Next month"
                >
                  <ChevronRight color={palette.ink} size={18} />
                </Pressable>
              </View>
            }
          >
            <View style={styles.calendarShell}>
              <View style={styles.weekHeader}>
                {weekdayLabels.map((day) => (
                  <Text key={day} style={styles.weekday}>
                    {day}
                  </Text>
                ))}
              </View>
              <View style={styles.monthGrid}>
                {monthDays.map((day, index) =>
                  day ? (
                    <Pressable
                      key={day}
                      style={styles.dayCell}
                      onPress={() => onSelectDate(day)}
                      accessibilityRole="button"
                      accessibilityLabel={`Open ${day}`}
                    >
                      <Text style={styles.dayNumber}>{Number(day.slice(-2))}</Text>
                      <View style={styles.dotRow}>
                        {dayOffDates.has(day) ? <View style={styles.redDot} /> : null}
                        {!dayOffDates.has(day) && timeOffDates.has(day) ? (
                          <View style={styles.yellowDot} />
                        ) : null}
                        {activeBookingsByDate.has(day) ? (
                          <View style={styles.blueDot} />
                        ) : null}
                      </View>
                    </Pressable>
                  ) : (
                    <View key={`empty-${index}`} style={styles.emptyDayCell} />
                  ),
                )}
              </View>
            </View>
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

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function buildMonthDays(month: Date): (string | null)[] {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const days: (string | null)[] = Array.from(
    { length: firstDay.getDay() },
    () => null,
  );

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(formatApiDate(new Date(month.getFullYear(), month.getMonth(), day)));
  }

  return days;
}

function formatApiDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
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
  monthActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  calendarShell: {
    backgroundColor: palette.white,
    borderColor: palette.lineSoft,
    borderRadius: radius.sm,
    borderWidth: 1,
    padding: spacing.sm,
  },
  weekHeader: {
    flexDirection: 'row',
  },
  weekday: {
    color: palette.faint,
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    alignItems: 'center',
    aspectRatio: 1,
    justifyContent: 'center',
    width: `${100 / 7}%`,
  },
  emptyDayCell: {
    aspectRatio: 1,
    width: `${100 / 7}%`,
  },
  dayNumber: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  dotRow: {
    flexDirection: 'row',
    gap: 3,
    height: 8,
    marginTop: 4,
  },
  redDot: {
    backgroundColor: palette.red,
    borderRadius: radius.pill,
    height: 6,
    width: 6,
  },
  yellowDot: {
    backgroundColor: palette.amber,
    borderRadius: radius.pill,
    height: 6,
    width: 6,
  },
  blueDot: {
    backgroundColor: palette.blue,
    borderRadius: radius.pill,
    height: 6,
    width: 6,
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
