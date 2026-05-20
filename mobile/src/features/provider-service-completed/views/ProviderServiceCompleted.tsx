import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import {
  Card,
  PrimaryButton,
} from '../../../components/DesignKit';
import {
  BookingSummary,
  PaymentSummary,
} from '../../../shared/models/types';
import { palette, spacing } from '../../../theme/serveaseDesign';
import { useProviderServiceCompletedViewModel } from '../viewModels/useProviderServiceCompletedViewModel';

type ProviderServiceCompletedScreenProps = {
  booking: BookingSummary;
  payment: PaymentSummary | null;
  onBackToBookings: () => void;
  onViewReceipt: () => void;
};

export function ProviderServiceCompletedScreen({
  booking,
  payment,
  onBackToBookings,
  onViewReceipt,
}: ProviderServiceCompletedScreenProps) {
  const serviceCompleted = useProviderServiceCompletedViewModel({
    booking,
    payment,
  });
  const { data } = serviceCompleted;

  return (
    <ScrollView contentContainerStyle={styles.withBottomNav}>
      <View style={styles.confirmationContent}>
        <View style={styles.successCircle}>
          <CheckCircle color={palette.white} size={44} strokeWidth={2.8} />
        </View>
        <Text style={styles.confirmationTitle}>Service Completed</Text>
        <Text style={styles.pageCopy}>{data.bookingReference}</Text>
        <Card>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Service</Text>
            <Text style={styles.infoValue}>{data.serviceTitle}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Earnings</Text>
            <Text style={styles.infoValue}>{data.earningsLabel}</Text>
          </View>
        </Card>
        <PrimaryButton label="View Receipt" onPress={onViewReceipt} />
        <PrimaryButton
          label="Back to Bookings"
          variant="secondary"
          onPress={onBackToBookings}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  withBottomNav: {
    backgroundColor: palette.cream,
    flexGrow: 1,
    paddingBottom: 108,
  },
  confirmationContent: {
    alignItems: 'stretch',
    gap: spacing.lg,
    padding: spacing.xl,
  },
  successCircle: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: palette.mint,
    borderRadius: 48,
    height: 96,
    justifyContent: 'center',
    width: 96,
  },
  confirmationTitle: {
    color: palette.ink,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0,
    textAlign: 'center',
  },
  pageCopy: {
    color: palette.muted,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 22,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  infoLabel: {
    color: palette.faint,
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  infoValue: {
    color: palette.ink,
    flex: 1.3,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
  },
});
