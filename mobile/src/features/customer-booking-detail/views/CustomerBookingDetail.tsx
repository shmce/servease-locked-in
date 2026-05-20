import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { InfoRow } from '../../../components/AppDisplay';
import {
  Badge,
  Card,
  PrimaryButton,
  StatusTimeline,
  TopBar,
} from '../../../components/DesignKit';
import {
  BookingSummary,
  PaymentSummary,
  ProviderListing,
  ReviewSummary,
} from '../../../shared/models/types';
import { ActionRow } from '../../../shared/components/ScreenLayout';
import { palette, spacing, type } from '../../../theme/serveaseDesign';
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
  });
  const { data } = bookingDetail;

  return (
    <>
      <TopBar
        title="Booking Information"
        subtitle={data.addressLabel}
        onBack={onBack}
      />
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.content}>
          <Card>
            <Text style={styles.bookingReference}>{data.bookingReference}</Text>
            <Text style={styles.detailTitle}>{data.serviceTitle}</Text>
            <Text style={styles.cardMeta}>{data.scheduleLabel}</Text>
            <StatusTimeline steps={data.timelineSteps} />
            <View style={styles.rowBetween}>
              <Text style={styles.priceText}>{data.totalAmountLabel}</Text>
              <Badge {...data.statusChip} />
            </View>
          </Card>
          {timelineEvents}
          <Card>
            <Text style={styles.cardTitle}>Service details</Text>
            {data.serviceDetailRows.map((row) => (
              <InfoRow key={row.key} label={row.label} value={row.value} />
            ))}
          </Card>
          <Card>
            <Text style={styles.cardTitle}>Service provider</Text>
            <Text style={styles.cardBody}>{data.providerName}</Text>
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
              <ChevronRight color={palette.mint} size={18} />
            </Pressable>
          </Card>
          {data.showTrackProvider ? (
            <PrimaryButton label="Track provider" onPress={onTrackProvider} />
          ) : null}
          {bookingMedia}
          {serviceUpdates}
          <ActionRow>
            <PrimaryButton label="Manage booking" onPress={onManageBooking} />
            <PrimaryButton label="Message" variant="secondary" onPress={onMessage} />
          </ActionRow>
          {data.showReservePayment ? (
            <PrimaryButton
              label={data.reservePaymentLabel}
              variant="secondary"
              onPress={onReservePayment}
              disabled={data.reservePaymentDisabled}
            />
          ) : null}
          {data.showPaymentSummary && data.paymentSummary ? (
            <Card>
              <Text style={styles.cardTitle}>Payment</Text>
              <Text style={styles.cardMeta}>
                {data.paymentSummary.label} - {data.paymentSummary.value}
              </Text>
            </Card>
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
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  profileLinkRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xxs,
    marginTop: spacing.sm,
  },
  bookingReference: {
    color: palette.mint,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
  },
  detailTitle: {
    color: palette.ink,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0,
    marginTop: spacing.xs,
  },
  priceText: {
    color: palette.mint,
    fontSize: 18,
    fontWeight: '900',
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
  cardBody: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  linkText: {
    color: palette.mint,
    fontSize: 13,
    fontWeight: '900',
  },
});
