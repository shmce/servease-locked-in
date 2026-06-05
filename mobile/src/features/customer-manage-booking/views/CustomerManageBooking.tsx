import { Pressable, StyleSheet, Text } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import {
  CustomerCard,
  CustomerContent,
  CustomerHeader,
  CustomerScreen,
  CustomerSection,
  customerText,
} from '../../../shared/components/CustomerUI';
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
    <CustomerScreen>
      <CustomerContent>
        <CustomerHeader
          title="Manage Booking"
          subtitle="Support and cancellation options"
          onBack={onBack}
        />

        <CustomerSection>
          <CustomerCard style={styles.optionList}>
            {manageBooking.data.optionRows.map((row, index) => (
              <Pressable
                key={row.key}
                style={[
                  styles.optionRow,
                  index < manageBooking.data.optionRows.length - 1 &&
                    styles.optionRowBorder,
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
          </CustomerCard>
        </CustomerSection>
      </CustomerContent>
    </CustomerScreen>
  );
}

const styles = StyleSheet.create({
  optionList: {
    gap: 0,
    overflow: 'hidden',
    paddingVertical: 0,
  },
  optionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 58,
    paddingHorizontal: spacing.base,
  },
  optionRowBorder: {
    borderBottomColor: '#EEF0F2',
    borderBottomWidth: 1,
  },
  optionRowDanger: {
    backgroundColor: '#FFF7F7',
  },
  optionLabel: {
    ...customerText.title,
    fontSize: 14,
    lineHeight: 19,
  },
  optionLabelDanger: {
    color: palette.red,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 19,
  },
});
