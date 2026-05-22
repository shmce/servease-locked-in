import { FileText } from 'lucide-react-native';
import { Linking, StyleSheet, Text, View } from 'react-native';
import {
  Badge,
  Card,
  EmptyState,
  PrimaryButton,
  TopBar,
} from '../../../components/DesignKit';
import {
  ScreenContent,
  ScreenScroll,
} from '../../../shared/components/ScreenLayout';
import type {
  ProviderApplicationDocumentSummary,
  ProviderApplicationStatus,
} from '../../../shared/models/types';
import { palette, spacing, type } from '../../../theme/serveaseDesign';
import { useProviderApplicationDocumentsViewModel } from '../viewModels/useProviderApplicationDocumentsViewModel';

type ProviderApplicationDocumentsScreenProps = {
  providerApplication: ProviderApplicationStatus | null;
  documents: ProviderApplicationDocumentSummary[];
  busyAction: string | null;
  onBack: () => void;
  onRefresh: () => void;
  onUploadDocument: (documentType: string) => void;
};

export function ProviderApplicationDocumentsScreen({
  providerApplication,
  documents,
  busyAction,
  onBack,
  onRefresh,
  onUploadDocument,
}: ProviderApplicationDocumentsScreenProps) {
  const providerDocuments = useProviderApplicationDocumentsViewModel({
    documents,
    busyAction,
  });
  const { data } = providerDocuments;

  return (
    <>
      <TopBar
        title="Application Documents"
        subtitle={providerApplication?.verificationStatus ?? 'Provider review'}
        onBack={onBack}
        right={
          <PrimaryButton
            label="Refresh"
            variant="secondary"
            onPress={onRefresh}
            disabled={data.refreshDisabled}
          />
        }
      />
      <ScreenScroll>
        <ScreenContent>
          <Card>
            <View style={styles.summaryRow}>
              <View style={styles.summaryIcon}>
                <FileText color={palette.mint} size={22} strokeWidth={2.4} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.summaryTitle}>{data.progressLabel}</Text>
                <Text style={styles.summaryBody}>
                  Uploaded documents are saved to your provider application for
                  admin review.
                </Text>
              </View>
              <Badge
                label={data.isComplete ? 'Ready' : 'Missing'}
                tone={data.isComplete ? 'success' : 'warning'}
              />
            </View>
          </Card>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Required Files</Text>
            {data.slots.length > 0 ? (
              data.slots.map((slot) => (
                <Card key={slot.id}>
                  <View style={styles.slotHeader}>
                    <View style={styles.flex}>
                      <View style={styles.titleRow}>
                        <Text style={styles.slotTitle}>{slot.title}</Text>
                        {slot.required ? (
                          <Text style={styles.requiredLabel}>Required</Text>
                        ) : null}
                      </View>
                      <Text style={styles.slotBody}>{slot.body}</Text>
                      {slot.updatedLabel ? (
                        <Text style={styles.slotMeta}>{slot.updatedLabel}</Text>
                      ) : null}
                    </View>
                    <Badge label={slot.statusLabel} tone={slot.statusTone} />
                  </View>
                  <View style={styles.actionRow}>
                    <PrimaryButton
                      label={slot.actionLabel}
                      onPress={() => onUploadDocument(slot.id)}
                      disabled={slot.isActionDisabled}
                    />
                    {slot.document?.previewUrl ? (
                      <PrimaryButton
                        label="Preview"
                        variant="secondary"
                        onPress={() =>
                          void Linking.openURL(slot.document?.previewUrl ?? '')
                        }
                      />
                    ) : null}
                  </View>
                </Card>
              ))
            ) : (
              <EmptyState
                title="No document slots"
                body="Application document requirements are not available yet."
              />
            )}
          </View>
        </ScreenContent>
      </ScreenScroll>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  summaryRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
  },
  summaryIcon: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  summaryTitle: {
    ...type.section,
  },
  summaryBody: {
    ...type.body,
    marginTop: spacing.xs,
  },
  sectionBlock: {
    gap: spacing.sm,
  },
  sectionLabel: {
    color: palette.faint,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    paddingHorizontal: spacing.xs,
    textTransform: 'uppercase',
  },
  slotHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.base,
    justifyContent: 'space-between',
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  slotTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  requiredLabel: {
    color: palette.mint,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  slotBody: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  slotMeta: {
    color: palette.faint,
    fontSize: 12,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
