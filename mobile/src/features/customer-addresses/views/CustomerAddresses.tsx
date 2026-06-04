import { CheckCircle, Home, MapPin, Trash2 } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { CustomerBookingLocationState } from '../../../domain/customerBookingLocation';
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
import {
  CustomerMapPinPickerModal,
  type CustomerPinAddressStatus,
} from '../../customer-location/components/CustomerMapPinPickerModal';
import { useCustomerAddressesViewModel } from '../viewModels/useCustomerAddressesViewModel';

type CustomerAddressesScreenProps = {
  addresses: CustomerAddressSummary[];
  draftLabel: string;
  draftAddress: string;
  editTargetId: string | null;
  mapPickerVisible: boolean;
  mapSearchBusy: boolean;
  mapSearchError: string | null;
  mapSearchQuery: string;
  pinAddressStatus: CustomerPinAddressStatus;
  serviceLocation: CustomerBookingLocationState;
  busyAction: string | null;
  onBack: () => void;
  onCancelDraft: () => void;
  onCloseMapPicker: () => void;
  onConfirmMapPin: () => void;
  onDraftLabelChange: (value: string) => void;
  onEditAddressPin: (address: CustomerAddressSummary) => void;
  onMapPinMove: (
    latitude: number,
    longitude: number,
    formattedAddress?: string,
  ) => void;
  onMapSearchQueryChange: (value: string) => void;
  onManualDetailsChange: (value: string) => void;
  onOpenMapPicker: () => void;
  onRefreshAddress: () => void;
  onSaveAddress: () => void;
  onSearchMapPin: () => void;
  onSetDefault: (addressId: string) => void;
  onDeleteAddress: (addressId: string) => void;
  onUseCurrentLocation: () => void;
};

function AddressField({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A7AFB8"
      />
    </View>
  );
}

export function CustomerAddressesScreen({
  addresses,
  draftLabel,
  draftAddress,
  editTargetId,
  mapPickerVisible,
  mapSearchBusy,
  mapSearchError,
  mapSearchQuery,
  pinAddressStatus,
  serviceLocation,
  busyAction,
  onBack,
  onCancelDraft,
  onCloseMapPicker,
  onConfirmMapPin,
  onDraftLabelChange,
  onEditAddressPin,
  onMapPinMove,
  onMapSearchQueryChange,
  onManualDetailsChange,
  onOpenMapPicker,
  onRefreshAddress,
  onSaveAddress,
  onSearchMapPin,
  onSetDefault,
  onDeleteAddress,
  onUseCurrentLocation,
}: CustomerAddressesScreenProps) {
  const addressBook = useCustomerAddressesViewModel({
    addresses,
    busyAction,
    editTargetId,
  });
  const confirmedDraftPin = serviceLocation.confirmedPin;
  const draftCoordinateLabel = confirmedDraftPin
    ? `${confirmedDraftPin.latitude.toFixed(5)}, ${confirmedDraftPin.longitude.toFixed(5)}`
    : null;
  const draftTitle = confirmedDraftPin
    ? 'Pin ready to save'
    : 'Choose a map pin';
  const draftBody =
    draftAddress.trim() ||
    'Search, use current location, or move the map to verify this saved address.';
  const isSaveDisabled =
    !confirmedDraftPin || addressBook.data.isSavingAddress;

  return (
    <>
      <CustomerScreen>
        <CustomerContent>
          <CustomerHeader
            title="Saved Addresses"
            subtitle="Verify service pins once, then book faster"
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
                          <Home
                            color={palette.mintDeep}
                            size={18}
                            strokeWidth={2.2}
                          />
                        ) : (
                          <MapPin
                            color={palette.mintDeep}
                            size={18}
                            strokeWidth={2.2}
                          />
                        )}
                      </CustomerIconBlock>
                      <View style={styles.flex}>
                        <View style={styles.addressTitleRow}>
                          <Text style={styles.addressLabel} numberOfLines={1}>
                            {address.label}
                          </Text>
                          <VerificationBadge
                            isVerified={address.isPinVerified}
                            label={address.verificationLabel}
                          />
                        </View>
                        <Text style={styles.addressMeta}>
                          {address.defaultLabel}
                        </Text>
                        <Text style={styles.addressText} numberOfLines={2}>
                          {address.address}
                        </Text>
                        {address.pinCoordinateLabel ? (
                          <Text style={styles.coordinateText}>
                            {address.pinCoordinateLabel}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                    <View style={styles.addressActions}>
                      <Pressable
                        style={[
                          styles.pinButton,
                          address.isPinActionBusy && styles.actionDisabled,
                        ]}
                        onPress={() => onEditAddressPin(address)}
                        disabled={address.isPinActionBusy}
                        accessibilityRole="button"
                        accessibilityLabel={`${address.pinActionLabel} for ${address.label}`}
                      >
                        <MapPin
                          color={palette.mintDeep}
                          size={15}
                          strokeWidth={2.4}
                        />
                        <Text style={styles.pinButtonText}>
                          {address.isPinActionBusy
                            ? 'Saving...'
                            : address.pinActionLabel}
                        </Text>
                      </Pressable>
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
                body="Add Home or another service location with a verified map pin."
              />
            )}
          </CustomerSection>

          <CustomerSection
            title={editTargetId ? 'Update address pin' : 'Add address'}
          >
            <CustomerCard style={styles.formCard}>
              <AddressField
                label="Label"
                value={draftLabel}
                onChangeText={onDraftLabelChange}
                placeholder="Home, Work, Condo"
              />
              <Pressable
                style={[
                  styles.pinStatusCard,
                  confirmedDraftPin && styles.pinStatusCardConfirmed,
                ]}
                onPress={onOpenMapPicker}
                accessibilityRole="button"
                accessibilityLabel="Choose saved address map pin"
              >
                <View style={styles.pinStatusIcon}>
                  {confirmedDraftPin ? (
                    <CheckCircle
                      color={palette.mintDeep}
                      size={18}
                      strokeWidth={2.5}
                    />
                  ) : (
                    <MapPin
                      color={palette.mintDeep}
                      size={18}
                      strokeWidth={2.5}
                    />
                  )}
                </View>
                <View style={styles.flex}>
                  <Text style={styles.pinStatusTitle}>{draftTitle}</Text>
                  <Text style={styles.pinStatusMeta} numberOfLines={2}>
                    {draftBody}
                  </Text>
                  {draftCoordinateLabel ? (
                    <Text style={styles.coordinateText}>
                      {draftCoordinateLabel}
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.pinStatusAction}>
                  {confirmedDraftPin ? 'Change' : 'Choose'}
                </Text>
              </Pressable>
              <View style={styles.formActions}>
                {editTargetId ? (
                  <Pressable
                    style={styles.cancelButton}
                    onPress={onCancelDraft}
                    accessibilityRole="button"
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                ) : null}
                <Pressable
                  style={[
                    styles.saveButton,
                    isSaveDisabled && styles.saveButtonDisabled,
                  ]}
                  onPress={onSaveAddress}
                  disabled={isSaveDisabled}
                  accessibilityRole="button"
                >
                  <Text style={styles.saveButtonText}>
                    {addressBook.data.saveLabel}
                  </Text>
                </Pressable>
              </View>
            </CustomerCard>
          </CustomerSection>
        </CustomerContent>
      </CustomerScreen>
      <CustomerMapPinPickerModal
        currentLocationBusy={busyAction === 'customer-address-current-location'}
        mapSearchBusy={mapSearchBusy}
        mapSearchError={mapSearchError}
        mapSearchQuery={mapSearchQuery}
        pinAddressStatus={pinAddressStatus}
        refreshAddressBusy={busyAction === 'customer-address-reverse-pin'}
        serviceLocation={serviceLocation}
        visible={mapPickerVisible}
        onClose={onCloseMapPicker}
        onConfirm={onConfirmMapPin}
        onMapSearchQueryChange={onMapSearchQueryChange}
        onManualDetailsChange={onManualDetailsChange}
        onMovePin={onMapPinMove}
        onRefreshAddress={onRefreshAddress}
        onSearchMapPin={onSearchMapPin}
        onUseCurrentLocation={onUseCurrentLocation}
      />
    </>
  );
}

function VerificationBadge({
  isVerified,
  label,
}: {
  isVerified: boolean;
  label: string;
}) {
  return (
    <View style={[styles.pinBadge, isVerified && styles.pinBadgeVerified]}>
      {isVerified ? (
        <CheckCircle color={palette.mintDeep} size={13} strokeWidth={2.4} />
      ) : (
        <MapPin color="#B45309" size={13} strokeWidth={2.4} />
      )}
      <Text
        style={[styles.pinBadgeText, isVerified && styles.pinBadgeTextVerified]}
      >
        {label}
      </Text>
    </View>
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
  addressTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  addressLabel: {
    ...customerText.title,
    flexShrink: 1,
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
  coordinateText: {
    color: '#7A828D',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 17,
    marginTop: 4,
  },
  pinBadge: {
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  pinBadgeVerified: {
    backgroundColor: '#F1FAF5',
  },
  pinBadgeText: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 14,
  },
  pinBadgeTextVerified: {
    color: palette.mintDeep,
  },
  addressActions: {
    alignItems: 'center',
    borderTopColor: '#EEF0F2',
    borderTopWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },
  pinButton: {
    alignItems: 'center',
    backgroundColor: '#F1FAF5',
    borderColor: 'rgba(0,160,85,0.22)',
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 34,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  pinButtonText: {
    color: palette.mintDeep,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 18,
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
  pinStatusAction: {
    color: palette.mintDeep,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
  },
  pinStatusCard: {
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  pinStatusCardConfirmed: {
    backgroundColor: '#F1FAF5',
    borderColor: '#BDE8D0',
  },
  pinStatusIcon: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  pinStatusMeta: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  pinStatusTitle: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
  },
  formActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cancelButton: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: palette.line,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: spacing.lg,
  },
  cancelButtonText: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: palette.mintDeep,
    borderRadius: radius.pill,
    flex: 1,
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
