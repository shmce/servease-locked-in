import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import {
  ProviderButton,
  ProviderCard,
  ProviderContent,
  ProviderHeader,
  ProviderScreen,
  ProviderStickyFooter,
  providerText,
} from '../../../shared/components/ProviderUI';
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
      <ProviderScreen bottomInset={148}>
        <ProviderContent>
          <ProviderHeader
            title="Cancel Booking"
            subtitle={bookingReference}
            onBack={onBack}
          />
          <ProviderCard>
            <Text style={styles.cardTitle}>Cancellation review</Text>
            <Text style={styles.manageCopy}>
              Cancelling updates the booking status immediately through the existing backend API.
            </Text>
          </ProviderCard>
          <ProviderCard>
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
          </ProviderCard>
        </ProviderContent>
      </ProviderScreen>
      <ProviderStickyFooter>
        <ProviderButton
          label="Cancel Booking"
          variant="danger"
          onPress={() => void onCancelBooking()}
          disabled={!data.canSubmit}
        />
        <Text style={styles.footerLink} onPress={onKeepBooking}>
          Keep booking
        </Text>
      </ProviderStickyFooter>
    </>
  );
}

const styles = StyleSheet.create({
  cardTitle: {
    ...providerText.title,
    fontSize: 15,
    lineHeight: 20,
  },
  manageCopy: {
    ...providerText.body,
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
    backgroundColor: palette.mintDeep,
    borderRadius: radius.pill,
    height: 10,
    width: 10,
  },
  radioLabel: {
    color: '#202733',
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  footerLink: {
    color: palette.mintDeep,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
