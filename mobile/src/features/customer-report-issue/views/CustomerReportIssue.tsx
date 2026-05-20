import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Upload } from 'lucide-react-native';
import {
  Field,
  Pill,
  PrimaryButton,
  Section,
  TopBar,
} from '../../../components/DesignKit';
import { palette, radius, spacing, type } from '../../../theme/serveaseDesign';
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
    <>
      <TopBar title="Report an Issue" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.content}>
          <View style={styles.lockedField}>
            <Text style={styles.label}>Booking ID</Text>
            <View style={styles.lockedInput}>
              <Text style={styles.cardMeta}>{bookingReference}</Text>
            </View>
          </View>
          <Section title="Issue type">
            <View style={styles.wrap}>
              {data.issueTypeRows.map((row) => (
                <Pill
                  key={row.issue}
                  label={row.issue}
                  selected={row.selected}
                  onPress={() => onIssueTypeChange(row.issue)}
                />
              ))}
            </View>
          </Section>
          <Field
            label="Description"
            value={supportMessage}
            onChangeText={onSupportMessageChange}
            placeholder="Describe the issue..."
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
          <Section title="Desired resolution">
            <View style={styles.radioGroup}>
              {data.resolutionRows.map((row) => (
                <Pressable
                  key={row.resolution}
                  style={styles.radioRow}
                  onPress={() => onDesiredResolutionChange(row.resolution)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: row.selected }}
                >
                  <View
                    style={[
                      styles.radioOuter,
                      row.selected && styles.radioOuterSelected,
                    ]}
                  >
                    {row.selected ? <View style={styles.radioInner} /> : null}
                  </View>
                  <Text style={styles.radioLabel}>{row.resolution}</Text>
                </Pressable>
              ))}
            </View>
          </Section>
          <PrimaryButton
            label="Raise dispute"
            onPress={() => void onSubmitIssue()}
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
  lockedField: {
    gap: spacing.xs,
  },
  label: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  lockedInput: {
    backgroundColor: palette.lineSoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  uploadBox: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.lineSoft,
    borderRadius: radius.lg,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: spacing.sm,
    minHeight: 136,
    justifyContent: 'center',
    overflow: 'hidden',
    padding: spacing.lg,
  },
  uploadPreview: {
    borderRadius: radius.md,
    height: 116,
    width: '100%',
  },
  radioGroup: {
    gap: spacing.sm,
  },
  radioRow: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.lineSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  radioOuter: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.mint,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  radioOuterSelected: {
    borderColor: palette.mint,
  },
  radioInner: {
    backgroundColor: palette.mint,
    borderRadius: radius.pill,
    height: 10,
    width: 10,
  },
  radioLabel: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '700',
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
