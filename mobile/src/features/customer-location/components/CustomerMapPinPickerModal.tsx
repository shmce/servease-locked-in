import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  LocateFixed,
  MapPin,
  RefreshCw,
  Search,
  X,
} from 'lucide-react-native';
import type { CustomerBookingLocationState } from '../../../domain/customerBookingLocation';
import { ServiceLocationPickerMap } from '../../../tracking/TrackingMapPreview';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';

export type CustomerPinAddressStatus =
  | 'idle'
  | 'scheduled'
  | 'resolving'
  | 'failed';

type CustomerMapPinPickerModalProps = {
  currentLocationBusy: boolean;
  mapSearchError: string | null;
  mapSearchQuery: string;
  mapSearchBusy: boolean;
  pinAddressStatus: CustomerPinAddressStatus;
  refreshAddressBusy: boolean;
  serviceLocation: CustomerBookingLocationState;
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onMapSearchQueryChange: (value: string) => void;
  onManualDetailsChange: (value: string) => void;
  onMovePin: (
    latitude: number,
    longitude: number,
    formattedAddress?: string,
  ) => void;
  onRefreshAddress: () => void;
  onSearchMapPin: () => void;
  onUseCurrentLocation: () => void;
};

export function CustomerMapPinPickerModal({
  currentLocationBusy,
  mapSearchBusy,
  mapSearchError,
  mapSearchQuery,
  pinAddressStatus,
  refreshAddressBusy,
  serviceLocation,
  visible,
  onClose,
  onConfirm,
  onMapSearchQueryChange,
  onManualDetailsChange,
  onMovePin,
  onRefreshAddress,
  onSearchMapPin,
  onUseCurrentLocation,
}: CustomerMapPinPickerModalProps) {
  const pin = serviceLocation.pendingPin ?? serviceLocation.confirmedPin;
  const addressLabel =
    serviceLocation.pendingPin?.formattedAddress ||
    serviceLocation.addressText ||
    'Move the map to set a pin';
  const coordinateLabel = pin
    ? `${pin.latitude.toFixed(5)}, ${pin.longitude.toFixed(5)}`
    : 'No pin selected';
  const isInspectingConfirmedPin =
    Boolean(serviceLocation.confirmedPin) && !serviceLocation.pendingPin;
  const isFindingAddress =
    refreshAddressBusy ||
    pinAddressStatus === 'scheduled' ||
    pinAddressStatus === 'resolving';
  const displayedAddressLabel = isFindingAddress
    ? 'Finding address...'
    : addressLabel;
  const refreshLabel =
    pinAddressStatus === 'failed'
      ? 'Retry'
      : isFindingAddress
        ? 'Finding...'
        : 'Refresh';
  const confirmPinLabel = isInspectingConfirmedPin ? 'Done' : 'Confirm pin';

  return (
    <Modal
      animationType="slide"
      presentationStyle="fullScreen"
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.mapPickerScreen}
      >
        <ServiceLocationPickerMap
          center={pin}
          onCenterChange={(location) => {
            onMovePin(location.latitude, location.longitude);
          }}
        />

        <View pointerEvents="box-none" style={styles.mapPickerTopOverlay}>
          <Pressable
            style={styles.mapPickerCloseButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close map picker"
          >
            <X color={palette.ink} size={20} strokeWidth={2.5} />
          </Pressable>
          <View style={styles.mapPickerSearchBar}>
            <Search color={palette.muted} size={18} strokeWidth={2.4} />
            <TextInput
              style={styles.mapPickerSearchInput}
              value={mapSearchQuery}
              onChangeText={onMapSearchQueryChange}
              onSubmitEditing={onSearchMapPin}
              placeholder="Search address or place"
              placeholderTextColor={palette.muted}
              returnKeyType="search"
              editable={!mapSearchBusy}
              selectTextOnFocus
            />
            <Pressable
              style={[
                styles.mapPickerSearchSubmit,
                mapSearchBusy && styles.faded,
              ]}
              onPress={onSearchMapPin}
              disabled={mapSearchBusy}
              accessibilityRole="button"
              accessibilityLabel="Search map address"
            >
              <Text style={styles.mapPickerSearchSubmitText} numberOfLines={1}>
                {mapSearchBusy ? 'Searching' : 'Search'}
              </Text>
            </Pressable>
          </View>
        </View>

        <View pointerEvents="box-none" style={styles.mapPickerFloatingActions}>
          <Pressable
            style={[styles.mapPickerAction, currentLocationBusy && styles.faded]}
            onPress={onUseCurrentLocation}
            disabled={currentLocationBusy}
            accessibilityRole="button"
            accessibilityLabel="Use current location"
          >
            <LocateFixed color={palette.mintDeep} size={16} strokeWidth={2.4} />
            <Text style={styles.smallActionText}>
              {currentLocationBusy ? 'Locating' : 'Current'}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.mapPickerAction, isFindingAddress && styles.faded]}
            onPress={onRefreshAddress}
            disabled={isFindingAddress}
            accessibilityRole="button"
            accessibilityLabel={
              pinAddressStatus === 'failed'
                ? 'Retry pin address'
                : 'Refresh pin address'
            }
          >
            <RefreshCw color={palette.mintDeep} size={16} strokeWidth={2.4} />
            <Text style={styles.smallActionText}>{refreshLabel}</Text>
          </Pressable>
        </View>

        <View style={styles.mapPickerSheet}>
          <View style={styles.mapPickerAddressRow}>
            <MapPin color={palette.mintDeep} size={20} strokeWidth={2.5} />
            <View style={styles.flex}>
              <Text style={styles.mapPickerAddressTitle} numberOfLines={2}>
                {displayedAddressLabel}
              </Text>
              <Text style={styles.mapPickerAddressMeta}>{coordinateLabel}</Text>
            </View>
          </View>
          {mapSearchError ? (
            <Text style={styles.mapPickerSearchError}>{mapSearchError}</Text>
          ) : null}

          <TextInput
            style={styles.manualDetailsInput}
            value={serviceLocation.manualDetails}
            onChangeText={onManualDetailsChange}
            placeholder="Unit, building, gate, or landmark"
            placeholderTextColor={palette.muted}
          />

          <Pressable
            style={[
              styles.confirmPinButton,
              !pin && styles.confirmPinButtonDisabled,
            ]}
            onPress={onConfirm}
            disabled={!pin}
            accessibilityRole="button"
            accessibilityLabel="Confirm map pin"
          >
            <Text style={styles.confirmPinButtonText}>{confirmPinLabel}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    minWidth: 0,
  },
  faded: {
    opacity: 0.5,
  },
  smallActionText: {
    color: palette.mintDeep,
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0,
  },
  mapPickerAction: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: radius.pill,
    elevation: 4,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 40,
    paddingHorizontal: spacing.md,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
  },
  mapPickerAddressMeta: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0,
  },
  mapPickerAddressRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  mapPickerAddressTitle: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 19,
  },
  mapPickerSearchBar: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderColor: 'rgba(17,24,39,0.08)',
    borderRadius: radius.pill,
    borderWidth: 1,
    elevation: 5,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 48,
    minWidth: 0,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
  },
  mapPickerSearchError: {
    color: '#B42318',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 17,
  },
  mapPickerSearchInput: {
    color: palette.ink,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0,
    minWidth: 0,
    paddingVertical: 0,
  },
  mapPickerSearchSubmit: {
    alignItems: 'center',
    backgroundColor: '#F1FAF5',
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: 36,
    minWidth: 70,
    paddingHorizontal: spacing.sm,
  },
  mapPickerSearchSubmitText: {
    color: palette.mintDeep,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
  },
  mapPickerCloseButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 24,
    elevation: 5,
    height: 48,
    justifyContent: 'center',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    width: 48,
  },
  mapPickerFloatingActions: {
    bottom: 226,
    flexDirection: 'row',
    gap: spacing.sm,
    left: spacing.lg,
    position: 'absolute',
    right: spacing.lg,
    zIndex: 5,
  },
  mapPickerScreen: {
    backgroundColor: '#E5E7EB',
    flex: 1,
    position: 'relative',
  },
  mapPickerSheet: {
    backgroundColor: palette.white,
    borderColor: 'rgba(17,24,39,0.08)',
    borderRadius: 8,
    borderWidth: 1,
    bottom: spacing.lg,
    elevation: 8,
    gap: spacing.sm,
    left: spacing.lg,
    padding: spacing.md,
    position: 'absolute',
    right: spacing.lg,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    zIndex: 4,
  },
  mapPickerTopOverlay: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    left: spacing.lg,
    position: 'absolute',
    right: spacing.lg,
    top: Platform.OS === 'android' ? 36 : 58,
    zIndex: 5,
  },
  manualDetailsInput: {
    backgroundColor: '#F8FAFC',
    borderColor: palette.line,
    borderRadius: 10,
    borderWidth: 1,
    color: palette.ink,
    fontSize: 14,
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  confirmPinButton: {
    alignItems: 'center',
    backgroundColor: palette.mintDeep,
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: 48,
  },
  confirmPinButtonDisabled: {
    backgroundColor: palette.line,
  },
  confirmPinButtonText: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0,
  },
});
