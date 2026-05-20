import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
            <Field
              label="Duration (hours)"
              value={hoursRequired}
              onChangeText={onHoursRequiredChange}
              keyboardType="number-pad"
              placeholder="1"
            />
          </Section>

          <Section title="Add details (optional)">
            <Field
              label="Tell the provider what you need"
              value={notes}
              onChangeText={onNotesChange}
              placeholder="Example: Kitchen sink leak under cabinet"
              multiline
            />
            <Pressable
              style={styles.uploadBox}
              onPress={onUploadReferencePhoto}
              accessibilityRole="button"
            >
              {bookingReferencePhotoUri ? (
                <Image source={{ uri: bookingReferencePhotoUri }} style={styles.uploadPreview} />
              ) : (
                <Upload color={palette.mint} size={28} />
              )}
              <Text style={styles.cardMeta}>Reference photo (optional)</Text>
              <Text style={styles.linkText}>{data.referencePhotoLabel}</Text>
            </Pressable>
          </Section>
        </View>
      </ScrollView>
      <View style={styles.stickyFooter}>
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
        <View style={styles.footerHomeIndicator} />
      </View>
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
    gap: spacing.lg,
    padding: spacing.xl,
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
    fontWeight: '900',
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
    fontWeight: '900',
  },
  faded: {
    opacity: 0.5,
  },
  uploadBox: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderColor: palette.line,
    borderRadius: radius.md,
    borderStyle: 'dashed',
    borderWidth: 2,
    gap: spacing.sm,
    minHeight: 160,
    paddingVertical: spacing.xxl,
  },
  uploadPreview: {
    borderRadius: radius.md,
    height: 120,
    width: '100%',
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
    fontWeight: '900',
  },
  footerTotalValue: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  stickyFooter: {
    alignSelf: 'center',
    backgroundColor: palette.white,
    borderTopColor: palette.lineSoft,
    borderTopWidth: 1,
    bottom: 0,
    gap: spacing.sm,
    left: 0,
    maxWidth: 393,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    position: 'absolute',
    right: 0,
    width: '100%',
  },
  footerLink: {
    color: palette.mint,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  footerHomeIndicator: {
    alignSelf: 'center',
    backgroundColor: palette.ink,
    borderRadius: radius.pill,
    height: 5,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
    width: 134,
  },
  cardTitle: {
    ...type.section,
    color: palette.ink,
  },
  cardMeta: {
    ...type.caption,
    color: palette.muted,
  },
  linkText: {
    color: palette.mint,
    fontSize: 13,
    fontWeight: '900',
  },
  noticeText: {
    ...type.caption,
    color: palette.muted,
    textAlign: 'center',
  },
});
