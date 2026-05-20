import { Dispatch, SetStateAction } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Filter, Search } from 'lucide-react-native';
import { EmptyState, Field, PrimaryButton, TopBar } from '../../../components/DesignKit';
import { BookingCard } from '../../../components/AppDisplay';
import { providerBookingTabs, ProviderBookingTab } from '../../../constants/appContent';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
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
        title="My Bookings"
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
          <View style={styles.providerTabBar}>
            {providerBookingTabs.map((tab) => (
              <Pressable
                key={tab.key}
                style={styles.providerTab}
                onPress={() => setProviderBookingTab(tab.key)}
              >
                <Text
                  style={[
                    styles.providerTabText,
                    providerBookingTab === tab.key && styles.providerTabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
                {providerBookingTab === tab.key ? (
                  <View style={styles.providerTabIndicator} />
                ) : null}
              </Pressable>
            ))}
          </View>
          <View style={styles.searchInputShell}>
            <Search color={palette.faint} size={18} />
            <Field
              label=""
              value={providerSearchQuery}
              onChangeText={setProviderSearchQuery}
              placeholder="Search bookings"
            />
            <View style={styles.filterButton}>
              <Filter color={palette.ink} size={20} />
            </View>
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
    gap: spacing.lg,
    padding: spacing.xl,
  },
  providerTabBar: {
    borderBottomColor: palette.lineSoft,
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  providerTab: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    position: 'relative',
  },
  providerTabText: {
    color: palette.faint,
    fontSize: 12,
    fontWeight: '800',
  },
  providerTabTextActive: {
    color: palette.mint,
  },
  providerTabIndicator: {
    backgroundColor: palette.mint,
    bottom: 0,
    height: 2,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  searchInputShell: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterButton: {
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: radius.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
});
