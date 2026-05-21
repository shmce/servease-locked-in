import { Dispatch, SetStateAction } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Search } from 'lucide-react-native';
import {
  EmptyState,
  Pill,
  PrimaryButton,
  TopBar,
} from '../../../components/DesignKit';
import { BookingCard } from '../../../components/AppDisplay';
import { providerBookingTabs, ProviderBookingTab } from '../../../constants/appContent';
import { palette, spacing } from '../../../theme/serveaseDesign';
import { BookingSummary } from '../../../shared/models/types';
import { useProviderBookingsViewModel } from '../viewModels/useProviderBookingsViewModel';

type ProviderBookingsScreenProps = {
  bookings: BookingSummary[];
  providerBookingTab: ProviderBookingTab;
  providerSearchQuery: string;
  setProviderBookingTab: Dispatch<SetStateAction<ProviderBookingTab>>;
  setProviderSearchQuery: Dispatch<SetStateAction<string>>;
  refreshWorkspace: () => Promise<void>;
  openBooking: (booking: BookingSummary) => void;
};

export function ProviderBookingsScreen({
  bookings,
  providerBookingTab,
  providerSearchQuery,
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

  return (
    <>
      <TopBar
        title="Bookings"
        subtitle="Review requests and update booking status"
        right={
          <PrimaryButton
            label="Refresh"
            variant="secondary"
            onPress={() => void refreshWorkspace()}
          />
        }
      />
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.content}>
          <View style={styles.segmentRow}>
            {providerBookingTabs.map((tab) => (
              <Pill
                key={tab.key}
                label={tab.label}
                selected={providerBookingTab === tab.key}
                onPress={() => setProviderBookingTab(tab.key)}
              />
            ))}
          </View>
          <View style={styles.searchInputShell}>
            <Search color={palette.faint} size={18} strokeWidth={2.2} />
            <TextInput
              style={styles.searchInput}
              value={providerSearchQuery}
              onChangeText={setProviderSearchQuery}
              placeholder="Search bookings"
              placeholderTextColor={palette.faint}
              accessibilityLabel="Search provider bookings"
            />
          </View>
          {providerBookings.data.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              role="provider"
              onPress={() => openBooking(booking)}
            />
          ))}
          {!providerBookings.data.length ? (
            <EmptyState
              title="No bookings found"
              body="Try changing tabs or adjusting your search."
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
    gap: spacing.md,
    padding: spacing.md,
  },
  segmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  searchInputShell: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
  },
  searchInput: {
    color: palette.ink,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    paddingVertical: spacing.sm,
  },
});
