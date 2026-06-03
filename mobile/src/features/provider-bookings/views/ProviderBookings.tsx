import { Dispatch, SetStateAction } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Search } from 'lucide-react-native';
import {
  ProviderButton,
  ProviderContent,
  ProviderEmptyState,
  ProviderHeader,
  ProviderPill,
  ProviderScreen,
} from '../../../shared/components/ProviderUI';
import { BookingCard, BookingCardSkeleton } from '../../../components/AppDisplay';
import { providerBookingTabs, ProviderBookingTab } from '../../../constants/appContent';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { BookingSummary } from '../../../shared/models/types';
import { useProviderBookingsViewModel } from '../viewModels/useProviderBookingsViewModel';

type ProviderBookingsScreenProps = {
  bookings: BookingSummary[];
  providerBookingTab: ProviderBookingTab;
  providerSearchQuery: string;
  isLoading?: boolean;
  setProviderBookingTab: Dispatch<SetStateAction<ProviderBookingTab>>;
  setProviderSearchQuery: Dispatch<SetStateAction<string>>;
  refreshWorkspace: () => Promise<void>;
  openBooking: (booking: BookingSummary) => void;
};

export function ProviderBookingsScreen({
  bookings,
  providerBookingTab,
  providerSearchQuery,
  isLoading = false,
  setProviderBookingTab,
  setProviderSearchQuery,
  refreshWorkspace,
  openBooking,
}: ProviderBookingsScreenProps) {
  const providerBookings = useProviderBookingsViewModel({
    bookings,
    providerBookingTab,
    providerSearchQuery,
  });
  const showSkeletons = isLoading && bookings.length === 0;

  return (
    <ProviderScreen>
      <ProviderContent>
        <ProviderHeader
          title="Bookings"
          subtitle="Review requests and update booking status"
          right={
            <ProviderButton
              label="Refresh"
              variant="secondary"
              onPress={() => void refreshWorkspace()}
            />
          }
        />
        <View style={styles.segmentRow}>
          {providerBookingTabs.map((tab) => (
            <ProviderPill
              key={tab.key}
              label={tab.label}
              selected={providerBookingTab === tab.key}
              onPress={() => setProviderBookingTab(tab.key)}
            />
          ))}
        </View>
        <View style={styles.searchInputShell}>
          <Search color="#87919D" size={20} strokeWidth={2.1} />
          <TextInput
            style={styles.searchInput}
            value={providerSearchQuery}
            onChangeText={setProviderSearchQuery}
            placeholder="Search bookings"
            placeholderTextColor="#A0A7B2"
            accessibilityLabel="Search provider bookings"
          />
        </View>
        {showSkeletons
          ? Array.from({ length: 3 }).map((_, index) => (
              <BookingCardSkeleton key={`provider-booking-skeleton-${index}`} />
            ))
          : providerBookings.data.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                role="provider"
                onPress={() => openBooking(booking)}
              />
            ))}
        {!showSkeletons && !providerBookings.data.length ? (
          <ProviderEmptyState
            title="No bookings found"
            body="Try changing tabs or adjusting your search."
          />
        ) : null}
      </ProviderContent>
    </ProviderScreen>
  );
}

const styles = StyleSheet.create({
  segmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  searchInputShell: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: '#EEF0F2',
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 58,
    paddingHorizontal: spacing.base,
  },
  searchInput: {
    color: '#202733',
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: 0,
    paddingVertical: spacing.sm,
  },
});
