import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CreditCard } from 'lucide-react-native';
import {
  Card,
  Field,
  PrimaryButton,
  Section,
  TopBar,
} from '../../../components/DesignKit';
import { InfoRow } from '../../../components/AppDisplay';
import {
  CustomerPaymentMethodSummary,
  CustomerPaymentMethodType,
  PaymentSummary,
  PromotionValidationSummary,
} from '../../../shared/models/types';
import { StickyFooter } from '../../../shared/components/ScreenLayout';
import { palette, radius, spacing, type } from '../../../theme/serveaseDesign';
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
          <View style={styles.noticeBox}>
            <Text style={styles.cardBody}>
              {data.statusNotice}
            </Text>
          </View>
          <Section title="Checkout method">
            {data.hasPaymentMethods ? (
              data.paymentMethods.map((item) => (
                <Pressable
                  key={item.method.id}
                  style={[
                    styles.paymentMethodOption,
                    item.selected && styles.paymentMethodSelected,
                  ]}
                  onPress={() => onSelectPaymentMethod(item.method.id)}
                  accessibilityRole="button"
                >
                  <View
                    style={[
                      styles.radioOuter,
                      item.selected && styles.radioOuterSelected,
                    ]}
                  >
                    {item.selected ? <View style={styles.radioInner} /> : null}
                  </View>
                  <CreditCard
                    color={item.selected ? palette.mint : palette.muted}
                    size={22}
                  />
                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>{item.label}</Text>
                    <Text style={styles.cardMeta}>{item.meta}</Text>
                  </View>
                </Pressable>
              ))
            ) : (
              <ActivityIndicator color={palette.mint} />
            )}
            <PrimaryButton
              label="Use Card"
              variant="secondary"
              onPress={() => void onSavePaymentMethod('card')}
            />
          </Section>
          <Card>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.cardTitle}>Wallet checkout</Text>
                <Text style={styles.cardMeta}>
                  GCash and Maya details are entered in APICenter
                </Text>
              </View>
              <View style={styles.inlineActions}>
                <Pressable
                  style={styles.smallAction}
                  onPress={() => void onSavePaymentMethod('gcash')}
                >
                  <Text style={styles.smallActionText}>GCash</Text>
                </Pressable>
                <Pressable
                  style={styles.smallAction}
                  onPress={() => void onSavePaymentMethod('paymaya')}
                >
                  <Text style={styles.smallActionText}>Maya</Text>
                </Pressable>
              </View>
            </View>
          </Card>
          <Card>
            <Text style={styles.cardTitle}>Promo code</Text>
            <Field
              label="Code"
              value={data.normalizedPromoCode}
              onChangeText={onPromoCodeChange}
              placeholder="SERVEASE10"
            />
            <PrimaryButton
              label={data.applyPromoLabel}
              variant="secondary"
              onPress={() => void onApplyPromotionCode()}
              disabled={data.applyPromoDisabled}
            />
            {data.promoResult ? (
              <View
                style={
                  data.promoResult.tone === 'success'
                    ? styles.promoAppliedBox
                    : styles.promoRejectedBox
                }
              >
                <Text style={styles.cardTitle}>{data.promoResult.title}</Text>
                <Text style={styles.cardMeta}>{data.promoResult.message}</Text>
                {data.promoResult.rows.map((row) => (
                  <InfoRow key={row.key} label={row.label} value={row.value} />
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
  noticeBox: {
    backgroundColor: palette.mintSoft,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  cardBody: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  paymentMethodOption: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.lineSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.base,
  },
  paymentMethodSelected: {
    backgroundColor: palette.mintSoft,
    borderColor: palette.mint,
  },
  radioOuter: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.mint,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  radioOuterSelected: {
    borderColor: palette.mint,
  },
  radioInner: {
    backgroundColor: palette.mint,
    borderRadius: radius.pill,
    height: 10,
    width: 10,
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  inlineActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  smallAction: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.xxs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  smallActionText: {
    color: palette.mint,
    fontSize: 12,
    fontWeight: '900',
  },
  promoAppliedBox: {
    backgroundColor: palette.mintSoft,
    borderRadius: radius.lg,
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  promoRejectedBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: radius.lg,
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  flex: {
    flex: 1,
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
});
