import { ScrollView, StyleSheet, View } from 'react-native';
import { BookingCard } from '../../../components/AppDisplay';
import { EmptyState, TopBar } from '../../../components/DesignKit';
import { BookingSummary } from '../../../shared/models/types';
import { palette, spacing } from '../../../theme/serveaseDesign';
import { useCustomerServiceHistoryViewModel } from '../viewModels/useCustomerServiceHistoryViewModel';

type CustomerServiceHistoryScreenProps = {
  bookings: BookingSummary[];
  setBookingFilter: (filter: 'active' | 'completed') => void;
  navigateToBookings: () => void;
  openBooking: (booking: BookingSummary) => void;
};

export function CustomerServiceHistoryScreen({
  bookings,
  setBookingFilter,
  navigateToBookings,
  openBooking,
}: CustomerServiceHistoryScreenProps) {
  const history = useCustomerServiceHistoryViewModel({ bookings });

  return (
    <>
      <TopBar
        title="Completed Bookings"
        onBack={() => {
          setBookingFilter('completed');
          navigateToBookings();
        }}
      />
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.content}>
          {history.data.completedBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              role="customer"
              onPress={() => openBooking(booking)}
            />
          ))}
          {!history.data.completedBookings.length ? (
            <EmptyState
              title="No completed services"
              body="Completed services will appear in your history."
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
});
