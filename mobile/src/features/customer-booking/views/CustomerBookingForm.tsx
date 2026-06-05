import { StyleSheet, Text, View } from 'react-native';
import {
  CheckCircle,
  Home,
  MapPin,
  Navigation,
  Upload,
} from 'lucide-react-native';
import { Field } from '../../../components/DesignKit';
import { MotionPressable, MotionView } from '../../../components/Motion';
import { CustomerBookingSchedulePicker } from './CustomerBookingSchedulePicker';
import {
  CustomerCard,
  CustomerContent,
  CustomerHeader,
  CustomerScreen,
  CustomerSection,
  customerText,
} from '../../../shared/components/CustomerUI';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import {
  GeoAddressResult,
  CustomerAddressSummary,
  ProviderAvailabilitySchedule,
  ProviderListing,
} from '../../../shared/models/types';
import { MediaUploadBox } from '../../../shared/components/ScreenLayout';
import { AddressVerificationPreview } from '../../../tracking/TrackingMapPreview';
import { CustomerMapPinPickerModal } from '../../customer-location/components/CustomerMapPinPickerModal';
import { useCustomerBookingFormViewModel } from '../viewModels/useCustomerBookingFormViewModel';
import type { CustomerBookingLocationState } from '../../../domain/customerBookingLocation';

type PinAddressStatus = 'idle' | 'scheduled' | 'resolving' | 'failed';

type CustomerBookingFormScreenProps = {
  provider: ProviderListing;
  providerAvailability: ProviderAvailabilitySchedule | null;
  scheduledAt: string;
  hoursRequired: string;
  timeSlots: string[];
  bookingSlotError: string;
  defaultScheduledAt: string;
  address: string;
  savedAddresses: CustomerAddressSummary[];
  selectedSavedAddressId: string | null;
  addressGeoResult: GeoAddressResult | null;
  serviceLocation: CustomerBookingLocationState;
  mapPickerVisible: boolean;
  mapSearchBusy: boolean;
  mapSearchError: string | null;
  mapSearchQuery: string;
  pinAddressStatus: PinAddressStatus;
  notes: string;
  bookingReferencePhotoUri: string | null;
  bookingReferencePhotoUrl: string | null;
  busyAction: string | null;
  onBack: () => void;
  onScheduledAtChange: (value: string) => void;
  onBookingSlotErrorChange: (value: string) => void;
  onUnavailableSlotPress: () => void;
  onAddressChange: (value: string) => void;
  onSavedAddressPress: (address: CustomerAddressSummary) => void;
  onSaveAddressAsHome: () => void;
  onUseCurrentLocation: () => void;
  onOpenMapPicker: () => void;
  onCloseMapPicker: () => void;
  onMapSearchQueryChange: (value: string) => void;
  onSearchMapPin: () => void;
  onMapPinMove: (
    latitude: number,
    longitude: number,
    formattedAddress?: string,
  ) => void;
  onReverseGeocodePin: () => void;
  onConfirmMapPin: () => void;
  onManualDetailsChange: (value: string) => void;
  onHoursRequiredChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onUploadReferencePhoto: () => void;
  onContinue: () => void;
  onBackToProvider: () => void;
};

export function CustomerBookingFormScreen({
  provider,
  providerAvailability,
  scheduledAt,
  hoursRequired,
  timeSlots,
  bookingSlotError,
  defaultScheduledAt,
  address,
  savedAddresses,
  selectedSavedAddressId,
  addressGeoResult,
  serviceLocation,
  mapPickerVisible,
  mapSearchBusy,
  mapSearchError,
  mapSearchQuery,
  pinAddressStatus,
  notes,
  bookingReferencePhotoUri,
  bookingReferencePhotoUrl,
  busyAction,
  onBack,
  onScheduledAtChange,
  onBookingSlotErrorChange,
  onUnavailableSlotPress,
  onAddressChange,
  onSavedAddressPress,
  onSaveAddressAsHome,
  onUseCurrentLocation,
  onOpenMapPicker,
  onCloseMapPicker,
  onMapSearchQueryChange,
  onSearchMapPin,
  onMapPinMove,
  onReverseGeocodePin,
  onConfirmMapPin,
  onManualDetailsChange,
  onHoursRequiredChange,
  onNotesChange,
  onUploadReferencePhoto,
  onContinue,
  onBackToProvider,
}: CustomerBookingFormScreenProps) {
  const bookingForm = useCustomerBookingFormViewModel({
    provider,
    providerAvailability,
    scheduledAt,
    hoursRequired,
    timeSlots,
    bookingSlotError,
    address,
    savedAddresses,
    selectedSavedAddressId,
    serviceLocation,
    bookingReferencePhotoUrl,
    busyAction,
    pinAddressStatus,
  });
  const { data } = bookingForm;

  return (
    <>
      <CustomerScreen bottomInset={230}>
        <CustomerContent>
          <CustomerHeader
            title="Book Service"
            subtitle="Step 1 of 2 - choose details"
            onBack={onBack}
          />

          <CustomerCard>
            <View style={styles.providerSummaryRow}>
              <View style={styles.providerPhoto}>
                <Text style={styles.providerPhotoText}>
                  {data.providerInitial}
                </Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>{data.providerName}</Text>
                <Text style={styles.cardMeta}>{data.providerMeta}</Text>
                <Text style={styles.cardMeta}>{data.providerRatingLabel}</Text>
              </View>
            </View>
          </CustomerCard>

          <CustomerBookingSchedulePicker
            providerAvailability={providerAvailability}
            scheduledAt={scheduledAt}
            hoursRequired={hoursRequired}
            timeSlots={timeSlots}
            bookingSlotError={bookingSlotError}
            defaultScheduledAt={defaultScheduledAt}
            onScheduledAtChange={onScheduledAtChange}
            onBookingSlotErrorChange={onBookingSlotErrorChange}
            onUnavailableSlotPress={onUnavailableSlotPress}
            onHoursRequiredChange={onHoursRequiredChange}
          />

          <CustomerSection title="Where do you need it?">
            <View style={styles.addressActionRow}>
              <MotionPressable
                contentStyle={[
                  styles.addressActionButton,
                  styles.addressCurrentAction,
                  data.useCurrentLocationDisabled && styles.faded,
                ]}
                onPress={onUseCurrentLocation}
                disabled={data.useCurrentLocationDisabled}
                accessibilityRole="button"
                accessibilityLabel="Use current location as service address"
              >
                <Navigation
                  color={palette.mintDeep}
                  size={15}
                  strokeWidth={2.5}
                />
                <Text style={styles.addressActionText} numberOfLines={1}>
                  {data.useCurrentLocationLabel}
                </Text>
              </MotionPressable>
              <MotionPressable
                contentStyle={[
                  styles.addressActionButton,
                  styles.addressMapAction,
                  data.verifyAddressDisabled && styles.faded,
                ]}
                onPress={onOpenMapPicker}
                disabled={data.verifyAddressDisabled}
                accessibilityRole="button"
                accessibilityLabel="Choose service address on map"
              >
                <MapPin color={palette.white} size={15} strokeWidth={2.5} />
                <Text style={styles.addressMapActionText} numberOfLines={1}>
                  {data.verifyAddressLabel}
                </Text>
              </MotionPressable>
            </View>
            {data.savedAddressOptions.length > 0 ? (
              <View style={styles.savedAddressRail}>
                {data.savedAddressOptions.map((savedAddress) => {
                  const fullAddress = savedAddresses.find(
                    (item) => item.id === savedAddress.id,
                  );
                  return (
                    <MotionPressable
                      key={savedAddress.id}
                      contentStyle={[
                        styles.savedAddressChip,
                        savedAddress.isSelected &&
                          styles.savedAddressChipSelected,
                      ]}
                      onPress={() => {
                        if (fullAddress) {
                          onSavedAddressPress(fullAddress);
                        }
                      }}
                      selected={savedAddress.isSelected}
                      accessibilityRole="button"
                      accessibilityLabel={`Use ${savedAddress.label} address`}
                      accessibilityState={{ selected: savedAddress.isSelected }}
                    >
                      {savedAddress.isSelected ? (
                        <Home
                          color={palette.mintDeep}
                          size={14}
                          strokeWidth={2.4}
                        />
                      ) : savedAddress.hasVerifiedPin ? (
                        <CheckCircle
                          color={palette.mintDeep}
                          size={14}
                          strokeWidth={2.4}
                        />
                      ) : (
                        <MapPin
                          color={palette.mintDeep}
                          size={14}
                          strokeWidth={2.4}
                        />
                      )}
                      <View style={styles.savedAddressTextColumn}>
                        <Text
                          style={[
                            styles.savedAddressLabel,
                            savedAddress.isSelected &&
                              styles.savedAddressLabelSelected,
                          ]}
                        >
                          {savedAddress.label}
                        </Text>
                        <Text style={styles.savedAddressText} numberOfLines={1}>
                          {savedAddress.address}
                        </Text>
                        <Text
                          style={[
                            styles.savedAddressStatus,
                            savedAddress.hasVerifiedPin &&
                              styles.savedAddressStatusVerified,
                          ]}
                          numberOfLines={1}
                        >
                          {savedAddress.statusLabel}
                        </Text>
                      </View>
                    </MotionPressable>
                  );
                })}
              </View>
            ) : null}

            <Field
              label="Service Address"
              value={address}
              onChangeText={onAddressChange}
              placeholder="House, street, barangay, city"
              multiline
            />
            <LocationStatusCard
              actionLabel={data.locationStatusActionLabel}
              coordinateLabel={data.locationCoordinateLabel}
              isConfirmed={data.locationStatusConfirmed}
              notice={data.locationNotice}
              statusLabel={data.locationStatusLabel}
              onEdit={onOpenMapPicker}
            />
            {addressGeoResult && !serviceLocation.confirmedPin ? (
              <AddressVerificationPreview result={addressGeoResult} />
            ) : null}
            <MotionPressable
              contentStyle={[
                styles.saveHomeButton,
                data.saveAddressDisabled && styles.faded,
              ]}
              onPress={onSaveAddressAsHome}
              disabled={data.saveAddressDisabled}
              accessibilityRole="button"
              accessibilityLabel="Save service address as home"
            >
              <Home color={palette.mintDeep} size={15} strokeWidth={2.4} />
              <Text style={styles.smallActionText}>
                {data.saveAddressLabel}
              </Text>
            </MotionPressable>
          </CustomerSection>

          <CustomerSection title="Add details (optional)">
            <Field
              label="Tell the provider what you need"
              value={notes}
              onChangeText={onNotesChange}
              placeholder="Example: Kitchen sink leak under cabinet"
              multiline
            />
            <MediaUploadBox
              imageUri={bookingReferencePhotoUri}
              icon={<Upload color={palette.mintDeep} size={28} />}
              helper="Reference photo (optional)"
              label={data.referencePhotoLabel}
              onPress={onUploadReferencePhoto}
              minHeight={132}
              previewHeight={120}
            />
          </CustomerSection>
        </CustomerContent>
      </CustomerScreen>

      <MotionView style={styles.stickyFooter} variant="sheet">
        <View style={styles.footerTotalRow}>
          <View style={styles.footerTotalCopy}>
            <Text style={styles.footerTotalLabel}>Base service rate</Text>
            <Text style={styles.cardMeta} numberOfLines={2}>
              {data.footerRateLabel} - travel and fuel {data.calloutFeeLabel}
            </Text>
          </View>
          <Text
            style={styles.footerTotalValue}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.78}
          >
            {data.estimatedTotalLabel}
          </Text>
        </View>
        {data.continueNotice ? (
          <Text style={styles.noticeText}>{data.continueNotice}</Text>
        ) : null}
        <MotionPressable
          contentStyle={[
            styles.footerButton,
            !data.canContinue && styles.footerButtonDisabled,
          ]}
          onPress={onContinue}
          disabled={!data.canContinue}
          accessibilityRole="button"
        >
          <Text style={styles.footerButtonText}>{data.continueLabel}</Text>
        </MotionPressable>
        <Text style={styles.footerLink} onPress={onBackToProvider}>
          Back to provider
        </Text>
      </MotionView>
      <CustomerMapPinPickerModal
        currentLocationBusy={busyAction === 'geo-current-location'}
        mapSearchBusy={mapSearchBusy}
        mapSearchError={mapSearchError}
        mapSearchQuery={mapSearchQuery}
        pinAddressStatus={pinAddressStatus}
        refreshAddressBusy={busyAction === 'geo-reverse-pin'}
        serviceLocation={serviceLocation}
        visible={mapPickerVisible}
        onClose={onCloseMapPicker}
        onConfirm={onConfirmMapPin}
        onMapSearchQueryChange={onMapSearchQueryChange}
        onSearchMapPin={onSearchMapPin}
        onManualDetailsChange={onManualDetailsChange}
        onMovePin={onMapPinMove}
        onRefreshAddress={onReverseGeocodePin}
        onUseCurrentLocation={onUseCurrentLocation}
      />
    </>
  );
}

function LocationStatusCard({
  actionLabel,
  coordinateLabel,
  isConfirmed,
  notice,
  statusLabel,
  onEdit,
}: {
  actionLabel: string;
  coordinateLabel: string | null;
  isConfirmed: boolean;
  notice: string | null;
  statusLabel: string;
  onEdit: () => void;
}) {
  return (
    <MotionPressable
      contentStyle={[
        styles.locationStatusCard,
        isConfirmed && styles.locationStatusCardConfirmed,
      ]}
      onPress={onEdit}
      accessibilityRole="button"
      accessibilityLabel="Edit service map pin"
    >
      <View style={styles.locationStatusIcon}>
        {isConfirmed ? (
          <CheckCircle color={palette.mintDeep} size={18} strokeWidth={2.5} />
        ) : (
          <MapPin color={palette.mintDeep} size={18} strokeWidth={2.5} />
        )}
      </View>
      <View style={styles.flex}>
        <Text style={styles.locationStatusTitle}>{statusLabel}</Text>
        <Text style={styles.locationStatusMeta} numberOfLines={2}>
          {coordinateLabel ?? notice ?? 'Tap to choose the exact service pin.'}
        </Text>
      </View>
      <Text style={styles.locationStatusAction}>{actionLabel}</Text>
    </MotionPressable>
  );
}

const styles = StyleSheet.create({
  providerSummaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  providerPhoto: {
    alignItems: 'center',
    backgroundColor: '#F1FAF5',
    borderRadius: radius.pill,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  providerPhotoText: {
    color: palette.mintDeep,
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 0,
  },
  flex: {
    flex: 1,
  },
  addressActionRow: {
    alignItems: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  addressActionButton: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  addressCurrentAction: {
    backgroundColor: '#F1FAF5',
    flexGrow: 1,
    minWidth: 132,
  },
  addressMapAction: {
    backgroundColor: palette.mintDeep,
    flexGrow: 1,
    minWidth: 160,
  },
  addressActionText: {
    color: palette.mintDeep,
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
  },
  addressMapActionText: {
    color: palette.white,
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
  },
  smallActionText: {
    color: palette.mintDeep,
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0,
  },
  faded: {
    opacity: 0.5,
  },
  savedAddressRail: {
    gap: spacing.sm,
  },
  savedAddressChip: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: '#EEF0F2',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 54,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  savedAddressChipSelected: {
    backgroundColor: '#F1FAF5',
    borderColor: '#BDE8D0',
  },
  savedAddressTextColumn: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  savedAddressLabel: {
    color: '#202733',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0,
  },
  savedAddressLabelSelected: {
    color: palette.mintDeep,
  },
  savedAddressText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0,
  },
  savedAddressStatus: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0,
  },
  savedAddressStatusVerified: {
    color: palette.mintDeep,
  },
  saveHomeButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F1FAF5',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 36,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  locationStatusAction: {
    color: palette.mintDeep,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
  },
  locationStatusCard: {
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  locationStatusCardConfirmed: {
    backgroundColor: '#F1FAF5',
    borderColor: '#BDE8D0',
  },
  locationStatusIcon: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  locationStatusMeta: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  locationStatusTitle: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
  },
  footerTotalRow: {
    alignItems: 'center',
    borderBottomColor: '#EEF0F2',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
  },
  footerTotalCopy: {
    flex: 1,
    minWidth: 0,
  },
  footerTotalLabel: {
    color: '#202733',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0,
  },
  footerTotalValue: {
    color: '#202733',
    flexShrink: 0,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0,
    maxWidth: '48%',
    textAlign: 'right',
  },
  footerLink: {
    color: palette.mintDeep,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0,
    textAlign: 'center',
  },
  cardTitle: {
    ...customerText.title,
    fontSize: 15,
    lineHeight: 20,
  },
  cardMeta: {
    ...customerText.meta,
  },
  noticeText: {
    ...customerText.meta,
    textAlign: 'center',
  },
  stickyFooter: {
    backgroundColor: palette.white,
    borderTopColor: '#EEF0F2',
    borderTopWidth: 1,
    bottom: 0,
    gap: spacing.sm,
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
