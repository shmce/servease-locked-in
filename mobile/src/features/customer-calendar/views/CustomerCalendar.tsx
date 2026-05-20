import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Badge,
  Card,
  EmptyState,
  PrimaryButton,
  Section,
  TopBar,
} from '../../../components/DesignKit';
import { MonthCalendar } from '../../../components/MonthCalendar';
import { BookingSummary } from '../../../shared/models/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { useCustomerCalendarViewModel } from '../viewModels/useCustomerCalendarViewModel';

type CustomerCalendarScreenProps = {
  bookings: BookingSummary[];
  onRefresh: () => Promise<void> | void;
  openBooking: (booking: BookingSummary) => void;
  onViewAllBookings: () => void;
};

export function CustomerCalendarScreen({
  bookings,
  onRefresh,
  openBooking,
  onViewAllBookings,
}: CustomerCalendarScreenProps) {
  const calendar = useCustomerCalendarViewModel({ bookings, onRefresh });
  const openCalendarBooking = (booking: BookingSummary) => {
    openBooking(booking);
  };

  return (
    <>
      <TopBar
        title="Calendar"
        subtitle="Your upcoming service schedule"
        right={
          <PrimaryButton
            label={calendar.isLoading ? 'Loading' : 'Refresh'}
            variant="secondary"
            onPress={() => void calendar.refreshBookings()}
            disabled={calendar.isLoading}
          />
        }
      />
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.content}>
          <Section>
            <MonthCalendar
              selectedDate={calendar.data.selectedDate}
              onSelectDate={calendar.selectDate}
              markers={calendar.data.calendarMarkers}
            />
            <View style={styles.legendRow}>
              <LegendDot color={palette.blue} label="Booked service" />
            </View>
          </Section>

          <Section
            title={calendar.data.agendaTitle}
            action={
              calendar.data.isShowingUpcomingPreview ? (
                <Pressable
                  onPress={onViewAllBookings}
                  accessibilityRole="button"
                  accessibilityLabel="View all bookings"
                >
                  <Text style={styles.sectionAction}>View all</Text>
                </Pressable>
              ) : null
            }
          >
            {calendar.data.selectedDateBookings.length ? (
              calendar.data.selectedDateBookings.map((item) => {
                const { booking } = item;

                return (
                  <Card key={booking.id} onPress={() => openCalendarBooking(booking)}>
                    <View style={styles.rowBetween}>
                      <View style={styles.flex}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.cardMeta}>{item.scheduledAtLabel}</Text>
                      </View>
                      <Badge label={item.statusLabel} tone="warning" />
                    </View>
                  </Card>
                );
              })
            ) : (
              <EmptyState
                title={calendar.data.emptyTitle}
                body={calendar.data.emptyBody}
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
    gap: spacing.md,
    padding: spacing.md,
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
    fontSize: 13,
    fontWeight: '700',
  },
  cardMeta: {
    color: palette.faint,
    fontSize: 13,
    fontWeight: '500',
    marginTop: spacing.xs,
  },
  sectionAction: {
    color: palette.mintDeep,
    fontSize: 13,
    fontWeight: '700',
  },
});
