import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  CustomerCard,
  CustomerContent,
  CustomerHeader,
  CustomerScreen,
  CustomerSection,
  customerText,
} from '../../../shared/components/CustomerUI';
import { AppRole } from '../../../navigation/types';
import { BookingStatus } from '../../../shared/models/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { useCustomerCancelBookingViewModel } from '../viewModels/useCustomerCancelBookingViewModel';

type CustomerCancelBookingScreenProps = {
  cancelReason: string;
  selectedBookingStatus?: BookingStatus;
  appRole: AppRole | 'guest';
  onBack: () => void;
  onReasonChange: (reason: string) => void;
  onCancelBooking: () => Promise<void>;
  onKeepBooking: () => void;
};

export function CustomerCancelBookingScreen({
  cancelReason,
  selectedBookingStatus,
  appRole,
  onBack,
  onReasonChange,
  onCancelBooking,
  onKeepBooking,
}: CustomerCancelBookingScreenProps) {
  const cancelBooking = useCustomerCancelBookingViewModel({
    cancelReason,
    selectedBookingStatus,
    appRole,
  });
  const { data } = cancelBooking;

  return (
    <CustomerScreen>
      <CustomerContent>
        <CustomerHeader
          title="Cancel Booking"
          subtitle="Tell us why you need to cancel"
          onBack={onBack}
        />

        <CustomerCard>
          <Text style={styles.sorryTitle}>Cancel this booking?</Text>
          <Text style={styles.pageCopy}>
            Please let us know why you are canceling your booking.
          </Text>
        </CustomerCard>

        <CustomerSection title="Reason">
          <View style={styles.radioGroup}>
            {data.reasonRows.map((row) => (
              <Pressable
                key={row.reason}
                style={[styles.radioRow, row.selected && styles.radioRowSelected]}
                onPress={() => onReasonChange(row.reason)}
                accessibilityRole="radio"
                accessibilityState={{ checked: row.selected }}
              >
                <View
                  style={[
                    styles.radioOuter,
                    row.selected && styles.radioOuterSelected,
                  ]}
                >
                  {row.selected ? <View style={styles.radioInner} /> : null}
                </View>
                <Text style={styles.radioLabel}>{row.reason}</Text>
              </Pressable>
            ))}
          </View>
        </CustomerSection>

        <CustomerCard>
          <Text style={styles.cardTitle}>Cancellation policy</Text>
          <Text style={styles.cardMeta}>
            Pending and confirmed bookings can be cancelled before the provider starts
            the service.
          </Text>
        </CustomerCard>

        {data.helperText ? (
          <Text style={styles.helperText}>{data.helperText}</Text>
        ) : null}

        <Pressable
          style={[styles.cancelButton, !data.canSubmit && styles.cancelButtonDisabled]}
          onPress={() => void onCancelBooking()}
          disabled={!data.canSubmit}
          accessibilityRole="button"
        >
          <Text style={styles.cancelButtonText}>Cancel Booking</Text>
        </Pressable>
        <Text style={styles.footerLink} onPress={onKeepBooking}>
          Keep Booking
        </Text>
      </CustomerContent>
    </CustomerScreen>
  );
}

const styles = StyleSheet.create({
  sorryTitle: {
    color: '#202733',
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 28,
  },
  pageCopy: {
    ...customerText.body,
  },
  radioGroup: {
    gap: spacing.sm,
  },
  radioRow: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: '#EEF0F2',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  radioRowSelected: {
    backgroundColor: '#F1FAF5',
    borderColor: '#BDE8D0',
  },
  radioOuter: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: '#D8DEE5',
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  radioOuterSelected: {
    borderColor: palette.mintDeep,
  },
  radioInner: {
    backgroundColor: palette.mintDeep,
    borderRadius: radius.pill,
    height: 10,
    width: 10,
  },
  radioLabel: {
    ...customerText.title,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  cardTitle: {
    ...customerText.title,
    fontSize: 14,
    lineHeight: 19,
  },
  cardMeta: {
    ...customerText.body,
  },
  helperText: {
    color: palette.red,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0,
  },
  cancelButton: {
    alignItems: 'center',
    backgroundColor: palette.red,
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButtonDisabled: {
    opacity: 0.5,
  },
  cancelButtonText: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0,
  },
  footerLink: {
    color: palette.mintDeep,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0,
    textAlign: 'center',
  },
});
