import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Trash2, Wallet } from 'lucide-react-native';
import {
  PrimaryButton,
  Section,
  TopBar,
} from '../../../components/DesignKit';
import {
  CustomerPaymentMethodSummary,
  CustomerPaymentMethodType,
} from '../../../shared/models/types';
import { AppScreen } from '../../../navigation/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import {
  ActionRow,
  ScreenContent,
  ScreenScroll,
} from '../../../shared/components/ScreenLayout';
import { useCustomerPaymentMethodsViewModel } from '../viewModels/useCustomerPaymentMethodsViewModel';

type CustomerPaymentMethodsScreenProps = {
  customerPaymentMethods: CustomerPaymentMethodSummary[];
  selectedMethodId: string | null;
  busyAction: string | null;
  navigate: (screen: AppScreen, nextRole?: 'customer') => void;
  setSelectedCustomerPaymentMethodId: (methodId: string) => void;
  saveCustomerPaymentMethod: (methodType: CustomerPaymentMethodType) => Promise<void>;
  removeCustomerPaymentMethod: (methodId: string) => Promise<void>;
};

export function CustomerPaymentMethodsScreen({
  customerPaymentMethods,
  selectedMethodId,
  busyAction,
  navigate,
  setSelectedCustomerPaymentMethodId,
  saveCustomerPaymentMethod,
  removeCustomerPaymentMethod,
}: CustomerPaymentMethodsScreenProps) {
  const paymentMethods = useCustomerPaymentMethodsViewModel({
    customerPaymentMethods,
    selectedMethodId,
    busyAction,
  });
  const walletActions = paymentMethods.data.actions.filter(
    (action) => action.methodType !== 'card',
  );
  const cardAction = paymentMethods.data.actions.find(
    (action) => action.methodType === 'card',
  );

  return (
    <>
      <TopBar title="Payment Methods" onBack={() => navigate('more', 'customer')} />
      <ScreenScroll>
        <ScreenContent>
          <Section title="Saved methods">
            {paymentMethods.data.hasMethods ? (
              paymentMethods.data.methods.map((item) => (
                <Pressable
                  key={item.method.id}
                  style={[
                    styles.paymentMethodOption,
                    item.selected && styles.paymentMethodSelected,
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
                  <Wallet color={item.selected ? palette.mint : palette.muted} size={22} />
                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>{item.method.label}</Text>
                    <Text style={styles.cardMeta}>{item.meta}</Text>
                  </View>
                  {item.canDelete ? (
                    <Pressable
                      style={styles.iconAction}
                      onPress={() => void removeCustomerPaymentMethod(item.method.id)}
                      disabled={item.deleting}
                    >
                      <Trash2 color={palette.red} size={18} />
                    </Pressable>
                  ) : null}
                </Pressable>
              ))
            ) : (
              <ActivityIndicator color={palette.mint} />
            )}
          </Section>
          <ActionRow>
            {walletActions.map((action) => (
              <PrimaryButton
                key={action.methodType}
                label={action.label}
                variant="secondary"
                onPress={() => void saveCustomerPaymentMethod(action.methodType)}
                disabled={action.disabled}
              />
            ))}
          </ActionRow>
          {cardAction ? (
            <PrimaryButton
              label={cardAction.label}
              onPress={() => void saveCustomerPaymentMethod(cardAction.methodType)}
              disabled={cardAction.disabled}
            />
          ) : null}
          {paymentMethods.error ? <Text style={styles.cardMeta}>{paymentMethods.error}</Text> : null}
        </ScreenContent>
      </ScreenScroll>
    </>
  );
}

const styles = StyleSheet.create({
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
  iconAction: {
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: radius.pill,
    height: 34,
    justifyContent: 'center',
    width: 34,
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
    color: palette.faint,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
  },
});
