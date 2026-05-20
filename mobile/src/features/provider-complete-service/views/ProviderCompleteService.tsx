import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Upload } from 'lucide-react-native';
import {
  Card,
  Field,
  PrimaryButton,
  TopBar,
} from '../../../components/DesignKit';
import {
  BookingSummary,
  PaymentSummary,
} from '../../../shared/models/types';
import { palette, spacing } from '../../../theme/serveaseDesign';
import {
  MediaUploadBox,
  StickyFooter,
} from '../../../shared/components/ScreenLayout';
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
      <TopBar
        title="Complete Service"
        subtitle={data.bookingReference}
        onBack={onBack}
      />
      <ScrollView contentContainerStyle={styles.withStickyFooter}>
        <View style={styles.content}>
          <Card>
            <Text style={styles.operationalTitle}>Finish and submit</Text>
            <Text style={styles.cardBody}>
              Add final notes before marking this service as completed.
            </Text>
          </Card>
          <Card>
            <Text style={styles.cardTitle}>Completion summary</Text>
            {data.summaryRows.map((row) => (
              <View key={row.key} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue}>{row.value}</Text>
              </View>
            ))}
          </Card>
          <Card>
            <Field
              label="Final notes"
              value={completionNotes}
              onChangeText={onCompletionNotesChange}
              placeholder="What was completed?"
              multiline
            />
            <MediaUploadBox
              imageUri={completionPhotoUri}
              icon={<Upload color={palette.mint} size={28} strokeWidth={2.5} />}
              label={data.completionPhotoActionLabel}
              onPress={onPickCompletionPhoto}
              minHeight={132}
            />
            {data.completionPhotoUploaded ? (
              <Text style={styles.noticeText}>Completion photo uploaded.</Text>
            ) : null}
          </Card>
        </View>
      </ScrollView>
      <StickyFooter maxWidth={420}>
        <PrimaryButton
          label="Mark as Completed"
          onPress={() => void onCompleteService()}
          disabled={data.submitDisabled}
        />
        <Text style={styles.footerLink} onPress={onBack}>
          Keep working
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
  operationalTitle: {
    color: palette.ink,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0,
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  cardBody: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  infoLabel: {
    color: palette.faint,
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  infoValue: {
    color: palette.ink,
    flex: 1.3,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
  },
  linkText: {
    color: palette.mint,
    fontSize: 13,
    fontWeight: '900',
  },
  noticeText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  footerLink: {
    color: palette.mint,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
});
