import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
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
    <>
      <TopBar
        title="Booking Information"
        subtitle={data.addressLabel}
        onBack={onBack}
      />
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.content}>

          {/* Hero card */}
          <Card>
            <Text style={styles.bookingReference}>{data.bookingReference}</Text>
            <Text style={styles.detailTitle}>{data.serviceTitle}</Text>
            <Text style={styles.scheduleLabel}>{data.scheduleLabel}</Text>
            <StatusTimeline steps={data.timelineSteps} />
            <View style={styles.priceRow}>
              <Text style={styles.priceText}>{data.totalAmountLabel}</Text>
              <Badge {...data.statusChip} />
            </View>
          </Card>

          {timelineEvents}

          {/* Service details */}
          <Card>
            <Text style={styles.sectionLabel}>Service details</Text>
            {data.serviceDetailRows.map((row, i) => (
              <DetailRow
                key={row.key}
                label={row.label}
                value={row.value}
                last={i === data.serviceDetailRows.length - 1}
              />
            ))}
          </Card>

          {/* Service provider */}
          <Card>
            <Text style={styles.sectionLabel}>Service provider</Text>
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
                  <ChevronRight color={palette.mint} size={14} strokeWidth={2.2} />
                </Pressable>
              </View>
            </View>
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
              <Text style={styles.sectionLabel}>Payment</Text>
              <DetailRow
                label={data.paymentSummary.label}
                value={data.paymentSummary.value}
                last
              />
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
  },
  flex: {
    flex: 1,
  },

  // Hero card
  bookingReference: {
    color: palette.mint,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  detailTitle: {
    color: palette.ink,
    fontSize: 20,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  scheduleLabel: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '500',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  priceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  priceText: {
    color: palette.mint,
    fontSize: 20,
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

  // Provider card
  providerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  providerAvatar: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.pill,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  providerInitial: {
    color: palette.mint,
    fontSize: 18,
    fontWeight: '700',
  },
  providerName: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '700',
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
});
