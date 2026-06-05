import { StyleSheet, Text, View } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { SuccessMotion } from '../../../components/Motion';
import {
  ProviderButton,
  ProviderCard,
  ProviderContent,
  ProviderScreen,
  providerText,
} from '../../../shared/components/ProviderUI';
import { BookingSummary, PaymentSummary } from '../../../shared/models/types';
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
    <ProviderScreen>
      <ProviderContent>
        <SuccessMotion style={styles.confirmationContent}>
          <View style={styles.successCircle}>
            <CheckCircle color={palette.white} size={44} strokeWidth={2.8} />
          </View>
          <Text style={styles.confirmationTitle}>Service Completed</Text>
          <Text style={styles.pageCopy}>{data.bookingReference}</Text>
          <ProviderCard>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Service</Text>
              <Text style={styles.infoValue}>{data.serviceTitle}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Provider payout</Text>
              <Text style={styles.infoValue}>{data.providerPayoutLabel}</Text>
            </View>
          </ProviderCard>
          <ProviderButton label="View Receipt" onPress={onViewReceipt} />
          <ProviderButton
            label="Back to Bookings"
            variant="secondary"
            onPress={onBackToBookings}
          />
        </SuccessMotion>
      </ProviderContent>
    </ProviderScreen>
  );
}

const styles = StyleSheet.create({
  confirmationContent: {
    alignItems: 'stretch',
    gap: spacing.md,
    paddingTop: spacing.xl,
  },
  successCircle: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: palette.mintDeep,
    borderRadius: 48,
    height: 96,
    justifyContent: 'center',
    width: 96,
  },
  confirmationTitle: {
    color: '#202733',
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: 0,
    textAlign: 'center',
  },
  pageCopy: {
    ...providerText.body,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  infoLabel: {
    color: '#6D7480',
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  infoValue: {
    color: '#202733',
    flex: 1.3,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
  },
});
