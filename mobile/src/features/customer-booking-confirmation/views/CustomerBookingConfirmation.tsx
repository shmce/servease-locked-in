import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CheckCircle, ChevronRight } from 'lucide-react-native';
import { StatusTimeline } from '../../../components/DesignKit';
import { MotionPressable, SuccessMotion } from '../../../components/Motion';
import { MissingSelection } from '../../../components/AppDisplay';
import {
  BookingSummary,
  PaymentSummary,
  ProviderListing,
} from '../../../shared/models/types';
import {
  CustomerCard,
  CustomerContent,
  CustomerHeader,
  CustomerScreen,
  CustomerSection,
  customerText,
} from '../../../shared/components/CustomerUI';
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
    <CustomerScreen>
      <CustomerContent>
        <CustomerHeader
          title="Booking confirmed"
          subtitle={data.bookingReference}
          onBack={onBack}
        />

        <SuccessMotion style={styles.hero}>
          <View style={styles.successCircle}>
            <CheckCircle color={palette.white} size={38} strokeWidth={2.4} />
          </View>
          <Text style={styles.confirmationTitle}>Your booking is confirmed</Text>
          <Text style={styles.noticeText}>{data.bookedForLabel}</Text>
        </SuccessMotion>

        <CustomerCard>
          <View style={styles.providerRow}>
            <View style={styles.providerAvatar}>
              <Text style={styles.providerInitial}>{data.providerInitial}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.providerName}>{data.providerName}</Text>
              <Text style={styles.providerRating}>{data.providerRatingLabel}</Text>
              <MotionPressable
                contentStyle={styles.profileLinkRow}
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
                <ChevronRight color={palette.mintDeep} size={14} strokeWidth={2.2} />
              </MotionPressable>
            </View>
          </View>
        </CustomerCard>

        <CustomerSection title="Service summary">
          <CustomerCard>
            <DetailRow label="Date" value={data.scheduledAtLabel} />
            <DetailRow label="Location" value={data.locationLabel} />
            <DetailRow label="Cost" value={data.costLabel} last />
          </CustomerCard>
        </CustomerSection>

        <CustomerSection title="Booking status">
          <CustomerCard>
            <StatusTimeline steps={data.statusSteps} />
          </CustomerCard>
        </CustomerSection>

        {timelineEvents}

        <View style={styles.actionStack}>
          <MotionPressable
            contentStyle={styles.primaryAction}
            onPress={() => navigate('customerBookingManage', 'customer')}
            accessibilityRole="button"
            accessibilityLabel="Manage booking"
          >
            <Text style={styles.primaryActionText}>Manage booking</Text>
          </MotionPressable>
          <MotionPressable
            contentStyle={styles.secondaryAction}
            onPress={() => void addSelectedBookingToCalendar()}
            accessibilityRole="button"
            accessibilityLabel="Add to Google Calendar"
          >
            <Text style={styles.secondaryActionText}>Add to Google Calendar</Text>
          </MotionPressable>
          <MotionPressable
            contentStyle={styles.secondaryAction}
            onPress={() => navigate('customerReservePayment', 'customer')}
            accessibilityRole="button"
            accessibilityLabel="View payment"
          >
            <Text style={styles.secondaryActionText}>View payment</Text>
          </MotionPressable>
        </View>
      </CustomerContent>
    </CustomerScreen>
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
      <Text style={styles.detailValue} numberOfLines={3}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    minWidth: 0,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  successCircle: {
    alignItems: 'center',
    backgroundColor: palette.mintDeep,
    borderRadius: radius.pill,
    height: 76,
    justifyContent: 'center',
    width: 76,
  },
  confirmationTitle: {
    color: '#202733',
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 28,
    textAlign: 'center',
  },
  providerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  providerAvatar: {
    alignItems: 'center',
    backgroundColor: '#F1FAF5',
    borderRadius: radius.pill,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  providerInitial: {
    color: palette.mintDeep,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0,
  },
  providerName: {
    ...customerText.title,
    fontSize: 15,
    lineHeight: 20,
  },
  providerRating: {
    ...customerText.meta,
    marginTop: 2,
  },
  profileLinkRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
    marginTop: spacing.xs,
  },
  linkText: {
    color: palette.mintDeep,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0,
  },
  detailRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  detailRowBorder: {
    borderBottomColor: '#EEF0F2',
    borderBottomWidth: 1,
  },
  detailLabel: {
    ...customerText.meta,
    flex: 1,
    paddingTop: 1,
  },
  detailValue: {
    color: '#202733',
    flex: 1.6,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 18,
    textAlign: 'right',
  },
  noticeText: {
    ...customerText.meta,
    textAlign: 'center',
  },
  actionStack: {
    gap: spacing.sm,
  },
  primaryAction: {
    alignItems: 'center',
    backgroundColor: palette.mintDeep,
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryActionText: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0,
  },
  secondaryAction: {
    alignItems: 'center',
    backgroundColor: '#F1FAF5',
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: 46,
  },
  secondaryActionText: {
    color: palette.mintDeep,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0,
  },
});
