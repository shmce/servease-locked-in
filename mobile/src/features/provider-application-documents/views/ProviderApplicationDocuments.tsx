import { FileText } from 'lucide-react-native';
import { Linking, StyleSheet, Text, View } from 'react-native';
import {
  ProviderActionRow,
  ProviderBadge,
  ProviderButton,
  ProviderCard,
  ProviderContent,
  ProviderEmptyState,
  ProviderHeader,
  ProviderIconBlock,
  ProviderScreen,
  ProviderSection,
  providerText,
} from '../../../shared/components/ProviderUI';
import type {
  ProviderApplicationDocumentSummary,
  ProviderApplicationStatus,
} from '../../../shared/models/types';
import { palette, spacing } from '../../../theme/serveaseDesign';
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
    <ProviderScreen>
      <ProviderContent>
        <ProviderHeader
          title="Application Documents"
          subtitle={providerApplication?.verificationStatus ?? 'Provider review'}
          onBack={onBack}
          right={
            <ProviderButton
              label="Refresh"
              variant="secondary"
              onPress={onRefresh}
              disabled={data.refreshDisabled}
            />
          }
        />

        <ProviderCard>
          <View style={styles.summaryRow}>
            <ProviderIconBlock>
              <FileText color={palette.mintDeep} size={24} strokeWidth={2.3} />
            </ProviderIconBlock>
            <View style={styles.flex}>
              <Text style={styles.summaryTitle}>{data.progressLabel}</Text>
              <Text style={styles.summaryBody}>
                Uploaded documents are saved to your provider application for
                admin review.
              </Text>
            </View>
            <ProviderBadge
              label={data.isComplete ? 'Ready' : 'Missing'}
              tone={data.isComplete ? 'success' : 'warning'}
            />
          </View>
        </ProviderCard>

        <ProviderSection title="Required Files">
          {data.slots.length > 0 ? (
            data.slots.map((slot) => (
              <ProviderCard key={slot.id}>
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
                  <ProviderBadge label={slot.statusLabel} tone={slot.statusTone} />
                </View>
                <ProviderActionRow>
                  <ProviderButton
                    label={slot.actionLabel}
                    onPress={() => onUploadDocument(slot.id)}
                    disabled={slot.isActionDisabled}
                  />
                  {slot.document?.previewUrl ? (
                    <ProviderButton
                      label="Preview"
                      variant="secondary"
                      onPress={() => void Linking.openURL(slot.document?.previewUrl ?? '')}
                    />
                  ) : null}
                </ProviderActionRow>
              </ProviderCard>
            ))
          ) : (
            <ProviderEmptyState
              title="No document slots"
              body="Application document requirements are not available yet."
            />
          )}
        </ProviderSection>
      </ProviderContent>
    </ProviderScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  summaryRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.base,
  },
  summaryTitle: {
    ...providerText.title,
    fontSize: 16,
    lineHeight: 21,
  },
  summaryBody: {
    ...providerText.body,
    marginTop: spacing.xs,
  },
  slotHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.base,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  slotTitle: {
    color: '#202733',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 21,
  },
  requiredLabel: {
    color: palette.mintDeep,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
    textTransform: 'uppercase',
  },
  slotBody: {
    ...providerText.body,
    marginTop: spacing.xs,
  },
  slotMeta: {
    ...providerText.meta,
    marginTop: spacing.xs,
  },
});
