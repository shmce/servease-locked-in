import { CalendarCheck, UserRound } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import {
  CustomerCard,
  CustomerContent,
  CustomerEmptyState,
  CustomerHeader,
  CustomerIconBlock,
  CustomerScreen,
  CustomerSection,
  customerText,
} from '../../../shared/components/CustomerUI';
import { ListSectionSkeleton } from '../../../shared/components/LoadingStates';
import { BookingSummary } from '../../../shared/models/types';
import { palette, spacing } from '../../../theme/serveaseDesign';
import { useCustomerServiceHistoryViewModel } from '../viewModels/useCustomerServiceHistoryViewModel';

type CustomerServiceHistoryScreenProps = {
  bookings: BookingSummary[];
  isLoading?: boolean;
  onBack: () => void;
  openBooking: (booking: BookingSummary) => void;
};

export function CustomerServiceHistoryScreen({
  bookings,
  isLoading = false,
  onBack,
  openBooking,
}: CustomerServiceHistoryScreenProps) {
  const history = useCustomerServiceHistoryViewModel({ bookings });
  const isInitialLoading = isLoading && bookings.length === 0;

  return (
    <CustomerScreen>
      <CustomerContent>
        <CustomerHeader
          title="Service History"
          subtitle="Completed services you've booked"
          onBack={onBack}
        />

        <CustomerSection title="Completed">
          {isInitialLoading ? (
            <ListSectionSkeleton count={4} label="Loading service history" />
          ) : history.data.completedRows.length ? (
            <View style={styles.historyList}>
              {history.data.completedRows.map((row) => (
                <CustomerCard
                  key={row.booking.id}
                  onPress={() => openBooking(row.booking)}
                  accessibilityLabel={`Open ${row.title} booking`}
                >
                  <View style={styles.historyTopRow}>
                    <CustomerIconBlock compact>
                      <CalendarCheck
                        color={palette.mintDeep}
                        size={18}
                        strokeWidth={2.2}
                      />
                    </CustomerIconBlock>
                    <View style={styles.flex}>
                      <Text style={styles.historyTitle} numberOfLines={1}>
                        {row.title}
                      </Text>
                      <Text style={styles.historyMeta} numberOfLines={1}>
                        {row.scheduledAtLabel}
                      </Text>
                    </View>
                    <Text style={styles.amountLabel}>{row.amountLabel}</Text>
                  </View>

                  <View style={styles.providerRow}>
                    <UserRound
                      color={palette.mintDark}
                      size={15}
                      strokeWidth={2.1}
                    />
                    <Text style={styles.providerLabel} numberOfLines={1}>
                      {row.providerLabel}
                    </Text>
                    <Text style={styles.referenceLabel} numberOfLines={1}>
                      {row.referenceLabel}
                    </Text>
                  </View>
                </CustomerCard>
              ))}
            </View>
          ) : (
            <CustomerEmptyState
              title="No completed services"
              body="Completed services will appear in your history."
            />
          )}
        </CustomerSection>
      </CustomerContent>
    </CustomerScreen>
  );
}

const styles = StyleSheet.create({
  historyList: {
    gap: spacing.md,
  },
  historyTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
    minWidth: 0,
  },
  historyTitle: {
    ...customerText.title,
    fontSize: 15,
    lineHeight: 20,
  },
  historyMeta: {
    ...customerText.meta,
    marginTop: 2,
  },
  amountLabel: {
    color: palette.mintDeep,
    flexShrink: 0,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 19,
  },
  providerRow: {
    alignItems: 'center',
    borderTopColor: '#EEF0F2',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
  },
  providerLabel: {
    ...customerText.body,
    flex: 1,
    minWidth: 0,
  },
  referenceLabel: {
    ...customerText.meta,
    flexShrink: 0,
    maxWidth: 108,
  },
});
