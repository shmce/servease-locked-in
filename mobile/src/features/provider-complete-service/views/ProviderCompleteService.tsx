import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
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
            <Pressable
              style={styles.uploadBox}
              onPress={onPickCompletionPhoto}
              accessibilityRole="button"
            >
              {completionPhotoUri ? (
                <Image source={{ uri: completionPhotoUri }} style={styles.uploadPreview} />
              ) : (
                <Upload color={palette.mint} size={28} strokeWidth={2.5} />
              )}
              <Text style={styles.linkText}>{data.completionPhotoActionLabel}</Text>
            </Pressable>
            {data.completionPhotoUploaded ? (
              <Text style={styles.noticeText}>Completion photo uploaded.</Text>
            ) : null}
          </Card>
        </View>
      </ScrollView>
      <View style={styles.stickyFooter}>
        <PrimaryButton
          label="Mark as Completed"
          onPress={() => void onCompleteService()}
          disabled={data.submitDisabled}
        />
        <Text style={styles.footerLink} onPress={onBack}>
          Keep working
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
  stickyFooter: {
    alignSelf: 'center',
    backgroundColor: palette.white,
    borderTopColor: palette.lineSoft,
    borderTopWidth: 1,
    bottom: 0,
    gap: spacing.sm,
    maxWidth: 420,
    padding: spacing.lg,
    position: 'absolute',
    width: '100%',
  },
  footerHomeIndicator: {
    alignSelf: 'center',
    backgroundColor: palette.line,
    borderRadius: radius.pill,
    height: 4,
    marginTop: spacing.xs,
    width: 88,
  },
  operationalTitle: {
    color: palette.ink,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0,
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  cardBody: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
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
  uploadBox: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.lineSoft,
    borderRadius: radius.lg,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 136,
    overflow: 'hidden',
    padding: spacing.lg,
  },
  uploadPreview: {
    borderRadius: radius.md,
    height: 116,
    width: '100%',
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
