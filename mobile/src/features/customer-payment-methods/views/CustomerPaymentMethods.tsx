import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Trash2, Wallet } from 'lucide-react-native';
import {
  EmptyState,
  PrimaryButton,
  Section,
  SkeletonBlock,
  SkeletonLine,
  TopBar,
} from '../../../components/DesignKit';
import {
  CustomerPaymentMethodSummary,
  CustomerPaymentMethodType,
} from '../../../shared/models/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import {
  ScreenContent,
  ScreenScroll,
} from '../../../shared/components/ScreenLayout';
import { useCustomerPaymentMethodsViewModel } from '../viewModels/useCustomerPaymentMethodsViewModel';

type CustomerPaymentMethodsScreenProps = {
  customerPaymentMethods: CustomerPaymentMethodSummary[];
  selectedMethodId: string | null;
  busyAction: string | null;
  isLoading?: boolean;
  onBack: () => void;
  setSelectedCustomerPaymentMethodId: (methodId: string) => void;
  saveCustomerPaymentMethod: (methodType: CustomerPaymentMethodType) => Promise<void>;
  removeCustomerPaymentMethod: (methodId: string) => Promise<void>;
};

export function CustomerPaymentMethodsScreen({
  customerPaymentMethods,
  selectedMethodId,
  busyAction,
  isLoading = false,
  onBack,
  setSelectedCustomerPaymentMethodId,
  saveCustomerPaymentMethod,
  removeCustomerPaymentMethod,
}: CustomerPaymentMethodsScreenProps) {
  const paymentMethods = useCustomerPaymentMethodsViewModel({
    customerPaymentMethods,
    selectedMethodId,
    busyAction,
    isLoading,
  });
  const walletActions = paymentMethods.data.actions.filter(
    (action) => action.methodType !== 'card',
  );
  const cardAction = paymentMethods.data.actions.find(
    (action) => action.methodType === 'card',
  );
  const showSkeletons = paymentMethods.isLoading && customerPaymentMethods.length === 0;

  return (
    <>
      <TopBar title="Payment Methods" onBack={onBack} />
      <ScreenScroll>
        <ScreenContent>

          <Section title="Saved methods">
            {showSkeletons ? (
              <View style={styles.methodList}>
                {Array.from({ length: 2 }).map((_, index) => (
                  <PaymentMethodSkeleton key={`payment-method-skeleton-${index}`} />
                ))}
              </View>
            ) : paymentMethods.data.hasMethods ? (
              <View style={styles.methodList}>
                {paymentMethods.data.methods.map((item) => (
                  <Pressable
                    key={item.method.id}
                    style={[
                      styles.methodCard,
                      item.selected && styles.methodCardSelected,
                    ]}
                    onPress={() => setSelectedCustomerPaymentMethodId(item.method.id)}
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
                    <View style={[
                      styles.methodIcon,
                      item.selected && styles.methodIconSelected,
                    ]}>
                      <Wallet
                        color={item.selected ? palette.mint : palette.muted}
                        size={18}
                        strokeWidth={2.2}
                      />
                    </View>
                    <View style={styles.flex}>
                      <Text style={styles.methodName}>{item.label}</Text>
                      <Text style={styles.methodMeta}>{item.meta}</Text>
                    </View>
                    {item.canDelete ? (
                      <Pressable
                        style={styles.deleteButton}
                        onPress={() => void removeCustomerPaymentMethod(item.method.id)}
                        disabled={item.deleting}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove ${item.label}`}
                      >
                        <Trash2 color={palette.red} size={16} strokeWidth={2.2} />
                      </Pressable>
                    ) : null}
                  </Pressable>
                ))}
              </View>
            ) : (
              <EmptyState
                title="No payment methods"
                body="Add a wallet or card below to get started."
              />
            )}
          </Section>

          <Text style={styles.disclaimer}>
            ServEase stores only your preferred checkout choice. Wallet and card
            details are entered in secure checkout when you pay.
          </Text>

          <Section title="Add a method">
            <View style={styles.addMethodRow}>
              {walletActions.map((action) => (
                <Pressable
                  key={action.methodType}
                  style={[styles.addMethodCard, action.disabled && styles.addMethodCardDisabled]}
                  onPress={() => void saveCustomerPaymentMethod(action.methodType)}
                  disabled={action.disabled}
                  accessibilityRole="button"
                >
                  <Wallet color={action.disabled ? palette.faint : palette.mint} size={20} />
                  <Text style={[
                    styles.addMethodLabel,
                    action.disabled && styles.addMethodLabelDisabled,
                  ]}>
                    {action.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            {cardAction ? (
              <PrimaryButton
                label={cardAction.label}
                onPress={() => void saveCustomerPaymentMethod(cardAction.methodType)}
                disabled={cardAction.disabled}
              />
            ) : null}
          </Section>

          {paymentMethods.error ? (
            <Text style={styles.errorText}>{paymentMethods.error}</Text>
          ) : null}

        </ScreenContent>
      </ScreenScroll>
    </>
  );
}

function PaymentMethodSkeleton() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.methodCard}
    >
      <SkeletonBlock width={20} height={20} radius={radius.pill} />
      <SkeletonBlock width={36} height={36} radius={radius.sm} />
      <View style={styles.flex}>
        <SkeletonLine width="48%" height={13} />
        <SkeletonLine width="68%" height={10} style={styles.methodSkeletonMeta} />
      </View>
      <SkeletonBlock width={32} height={32} radius={radius.sm} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  methodList: {
    gap: spacing.sm,
  },
  methodCard: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: radius.md,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 68,
    padding: spacing.base,
  },
  methodCardSelected: {
    backgroundColor: palette.mintSoft,
    borderColor: palette.mint,
  },
  radioOuter: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.line,
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
  methodIcon: {
    alignItems: 'center',
    backgroundColor: palette.lineSoft,
    borderRadius: radius.sm,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  methodIconSelected: {
    backgroundColor: palette.white,
  },
  methodName: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  methodMeta: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  methodSkeletonMeta: {
    marginTop: 6,
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: radius.sm,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },

  disclaimer: {
    color: palette.faint,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19,
    textAlign: 'center',
  },

  addMethodRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  addMethodCard: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.base,
  },
  addMethodCardDisabled: {
    opacity: 0.5,
  },
  addMethodLabel: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '600',
  },
  addMethodLabelDisabled: {
    color: palette.faint,
  },

  errorText: {
    color: palette.red,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
    textAlign: 'center',
  },
});
