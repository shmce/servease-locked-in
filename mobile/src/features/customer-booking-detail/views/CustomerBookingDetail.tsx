import { ReactNode, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-react-native';
import { TabBar } from '../../../components/ui';
import {
  BookingSummary,
  PaymentSummary,
  ProviderListing,
  ReviewSummary,
  BookingStatus,
  BookingTimelineEventSummary,
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
import { formatDateTime, timelineEventLabel } from '../../../domain/booking';
import { useCustomerBookingDetailViewModel } from '../viewModels/useCustomerBookingDetailViewModel';
import { CustomerBookingReviewPanel } from './CustomerBookingReviewPanel';
import { CustomerBookingReviewSheet } from './CustomerBookingReviewSheet';

type CustomerBookingDetailScreenProps = {
  booking: BookingSummary;
  selectedProvider: ProviderListing | null;
  selectedPayment: PaymentSummary | null;
  timelineEvents: BookingTimelineEventSummary[];
  hasTimelineEvents?: boolean;
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
  onOpenReview: () => void;
  onCloseReview: () => void;
  isReviewSheetVisible: boolean;
};

type TimelinePinState = 'completed' | 'current' | 'upcoming';

type PinTimelineEntry = BookingTimelineEventSummary & {
  state: TimelinePinState;
  resolvedLabel: string;
  resolvedTime: string;
};

const timelineStatusRanks: Record<BookingStatus, number> = {
  pending: 0,
  confirmed: 1,
  in_progress: 2,
  completed: 3,
  cancelled: 3,
  rejected: 3,
};

const pinStateLabel: Record<TimelinePinState, string> = {
  completed: 'completed',
  current: 'current',
  upcoming: 'upcoming',
};

const bookingDetailTabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'timeline', label: 'Timeline' },
] as const;

type BookingDetailTab = (typeof bookingDetailTabs)[number]['key'];

export function CustomerBookingDetailScreen({
  booking,
  selectedProvider,
  selectedPayment,
  timelineEvents,
  hasTimelineEvents = false,
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
  onOpenReview,
  onCloseReview,
  isReviewSheetVisible,
}: CustomerBookingDetailScreenProps) {
  const [activeTab, setActiveTab] = useState<BookingDetailTab>('overview');
  const [isPriceBreakdownExpanded, setIsPriceBreakdownExpanded] =
    useState(false);

  const bookingDetail = useCustomerBookingDetailViewModel({
    booking,
    selectedProvider,
    selectedPayment,
    showReservePaymentAction,
    selectedReview,
  });
  const { data } = bookingDetail;

  const priceRows = data.priceBreakdownRows;
  const totalPriceRow = priceRows.at(-1) ?? null;
  const hasPriceBreakdownDetails = priceRows.length > 1;
  const visiblePriceRows = isPriceBreakdownExpanded
    ? priceRows
    : totalPriceRow
      ? [totalPriceRow]
      : [];
  const timelinePinEvents = buildPinTimelineEvents(timelineEvents, booking.status);

  const timelineTabContent = hasTimelineEvents ? (
    <CustomerSection title="Booking Timeline">
      <CustomerCard>
        {timelinePinEvents.map((event, index) => (
          <BookingTimelinePinRow
            key={event.id}
            isLast={index === timelinePinEvents.length - 1}
            entry={event}
          />
        ))}
      </CustomerCard>
    </CustomerSection>
  ) : (
    <CustomerSection title="Booking Timeline">
      <CustomerCard>
        <Text style={styles.emptyMetaText}>No timeline updates yet.</Text>
      </CustomerCard>
    </CustomerSection>
  );

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
          <View style={styles.statusSummaryRow}>
            <Text style={styles.statusSummaryLabel}>Current status</Text>
            <CustomerBadge
              label={data.statusChip.label}
              tone={data.statusChip.tone}
            />
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceText}>{data.totalAmountLabel}</Text>
          </View>
        </CustomerCard>

        <View style={styles.tabContainer}>
          <TabBar
            tabs={bookingDetailTabs}
            activeTab={activeTab}
            onChange={(tab) => setActiveTab(tab)}
          />
        </View>

        {activeTab === 'overview' ? (
          <>
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

            <CustomerSection title="Price breakdown">
              <CustomerCard>
                <View style={styles.priceBreakdownHeader}>
                  <Text style={styles.sectionTitle}>Price breakdown</Text>
                  <Pressable
                    style={styles.priceToggleButton}
                    onPress={() =>
                      setIsPriceBreakdownExpanded((current) => !current)
                    }
                    accessibilityRole="button"
                    accessibilityLabel="Toggle price breakdown details"
                    accessibilityState={{
                      expanded: isPriceBreakdownExpanded,
                      disabled: !hasPriceBreakdownDetails,
                    }}
                    disabled={!hasPriceBreakdownDetails}
                  >
                    <Text
                      style={
                        hasPriceBreakdownDetails
                          ? styles.priceToggleActionText
                          : styles.priceToggleActionTextDisabled
                      }
                    >
                      {hasPriceBreakdownDetails
                        ? isPriceBreakdownExpanded
                          ? 'Hide details'
                          : 'Show details'
                        : 'No additional details'}
                    </Text>
                    {hasPriceBreakdownDetails ? (
                      isPriceBreakdownExpanded ? (
                        <ChevronUp
                          color={palette.mintDeep}
                          size={15}
                          strokeWidth={2.4}
                        />
                      ) : (
                        <ChevronDown
                          color={palette.mintDeep}
                          size={15}
                          strokeWidth={2.4}
                        />
                      )
                    ) : null}
                  </Pressable>
                </View>
                {visiblePriceRows.map((row, index) => (
                  <DetailRow
                    key={row.key}
                    label={row.label}
                    value={row.value}
                    last={index === visiblePriceRows.length - 1}
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
                      <ChevronRight
                        color={palette.mintDeep}
                        size={14}
                        strokeWidth={2.2}
                      />
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
                <Text style={styles.secondaryActionText}>
                  {data.reservePaymentLabel}
                </Text>
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
              selectedReview ? (
                <CustomerBookingReviewPanel
                  selectedReview={selectedReview}
                  rating={rating}
                  reviewText={reviewText}
                  busyAction={busyAction}
                  onRatingChange={onRatingChange}
                  onReviewTextChange={onReviewTextChange}
                  onSubmitReview={onSubmitReview}
                />
              ) : (
                <CustomerSection title="Your review">
                  <Pressable
                    style={styles.reviewActionCard}
                    onPress={onOpenReview}
                    accessibilityRole="button"
                    accessibilityLabel="Open review flow"
                  >
                    <Text style={styles.reviewActionTitle}>Rate this booking</Text>
                    <Text style={styles.reviewActionMeta}>
                      Share your feedback to help improve service quality.
                    </Text>
                    <Text style={styles.reviewActionLink}>
                      {data.reviewActionLabel}
                    </Text>
                  </Pressable>
                </CustomerSection>
              )
            ) : null}
          </>
        ) : (
          timelineTabContent
        )}
      </CustomerContent>

      <CustomerBookingReviewSheet
        providerName={data.providerName}
        visible={isReviewSheetVisible}
        selectedReview={selectedReview}
        rating={rating}
        reviewText={reviewText}
        busyAction={busyAction}
        onClose={onCloseReview}
        onRatingChange={onRatingChange}
        onReviewTextChange={onReviewTextChange}
        onSubmitReview={onSubmitReview}
      />
    </CustomerScreen>
  );
}

function BookingTimelinePinRow({
  entry,
  isLast,
}: {
  entry: PinTimelineEntry;
  isLast: boolean;
}) {
  return (
    <View
      style={styles.timelineRow}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${entry.resolvedLabel}, ${pinStateLabel[entry.state]} event, ${entry.resolvedTime}`}
    >
      <View style={styles.timelineMarkerColumn}>
        <View
          style={[
            styles.timelinePin,
            entry.state === 'completed' && styles.timelinePinCompleted,
            entry.state === 'current' && styles.timelinePinCurrent,
            entry.state === 'upcoming' && styles.timelinePinUpcoming,
          ]}
        >
          {entry.state === 'current' ? <View style={styles.timelinePinCore} /> : null}
        </View>
        {!isLast ? <View style={styles.timelineConnector} /> : null}
      </View>

      <View style={styles.timelineContent}>
        <Text style={styles.timelineTitle}>{entry.resolvedLabel}</Text>
        <Text style={styles.timelineMeta}>{entry.resolvedTime}</Text>
        {entry.state === 'current' ? (
          <Text style={styles.timelineStatusText}>Tracking progress</Text>
        ) : null}
      </View>
    </View>
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

function buildPinTimelineEvents(
  events: BookingTimelineEventSummary[],
  bookingStatus: BookingStatus,
): PinTimelineEntry[] {
  const timelineRank = timelineStatusRanks[bookingStatus];
  const eventRanks = events.map((event) => getTimelineEventRank(event));

  let pivotIndex = -1;
  for (let index = 0; index < events.length; index += 1) {
    const eventRank = eventRanks[index];

    if (eventRank !== null && eventRank <= timelineRank) {
      pivotIndex = index;
    }
  }

  if (pivotIndex < 0 && events.length > 0) {
    pivotIndex = 0;
  }

  return events.map((event, index) => {
    const eventRank = eventRanks[index];
    const state: TimelinePinState =
      eventRank !== null
        ? eventRank < timelineRank
          ? 'completed'
          : eventRank === timelineRank
            ? 'current'
            : 'upcoming'
        : index < pivotIndex
          ? 'completed'
          : index === pivotIndex
            ? 'current'
            : 'upcoming';

    return {
      ...event,
      state,
      resolvedLabel: timelineEventLabel(event),
      resolvedTime: formatDateTime(event.createdAt),
    };
  });
}

function getTimelineEventRank(event: BookingTimelineEventSummary): number | null {
  const status = inferTimelineStatus(event);

  if (status === null) {
    return null;
  }

  return timelineStatusRanks[status];
}

function inferTimelineStatus(event: BookingTimelineEventSummary): BookingStatus | null {
  const label = event.label ? event.label.trim().toLowerCase() : '';
  const eventType = event.eventType ? event.eventType.trim().toLowerCase() : '';

  const statusMatch = label.match(/booking status changed to ([a-z_]+)/i);
  if (statusMatch) {
    const rawStatus = statusMatch[1]?.toLowerCase() ?? '';
    if (isBookingStatus(rawStatus)) {
      return rawStatus;
    }
  }

  if (
    eventType === 'created' ||
    label === 'booking requested' ||
    label === 'booking created'
  ) {
    return 'pending';
  }

  if (eventType === 'confirmed') {
    return 'confirmed';
  }

  if (eventType === 'provider_started' || eventType === 'provider-started') {
    return 'in_progress';
  }

  if (eventType === 'completed') {
    return 'completed';
  }

  if (eventType === 'cancelled' || eventType === 'rejected' || label.includes('cancel')) {
    return 'cancelled';
  }

  if (eventType === 'rejected' || label.includes('rejected')) {
    return 'rejected';
  }

  return null;
}

function isBookingStatus(value: string): value is BookingStatus {
  return (
    value === 'pending' ||
    value === 'confirmed' ||
    value === 'in_progress' ||
    value === 'completed' ||
    value === 'cancelled' ||
    value === 'rejected'
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
  statusSummaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusSummaryLabel: {
    ...customerText.meta,
  },
  tabContainer: {
    marginBottom: spacing.xs,
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
  sectionTitle: {
    ...customerText.title,
    fontSize: 14,
    lineHeight: 18,
  },
  priceBreakdownHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  priceToggleButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  priceToggleActionText: {
    color: palette.mintDeep,
    fontSize: 12,
    fontWeight: '600',
  },
  priceToggleActionTextDisabled: {
    color: '#7A828D',
    fontSize: 12,
    fontWeight: '600',
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
  reviewActionCard: {
    alignItems: 'stretch',
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  reviewActionLink: {
    color: palette.mintDeep,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
  },
  reviewActionMeta: {
    ...customerText.meta,
  },
  reviewActionTitle: {
    color: '#202733',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0,
  },
  actionDisabled: {
    opacity: 0.55,
  },
  emptyMetaText: {
    ...customerText.meta,
    textAlign: 'center',
  },
  timelineRow: {
    alignItems: 'stretch',
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  timelineMarkerColumn: {
    alignItems: 'center',
    paddingTop: 2,
    width: 20,
  },
  timelinePin: {
    alignItems: 'center',
    borderRadius: 999,
    height: 16,
    justifyContent: 'center',
    width: 16,
  },
  timelinePinCompleted: {
    backgroundColor: palette.mintDeep,
    borderColor: palette.mintDeep,
    borderWidth: 1.5,
  },
  timelinePinCurrent: {
    backgroundColor: palette.white,
    borderColor: palette.mintDeep,
    borderWidth: 2,
  },
  timelinePinUpcoming: {
    backgroundColor: '#F3F5F7',
    borderColor: '#D9DEE3',
    borderWidth: 1.5,
  },
  timelinePinCore: {
    backgroundColor: palette.mintDeep,
    borderRadius: 999,
    height: 6,
    width: 6,
  },
  timelineConnector: {
    backgroundColor: '#D9DEE3',
    flex: 1,
    marginTop: 4,
    width: 1,
  },
  timelineContent: {
    flex: 1,
    gap: 3,
    minWidth: 0,
    paddingBottom: spacing.sm,
  },
  timelineTitle: {
    ...customerText.title,
    fontSize: 14,
    lineHeight: 19,
  },
  timelineMeta: {
    ...customerText.meta,
    fontSize: 11,
    letterSpacing: 0,
  },
  timelineStatusText: {
    color: palette.mintDeep,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0,
  },
});
