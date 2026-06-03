import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MessageCircle, Phone, User } from 'lucide-react-native';
import { InfoRow } from '../../../components/AppDisplay';
import { StatusTimeline } from '../../../components/DesignKit';
import {
  ProviderBadge,
  ProviderButton,
  ProviderCard,
  ProviderContent,
  ProviderHeader,
  ProviderScreen,
  providerText,
} from '../../../shared/components/ProviderUI';
import { BookingSummary, PaymentSummary } from '../../../shared/models/types';
import { palette, spacing } from '../../../theme/serveaseDesign';
import {
  ProviderBookingDetailAction,
  useProviderBookingDetailViewModel,
} from '../viewModels/useProviderBookingDetailViewModel';

type ProviderBookingDetailScreenProps = {
  booking: BookingSummary;
  bookingMedia: ReactNode;
  busyAction: string | null;
  hasBlockingActiveBooking?: boolean;
  selectedPayment: PaymentSummary | null;
  serviceUpdates: ReactNode;
  timelineEvents: ReactNode;
  onBack: () => void;
  onCallCustomer: () => Promise<void>;
  onMessage: () => Promise<unknown>;
  onStatusAction: (action: ProviderBookingDetailAction) => void;
};

export function ProviderBookingDetailScreen({
  booking,
  bookingMedia,
  busyAction,
  hasBlockingActiveBooking = false,
  selectedPayment,
  serviceUpdates,
  timelineEvents,
  onBack,
  onCallCustomer,
  onMessage,
  onStatusAction,
}: ProviderBookingDetailScreenProps) {
  const bookingDetail = useProviderBookingDetailViewModel({
    booking,
    busyAction,
    hasBlockingActiveBooking,
    selectedPayment,
  });
  const { data } = bookingDetail;

  return (
    <ProviderScreen>
      <ProviderContent>
        <ProviderHeader
          title="Booking Details"
          subtitle={data.addressLabel}
          onBack={onBack}
        />
        <ProviderCard>
          <View style={styles.bookingCardHeader}>
            <View style={styles.flex}>
              <Text style={styles.bookingReference}>
                {data.bookingReference}
              </Text>
              <Text style={styles.detailTitle}>{data.serviceTitle}</Text>
            </View>
            <ProviderBadge {...data.statusChip} />
          </View>
          <StatusTimeline steps={data.timelineSteps} />
        </ProviderCard>
        {timelineEvents}

        <ProviderCard>
          <View style={styles.providerSummaryRow}>
            <View style={styles.customerAvatar}>
              <User color={palette.mintDeep} size={24} strokeWidth={2.5} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.cardTitle}>Customer</Text>
              <Text style={styles.cardMeta}>{data.customerName}</Text>
            </View>
            <Pressable
              style={styles.circleButton}
              onPress={() => void onCallCustomer()}
              accessibilityRole="button"
              accessibilityLabel="Call customer"
            >
              <Phone color={palette.mintDeep} size={18} strokeWidth={2.5} />
            </Pressable>
            <Pressable
              style={styles.circleButton}
              onPress={() => void onMessage()}
              accessibilityRole="button"
              accessibilityLabel="Message customer"
            >
              <MessageCircle
                color={palette.mintDeep}
                size={18}
                strokeWidth={2.5}
              />
            </Pressable>
          </View>
        </ProviderCard>

        <ProviderCard>
          <Text style={styles.cardTitle}>Service Details</Text>
          {data.serviceDetailRows.map((row) => (
            <InfoRow key={row.key} label={row.label} value={row.value} />
          ))}
          <View style={styles.breakdownBlock}>
            <Text style={styles.cardTitle}>Price breakdown</Text>
            {data.priceBreakdownRows.map((row) => (
              <InfoRow key={row.key} label={row.label} value={row.value} />
            ))}
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Estimated earnings</Text>
            <Text style={styles.totalValue}>{data.estimatedEarningsLabel}</Text>
          </View>
        </ProviderCard>

        {bookingMedia}
        {serviceUpdates}

        {data.statusActions.length ? (
          <View style={styles.actions}>
            {data.statusActions.map((action) => (
              <ProviderButton
                key={action.key}
                label={action.label}
                variant={action.variant}
                onPress={() => onStatusAction(action.action)}
                disabled={action.disabled}
              />
            ))}
          </View>
        ) : null}

        <ProviderButton
          label="Message Customer"
          variant="secondary"
          onPress={() => void onMessage()}
        />
      </ProviderContent>
    </ProviderScreen>
  );
}

const styles = StyleSheet.create({
  bookingCardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  providerSummaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  customerAvatar: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderColor: '#A7E5C2',
    borderWidth: 1,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  actions: {
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  circleButton: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  bookingReference: {
    color: palette.mintDeep,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0,
  },
  detailTitle: {
    color: '#202733',
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 28,
    marginTop: spacing.xs,
  },
  cardTitle: {
    ...providerText.title,
    fontSize: 15,
    lineHeight: 20,
  },
  cardMeta: {
    ...providerText.meta,
  },
  breakdownBlock: {
    borderTopColor: palette.lineSoft,
    borderTopWidth: 1,
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  totalRow: {
    alignItems: 'center',
    borderTopColor: palette.lineSoft,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  totalLabel: {
    color: '#6D7480',
    fontSize: 13,
    fontWeight: '500',
  },
  totalValue: {
    color: palette.mintDeep,
    fontSize: 18,
    fontWeight: '600',
  },
});
