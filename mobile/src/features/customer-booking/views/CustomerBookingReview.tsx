import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import {
  Card,
  PrimaryButton,
  Section,
  TopBar,
} from '../../../components/DesignKit';
import { InfoRow } from '../../../components/AppDisplay';
import { palette, radius, spacing, type } from '../../../theme/serveaseDesign';
import {
  CatalogServiceItem,
  PricingQuoteSummary,
  PromotionValidationSummary,
  ProviderListing,
} from '../../../shared/models/types';
import { StickyFooter } from '../../../shared/components/ScreenLayout';
import { useCustomerBookingReviewViewModel } from '../viewModels/useCustomerBookingReviewViewModel';

type CustomerBookingReviewScreenProps = {
  provider: ProviderListing;
  selectedService: CatalogServiceItem | null;
  hoursRequired: string;
  scheduledAt: string;
  address: string;
  notes: string;
  bookingReferencePhotoUrl: string | null;
  pricingQuote: PricingQuoteSummary | null;
  promotionValidation: PromotionValidationSummary | null;
  promoCode: string;
  busyAction: string | null;
  onBack: () => void;
  onViewProvider: () => void;
  onConfirm: () => void;
  onPreviewEstimate: () => void;
  onEditBooking: () => void;
};

export function CustomerBookingReviewScreen({
  provider,
  selectedService,
  hoursRequired,
  scheduledAt,
  address,
  notes,
  bookingReferencePhotoUrl,
  pricingQuote,
  promotionValidation,
  promoCode,
  busyAction,
  onBack,
  onViewProvider,
  onConfirm,
  onPreviewEstimate,
  onEditBooking,
}: CustomerBookingReviewScreenProps) {
  const bookingReview = useCustomerBookingReviewViewModel({
    provider,
    selectedService,
    hoursRequired,
    scheduledAt,
    address,
    notes,
    bookingReferencePhotoUrl,
    pricingQuote,
    promotionValidation,
    promoCode,
    busyAction,
  });
  const { data } = bookingReview;

  return (
    <>
      <TopBar
        title="Review booking"
        subtitle="Step 2 of 2 - Confirm and send"
        onBack={onBack}
      />
      <ScrollView contentContainerStyle={styles.withStickyFooter}>
        <View style={styles.content}>
          <Card>
            <View style={styles.providerSummaryRow}>
              <View style={styles.providerPhoto}>
                <Text style={styles.providerPhotoText}>{data.providerInitial}</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>{data.providerName}</Text>
                <Text style={styles.cardMeta}>{data.providerRatingLabel}</Text>
                <Pressable
                  style={styles.profileLinkRow}
                  onPress={onViewProvider}
                  accessibilityRole="button"
                  accessibilityLabel="View provider profile"
                >
                  <Text style={styles.linkText}>View Profile</Text>
                  <ChevronRight color={palette.mint} size={18} />
                </Pressable>
              </View>
            </View>
          </Card>

          <Section title="Service details">
            {data.serviceRows.map((row) => (
              <InfoRow key={row.label} label={row.label} value={row.value} />
            ))}
          </Section>

          <Section title="Special instructions">
            <InfoRow label="Your notes" value={data.notesLabel} />
          </Section>

          <Section title="Price breakdown">
            {data.priceBreakdownRows.map((row) => (
              <InfoRow key={row.key} label={row.label} value={row.value} />
            ))}
            <InfoRow label="Promo code" value={data.promoCodeLabel} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Booking Cost</Text>
              <Text style={styles.totalValue}>{data.displayedTotalLabel}</Text>
            </View>
          </Section>

          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>{data.quoteExplanation}</Text>
          </View>
        </View>
      </ScrollView>
      <StickyFooter>
        <PrimaryButton
          label={data.confirmLabel}
          onPress={onConfirm}
          disabled={data.confirmDisabled}
        />
        <Text style={styles.footerLink} onPress={onPreviewEstimate}>
          {data.estimateLabel}
        </Text>
        <Text style={styles.footerLink} onPress={onEditBooking}>
          Edit booking
        </Text>
      </StickyFooter>
    </>
  );
}

const styles = StyleSheet.create({
  withStickyFooter: {
    backgroundColor: palette.cream,
    flexGrow: 1,
    paddingBottom: 180,
  },
  content: {
    gap: spacing.md,
    padding: spacing.md,
  },
  providerSummaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  providerPhoto: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.lg,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  providerPhotoText: {
    color: palette.mint,
    fontSize: 20,
    fontWeight: '900',
  },
  flex: {
    flex: 1,
  },
  profileLinkRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xxs,
    marginTop: spacing.xs,
  },
  totalRow: {
    alignItems: 'center',
    borderTopColor: palette.lineSoft,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.md,
  },
  noticeBox: {
    backgroundColor: palette.mintSoft,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  footerLink: {
    ...type.caption,
    color: palette.mint,
    fontWeight: '900',
    textAlign: 'center',
  },
  linkText: {
    color: palette.mint,
    fontSize: 13,
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
  noticeText: {
    ...type.caption,
    color: palette.muted,
    textAlign: 'center',
  },
  totalLabel: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  totalValue: {
    color: palette.mint,
    fontSize: 20,
    fontWeight: '900',
  },
});
