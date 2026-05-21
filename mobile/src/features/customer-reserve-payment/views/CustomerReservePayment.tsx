import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ChevronRight, CreditCard, Plus, Wallet } from 'lucide-react-native';
import {
  Card,
  Field,
  PrimaryButton,
  TopBar,
} from '../../../components/DesignKit';
import {
  CustomerPaymentMethodSummary,
  CustomerPaymentMethodType,
  PaymentSummary,
  PromotionValidationSummary,
} from '../../../shared/models/types';
import { StickyFooter } from '../../../shared/components/ScreenLayout';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { useCustomerReservePaymentViewModel } from '../viewModels/useCustomerReservePaymentViewModel';

type CustomerReservePaymentScreenProps = {
  customerPaymentMethods: CustomerPaymentMethodSummary[];
  selectedMethodId: string | null;
  selectedPayment: PaymentSummary | null;
  promotionValidation: PromotionValidationSummary | null;
  promoCode: string;
  busyAction: string | null;
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
  });
  const { data } = reservePayment;

  return (
    <>
      <TopBar title="Reserve payment" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.withStickyFooter}>
        <View style={styles.content}>

          {/* Notice */}
          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              {data.statusNotice}
            </Text>
          </View>

          {/* Saved payment methods */}
          <Card>
            <Text style={styles.sectionLabel}>Saved payment methods</Text>
            {data.hasPaymentMethods ? (
              data.paymentMethods.map((item, i) => (
                <Pressable
                  key={item.method.id}
                  style={[
                    styles.methodRow,
                    i < data.paymentMethods.length - 1 && styles.methodRowBorder,
                    item.selected && styles.methodRowSelected,
                  ]}
                  onPress={() => onSelectPaymentMethod(item.method.id)}
                  accessibilityRole="button"
                >
                  <View style={[styles.radio, item.selected && styles.radioSelected]}>
                    {item.selected ? <View style={styles.radioDot} /> : null}
                  </View>
                  <CreditCard
                    color={item.selected ? palette.mint : palette.muted}
                    size={20}
                    strokeWidth={2.2}
                  />
                  <View style={styles.flex}>
                    <Text style={styles.methodName}>{item.method.label}</Text>
                    <Text style={styles.methodMeta}>{item.meta}</Text>
                  </View>
                </Pressable>
              ))
            ) : (
              <ActivityIndicator color={palette.mint} style={styles.loader} />
            )}
            <Pressable
              style={styles.addCardRow}
              onPress={() => void onSavePaymentMethod('card')}
              accessibilityRole="button"
            >
              <View style={styles.addCardIcon}>
                <Plus color={palette.mint} size={16} strokeWidth={2.4} />
              </View>
              <Text style={styles.addCardText}>Add new card</Text>
            </Pressable>
          </Card>

          {/* Wallet options */}
          <Card>
            <Text style={styles.sectionLabel}>Wallet options</Text>
            <Text style={styles.sectionMeta}>GCash and PayMaya use secure checkout</Text>
            <Pressable
              style={[styles.walletRow, styles.walletRowBorder]}
              onPress={() => void onSavePaymentMethod('gcash')}
              accessibilityRole="button"
            >
              <Wallet color={palette.mint} size={20} strokeWidth={2.2} />
              <Text style={styles.walletName}>GCash</Text>
              <ChevronRight color={palette.faint} size={18} strokeWidth={2.2} />
            </Pressable>
            <Pressable
              style={styles.walletRow}
              onPress={() => void onSavePaymentMethod('paymaya')}
              accessibilityRole="button"
            >
              <Wallet color={palette.mint} size={20} strokeWidth={2.2} />
              <Text style={styles.walletName}>PayMaya</Text>
              <ChevronRight color={palette.faint} size={18} strokeWidth={2.2} />
            </Pressable>
          </Card>

          {/* Promo code */}
          <Card>
            <Text style={styles.sectionLabel}>Promo code</Text>
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
                style={[styles.applyButton, data.applyPromoDisabled && styles.applyButtonDisabled]}
                onPress={() => void onApplyPromotionCode()}
                disabled={data.applyPromoDisabled}
                accessibilityRole="button"
              >
                <Text style={[styles.applyButtonText, data.applyPromoDisabled && styles.applyButtonTextDisabled]}>
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
                <Text style={[
                  styles.promoTitle,
                  data.promoResult.tone === 'success' ? styles.promoTitleSuccess : styles.promoTitleDanger,
                ]}>
                  {data.promoResult.title}
                </Text>
                <Text style={styles.promoMessage}>{data.promoResult.message}</Text>
                {data.promoResult.rows.map((row, i) => (
                  <DetailRow
                    key={row.key}
                    label={row.label}
                    value={row.value}
                    last={i === data.promoResult!.rows.length - 1}
                  />
                ))}
              </View>
            ) : null}
          </Card>

        </View>
      </ScrollView>
      <StickyFooter>
        <PrimaryButton
          label={data.confirmLabel}
          onPress={() => {
            if (
              selectedPayment?.status === 'pending' &&
              selectedPayment.paymentMethod !== 'cash_on_service'
            ) {
              void onCheckPaymentStatus();
            } else {
              void onReservePayment();
            }
          }}
          disabled={data.confirmDisabled}
        />
      </StickyFooter>
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
      <Text style={styles.detailValue}>{value}</Text>
    </View>
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
  flex: {
    flex: 1,
  },

  // Notice
  noticeBox: {
    backgroundColor: palette.mintSoft,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  noticeText: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
  },

  // Section labels
  sectionLabel: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  sectionMeta: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: spacing.sm,
    marginTop: -spacing.xs,
  },

  // Payment method rows
  methodRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  methodRowBorder: {
    borderBottomColor: palette.line,
    borderBottomWidth: 1,
  },
  methodRowSelected: {
    backgroundColor: palette.mintSoft,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    marginHorizontal: -spacing.sm,
  },
  radio: {
    alignItems: 'center',
    borderColor: palette.line,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  radioSelected: {
    borderColor: palette.mint,
  },
  radioDot: {
    backgroundColor: palette.mint,
    borderRadius: radius.pill,
    height: 10,
    width: 10,
  },
  methodName: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  methodMeta: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  loader: {
    paddingVertical: spacing.md,
  },

  // Add card row
  addCardRow: {
    alignItems: 'center',
    borderTopColor: palette.line,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
  addCardIcon: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.pill,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  addCardText: {
    color: palette.mint,
    fontSize: 13,
    fontWeight: '700',
  },

  // Wallet rows
  walletRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  walletRowBorder: {
    borderBottomColor: palette.line,
    borderBottomWidth: 1,
    marginBottom: spacing.xs,
    paddingBottom: spacing.sm + spacing.xs,
  },
  walletName: {
    color: palette.ink,
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },

  // Promo row (inline field + button)
  promoRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  applyButton: {
    alignItems: 'center',
    backgroundColor: palette.mint,
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
    fontWeight: '700',
  },
  applyButtonTextDisabled: {
    color: palette.faint,
  },

  // Promo result
  promoSuccess: {
    backgroundColor: palette.mintSoft,
    borderRadius: radius.md,
    gap: spacing.xs,
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  promoDanger: {
    backgroundColor: '#FEF2F2',
    borderRadius: radius.md,
    gap: spacing.xs,
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  promoTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  promoTitleSuccess: {
    color: palette.mintDeep,
  },
  promoTitleDanger: {
    color: palette.red,
  },
  promoMessage: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
  },

  // Detail rows (promo breakdown)
  detailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.xs,
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
  },
  detailValue: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },
});
