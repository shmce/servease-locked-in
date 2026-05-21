import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton, TopBar } from '../../../components/DesignKit';
import { AppRole } from '../../../navigation/types';
import { BookingStatus } from '../../../shared/models/types';
import { palette, radius, spacing, type } from '../../../theme/serveaseDesign';
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
    <>
      <TopBar title="Cancel Booking" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.content}>
          <Text style={styles.sorryTitle}>Cancel this booking?</Text>
          <Text style={styles.pageCopy}>
            Please let us know why you&apos;re canceling your booking. We would really appreciate your feedback.
          </Text>
          <View style={styles.radioGroup}>
            {data.reasonRows.map((row) => (
              <Pressable
                key={row.reason}
                style={styles.radioRow}
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
          <View style={styles.policyCard}>
            <Text style={styles.cardTitle}>Cancellation policy</Text>
            <Text style={styles.cardMeta}>
              Pending and confirmed bookings can be cancelled before the provider starts the service.
            </Text>
          </View>
          {data.helperText ? (
            <Text style={styles.helperText}>{data.helperText}</Text>
          ) : null}
          <PrimaryButton
            label="Cancel Booking"
            variant="danger"
            onPress={() => void onCancelBooking()}
            disabled={!data.canSubmit}
          />
          <Text style={styles.footerLink} onPress={onKeepBooking}>
            Don&apos;t Cancel
          </Text>
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
  sorryTitle: {
    color: palette.ink,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0,
  },
  pageCopy: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  radioGroup: {
    gap: spacing.sm,
  },
  radioRow: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.lineSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  radioOuter: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.mint,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  radioOuterSelected: {
    borderColor: palette.mint,
  },
  radioInner: {
    backgroundColor: palette.mint,
    borderRadius: radius.pill,
    height: 10,
    width: 10,
  },
  radioLabel: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  policyCard: {
    backgroundColor: palette.white,
    borderColor: palette.lineSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  cardMeta: {
    ...type.caption,
    color: palette.muted,
  },
  helperText: {
    color: palette.red,
    fontSize: 12,
    fontWeight: '700',
  },
  footerLink: {
    ...type.caption,
    color: palette.mint,
    fontWeight: '900',
    textAlign: 'center',
  },
});
