import { ScrollView, StyleSheet, View } from 'react-native';
import { BookingCard } from '../../../components/AppDisplay';
import {
  EmptyState,
  Pill,
  PrimaryButton,
  TopBar,
} from '../../../components/DesignKit';
import { AppRole } from '../../../navigation/types';
import { BookingSummary } from '../../../shared/models/types';
import { palette, spacing } from '../../../theme/serveaseDesign';
import {
  BookingFilter,
  useBookingsViewModel,
} from '../viewModels/useBookingsViewModel';

type BookingsScreenProps = {
  bookings: BookingSummary[];
  bookingFilter: BookingFilter;
  role: AppRole;
  busyAction: string | null;
  setBookingFilter: (filter: BookingFilter) => void;
  refreshWorkspace: () => Promise<void>;
  openBooking: (booking: BookingSummary) => void;
};

export function BookingsScreen({
  bookings,
  bookingFilter,
  role,
  busyAction,
  setBookingFilter,
  refreshWorkspace,
  openBooking,
}: BookingsScreenProps) {
  const bookingsList = useBookingsViewModel({
    bookings,
    bookingFilter,
  });

  return (
    <>
      <TopBar
        title="Bookings"
        subtitle="Track work in progress and completed service history"
        right={
          <PrimaryButton
            label="Refresh"
            variant="secondary"
            onPress={() => void refreshWorkspace()}
            disabled={busyAction === 'refresh'}
          />
        }
      />
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.content}>
          <View style={styles.segmentRow}>
            <Pill
              label="Active"
              selected={bookingFilter === 'active'}
              onPress={() => setBookingFilter('active')}
            />
            <Pill
              label="Completed"
              selected={bookingFilter === 'completed'}
              onPress={() => setBookingFilter('completed')}
            />
          </View>
          {bookingsList.data.visibleBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              role={role}
              onPress={() => openBooking(booking)}
            />
          ))}
          {bookingsList.data.isEmpty ? (
            <EmptyState
              title="No bookings here"
              body="Browse services and book a service provider to get started."
            />
          ) : null}
        </View>
      </ScrollView>
    </>
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
  segmentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
