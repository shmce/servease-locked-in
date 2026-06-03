import { StyleSheet } from 'react-native';
import { Upload } from 'lucide-react-native';
import { palette, spacing } from '../../../theme/serveaseDesign';
import { MediaUploadBox } from '../../../shared/components/ScreenLayout';
import {
  ProviderButton,
  ProviderCard,
  ProviderContent,
  ProviderHeader,
  ProviderScreen,
  ProviderTextField,
} from '../../../shared/components/ProviderUI';
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
    <ProviderScreen>
      <ProviderContent>
        <ProviderHeader
          title="Report Issue"
          subtitle={bookingReference}
          onBack={onBack}
        />
        <ProviderCard style={styles.formCard}>
          <ProviderTextField
            label="Issue subject"
            value={providerReportReason}
            onChangeText={onProviderReportReasonChange}
            placeholder="What happened?"
          />
          <ProviderTextField
            label="Details"
            value={providerReportDetails}
            onChangeText={onProviderReportDetailsChange}
            placeholder="Describe the issue for support review."
            multiline
          />
          <MediaUploadBox
            imageUri={reportEvidencePhotoUri}
            icon={<Upload color={palette.mintDeep} size={32} strokeWidth={2} />}
            helper="Upload photos or videos"
            label={data.evidenceLabel}
            onPress={onPickEvidence}
            minHeight={132}
          />
          <ProviderButton
            label={data.submitLabel}
            onPress={() => void onSubmitReport()}
            disabled={!data.canSubmit}
          />
        </ProviderCard>
      </ProviderContent>
    </ProviderScreen>
  );
}

const styles = StyleSheet.create({
  formCard: {
    gap: spacing.md,
  },
});
