import { StyleSheet, Text, View } from 'react-native';
import { InfoRow } from '../../../components/AppDisplay';
import {
  ProviderButton,
  ProviderCard,
  ProviderContent,
  ProviderHeader,
  ProviderScreen,
  providerText,
} from '../../../shared/components/ProviderUI';
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
    <ProviderScreen>
      <ProviderContent>
        <ProviderHeader
          title="Service Receipt"
          subtitle={data.bookingReference}
          onBack={onBack}
        />
        <ProviderCard>
          <Text style={styles.cardTitle}>{data.serviceTitle}</Text>
          {data.receiptRows.map((row) => (
            <InfoRow key={row.key} label={row.label} value={row.value} />
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Provider payout</Text>
            <Text style={styles.totalValue}>{data.providerPayoutLabel}</Text>
          </View>
        </ProviderCard>
        <ProviderButton label="Back to Bookings" onPress={onBackToBookings} />
      </ProviderContent>
    </ProviderScreen>
  );
}

const styles = StyleSheet.create({
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
    ...providerText.title,
    fontSize: 15,
    lineHeight: 20,
  },
  totalLabel: {
    color: '#6D7480',
    fontSize: 13,
    fontWeight: '500',
  },
  totalValue: {
    color: palette.mintDeep,
    fontSize: 18,
    fontWeight: '600',
  },
});
