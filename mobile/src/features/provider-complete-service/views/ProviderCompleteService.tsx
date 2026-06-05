import { StyleSheet, Text, View } from 'react-native';
import { Upload } from 'lucide-react-native';
import {
  BookingSummary,
  PaymentSummary,
} from '../../../shared/models/types';
import { palette, spacing } from '../../../theme/serveaseDesign';
import { MediaUploadBox } from '../../../shared/components/ScreenLayout';
import {
  ProviderButton,
  ProviderCard,
  ProviderContent,
  ProviderHeader,
  ProviderScreen,
  ProviderStickyFooter,
  ProviderTextField,
  providerText,
} from '../../../shared/components/ProviderUI';
import { useProviderCompleteServiceViewModel } from '../viewModels/useProviderCompleteServiceViewModel';

type ProviderCompleteServiceScreenProps = {
  booking: BookingSummary;
  busyAction: string | null;
  completionNotes: string;
  completionPhotoUri: string | null;
  completionPhotoUrl: string | null;
  payment: PaymentSummary | null;
  onBack: () => void;
  onCompleteService: () => Promise<void>;
  onCompletionNotesChange: (notes: string) => void;
  onPickCompletionPhoto: () => void;
};

export function ProviderCompleteServiceScreen({
  booking,
  busyAction,
  completionNotes,
  completionPhotoUri,
  completionPhotoUrl,
  payment,
  onBack,
  onCompleteService,
  onCompletionNotesChange,
  onPickCompletionPhoto,
}: ProviderCompleteServiceScreenProps) {
  const completeService = useProviderCompleteServiceViewModel({
    booking,
    busyAction,
    completionPhotoUri,
    completionPhotoUrl,
    payment,
  });
  const { data } = completeService;

  return (
    <>
      <ProviderScreen bottomInset={148}>
        <ProviderContent>
          <ProviderHeader
            title="Complete Service"
            subtitle={data.bookingReference}
            onBack={onBack}
          />
          <ProviderCard>
            <Text style={styles.operationalTitle}>Finish and submit</Text>
            <Text style={styles.cardBody}>
              Add final notes before marking this service as completed.
            </Text>
          </ProviderCard>
          <ProviderCard>
            <Text style={styles.cardTitle}>Completion summary</Text>
            <Text style={styles.noticeText}>{data.paymentNotice}</Text>
            {data.summaryRows.map((row) => (
              <View key={row.key} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue}>{row.value}</Text>
              </View>
            ))}
          </ProviderCard>
          <ProviderCard>
            <ProviderTextField
              label="Final notes"
              value={completionNotes}
              onChangeText={onCompletionNotesChange}
              placeholder="What was completed?"
              multiline
            />
            <MediaUploadBox
              imageUri={completionPhotoUri}
              icon={<Upload color={palette.mintDeep} size={28} strokeWidth={2.5} />}
              label={data.completionPhotoActionLabel}
              onPress={onPickCompletionPhoto}
              minHeight={132}
            />
            {data.completionPhotoUploaded ? (
              <Text style={styles.noticeText}>Completion photo uploaded.</Text>
            ) : null}
          </ProviderCard>
        </ProviderContent>
      </ProviderScreen>
      <ProviderStickyFooter maxWidth={420}>
        <ProviderButton
          label={data.submitLabel}
          onPress={() => void onCompleteService()}
          disabled={data.submitDisabled}
        />
        <Text style={styles.footerLink} onPress={onBack}>
          Keep working
        </Text>
      </ProviderStickyFooter>
    </>
  );
}

const styles = StyleSheet.create({
  operationalTitle: {
    color: '#202733',
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 0,
  },
  cardTitle: {
    ...providerText.title,
    fontSize: 15,
    lineHeight: 20,
  },
  cardBody: {
    ...providerText.body,
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  infoLabel: {
    color: '#6D7480',
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  infoValue: {
    color: '#202733',
    flex: 1.3,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
  },
  linkText: {
    color: palette.mintDeep,
    fontSize: 13,
    fontWeight: '600',
  },
  noticeText: {
    color: '#6D7480',
    fontSize: 12,
    fontWeight: '500',
  },
  footerLink: {
    color: palette.mintDeep,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
