import { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CheckCircle, ChevronRight } from 'lucide-react-native';
import {
  Card,
  PrimaryButton,
  Section,
  StatusTimeline,
} from '../../../components/DesignKit';
import {
  InfoRow,
  MissingSelection,
} from '../../../components/AppDisplay';
import {
  BookingSummary,
  PaymentSummary,
  ProviderListing,
} from '../../../shared/models/types';
import { ActionRow } from '../../../shared/components/ScreenLayout';
import { AppScreen } from '../../../navigation/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { useCustomerBookingConfirmationViewModel } from '../viewModels/useCustomerBookingConfirmationViewModel';

type CustomerBookingConfirmationScreenProps = {
  selectedBooking: BookingSummary | null;
  selectedProvider: ProviderListing | null | undefined;
  selectedPayment: PaymentSummary | null;
  timelineEvents: ReactNode;
  navigate: (screen: AppScreen, nextRole?: 'customer') => void;
  onBack: () => void;
  addSelectedBookingToCalendar: () => Promise<void>;
  onMissingProvider: () => void;
};

export function CustomerBookingConfirmationScreen({
  selectedBooking,
  selectedProvider,
  selectedPayment,
  timelineEvents,
  navigate,
  onBack,
  addSelectedBookingToCalendar,
  onMissingProvider,
}: CustomerBookingConfirmationScreenProps) {
  const confirmation = useCustomerBookingConfirmationViewModel({
    selectedBooking,
    selectedProvider,
    selectedPayment,
  });

  if (!confirmation.data.hasBooking) {
    return <MissingSelection onBack={onBack} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.withBottomNav}>
      <View style={styles.confirmationContent}>
        <View style={styles.successCircle}>
          <CheckCircle color={palette.white} size={44} strokeWidth={2.6} />
        </View>
        <Text style={styles.confirmationTitle}>Your booking is confirmed!</Text>
        <Text style={styles.bookingReference}>
          {confirmation.data.bookingReference}
        </Text>

        <Card>
          <View style={styles.providerSummaryRow}>
            <View style={styles.providerPhoto}>
              <Text style={styles.providerPhotoText}>
                {confirmation.data.providerInitial}
              </Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.cardTitle}>{confirmation.data.providerName}</Text>
              <Text style={styles.cardMeta}>{confirmation.data.providerRatingLabel}</Text>
              <Pressable
                style={styles.profileLinkRow}
                onPress={() => {
                  if (confirmation.data.canViewProvider) {
                    navigate('customerProviderProfile', 'customer');
                  } else {
                    onMissingProvider();
                  }
                }}
                accessibilityRole="button"
                accessibilityLabel="View provider profile"
              >
                <Text style={styles.linkText}>View Profile</Text>
                <ChevronRight color={palette.mint} size={18} />
              </Pressable>
            </View>
          </View>
        </Card>

        <Section title="Service summary">
          <InfoRow label="Date" value={confirmation.data.scheduledAtLabel} />
          <InfoRow label="Location" value={confirmation.data.locationLabel} />
          <InfoRow label="Cost" value={confirmation.data.costLabel} />
        </Section>

        <StatusTimeline steps={confirmation.data.statusSteps} />
        {timelineEvents}
        <Text style={styles.noticeText}>{confirmation.data.bookedForLabel}</Text>

        <ActionRow>
          <PrimaryButton
            label="Manage booking"
            onPress={() => navigate('customerBookingManage', 'customer')}
          />
          <PrimaryButton
            label="Add to calendar"
            variant="secondary"
            onPress={() => void addSelectedBookingToCalendar()}
          />
        </ActionRow>
        <PrimaryButton
          label="Reserve payment"
          variant="secondary"
          onPress={() => navigate('customerReservePayment', 'customer')}
          disabled={confirmation.data.isPaymentReserved}
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
    gap: spacing.md,
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
  successCircle: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: palette.mint,
    borderRadius: radius.pill,
    height: 88,
    justifyContent: 'center',
    width: 88,
  },
  confirmationTitle: {
    color: palette.ink,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
    textAlign: 'center',
  },
  bookingReference: {
    color: palette.faint,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.4,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  providerSummaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.base,
  },
  providerPhoto: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.pill,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  providerPhotoText: {
    color: palette.mint,
    fontSize: 20,
    fontWeight: '900',
  },
  profileLinkRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  flex: {
    flex: 1,
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  cardMeta: {
    color: palette.faint,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
  },
  linkText: {
    color: palette.mint,
    fontSize: 13,
    fontWeight: '900',
  },
  noticeText: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
});
