import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight, CreditCard, Plus, Wallet } from 'lucide-react-native';
import {
  Field,
  SkeletonBlock,
  SkeletonLine,
} from '../../../components/DesignKit';
import {
  CustomerCard,
  CustomerContent,
  CustomerHeader,
  CustomerScreen,
  CustomerSection,
  customerText,
} from '../../../shared/components/CustomerUI';
import {
  CustomerPaymentMethodSummary,
  CustomerPaymentMethodType,
  PaymentSummary,
  PromotionValidationSummary,
} from '../../../shared/models/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { useCustomerReservePaymentViewModel } from '../viewModels/useCustomerReservePaymentViewModel';

type CustomerReservePaymentScreenProps = {
  customerPaymentMethods: CustomerPaymentMethodSummary[];
  selectedMethodId: string | null;
  selectedPayment: PaymentSummary | null;
  promotionValidation: PromotionValidationSummary | null;
  promoCode: string;
  busyAction: string | null;
  isLoading?: boolean;
  onBack: () => void;
  onSelectPaymentMethod: (methodId: string) => void;
  onSavePaymentMethod: (methodType: CustomerPaymentMethodType) => Promise<void>;
  onPromoCodeChange: (value: string) => void;
  onApplyPromotionCode: () => Promise<unknown>;
  onCheckPaymentStatus: () => Promise<void>;
  onReservePayment: () => Promise<void>;
};

export function CustomerReservePaymentScreen({
  customerPaymentMethods,
  selectedMethodId,
  selectedPayment,
  promotionValidation,
  promoCode,
  busyAction,
  isLoading = false,
  onBack,
  onSelectPaymentMethod,
  onSavePaymentMethod,
  onPromoCodeChange,
  onApplyPromotionCode,
  onCheckPaymentStatus,
  onReservePayment,
}: CustomerReservePaymentScreenProps) {
  const reservePayment = useCustomerReservePaymentViewModel({
    customerPaymentMethods,
    selectedMethodId,
    selectedPayment,
    promotionValidation,
    promoCode,
    busyAction,
    isLoading,
  });
  const { data } = reservePayment;
  const showPaymentSkeletons =
    reservePayment.isLoading && customerPaymentMethods.length === 0;

  function handleConfirm() {
    if (
      selectedPayment?.status === 'pending' &&
      selectedPayment.paymentMethod !== 'cash_on_service'
    ) {
      void onCheckPaymentStatus();
      return;
    }

    void onReservePayment();
  }

  return (
    <>
      <CustomerScreen bottomInset={148}>
        <CustomerContent>
          <CustomerHeader
            title="Payment"
            subtitle="Reserve your booking securely"
            onBack={onBack}
          />

          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>{data.statusNotice}</Text>
          </View>

          <CustomerSection title="Saved payment methods">
            <CustomerCard>
              {showPaymentSkeletons ? (
                <View style={styles.methodSkeletonList}>
                  {Array.from({ length: 2 }).map((_, index) => (
                    <ReservePaymentMethodSkeleton
                      key={`reserve-payment-method-skeleton-${index}`}
                    />
                  ))}
                </View>
              ) : data.hasPaymentMethods ? (
                data.paymentMethods.map((item, index) => (
                  <Pressable
                    key={item.method.id}
                    style={[
                      styles.methodRow,
                      index < data.paymentMethods.length - 1 &&
                        styles.methodRowBorder,
                      item.selected && styles.methodRowSelected,
                    ]}
                    onPress={() => onSelectPaymentMethod(item.method.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: item.selected }}
                  >
                    <View style={[styles.radio, item.selected && styles.radioSelected]}>
                      {item.selected ? <View style={styles.radioDot} /> : null}
                    </View>
                    <CreditCard
                      color={item.selected ? palette.mintDeep : palette.muted}
                      size={20}
                      strokeWidth={2.2}
                    />
                    <View style={styles.flex}>
                      <Text style={styles.methodName}>{item.method.label}</Text>
                      <Text style={styles.methodMeta}>{item.meta}</Text>
                    </View>
                  </Pressable>
                ))
              ) : null}
              <Pressable
                style={styles.addCardRow}
                onPress={() => void onSavePaymentMethod('card')}
                accessibilityRole="button"
              >
                <View style={styles.addCardIcon}>
                  <Plus color={palette.mintDeep} size={16} strokeWidth={2.4} />
                </View>
                <Text style={styles.addCardText}>Add new card</Text>
              </Pressable>
            </CustomerCard>
          </CustomerSection>

          <CustomerSection title="Wallet options">
            <CustomerCard>
              <Text style={styles.sectionMeta}>
                GCash and PayMaya use secure checkout
              </Text>
              <WalletRow
                label="GCash"
                onPress={() => onSavePaymentMethod('gcash')}
                showBorder
              />
              <WalletRow
                label="PayMaya"
                onPress={() => onSavePaymentMethod('paymaya')}
              />
            </CustomerCard>
          </CustomerSection>

          <CustomerSection title="Promo code">
            <CustomerCard>
              <View style={styles.promoRow}>
                <View style={styles.flex}>
                  <Field
                    label="Code"
                    value={data.normalizedPromoCode}
                    onChangeText={onPromoCodeChange}
                    placeholder="SERVEASE10"
                  />
                </View>
                <Pressable
                  style={[
                    styles.applyButton,
                    data.applyPromoDisabled && styles.applyButtonDisabled,
                  ]}
                  onPress={() => void onApplyPromotionCode()}
                  disabled={data.applyPromoDisabled}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.applyButtonText,
                      data.applyPromoDisabled && styles.applyButtonTextDisabled,
                    ]}
                  >
                    {data.applyPromoLabel}
                  </Text>
                </Pressable>
              </View>
              {data.promoResult ? (
                <View
                  style={
                    data.promoResult.tone === 'success'
                      ? styles.promoSuccess
                      : styles.promoDanger
                  }
                >
                  <Text
                    style={[
                      styles.promoTitle,
                      data.promoResult.tone === 'success'
                        ? styles.promoTitleSuccess
                        : styles.promoTitleDanger,
                    ]}
                  >
                    {data.promoResult.title}
                  </Text>
                  <Text style={styles.promoMessage}>{data.promoResult.message}</Text>
                  {data.promoResult.rows.map((row, index) => (
                    <DetailRow
                      key={row.key}
                      label={row.label}
                      value={row.value}
                      last={index === data.promoResult!.rows.length - 1}
                    />
                  ))}
                </View>
              ) : null}
            </CustomerCard>
          </CustomerSection>
        </CustomerContent>
      </CustomerScreen>

      <View style={styles.stickyFooter}>
        <Pressable
          style={[styles.footerButton, data.confirmDisabled && styles.footerButtonDisabled]}
          onPress={handleConfirm}
          disabled={data.confirmDisabled}
          accessibilityRole="button"
        >
          <Text style={styles.footerButtonText}>{data.confirmLabel}</Text>
        </Pressable>
      </View>
    </>
  );
}

function WalletRow({
  label,
  onPress,
  showBorder,
}: {
  label: string;
  onPress: () => Promise<void>;
  showBorder?: boolean;
}) {
  return (
    <Pressable
      style={[styles.walletRow, showBorder && styles.walletRowBorder]}
      onPress={() => void onPress()}
      accessibilityRole="button"
    >
      <Wallet color={palette.mintDeep} size={20} strokeWidth={2.2} />
      <Text style={styles.walletName}>{label}</Text>
      <ChevronRight color={palette.faint} size={18} strokeWidth={2.2} />
    </Pressable>
  );
}

function ReservePaymentMethodSkeleton() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.methodRow}
    >
      <SkeletonBlock width={20} height={20} radius={radius.pill} />
      <SkeletonBlock width={20} height={20} radius={radius.sm} />
      <View style={styles.flex}>
        <SkeletonLine width="42%" height={12} />
        <SkeletonLine width="64%" height={9} style={styles.methodSkeletonMeta} />
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
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    minWidth: 0,
  },
  noticeBox: {
    backgroundColor: '#F1FAF5',
    borderRadius: 10,
    padding: spacing.md,
  },
  noticeText: {
    ...customerText.body,
  },
  sectionMeta: {
    ...customerText.meta,
    marginBottom: spacing.sm,
  },
  methodRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  methodRowBorder: {
    borderBottomColor: '#EEF0F2',
    borderBottomWidth: 1,
  },
  methodRowSelected: {
    backgroundColor: '#F1FAF5',
    borderRadius: 10,
    marginHorizontal: -spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  radio: {
    alignItems: 'center',
    borderColor: '#D8DEE5',
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  radioSelected: {
    borderColor: palette.mintDeep,
  },
  radioDot: {
    backgroundColor: palette.mintDeep,
    borderRadius: radius.pill,
    height: 10,
    width: 10,
  },
  methodName: {
    ...customerText.title,
    fontSize: 13,
    lineHeight: 18,
  },
  methodMeta: {
    ...customerText.meta,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  methodSkeletonList: {
    gap: spacing.xs,
  },
  methodSkeletonMeta: {
    marginTop: 6,
  },
  addCardRow: {
    alignItems: 'center',
    borderTopColor: '#EEF0F2',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
  addCardIcon: {
    alignItems: 'center',
    backgroundColor: '#F1FAF5',
    borderRadius: radius.pill,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  addCardText: {
    color: palette.mintDeep,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0,
  },
  walletRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  walletRowBorder: {
    borderBottomColor: '#EEF0F2',
    borderBottomWidth: 1,
  },
  walletName: {
    ...customerText.title,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  promoRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  applyButton: {
    alignItems: 'center',
    backgroundColor: palette.mintDeep,
    borderRadius: radius.pill,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.base,
  },
  applyButtonDisabled: {
    backgroundColor: palette.line,
  },
  applyButtonText: {
    color: palette.white,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0,
  },
  applyButtonTextDisabled: {
    color: palette.faint,
  },
  promoSuccess: {
    backgroundColor: '#F1FAF5',
    borderRadius: 10,
    gap: spacing.xs,
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  promoDanger: {
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    gap: spacing.xs,
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  promoTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0,
    marginBottom: spacing.xs,
  },
  promoTitleSuccess: {
    color: palette.mintDeep,
  },
  promoTitleDanger: {
    color: palette.red,
  },
  promoMessage: {
    ...customerText.meta,
  },
  detailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  detailRowBorder: {
    borderBottomColor: '#EEF0F2',
    borderBottomWidth: 1,
  },
  detailLabel: {
    ...customerText.meta,
    flex: 1,
  },
  detailValue: {
    color: '#202733',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 18,
    textAlign: 'right',
  },
  stickyFooter: {
    backgroundColor: palette.white,
    borderTopColor: '#EEF0F2',
    borderTopWidth: 1,
    bottom: 0,
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
});
