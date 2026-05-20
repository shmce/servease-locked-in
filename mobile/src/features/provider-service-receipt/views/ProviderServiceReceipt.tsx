import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { InfoRow } from '../../../components/AppDisplay';
import {
  Card,
  PrimaryButton,
  TopBar,
} from '../../../components/DesignKit';
import {
  BookingSummary,
  PaymentSummary,
} from '../../../shared/models/types';
import { palette, spacing } from '../../../theme/serveaseDesign';
import { useProviderServiceReceiptViewModel } from '../viewModels/useProviderServiceReceiptViewModel';

type ProviderServiceReceiptScreenProps = {
  booking: BookingSummary;
  payment: PaymentSummary | null;
  onBack: () => void;
  onBackToBookings: () => void;
};

export function ProviderServiceReceiptScreen({
  booking,
  payment,
  onBack,
  onBackToBookings,
}: ProviderServiceReceiptScreenProps) {
  const receipt = useProviderServiceReceiptViewModel({
    booking,
    payment,
  });
  const { data } = receipt;

  return (
    <>
      <TopBar
        title="Service Receipt"
        subtitle={data.bookingReference}
        onBack={onBack}
      />
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.content}>
          <Card>
            <Text style={styles.cardTitle}>{data.serviceTitle}</Text>
            {data.receiptRows.map((row) => (
              <InfoRow key={row.key} label={row.label} value={row.value} />
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Provider payout</Text>
              <Text style={styles.totalValue}>{data.providerPayoutLabel}</Text>
            </View>
          </Card>
          <PrimaryButton label="Back to Bookings" onPress={onBackToBookings} />
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
  totalRow: {
    alignItems: 'center',
    borderTopColor: palette.line,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  totalLabel: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  totalValue: {
    color: palette.mint,
    fontSize: 18,
    fontWeight: '900',
  },
});
