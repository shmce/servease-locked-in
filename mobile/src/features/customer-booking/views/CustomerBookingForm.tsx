import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Navigation, Upload } from 'lucide-react-native';
import {
  Card,
  Field,
  PrimaryButton,
  Section,
  TopBar,
} from '../../../components/DesignKit';
import { CustomerBookingSchedulePicker } from './CustomerBookingSchedulePicker';
import { palette, radius, spacing, type } from '../../../theme/serveaseDesign';
import {
  GeoAddressResult,
  ProviderAvailabilitySchedule,
  ProviderListing,
} from '../../../shared/models/types';
import {
  MediaUploadBox,
  StickyFooter,
} from '../../../shared/components/ScreenLayout';
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
    bookingReferencePhotoUrl,
    busyAction,
  });
  const { data } = bookingForm;

  return (
    <>
      <TopBar
        title="Book Service"
        subtitle="Step 1 of 2 - Choose details"
        onBack={onBack}
      />
      <ScrollView contentContainerStyle={styles.withStickyFooter}>
        <View style={styles.content}>
          <Card>
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
          </Card>

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

          <Section
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
                  <Navigation color={palette.mint} size={14} strokeWidth={2.5} />
                  <Text style={styles.smallActionText}>{data.useCurrentLocationLabel}</Text>
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
          </Section>

          <Section title="Add details (optional)">
            <Field
              label="Tell the provider what you need"
              value={notes}
              onChangeText={onNotesChange}
              placeholder="Example: Kitchen sink leak under cabinet"
              multiline
            />
            <MediaUploadBox
              imageUri={bookingReferencePhotoUri}
              icon={<Upload color={palette.mint} size={28} />}
              helper="Reference photo (optional)"
              label={data.referencePhotoLabel}
              onPress={onUploadReferencePhoto}
              minHeight={132}
              previewHeight={120}
            />
          </Section>
        </View>
      </ScrollView>
      <StickyFooter>
        <View style={styles.footerTotalRow}>
          <View>
            <Text style={styles.footerTotalLabel}>Estimated total</Text>
            <Text style={styles.cardMeta}>
              {data.footerRateLabel} - callout fee {data.calloutFeeLabel}
            </Text>
          </View>
          <Text style={styles.footerTotalValue}>{data.estimatedTotalLabel}</Text>
        </View>
        {data.continueNotice ? (
          <Text style={styles.noticeText}>{data.continueNotice}</Text>
        ) : null}
        <PrimaryButton
          label="Continue to Review"
          onPress={onContinue}
          disabled={!data.canContinue}
        />
        <Text style={styles.footerLink} onPress={onBackToProvider}>
          Back to provider
        </Text>
      </StickyFooter>
    </>
  );
}

const styles = StyleSheet.create({
  withStickyFooter: {
    backgroundColor: palette.white,
    flexGrow: 1,
    paddingBottom: 132,
  },
  content: {
    gap: spacing.md,
    padding: spacing.md,
  },
  providerSummaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  providerPhoto: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    borderRadius: radius.pill,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  providerPhotoText: {
    color: palette.white,
    fontSize: 22,
    fontWeight: '700',
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
    backgroundColor: palette.mintSoft,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.xxs,
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  smallActionText: {
    color: palette.mint,
    fontSize: 12,
    fontWeight: '700',
  },
  faded: {
    opacity: 0.5,
  },
  footerTotalRow: {
    alignItems: 'center',
    borderBottomColor: palette.lineSoft,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
  },
  footerTotalLabel: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  footerTotalValue: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  footerLink: {
    color: palette.mint,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  cardTitle: {
    ...type.section,
    color: palette.ink,
  },
  cardMeta: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  linkText: {
    color: palette.mint,
    fontSize: 13,
    fontWeight: '700',
  },
  noticeText: {
    ...type.caption,
    color: palette.muted,
    textAlign: 'center',
  },
});
