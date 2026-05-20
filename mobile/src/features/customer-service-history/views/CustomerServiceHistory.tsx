import { BookingCard } from '../../../components/AppDisplay';
import { EmptyState, TopBar } from '../../../components/DesignKit';
import { BookingSummary } from '../../../shared/models/types';
import {
  ScreenContent,
  ScreenScroll,
} from '../../../shared/components/ScreenLayout';
import { useCustomerServiceHistoryViewModel } from '../viewModels/useCustomerServiceHistoryViewModel';

type CustomerServiceHistoryScreenProps = {
  bookings: BookingSummary[];
  onBack: () => void;
  openBooking: (booking: BookingSummary) => void;
};

export function CustomerServiceHistoryScreen({
  bookings,
  onBack,
  openBooking,
}: CustomerServiceHistoryScreenProps) {
  const history = useCustomerServiceHistoryViewModel({ bookings });

  return (
    <>
      <TopBar
        title="Completed Bookings"
        onBack={onBack}
      />
      <ScreenScroll>
        <ScreenContent>
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
        </ScreenContent>
      </ScreenScroll>
    </>
  );
}
