import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Card,
  PrimaryButton,
  TopBar,
} from '../../../components/DesignKit';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { useProviderCancelBookingViewModel } from '../viewModels/useProviderCancelBookingViewModel';

type ProviderCancelBookingScreenProps = {
  bookingReference: string;
  busyAction: string | null;
  selectedReason: string;
  onBack: () => void;
  onCancelBooking: () => Promise<void>;
  onKeepBooking: () => void;
  onReasonChange: (reason: string) => void;
};

export function ProviderCancelBookingScreen({
  bookingReference,
  busyAction,
  selectedReason,
  onBack,
  onCancelBooking,
  onKeepBooking,
  onReasonChange,
}: ProviderCancelBookingScreenProps) {
  const cancelBooking = useProviderCancelBookingViewModel({
    busyAction,
    selectedReason,
  });
  const { data } = cancelBooking;

  return (
    <>
      <TopBar
        title="Cancel Booking"
        subtitle={bookingReference}
        onBack={onBack}
      />
      <ScrollView contentContainerStyle={styles.withStickyFooter}>
        <View style={styles.content}>
          <View style={styles.policyCard}>
            <Text style={styles.cardTitle}>Cancellation review</Text>
            <Text style={styles.manageCopy}>
              Cancelling updates the booking status immediately through the existing backend API.
            </Text>
          </View>
          <Card>
            <Text style={styles.cardTitle}>Reason</Text>
            <View style={styles.radioGroup}>
              {data.reasonRows.map((row) => (
                <Pressable
                  key={row.reason}
                  style={styles.radioRow}
                  onPress={() => onReasonChange(row.reason)}
                  accessibilityRole="button"
                >
                  <View style={styles.radioOuter}>
                    {row.selected ? <View style={styles.radioInner} /> : null}
                  </View>
                  <Text style={styles.radioLabel}>{row.reason}</Text>
                </Pressable>
              ))}
            </View>
          </Card>
        </View>
      </ScrollView>
      <View style={styles.stickyFooter}>
        <PrimaryButton
          label="Cancel Booking"
          variant="danger"
          onPress={() => void onCancelBooking()}
          disabled={!data.canSubmit}
        />
        <Text style={styles.footerLink} onPress={onKeepBooking}>
          Keep booking
        </Text>
        <View style={styles.footerHomeIndicator} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  withStickyFooter: {
    backgroundColor: palette.cream,
    flexGrow: 1,
    paddingBottom: 148,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.xl,
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
    fontSize: 15,
    fontWeight: '900',
  },
  manageCopy: {
    color: palette.muted,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  radioGroup: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  radioRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  radioOuter: {
    alignItems: 'center',
    borderColor: palette.line,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  radioInner: {
    backgroundColor: palette.mint,
    borderRadius: radius.pill,
    height: 10,
    width: 10,
  },
  radioLabel: {
    color: palette.ink,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  stickyFooter: {
    backgroundColor: palette.white,
    borderTopColor: palette.lineSoft,
    borderTopWidth: 1,
    bottom: 0,
    gap: spacing.sm,
    left: 0,
    padding: spacing.lg,
    position: 'absolute',
    right: 0,
  },
  footerLink: {
    color: palette.mint,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  footerHomeIndicator: {
    alignSelf: 'center',
    backgroundColor: '#111111',
    borderRadius: radius.pill,
    height: 4,
    marginTop: spacing.xs,
    opacity: 0.18,
    width: 96,
  },
});
