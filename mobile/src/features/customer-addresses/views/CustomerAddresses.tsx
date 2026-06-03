import { Home, MapPin, Trash2 } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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

function AddressField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textarea]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A7AFB8"
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : undefined}
      />
    </View>
  );
}

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
    <CustomerScreen>
      <CustomerContent>
        <CustomerHeader
          title="Saved Addresses"
          subtitle="Choose where your providers should go"
          onBack={onBack}
        />

        <CustomerSection title="Your locations">
          {addressBook.data.hasAddresses ? (
            <View style={styles.addressList}>
              {addressBook.data.addresses.map((address) => (
                <CustomerCard
                  key={address.id}
                  selected={address.isDefault}
                  style={styles.addressCard}
                >
                  <View style={styles.addressRow}>
                    <CustomerIconBlock compact>
                      {address.isDefault ? (
                        <Home color={palette.mintDeep} size={18} strokeWidth={2.2} />
                      ) : (
                        <MapPin color={palette.mintDeep} size={18} strokeWidth={2.2} />
                      )}
                    </CustomerIconBlock>
                    <View style={styles.flex}>
                      <Text style={styles.addressLabel} numberOfLines={1}>
                        {address.label}
                      </Text>
                      <Text style={styles.addressMeta}>{address.defaultLabel}</Text>
                      <Text style={styles.addressText} numberOfLines={2}>
                        {address.address}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.addressActions}>
                    {!address.isDefault ? (
                      <Pressable
                        style={[
                          styles.homeButton,
                          address.settingDefault && styles.actionDisabled,
                        ]}
                        onPress={() => onSetDefault(address.id)}
                        disabled={address.settingDefault}
                        accessibilityRole="button"
                        accessibilityLabel={`Set ${address.label} as home`}
                      >
                        <Text style={styles.homeButtonText}>Set home</Text>
                      </Pressable>
                    ) : (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Default</Text>
                      </View>
                    )}
                    <Pressable
                      style={[
                        styles.deleteButton,
                        address.deleting && styles.actionDisabled,
                      ]}
                      onPress={() => onDeleteAddress(address.id)}
                      disabled={address.deleting}
                      accessibilityRole="button"
                      accessibilityLabel={`Delete ${address.label}`}
                    >
                      <Trash2 color={palette.red} size={16} strokeWidth={2.2} />
                    </Pressable>
                  </View>
                </CustomerCard>
              ))}
            </View>
          ) : (
            <CustomerEmptyState
              title="No saved addresses"
              body="Add your home or another service location below."
            />
          )}
        </CustomerSection>

        <CustomerSection title="Add address">
          <CustomerCard style={styles.formCard}>
            <AddressField
              label="Label"
              value={draftLabel}
              onChangeText={onDraftLabelChange}
              placeholder="Home, Work, Condo"
            />
            <AddressField
              label="Address"
              value={draftAddress}
              onChangeText={onDraftAddressChange}
              placeholder="House, street, barangay, city"
              multiline
            />
            <Pressable
              style={[
                styles.saveButton,
                (!draftAddress.trim() || busyAction === 'save-customer-address') &&
                  styles.saveButtonDisabled,
              ]}
              onPress={onSaveAddress}
              disabled={!draftAddress.trim() || busyAction === 'save-customer-address'}
              accessibilityRole="button"
            >
              <Text style={styles.saveButtonText}>{addressBook.data.saveLabel}</Text>
            </Pressable>
          </CustomerCard>
        </CustomerSection>
      </CustomerContent>
    </CustomerScreen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    minWidth: 0,
  },
  addressList: {
    gap: spacing.md,
  },
  addressCard: {
    gap: spacing.md,
  },
  addressRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
  },
  addressLabel: {
    ...customerText.title,
    fontSize: 15,
    lineHeight: 20,
  },
  addressMeta: {
    color: palette.mintDeep,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 16,
    marginTop: 2,
  },
  addressText: {
    ...customerText.body,
    marginTop: 4,
  },
  addressActions: {
    alignItems: 'center',
    borderTopColor: '#EEF0F2',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },
  homeButton: {
    backgroundColor: '#F1FAF5',
    borderColor: 'rgba(0,160,85,0.22)',
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  homeButtonText: {
    color: palette.mintDeep,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 18,
  },
  defaultBadge: {
    backgroundColor: '#F1FAF5',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  defaultBadgeText: {
    color: palette.mintDeep,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 16,
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
  formCard: {
    gap: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  fieldLabel: {
    ...customerText.meta,
    color: '#7A828D',
  },
  input: {
    ...customerText.body,
    backgroundColor: '#FBFCFD',
    borderColor: '#EEF0F2',
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 46,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  textarea: {
    minHeight: 94,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: palette.mintDeep,
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: spacing.lg,
  },
  saveButtonDisabled: {
    opacity: 0.45,
  },
  saveButtonText: {
    color: palette.white,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 19,
  },
});
