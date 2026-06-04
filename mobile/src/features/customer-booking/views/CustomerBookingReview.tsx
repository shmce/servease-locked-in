import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight, CreditCard, Wallet } from 'lucide-react-native';
import {
  CustomerCard,
  CustomerContent,
  CustomerHeader,
  CustomerScreen,
  CustomerSection,
  customerText,
} from '../../../shared/components/CustomerUI';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import {
  CatalogServiceItem,
  CustomerPaymentMethodSummary,
  CustomerPaymentMethodType,
  PricingQuoteSummary,
  PromotionValidationSummary,
  ProviderListing,
} from '../../../shared/models/types';
import { useCustomerBookingReviewViewModel } from '../viewModels/useCustomerBookingReviewViewModel';
import type { CustomerBookingLocationState } from '../../../domain/customerBookingLocation';

type CustomerBookingReviewScreenProps = {
  provider: ProviderListing;
  selectedService: CatalogServiceItem | null;
  hoursRequired: string;
  scheduledAt: string;
  bookingSlotError: string;
  address: string;
  serviceLocation: CustomerBookingLocationState;
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
  bookingSlotError,
  address,
  serviceLocation,
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
    bookingSlotError,
    address,
    serviceLocation,
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
      <CustomerScreen bottomInset={208}>
        <CustomerContent>
          <CustomerHeader
            title="Review booking"
            subtitle="Step 2 of 2 - confirm and send"
            onBack={onBack}
          />

          <CustomerCard>
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
                  <ChevronRight color={palette.mintDeep} size={15} strokeWidth={2.2} />
                </Pressable>
              </View>
            </View>
          </CustomerCard>

          <CustomerSection title="Service details">
            <CustomerCard>
              {data.serviceRows.map((row, index) => (
                <ReviewRow
                  key={row.label}
                  label={row.label}
                  value={row.value}
                  last={index === data.serviceRows.length - 1}
                />
              ))}
            </CustomerCard>
          </CustomerSection>

          <CustomerSection title="Special instructions">
            <CustomerCard>
              <Text style={styles.notesLabel}>Your notes</Text>
              <Text style={styles.notesValue}>{data.notesLabel}</Text>
            </CustomerCard>
          </CustomerSection>

          <CustomerSection title="Payment method">
            <CustomerCard>
              {data.paymentMethodRows.map((item, index) => (
                <Pressable
                  key={item.method.id}
                  style={[
                    styles.paymentMethodRow,
                    index < data.paymentMethodRows.length - 1 &&
                      styles.paymentMethodBorder,
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
                      color={item.selected ? palette.mintDeep : palette.muted}
                      size={20}
                      strokeWidth={2.2}
                    />
                  ) : (
                    <CreditCard
                      color={item.selected ? palette.mintDeep : palette.muted}
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
                <QuickMethodButton label="GCash" onPress={() => onSavePaymentMethod('gcash')} />
                <QuickMethodButton label="Maya" onPress={() => onSavePaymentMethod('paymaya')} />
                <QuickMethodButton label="Card" onPress={() => onSavePaymentMethod('card')} />
              </View>
              <Text style={styles.paymentNotice}>{data.paymentNotice}</Text>
            </CustomerCard>
          </CustomerSection>

          <CustomerSection title="Price breakdown">
            <CustomerCard>
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
            </CustomerCard>
          </CustomerSection>

          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>{data.quoteExplanation}</Text>
          </View>
        </CustomerContent>
      </CustomerScreen>

      <View style={styles.stickyFooter}>
        <Pressable
          style={[styles.footerButton, data.confirmDisabled && styles.footerButtonDisabled]}
          onPress={onConfirm}
          disabled={data.confirmDisabled}
          accessibilityRole="button"
        >
          <Text style={styles.footerButtonText}>{data.confirmLabel}</Text>
        </Pressable>
        <Text style={styles.footerLink} onPress={onPreviewEstimate}>
          {data.estimateLabel}
        </Text>
        <Text style={styles.footerLink} onPress={onEditBooking}>
          Edit booking
        </Text>
      </View>
    </>
  );
}

function QuickMethodButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => Promise<void>;
}) {
  return (
    <Pressable
      style={styles.quickMethodButton}
      onPress={() => void onPress()}
      accessibilityRole="button"
    >
      <Text style={styles.quickMethodText}>{label}</Text>
    </Pressable>
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
      <Text style={styles.reviewValue} numberOfLines={3}>
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
  providerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  providerAvatar: {
    alignItems: 'center',
    backgroundColor: '#F1FAF5',
    borderRadius: 10,
    height: 52,
    justifyContent: 'center',
    width: 52,
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
  profileLink: {
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
  paymentMethodRow: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 54,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
  },
  paymentMethodBorder: {
    borderBottomColor: '#EEF0F2',
    borderBottomWidth: 1,
  },
  paymentMethodSelected: {
    backgroundColor: '#F1FAF5',
  },
  radio: {
    alignItems: 'center',
    borderColor: '#D8DEE5',
    borderRadius: 9,
    borderWidth: 2,
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  radioSelected: {
    borderColor: palette.mintDeep,
  },
  radioDot: {
    backgroundColor: palette.mintDeep,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  paymentMethodTitle: {
    ...customerText.title,
    fontSize: 13,
    lineHeight: 18,
  },
  paymentMethodMeta: {
    ...customerText.meta,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  quickMethodRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  quickMethodButton: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: '#EEF0F2',
    borderRadius: radius.pill,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: spacing.sm,
  },
  quickMethodText: {
    color: palette.mintDeep,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0,
  },
  paymentNotice: {
    ...customerText.meta,
  },
  reviewRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  reviewRowBorder: {
    borderBottomColor: '#EEF0F2',
    borderBottomWidth: 1,
  },
  reviewLabel: {
    ...customerText.meta,
    flex: 1,
    paddingTop: 1,
  },
  reviewValue: {
    color: '#202733',
    flex: 1.6,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 18,
    textAlign: 'right',
  },
  notesLabel: {
    ...customerText.meta,
    fontSize: 11,
    lineHeight: 15,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  notesValue: {
    ...customerText.body,
  },
  totalRow: {
    alignItems: 'center',
    borderTopColor: '#EEF0F2',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    paddingTop: spacing.md,
  },
  totalLabel: {
    color: '#202733',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0,
  },
  totalValue: {
    color: palette.mintDeep,
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 0,
  },
  noticeBox: {
    backgroundColor: '#F1FAF5',
    borderRadius: 10,
    padding: spacing.md,
  },
  noticeText: {
    ...customerText.meta,
    textAlign: 'center',
  },
  stickyFooter: {
    backgroundColor: palette.white,
    borderTopColor: '#EEF0F2',
    borderTopWidth: 1,
    bottom: 0,
    gap: spacing.sm,
    left: 0,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    position: 'absolute',
    right: 0,
  },
  footerButton: {
    alignItems: 'center',
    backgroundColor: palette.mintDeep,
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: 48,
  },
  footerButtonDisabled: {
    backgroundColor: palette.line,
  },
  footerButtonText: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0,
  },
  footerLink: {
    ...customerText.meta,
    color: palette.mintDeep,
    fontWeight: '600',
    textAlign: 'center',
  },
});
