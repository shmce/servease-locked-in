import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CheckCircle, Trash2, Wallet } from 'lucide-react-native';
import {
  CustomerCard,
  CustomerContent,
  CustomerEmptyState,
  CustomerHeader,
  CustomerIconBlock,
  CustomerScreen,
  CustomerSection,
  customerText,
} from '../../../shared/components/CustomerUI';
import {
  CustomerPaymentMethodSummary,
  CustomerPaymentMethodType,
} from '../../../shared/models/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
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
    <CustomerScreen>
      <CustomerContent>
        <CustomerHeader
          title="Payment Methods"
          subtitle="Choose how you prefer to pay"
          onBack={onBack}
        />

        <CustomerSection title="Saved methods">
          {showSkeletons ? (
            <View style={styles.methodList}>
              {Array.from({ length: 2 }).map((_, index) => (
                <PaymentMethodSkeleton key={`payment-method-skeleton-${index}`} />
              ))}
            </View>
          ) : paymentMethods.data.hasMethods ? (
            <View style={styles.methodList}>
              {paymentMethods.data.methods.map((item) => (
                <View
                  key={item.method.id}
                  style={[
                    styles.methodCard,
                    item.selected && styles.methodCardSelected,
                  ]}
                >
                  <Pressable
                    style={styles.methodSelectArea}
                    onPress={() => setSelectedCustomerPaymentMethodId(item.method.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: item.selected }}
                  >
                    <CustomerIconBlock compact>
                      <Wallet color={palette.mintDeep} size={18} strokeWidth={2.1} />
                    </CustomerIconBlock>
                    <View style={styles.flex}>
                      <Text style={styles.methodName} numberOfLines={1}>
                        {item.label}
                      </Text>
                      <Text style={styles.methodMeta} numberOfLines={1}>
                        {item.meta}
                      </Text>
                    </View>
                    {item.selected ? (
                      <CheckCircle color={palette.mintDeep} size={20} strokeWidth={2.2} />
                    ) : (
                      <View style={styles.radioEmpty} />
                    )}
                  </Pressable>
                  {item.canDelete ? (
                    <Pressable
                      style={[
                        styles.deleteButton,
                        item.deleting && styles.actionDisabled,
                      ]}
                      onPress={() => void removeCustomerPaymentMethod(item.method.id)}
                      disabled={item.deleting}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${item.label}`}
                    >
                      <Trash2 color={palette.red} size={16} strokeWidth={2.2} />
                    </Pressable>
                  ) : null}
                </View>
              ))}
            </View>
          ) : (
            <CustomerEmptyState
              title="No payment methods"
              body="Add a wallet or card below to get started."
            />
          )}
        </CustomerSection>

        <Text style={styles.disclaimer}>
          ServEase stores only your preferred checkout choice. Wallet and card
          details are entered in secure checkout when you pay.
        </Text>

        <CustomerSection title="Add a method">
          <View style={styles.addMethodRow}>
            {walletActions.map((action) => (
              <Pressable
                key={action.methodType}
                style={[styles.addMethodCard, action.disabled && styles.actionDisabled]}
                onPress={() => void saveCustomerPaymentMethod(action.methodType)}
                disabled={action.disabled}
                accessibilityRole="button"
              >
                <Wallet
                  color={action.disabled ? '#A7AFB8' : palette.mintDeep}
                  size={19}
                  strokeWidth={2.1}
                />
                <Text
                  style={[
                    styles.addMethodLabel,
                    action.disabled && styles.addMethodLabelDisabled,
                  ]}
                  numberOfLines={1}
                >
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </View>
          {cardAction ? (
            <Pressable
              style={[
                styles.cardButton,
                cardAction.disabled && styles.actionDisabled,
              ]}
              onPress={() => void saveCustomerPaymentMethod(cardAction.methodType)}
              disabled={cardAction.disabled}
              accessibilityRole="button"
            >
              <Text style={styles.cardButtonText}>{cardAction.label}</Text>
            </Pressable>
          ) : null}
        </CustomerSection>

        {paymentMethods.error ? (
          <Text style={styles.errorText}>{paymentMethods.error}</Text>
        ) : null}
      </CustomerContent>
    </CustomerScreen>
  );
}

function PaymentMethodSkeleton() {
  return (
    <CustomerCard style={styles.skeletonCard}>
      <View style={styles.skeletonIcon} />
      <View style={styles.flex}>
        <View style={styles.skeletonLineShort} />
        <View style={styles.skeletonLine} />
      </View>
      <View style={styles.skeletonAction} />
    </CustomerCard>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    minWidth: 0,
  },
  methodList: {
    gap: spacing.md,
  },
  methodCard: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: '#EEF0F2',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  methodCardSelected: {
    backgroundColor: '#F1FAF5',
    borderColor: 'rgba(0,160,85,0.28)',
  },
  methodSelectArea: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 58,
  },
  methodName: {
    ...customerText.title,
    fontSize: 15,
    lineHeight: 20,
  },
  methodMeta: {
    ...customerText.meta,
    marginTop: 2,
  },
  radioEmpty: {
    borderColor: '#CBD2D9',
    borderRadius: radius.pill,
    borderWidth: 1.5,
    height: 18,
    width: 18,
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: '#FEECEC',
    borderRadius: radius.sm,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  actionDisabled: {
    opacity: 0.45,
  },
  disclaimer: {
    ...customerText.meta,
    textAlign: 'center',
  },
  addMethodRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  addMethodCard: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: '#EEF0F2',
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: spacing.md,
  },
  addMethodLabel: {
    color: '#202733',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 18,
  },
  addMethodLabelDisabled: {
    color: '#A7AFB8',
  },
  cardButton: {
    alignItems: 'center',
    backgroundColor: palette.mintDeep,
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: spacing.lg,
  },
  cardButtonText: {
    color: palette.white,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 19,
  },
  errorText: {
    color: palette.red,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
    textAlign: 'center',
  },
  skeletonCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  skeletonIcon: {
    backgroundColor: '#EEF2F6',
    borderRadius: radius.pill,
    height: 36,
    width: 36,
  },
  skeletonLineShort: {
    backgroundColor: '#EEF2F6',
    borderRadius: radius.pill,
    height: 12,
    width: '48%',
  },
  skeletonLine: {
    backgroundColor: '#F4F6F8',
    borderRadius: radius.pill,
    height: 10,
    marginTop: spacing.sm,
    width: '68%',
  },
  skeletonAction: {
    backgroundColor: '#EEF2F6',
    borderRadius: radius.pill,
    height: 20,
    width: 20,
  },
});
