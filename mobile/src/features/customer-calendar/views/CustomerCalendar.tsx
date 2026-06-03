import { CalendarCheck, RefreshCw } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MonthCalendar } from '../../../components/MonthCalendar';
import {
  CustomerBadge,
  CustomerCard,
  CustomerContent,
  CustomerEmptyState,
  CustomerHeader,
  CustomerIconBlock,
  CustomerScreen,
  CustomerSection,
  customerText,
} from '../../../shared/components/CustomerUI';
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
    <CustomerScreen>
      <CustomerContent>
        <CustomerHeader
          title="Calendar"
          subtitle="Your upcoming service schedule"
          right={
            <Pressable
              style={[
                styles.refreshButton,
                calendar.isLoading && styles.refreshButtonDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel={
                calendar.isLoading ? 'Refreshing bookings' : 'Refresh bookings'
              }
              accessibilityState={{ disabled: calendar.isLoading }}
              onPress={() => void calendar.refreshBookings()}
              disabled={calendar.isLoading}
            >
              <RefreshCw color={palette.mintDeep} size={20} strokeWidth={2.2} />
            </Pressable>
          }
        />

        <CustomerSection>
          <CustomerCard style={styles.calendarCard}>
            <MonthCalendar
              selectedDate={calendar.data.selectedDate}
              onSelectDate={calendar.selectDate}
              markers={calendar.data.calendarMarkers}
            />
            <View style={styles.legendRow}>
              <LegendDot color={palette.mintDeep} label="Booked service" />
            </View>
          </CustomerCard>
        </CustomerSection>

        <CustomerSection
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
            <View style={styles.agendaList}>
              {calendar.data.selectedDateBookings.map((item) => {
                const { booking } = item;

                return (
                  <CustomerCard
                    key={booking.id}
                    onPress={() => openCalendarBooking(booking)}
                    accessibilityLabel={`Open ${item.title} booking`}
                  >
                    <View style={styles.agendaRow}>
                      <CustomerIconBlock compact>
                        <CalendarCheck
                          color={palette.mintDark}
                          size={18}
                          strokeWidth={2.2}
                        />
                      </CustomerIconBlock>
                      <View style={styles.agendaCopy}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.cardMeta}>{item.scheduledAtLabel}</Text>
                      </View>
                      <CustomerBadge label={item.statusLabel} tone="warning" />
                    </View>
                  </CustomerCard>
                );
              })}
            </View>
          ) : (
            <CustomerEmptyState
              title={calendar.data.emptyTitle}
              body={calendar.data.emptyBody}
            />
          )}
        </CustomerSection>
      </CustomerContent>
    </CustomerScreen>
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
  refreshButton: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: '#ECEFF1',
    borderRadius: 20,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    shadowColor: '#101820',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    width: 44,
  },
  refreshButtonDisabled: {
    opacity: 0.55,
  },
  calendarCard: {
    padding: spacing.base,
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
    fontWeight: '500',
  },
  agendaList: {
    gap: spacing.md,
  },
  agendaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  agendaCopy: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    ...customerText.title,
    fontSize: 15,
    lineHeight: 20,
  },
  cardMeta: {
    ...customerText.body,
    marginTop: 2,
  },
  sectionAction: {
    color: palette.mintDeep,
    fontSize: 13,
    fontWeight: '600',
  },
});
