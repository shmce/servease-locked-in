import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { StatusTimeline } from '../../../components/DesignKit';
import {
  BookingSummary,
  PaymentSummary,
  ProviderListing,
  ReviewSummary,
} from '../../../shared/models/types';
import {
  CustomerBadge,
  CustomerCard,
  CustomerContent,
  CustomerHeader,
  CustomerScreen,
  CustomerSection,
  customerText,
} from '../../../shared/components/CustomerUI';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { useCustomerBookingDetailViewModel } from '../viewModels/useCustomerBookingDetailViewModel';
import { CustomerBookingReviewPanel } from './CustomerBookingReviewPanel';

type CustomerBookingDetailScreenProps = {
  booking: BookingSummary;
  selectedProvider: ProviderListing | null;
  selectedPayment: PaymentSummary | null;
  timelineEvents: ReactNode;
  bookingMedia: ReactNode;
  serviceUpdates: ReactNode;
  selectedReview: ReviewSummary | null;
  rating: string;
  reviewText: string;
  busyAction: string | null;
  showReservePaymentAction?: boolean;
  onBack: () => void;
  onViewProviderProfile: () => void;
  onProviderProfileUnavailable: () => void;
  onTrackProvider: () => void;
  onManageBooking: () => void;
  onMessage: () => void;
  onReservePayment: () => void;
  onRatingChange: (value: string) => void;
  onReviewTextChange: (value: string) => void;
  onSubmitReview: () => void;
};

export function CustomerBookingDetailScreen({
  booking,
  selectedProvider,
  selectedPayment,
  timelineEvents,
  bookingMedia,
  serviceUpdates,
  selectedReview,
  rating,
  reviewText,
  busyAction,
  showReservePaymentAction,
  onBack,
  onViewProviderProfile,
  onProviderProfileUnavailable,
  onTrackProvider,
  onManageBooking,
  onMessage,
  onReservePayment,
  onRatingChange,
  onReviewTextChange,
  onSubmitReview,
}: CustomerBookingDetailScreenProps) {
  const bookingDetail = useCustomerBookingDetailViewModel({
    booking,
    selectedProvider,
    selectedPayment,
    showReservePaymentAction,
  });
  const { data } = bookingDetail;

  return (
    <CustomerScreen>
      <CustomerContent>
        <CustomerHeader
          title="Booking Information"
          subtitle={data.addressLabel}
          onBack={onBack}
        />

        <CustomerCard>
          <Text style={styles.bookingReference}>{data.bookingReference}</Text>
          <Text style={styles.detailTitle}>{data.serviceTitle}</Text>
          <Text style={styles.scheduleLabel}>{data.scheduleLabel}</Text>
          <StatusTimeline steps={data.timelineSteps} />
          <View style={styles.priceRow}>
            <Text style={styles.priceText}>{data.totalAmountLabel}</Text>
            <CustomerBadge
              label={data.statusChip.label}
              tone={data.statusChip.tone}
            />
          </View>
        </CustomerCard>

        {timelineEvents}

        <CustomerSection title="Service details">
          <CustomerCard>
            {data.serviceDetailRows.map((row, index) => (
              <DetailRow
                key={row.key}
                label={row.label}
                value={row.value}
                last={index === data.serviceDetailRows.length - 1}
              />
            ))}
          </CustomerCard>
        </CustomerSection>

        <CustomerSection title="Service provider">
          <CustomerCard>
            <View style={styles.providerRow}>
              <View style={styles.providerAvatar}>
                <Text style={styles.providerInitial}>
                  {data.providerName.slice(0, 1).toUpperCase()}
                </Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.providerName}>{data.providerName}</Text>
                <Pressable
                  style={styles.profileLinkRow}
                  onPress={
                    data.canViewProviderProfile
                      ? onViewProviderProfile
                      : onProviderProfileUnavailable
                  }
                  accessibilityRole="button"
                  accessibilityLabel="View provider profile"
                >
                  <Text style={styles.linkText}>View Profile</Text>
                  <ChevronRight color={palette.mintDeep} size={14} strokeWidth={2.2} />
                </Pressable>
              </View>
            </View>
          </CustomerCard>
        </CustomerSection>

        {data.showTrackProvider ? (
          <Pressable
            style={styles.primaryAction}
            onPress={onTrackProvider}
            accessibilityRole="button"
          >
            <Text style={styles.primaryActionText}>Track provider</Text>
          </Pressable>
        ) : null}

        {bookingMedia}
        {serviceUpdates}

        <View style={styles.actionRow}>
          <Pressable
            style={styles.primaryAction}
            onPress={onManageBooking}
            accessibilityRole="button"
          >
            <Text style={styles.primaryActionText}>Manage booking</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryAction}
            onPress={onMessage}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryActionText}>Message</Text>
          </Pressable>
        </View>

        {data.showReservePayment ? (
          <Pressable
            style={[
              styles.secondaryAction,
              data.reservePaymentDisabled && styles.actionDisabled,
            ]}
            onPress={onReservePayment}
            disabled={data.reservePaymentDisabled}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryActionText}>{data.reservePaymentLabel}</Text>
          </Pressable>
        ) : null}

        {data.showPaymentSummary && data.paymentSummary ? (
          <CustomerSection title="Payment">
            <CustomerCard>
              <DetailRow
                label={data.paymentSummary.label}
                value={data.paymentSummary.value}
                last
              />
            </CustomerCard>
          </CustomerSection>
        ) : null}

        {data.showReviewPanel ? (
          <CustomerBookingReviewPanel
            selectedReview={selectedReview}
            rating={rating}
            reviewText={reviewText}
            busyAction={busyAction}
            onRatingChange={onRatingChange}
            onReviewTextChange={onReviewTextChange}
            onSubmitReview={onSubmitReview}
          />
        ) : null}
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
  bookingReference: {
    color: palette.mintDeep,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  detailTitle: {
    ...customerText.title,
    fontSize: 20,
    lineHeight: 26,
    marginTop: spacing.xs,
  },
  scheduleLabel: {
    ...customerText.meta,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  priceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  priceText: {
    color: palette.mintDeep,
    fontSize: 20,
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
  providerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  providerAvatar: {
    alignItems: 'center',
    backgroundColor: '#F1FAF5',
    borderRadius: radius.pill,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  providerInitial: {
    color: palette.mintDeep,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0,
  },
  providerName: {
    ...customerText.title,
    fontSize: 14,
    lineHeight: 19,
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
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  primaryAction: {
    alignItems: 'center',
    backgroundColor: palette.mintDeep,
    borderRadius: radius.pill,
    flex: 1,
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
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  secondaryActionText: {
    color: palette.mintDeep,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0,
  },
  actionDisabled: {
    opacity: 0.55,
  },
});
