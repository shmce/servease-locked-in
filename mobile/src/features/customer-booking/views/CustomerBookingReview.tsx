import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChevronRight, CreditCard, Wallet } from 'lucide-react-native';
import {
  Card,
  PrimaryButton,
  Section,
  TopBar,
} from '../../../components/DesignKit';
import { palette, radius, spacing, type } from '../../../theme/serveaseDesign';
import {
  CatalogServiceItem,
  CustomerPaymentMethodSummary,
  CustomerPaymentMethodType,
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
  customerPaymentMethods: CustomerPaymentMethodSummary[];
  selectedPaymentMethodId: string | null;
  busyAction: string | null;
  onBack: () => void;
  onViewProvider: () => void;
  onSelectPaymentMethod: (methodId: string) => void;
  onSavePaymentMethod: (methodType: CustomerPaymentMethodType) => Promise<void>;
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
  customerPaymentMethods,
  selectedPaymentMethodId,
  busyAction,
  onBack,
  onViewProvider,
  onSelectPaymentMethod,
  onSavePaymentMethod,
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
    customerPaymentMethods,
    selectedPaymentMethodId,
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>

          {/* Provider card */}
          <Card>
            <View style={styles.providerRow}>
              <View style={styles.providerAvatar}>
                <Text style={styles.providerInitial}>{data.providerInitial}</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.providerName}>{data.providerName}</Text>
                <Text style={styles.providerRating}>{data.providerRatingLabel}</Text>
                <Pressable
                  style={styles.profileLink}
                  onPress={onViewProvider}
                  accessibilityRole="button"
                  accessibilityLabel="View provider profile"
                >
                  <Text style={styles.linkText}>View Profile</Text>
                  <ChevronRight color={palette.mint} size={15} strokeWidth={2.2} />
                </Pressable>
              </View>
            </View>
          </Card>

          {/* Service details */}
          <Section title="Service details">
            <Card>
              {data.serviceRows.map((row, i) => (
                <ReviewRow
                  key={row.label}
                  label={row.label}
                  value={row.value}
                  last={i === data.serviceRows.length - 1}
                />
              ))}
            </Card>
          </Section>

          {/* Special instructions */}
          <Section title="Special instructions">
            <Card>
              <Text style={styles.notesLabel}>Your notes</Text>
              <Text style={styles.notesValue}>{data.notesLabel}</Text>
            </Card>
          </Section>

          <Section title="Payment method">
            <Card>
              {data.paymentMethodRows.map((item, i) => (
                <Pressable
                  key={item.method.id}
                  style={[
                    styles.paymentMethodRow,
                    i < data.paymentMethodRows.length - 1 && styles.paymentMethodBorder,
                    item.selected && styles.paymentMethodSelected,
                  ]}
                  onPress={() => onSelectPaymentMethod(item.method.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Use ${item.label}`}
                  accessibilityState={{ selected: item.selected }}
                >
                  <View style={[styles.radio, item.selected && styles.radioSelected]}>
                    {item.selected ? <View style={styles.radioDot} /> : null}
                  </View>
                  {item.method.methodType === 'cash_on_service' ? (
                    <Wallet
                      color={item.selected ? palette.mint : palette.muted}
                      size={20}
                      strokeWidth={2.2}
                    />
                  ) : (
                    <CreditCard
                      color={item.selected ? palette.mint : palette.muted}
                      size={20}
                      strokeWidth={2.2}
                    />
                  )}
                  <View style={styles.flex}>
                    <Text style={styles.paymentMethodTitle}>{item.label}</Text>
                    <Text style={styles.paymentMethodMeta}>{item.meta}</Text>
                  </View>
                </Pressable>
              ))}
              <View style={styles.quickMethodRow}>
                <Pressable
                  style={styles.quickMethodButton}
                  onPress={() => void onSavePaymentMethod('gcash')}
                  accessibilityRole="button"
                >
                  <Text style={styles.quickMethodText}>GCash</Text>
                </Pressable>
                <Pressable
                  style={styles.quickMethodButton}
                  onPress={() => void onSavePaymentMethod('paymaya')}
                  accessibilityRole="button"
                >
                  <Text style={styles.quickMethodText}>Maya</Text>
                </Pressable>
                <Pressable
                  style={styles.quickMethodButton}
                  onPress={() => void onSavePaymentMethod('card')}
                  accessibilityRole="button"
                >
                  <Text style={styles.quickMethodText}>Card</Text>
                </Pressable>
              </View>
              <Text style={styles.paymentNotice}>{data.paymentNotice}</Text>
            </Card>
          </Section>

          {/* Price breakdown */}
          <Section title="Price breakdown">
            <Card>
              {data.priceBreakdownRows.map((row) => (
                <ReviewRow
                  key={row.key}
                  label={row.label}
                  value={row.value}
                  last={false}
                />
              ))}
              <ReviewRow
                label="Promo code"
                value={data.promoCodeLabel}
                last={false}
              />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>{data.totalLabel}</Text>
                <Text style={styles.totalValue}>{data.displayedTotalLabel}</Text>
              </View>
            </Card>
          </Section>

          {/* Notice */}
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

function ReviewRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last: boolean;
}) {
  return (
    <View style={[styles.reviewRow, !last && styles.reviewRowBorder]}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue} numberOfLines={3}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    backgroundColor: palette.cream,
    flexGrow: 1,
    paddingBottom: 200,
  },
  content: {
    gap: spacing.md,
    padding: spacing.md,
  },
  flex: {
    flex: 1,
  },

  // Provider card
  providerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  providerAvatar: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.lg,
    height: 52,
    justifyContent: 'center',
    width: 52,
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
  profileLink: {
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

  // Payment methods
  paymentMethodRow: {
    alignItems: 'center',
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 54,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
  },
  paymentMethodBorder: {
    borderBottomColor: palette.lineSoft,
    borderBottomWidth: 1,
  },
  paymentMethodSelected: {
    backgroundColor: palette.mintSoft,
  },
  radio: {
    alignItems: 'center',
    borderColor: palette.line,
    borderRadius: 9,
    borderWidth: 2,
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  radioSelected: {
    borderColor: palette.mint,
  },
  radioDot: {
    backgroundColor: palette.mint,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  paymentMethodTitle: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  paymentMethodMeta: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  quickMethodRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  quickMethodButton: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: radius.pill,
    borderWidth: 1,
    flex: 1,
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  quickMethodText: {
    color: palette.mint,
    fontSize: 12,
    fontWeight: '800',
  },
  paymentNotice: {
    ...type.caption,
    color: palette.muted,
  },

  // Review rows
  reviewRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  reviewRowBorder: {
    borderBottomColor: palette.line,
    borderBottomWidth: 1,
  },
  reviewLabel: {
    color: palette.muted,
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    paddingTop: 1,
  },
  reviewValue: {
    color: palette.ink,
    flex: 1.6,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },

  // Notes
  notesLabel: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: '500',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  notesValue: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
  },

  // Total
  totalRow: {
    alignItems: 'center',
    borderTopColor: palette.line,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    marginTop: spacing.xs,
  },
  totalLabel: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  totalValue: {
    color: palette.mint,
    fontSize: 22,
    fontWeight: '700',
  },

  // Notice
  noticeBox: {
    backgroundColor: palette.mintSoft,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  noticeText: {
    ...type.caption,
    color: palette.muted,
    textAlign: 'center',
  },

  // Footer
  footerLink: {
    ...type.caption,
    color: palette.mint,
    fontWeight: '700',
    textAlign: 'center',
  },
});
