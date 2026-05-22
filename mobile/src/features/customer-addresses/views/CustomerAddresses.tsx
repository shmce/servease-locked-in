import { Home, MapPin, Trash2 } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  EmptyState,
  Field,
  PrimaryButton,
  Section,
  TopBar,
} from '../../../components/DesignKit';
import { ScreenContent, ScreenScroll } from '../../../shared/components/ScreenLayout';
import { CustomerAddressSummary } from '../../../shared/models/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { useCustomerAddressesViewModel } from '../viewModels/useCustomerAddressesViewModel';

type CustomerAddressesScreenProps = {
  addresses: CustomerAddressSummary[];
  draftLabel: string;
  draftAddress: string;
  busyAction: string | null;
  onBack: () => void;
  onDraftLabelChange: (value: string) => void;
  onDraftAddressChange: (value: string) => void;
  onSaveAddress: () => void;
  onSetDefault: (addressId: string) => void;
  onDeleteAddress: (addressId: string) => void;
};

export function CustomerAddressesScreen({
  addresses,
  draftLabel,
  draftAddress,
  busyAction,
  onBack,
  onDraftLabelChange,
  onDraftAddressChange,
  onSaveAddress,
  onSetDefault,
  onDeleteAddress,
}: CustomerAddressesScreenProps) {
  const addressBook = useCustomerAddressesViewModel({ addresses, busyAction });

  return (
    <>
      <TopBar title="Saved Addresses" onBack={onBack} />
      <ScreenScroll>
        <ScreenContent>
          <Section title="Your locations">
            {addressBook.data.hasAddresses ? (
              <View style={styles.addressList}>
                {addressBook.data.addresses.map((address) => (
                  <View key={address.id} style={styles.addressCard}>
                    <View style={styles.addressIcon}>
                      {address.isDefault ? (
                        <Home color={palette.mint} size={18} strokeWidth={2.4} />
                      ) : (
                        <MapPin color={palette.muted} size={18} strokeWidth={2.4} />
                      )}
                    </View>
                    <View style={styles.flex}>
                      <Text style={styles.addressLabel}>{address.label}</Text>
                      <Text style={styles.addressMeta}>{address.defaultLabel}</Text>
                      <Text style={styles.addressText}>{address.address}</Text>
                    </View>
                    {!address.isDefault ? (
                      <Pressable
                        style={styles.linkButton}
                        onPress={() => onSetDefault(address.id)}
                        disabled={address.settingDefault}
                        accessibilityRole="button"
                        accessibilityLabel={`Set ${address.label} as home`}
                      >
                        <Text style={styles.linkButtonText}>Home</Text>
                      </Pressable>
                    ) : null}
                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => onDeleteAddress(address.id)}
                      disabled={address.deleting}
                      accessibilityRole="button"
                      accessibilityLabel={`Delete ${address.label}`}
                    >
                      <Trash2 color={palette.red} size={16} strokeWidth={2.3} />
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : (
              <EmptyState
                title="No saved addresses"
                body="Add your home or another service location below."
              />
            )}
          </Section>

          <Section title="Add address">
            <Field
              label="Label"
              value={draftLabel}
              onChangeText={onDraftLabelChange}
              placeholder="Home, Work, Condo"
            />
            <Field
              label="Address"
              value={draftAddress}
              onChangeText={onDraftAddressChange}
              placeholder="House, street, barangay, city"
              multiline
            />
            <PrimaryButton
              label={addressBook.data.saveLabel}
              onPress={onSaveAddress}
              disabled={!draftAddress.trim() || busyAction === 'save-customer-address'}
            />
          </Section>
        </ScreenContent>
      </ScreenScroll>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  addressList: {
    gap: spacing.sm,
  },
  addressCard: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.lineSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 76,
    padding: spacing.base,
  },
  addressIcon: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  addressLabel: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  addressMeta: {
    color: palette.mint,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  addressText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  linkButton: {
    backgroundColor: palette.mintSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  linkButtonText: {
    color: palette.mint,
    fontSize: 12,
    fontWeight: '800',
  },
  deleteButton: {
    alignItems: 'center',
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
});
