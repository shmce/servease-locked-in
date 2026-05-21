import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MessageCircle, Phone, User } from 'lucide-react-native';
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
} from '../../../shared/models/types';
import { palette, spacing, type } from '../../../theme/serveaseDesign';
import {
  ProviderBookingDetailAction,
  useProviderBookingDetailViewModel,
} from '../viewModels/useProviderBookingDetailViewModel';

type ProviderBookingDetailScreenProps = {
  booking: BookingSummary;
  bookingMedia: ReactNode;
  busyAction: string | null;
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
    selectedPayment,
  });
  const { data } = bookingDetail;

  return (
    <>
      <TopBar
        title="Booking Details"
        subtitle={data.addressLabel}
        onBack={onBack}
      />
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.content}>
          <Card>
            <View style={styles.bookingCardHeader}>
              <View style={styles.flex}>
                <Text style={styles.bookingReference}>{data.bookingReference}</Text>
                <Text style={styles.detailTitle}>{data.serviceTitle}</Text>
              </View>
              <Badge {...data.statusChip} />
            </View>
            <StatusTimeline steps={data.timelineSteps} />
          </Card>
          {timelineEvents}

          <Card>
            <View style={styles.providerSummaryRow}>
              <View style={styles.customerAvatar}>
                <User color={palette.white} size={24} strokeWidth={2.5} />
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
                <Phone color={palette.mint} size={18} strokeWidth={2.5} />
              </Pressable>
              <Pressable
                style={styles.circleButton}
                onPress={() => void onMessage()}
                accessibilityRole="button"
                accessibilityLabel="Message customer"
              >
                <MessageCircle color={palette.mint} size={18} strokeWidth={2.5} />
              </Pressable>
            </View>
          </Card>

          <Card>
            <Text style={styles.cardTitle}>Service Details</Text>
            {data.serviceDetailRows.map((row) => (
              <InfoRow key={row.key} label={row.label} value={row.value} />
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Estimated earnings</Text>
              <Text style={styles.totalValue}>{data.estimatedEarningsLabel}</Text>
            </View>
          </Card>

          {bookingMedia}
          {serviceUpdates}

          {data.statusActions.length ? (
            <View style={styles.actions}>
              {data.statusActions.map((action) => (
                <PrimaryButton
                  key={action.key}
                  label={action.label}
                  variant={action.variant}
                  onPress={() => onStatusAction(action.action)}
                  disabled={action.disabled}
                />
              ))}
            </View>
          ) : null}

          <PrimaryButton
            label="Message Customer"
            variant="secondary"
            onPress={() => void onMessage()}
          />
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
    backgroundColor: palette.mint,
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
  cardTitle: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  cardMeta: {
    ...type.caption,
    color: palette.muted,
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
    color: palette.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  totalValue: {
    color: palette.mint,
    fontSize: 18,
    fontWeight: '900',
  },
});
