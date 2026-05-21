import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { TopBar } from '../../../components/DesignKit';
import { BookingStatus } from '../../../shared/models/types';
import { palette, spacing } from '../../../theme/serveaseDesign';
import {
  CustomerManageBookingAction,
  useCustomerManageBookingViewModel,
} from '../viewModels/useCustomerManageBookingViewModel';

type CustomerManageBookingScreenProps = {
  status?: BookingStatus;
  onBack: () => void;
  onMessage: () => void;
  onTrack: () => void;
  onViewPayment: () => void;
  onReportIssue: () => void;
  onCancel: () => void;
};

export function CustomerManageBookingScreen({
  status,
  onBack,
  onMessage,
  onTrack,
  onViewPayment,
  onReportIssue,
  onCancel,
}: CustomerManageBookingScreenProps) {
  const manageBooking = useCustomerManageBookingViewModel({ status });
  const actionHandlers: Record<CustomerManageBookingAction, () => void> = {
    cancel: onCancel,
    message: onMessage,
    payment: onViewPayment,
    report: onReportIssue,
    track: onTrack,
  };

  return (
    <>
      <TopBar title="Manage Booking" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.content}>
          <Text style={styles.manageCopy}>
            Manage support and cancellation options for this booking.
          </Text>
          <View style={styles.optionList}>
            {manageBooking.data.optionRows.map((row) => (
              <Pressable
                key={row.key}
                style={[
                  styles.optionRow,
                  row.tone === 'danger' && styles.optionRowDanger,
                ]}
                onPress={actionHandlers[row.key]}
                accessibilityRole="button"
                accessibilityLabel={row.accessibilityLabel}
              >
                <Text
                  style={
                    row.tone === 'danger'
                      ? styles.optionLabelDanger
                      : styles.optionLabel
                  }
                >
                  {row.label}
                </Text>
                <ChevronRight color={palette.faint} size={20} />
              </Pressable>
            ))}
          </View>
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
  manageCopy: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  optionList: {
    backgroundColor: palette.white,
    borderColor: palette.lineSoft,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  optionRow: {
    alignItems: 'center',
    borderBottomColor: palette.lineSoft,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  optionRowDanger: {
    backgroundColor: '#FFF1F2',
  },
  optionLabel: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  optionLabelDanger: {
    color: palette.red,
    fontSize: 13,
    fontWeight: '900',
  },
});
