import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Home, MapPin, Navigation, Upload } from 'lucide-react-native';
import { Field } from '../../../components/DesignKit';
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
import { useCustomerBookingFormViewModel } from '../viewModels/useCustomerBookingFormViewModel';

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
  onVerifyAddress: () => void;
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
  onVerifyAddress,
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
    bookingReferencePhotoUrl,
    busyAction,
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
                <Text style={styles.providerPhotoText}>{data.providerInitial}</Text>
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

          <CustomerSection
            title="Where do you need it?"
            action={
              <View style={styles.inlineActions}>
                <Pressable
                  style={[
                    styles.smallAction,
                    data.useCurrentLocationDisabled && styles.faded,
                  ]}
                  onPress={onUseCurrentLocation}
                  disabled={data.useCurrentLocationDisabled}
                  accessibilityRole="button"
                  accessibilityLabel="Use current location as service address"
                >
                  <Navigation color={palette.mintDeep} size={14} strokeWidth={2.5} />
                  <Text style={styles.smallActionText}>
                    {data.useCurrentLocationLabel}
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.smallAction, data.verifyAddressDisabled && styles.faded]}
                  onPress={onVerifyAddress}
                  disabled={data.verifyAddressDisabled}
                  accessibilityRole="button"
                  accessibilityLabel="Verify service address"
                >
                  <Text style={styles.smallActionText}>{data.verifyAddressLabel}</Text>
                </Pressable>
              </View>
            }
          >
            {data.savedAddressOptions.length > 0 ? (
              <View style={styles.savedAddressRail}>
                {data.savedAddressOptions.map((savedAddress) => {
                  const fullAddress = savedAddresses.find(
                    (item) => item.id === savedAddress.id,
                  );
                  return (
                    <Pressable
                      key={savedAddress.id}
                      style={[
                        styles.savedAddressChip,
                        savedAddress.isSelected && styles.savedAddressChipSelected,
                      ]}
                      onPress={() => {
                        if (fullAddress) {
                          onSavedAddressPress(fullAddress);
                        }
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Use ${savedAddress.label} address`}
                    >
                      {savedAddress.isSelected ? (
                        <Home color={palette.mintDeep} size={14} strokeWidth={2.4} />
                      ) : (
                        <MapPin color={palette.mintDeep} size={14} strokeWidth={2.4} />
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
                        <Text
                          style={styles.savedAddressText}
                          numberOfLines={1}
                        >
                          {savedAddress.address}
                        </Text>
                      </View>
                    </Pressable>
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
            {addressGeoResult ? (
              <AddressVerificationPreview result={addressGeoResult} />
            ) : null}
            <Pressable
              style={[styles.saveHomeButton, data.saveAddressDisabled && styles.faded]}
              onPress={onSaveAddressAsHome}
              disabled={data.saveAddressDisabled}
              accessibilityRole="button"
              accessibilityLabel="Save service address as home"
            >
              <Home color={palette.mintDeep} size={15} strokeWidth={2.4} />
              <Text style={styles.smallActionText}>{data.saveAddressLabel}</Text>
            </Pressable>
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

      <View style={styles.stickyFooter}>
        <View style={styles.footerTotalRow}>
          <View style={styles.footerTotalCopy}>
            <Text style={styles.footerTotalLabel}>Provider rate estimate</Text>
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
        <Pressable
          style={[styles.footerButton, !data.canContinue && styles.footerButtonDisabled]}
          onPress={onContinue}
          disabled={!data.canContinue}
          accessibilityRole="button"
        >
          <Text style={styles.footerButtonText}>{data.continueLabel}</Text>
        </Pressable>
        <Text style={styles.footerLink} onPress={onBackToProvider}>
          Back to provider
        </Text>
      </View>
    </>
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
  inlineActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
    gap: spacing.xs,
  },
  smallAction: {
    alignItems: 'center',
    backgroundColor: '#F1FAF5',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.xxs,
    justifyContent: 'center',
    minHeight: 34,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  smallActionText: {
    color: palette.mintDeep,
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
