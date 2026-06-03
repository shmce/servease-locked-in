import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CheckCircle, FileText, MessageCircle, Upload } from 'lucide-react-native';
import {
  CustomerCard,
  CustomerContent,
  CustomerHeader,
  CustomerIconBlock,
  CustomerScreen,
  CustomerSection,
  customerText,
} from '../../../shared/components/CustomerUI';
import { MediaUploadBox } from '../../../shared/components/ScreenLayout';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { useCustomerReportIssueViewModel } from '../viewModels/useCustomerReportIssueViewModel';

type CustomerReportIssueScreenProps = {
  bookingReference: string;
  supportSubject: string;
  supportMessage: string;
  desiredResolution: string;
  reportEvidencePhotoUri: string | null;
  reportEvidencePhotoUrl: string | null;
  busyAction: string | null;
  onBack: () => void;
  onIssueTypeChange: (issue: string) => void;
  onSupportMessageChange: (message: string) => void;
  onPickEvidence: () => void;
  onDesiredResolutionChange: (resolution: string) => void;
  onSubmitIssue: () => Promise<void>;
};

export function CustomerReportIssueScreen({
  bookingReference,
  supportSubject,
  supportMessage,
  desiredResolution,
  reportEvidencePhotoUri,
  reportEvidencePhotoUrl,
  busyAction,
  onBack,
  onIssueTypeChange,
  onSupportMessageChange,
  onPickEvidence,
  onDesiredResolutionChange,
  onSubmitIssue,
}: CustomerReportIssueScreenProps) {
  const reportIssue = useCustomerReportIssueViewModel({
    supportSubject,
    supportMessage,
    desiredResolution,
    evidencePhotoUrl: reportEvidencePhotoUrl,
    busyAction,
  });
  const { data } = reportIssue;

  return (
    <CustomerScreen>
      <CustomerContent>
        <CustomerHeader
          title="Report Issue"
          subtitle="Tell us what happened so support can help quickly"
          onBack={onBack}
        />

        <CustomerCard>
          <View style={styles.bookingRow}>
            <CustomerIconBlock compact>
              <FileText color={palette.mintDeep} size={18} strokeWidth={2.1} />
            </CustomerIconBlock>
            <View style={styles.flex}>
              <Text style={styles.label}>Booking ID</Text>
              <Text style={styles.bookingReference} numberOfLines={1}>
                {bookingReference}
              </Text>
            </View>
          </View>
        </CustomerCard>

        <CustomerSection title="Issue type">
          <View style={styles.wrap}>
            {data.issueTypeRows.map((row) => (
              <Pressable
                key={row.issue}
                style={[styles.choiceChip, row.selected && styles.choiceChipSelected]}
                onPress={() => onIssueTypeChange(row.issue)}
                accessibilityRole="button"
                accessibilityState={{ selected: row.selected }}
              >
                <Text
                  style={[
                    styles.choiceChipText,
                    row.selected && styles.choiceChipTextSelected,
                  ]}
                  numberOfLines={1}
                >
                  {row.issue}
                </Text>
              </Pressable>
            ))}
          </View>
        </CustomerSection>

        <CustomerSection title="Description">
          <View style={styles.inputCard}>
            <View style={styles.fieldHeader}>
              <MessageCircle color={palette.mintDeep} size={18} strokeWidth={2.1} />
              <Text style={styles.label}>What should we know?</Text>
            </View>
            <TextInput
              style={styles.textArea}
              value={supportMessage}
              onChangeText={onSupportMessageChange}
              placeholder="Describe the issue..."
              placeholderTextColor="#A7AFB8"
              multiline
              textAlignVertical="top"
            />
          </View>
        </CustomerSection>

        <CustomerSection title="Evidence">
          <MediaUploadBox
            imageUri={reportEvidencePhotoUri}
            icon={<Upload color={palette.mintDeep} size={30} strokeWidth={2} />}
            helper="Upload photos or videos"
            label={data.evidenceLabel}
            onPress={onPickEvidence}
            minHeight={132}
          />
        </CustomerSection>

        <CustomerSection title="Desired resolution">
          <View style={styles.radioGroup}>
            {data.resolutionRows.map((row) => (
              <Pressable
                key={row.resolution}
                style={[styles.radioRow, row.selected && styles.radioRowSelected]}
                onPress={() => onDesiredResolutionChange(row.resolution)}
                accessibilityRole="radio"
                accessibilityState={{ checked: row.selected }}
              >
                <Text style={styles.radioLabel} numberOfLines={2}>
                  {row.resolution}
                </Text>
                {row.selected ? (
                  <CheckCircle color={palette.mintDeep} size={20} strokeWidth={2.2} />
                ) : (
                  <View style={styles.radioEmpty} />
                )}
              </Pressable>
            ))}
          </View>
        </CustomerSection>

        <Pressable
          style={[styles.submitButton, !data.canSubmit && styles.submitButtonDisabled]}
          onPress={() => void onSubmitIssue()}
          disabled={!data.canSubmit}
          accessibilityRole="button"
        >
          <Text style={styles.submitButtonText}>Raise dispute</Text>
        </Pressable>
      </CustomerContent>
    </CustomerScreen>
  );
}

const styles = StyleSheet.create({
  bookingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    ...customerText.meta,
    color: '#7A828D',
  },
  bookingReference: {
    ...customerText.title,
    fontSize: 15,
    lineHeight: 20,
    marginTop: 2,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  choiceChip: {
    backgroundColor: palette.white,
    borderColor: '#EEF0F2',
    borderRadius: radius.pill,
    borderWidth: 1,
    maxWidth: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  choiceChipSelected: {
    backgroundColor: '#F1FAF5',
    borderColor: 'rgba(0,160,85,0.35)',
  },
  choiceChipText: {
    color: '#68717E',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 18,
  },
  choiceChipTextSelected: {
    color: palette.mintDeep,
    fontWeight: '600',
  },
  inputCard: {
    backgroundColor: palette.white,
    borderColor: '#EEF0F2',
    borderRadius: 10,
    borderWidth: 1,
    gap: spacing.sm,
    padding: 14,
  },
  fieldHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  textArea: {
    ...customerText.body,
    minHeight: 118,
    padding: 0,
  },
  radioGroup: {
    gap: spacing.sm,
  },
  radioRow: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: '#EEF0F2',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: 14,
    paddingVertical: spacing.md,
  },
  radioRowSelected: {
    backgroundColor: '#F1FAF5',
    borderColor: 'rgba(0,160,85,0.28)',
  },
  radioEmpty: {
    borderColor: '#CBD2D9',
    borderRadius: radius.pill,
    borderWidth: 1.5,
    height: 18,
    width: 18,
  },
  radioLabel: {
    ...customerText.title,
    flex: 1,
    fontSize: 14,
    lineHeight: 19,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: palette.mintDeep,
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  submitButtonDisabled: {
    opacity: 0.45,
  },
  submitButtonText: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 20,
  },
});
