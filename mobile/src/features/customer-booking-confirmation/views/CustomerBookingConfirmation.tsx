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
  StatusTimeline,
} from '../../../components/DesignKit';
import { MissingSelection } from '../../../components/AppDisplay';
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

  const { data } = confirmation;

  return (
    <ScrollView contentContainerStyle={styles.withBottomNav}>
      <View style={styles.content}>

        {/* Success hero */}
        <View style={styles.hero}>
          <View style={styles.successCircle}>
            <CheckCircle color={palette.white} size={44} strokeWidth={2.4} />
          </View>
          <Text style={styles.confirmationTitle}>Your booking is confirmed!</Text>
          <Text style={styles.bookingReference}>{data.bookingReference}</Text>
        </View>

        {/* Provider */}
        <Card>
          <View style={styles.providerRow}>
            <View style={styles.providerAvatar}>
              <Text style={styles.providerInitial}>{data.providerInitial}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.providerName}>{data.providerName}</Text>
              <Text style={styles.providerRating}>{data.providerRatingLabel}</Text>
              <Pressable
                style={styles.profileLinkRow}
                onPress={() => {
                  if (data.canViewProvider) {
                    navigate('customerProviderProfile', 'customer');
                  } else {
                    onMissingProvider();
                  }
                }}
                accessibilityRole="button"
                accessibilityLabel="View provider profile"
              >
                <Text style={styles.linkText}>View Profile</Text>
                <ChevronRight color={palette.mint} size={14} strokeWidth={2.2} />
              </Pressable>
            </View>
          </View>
        </Card>

        {/* Service summary */}
        <Card>
          <Text style={styles.sectionLabel}>Service summary</Text>
          <DetailRow label="Date" value={data.scheduledAtLabel} />
          <DetailRow label="Location" value={data.locationLabel} />
          <DetailRow label="Cost" value={data.costLabel} last />
        </Card>

        {/* Booking status */}
        <Card>
          <Text style={styles.sectionLabel}>Booking status</Text>
          <StatusTimeline steps={data.statusSteps} />
        </Card>

        {timelineEvents}

        <Text style={styles.noticeText}>{data.bookedForLabel}</Text>

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
          label="View payment"
          variant="secondary"
          onPress={() => navigate('customerReservePayment', 'customer')}
        />

      </View>
    </ScrollView>
  );
}

function DetailRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.detailRow, !last && styles.detailRowBorder]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={3}>{value}</Text>
    </View>
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
    paddingTop: spacing.lg,
  },
  flex: {
    flex: 1,
  },

  // Hero
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  successCircle: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    borderRadius: radius.pill,
    height: 88,
    justifyContent: 'center',
    width: 88,
  },
  confirmationTitle: {
    color: palette.ink,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
    textAlign: 'center',
  },
  bookingReference: {
    color: palette.mint,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textAlign: 'center',
    textTransform: 'uppercase',
  },

  // Provider card
  providerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.base,
  },
  providerAvatar: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.pill,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  providerInitial: {
    color: palette.mint,
    fontSize: 20,
    fontWeight: '700',
  },
  providerName: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  providerRating: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  profileLinkRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
    marginTop: spacing.xs,
  },
  linkText: {
    color: palette.mint,
    fontSize: 12,
    fontWeight: '700',
  },

  // Section label
  sectionLabel: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },

  // Detail rows
  detailRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  detailRowBorder: {
    borderBottomColor: palette.line,
    borderBottomWidth: 1,
  },
  detailLabel: {
    color: palette.muted,
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    paddingTop: 1,
  },
  detailValue: {
    color: palette.ink,
    flex: 1.6,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },

  // Notice + footer
  noticeText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
    textAlign: 'center',
  },
});
