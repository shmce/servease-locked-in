import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Upload } from 'lucide-react-native';
import {
  Field,
  PrimaryButton,
  TopBar,
} from '../../../components/DesignKit';
import { palette, radius, spacing, type } from '../../../theme/serveaseDesign';
import { useProviderReportIssueViewModel } from '../viewModels/useProviderReportIssueViewModel';

type ProviderReportIssueScreenProps = {
  bookingReference: string;
  busyAction: string | null;
  providerReportDetails: string;
  providerReportReason: string;
  reportEvidencePhotoUri: string | null;
  reportEvidencePhotoUrl: string | null;
  onBack: () => void;
  onPickEvidence: () => void;
  onProviderReportDetailsChange: (details: string) => void;
  onProviderReportReasonChange: (reason: string) => void;
  onSubmitReport: () => Promise<void>;
};

export function ProviderReportIssueScreen({
  bookingReference,
  busyAction,
  providerReportDetails,
  providerReportReason,
  reportEvidencePhotoUri,
  reportEvidencePhotoUrl,
  onBack,
  onPickEvidence,
  onProviderReportDetailsChange,
  onProviderReportReasonChange,
  onSubmitReport,
}: ProviderReportIssueScreenProps) {
  const reportIssue = useProviderReportIssueViewModel({
    providerReportDetails,
    providerReportReason,
    reportEvidencePhotoUrl,
    busyAction,
  });
  const { data } = reportIssue;

  return (
    <>
      <TopBar
        title="Report Issue"
        subtitle={bookingReference}
        onBack={onBack}
      />
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.content}>
          <Field
            label="Issue subject"
            value={providerReportReason}
            onChangeText={onProviderReportReasonChange}
            placeholder="What happened?"
          />
          <Field
            label="Details"
            value={providerReportDetails}
            onChangeText={onProviderReportDetailsChange}
            placeholder="Describe the issue for support review."
            multiline
          />
          <Pressable
            style={styles.uploadBox}
            onPress={onPickEvidence}
            accessibilityRole="button"
          >
            {reportEvidencePhotoUri ? (
              <Image source={{ uri: reportEvidencePhotoUri }} style={styles.uploadPreview} />
            ) : (
              <Upload color={palette.mint} size={32} strokeWidth={2} />
            )}
            <Text style={styles.cardMeta}>Upload photos or videos</Text>
            <Text style={styles.linkText}>{data.evidenceLabel}</Text>
          </Pressable>
          <PrimaryButton
            label={data.submitLabel}
            onPress={() => void onSubmitReport()}
            disabled={!data.canSubmit}
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  withBottomNav: {
    backgroundColor: palette.cream,
    flexGrow: 1,
    paddingBottom: 108,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.xl,
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
  cardMeta: {
    ...type.caption,
    color: palette.muted,
  },
  linkText: {
    color: palette.mint,
    fontSize: 13,
    fontWeight: '900',
  },
});
