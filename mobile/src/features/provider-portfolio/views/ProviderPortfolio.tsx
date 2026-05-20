import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image as ImageIcon, Trash2 } from 'lucide-react-native';
import {
  EmptyState,
  Field,
  PrimaryButton,
  TopBar,
} from '../../../components/DesignKit';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { ProviderPortfolioMediaSummary } from '../../../shared/models/types';
import {
  ActionRow,
  MediaUploadBox,
} from '../../../shared/components/ScreenLayout';
import { useProviderPortfolioViewModel } from '../viewModels/useProviderPortfolioViewModel';

type ProviderPortfolioScreenProps = {
  providerPortfolioMedia: ProviderPortfolioMediaSummary[];
  providerPortfolioPhotoUri: string | null;
  hasUploadedPortfolioPhoto: boolean;
  editingPortfolioCaptionId: string | null;
  portfolioCaptionDraft: string;
  busyAction: string | null;
  onBack: () => void;
  onRefresh: () => void;
  onUploadPortfolioMedia: () => void;
  onPortfolioCaptionDraftChange: (value: string) => void;
  onSavePortfolioCaption: (item: ProviderPortfolioMediaSummary) => void;
  onCancelPortfolioCaption: () => void;
  onMovePortfolioMedia: (mediaId: string, direction: -1 | 1) => void;
  onStartPortfolioCaptionEdit: (item: ProviderPortfolioMediaSummary) => void;
  onRemovePortfolioMedia: (mediaId: string) => void;
};

export function ProviderPortfolioScreen({
  providerPortfolioMedia,
  providerPortfolioPhotoUri,
  hasUploadedPortfolioPhoto,
  editingPortfolioCaptionId,
  portfolioCaptionDraft,
  busyAction,
  onBack,
  onRefresh,
  onUploadPortfolioMedia,
  onPortfolioCaptionDraftChange,
  onSavePortfolioCaption,
  onCancelPortfolioCaption,
  onMovePortfolioMedia,
  onStartPortfolioCaptionEdit,
  onRemovePortfolioMedia,
}: ProviderPortfolioScreenProps) {
  const providerPortfolio = useProviderPortfolioViewModel({
    providerPortfolioMedia,
    hasUploadedPortfolioPhoto,
    editingPortfolioCaptionId,
    busyAction,
  });
  const { data } = providerPortfolio;

  return (
    <>
      <TopBar
        title="Portfolio"
        subtitle="Work samples shown to customers"
        onBack={onBack}
        right={
          <PrimaryButton
            label="Refresh"
            variant="secondary"
            onPress={onRefresh}
          />
        }
      />
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.content}>
          <MediaUploadBox
            imageUri={providerPortfolioPhotoUri}
            icon={<ImageIcon color={palette.mint} size={28} strokeWidth={2.5} />}
            label={data.uploadLabel}
            onPress={onUploadPortfolioMedia}
            minHeight={132}
            previewHeight={132}
            surface="mint"
          />

          <View style={styles.portfolioGrid}>
            {data.portfolioItems.map((portfolioItem) => (
              <View key={portfolioItem.id} style={styles.portfolioTile}>
                <Image
                  source={{ uri: portfolioItem.fileUrl }}
                  style={styles.portfolioImage}
                />
                {portfolioItem.isEditingCaption ? (
                  <View style={styles.portfolioEditor}>
                    <Field
                      label="Caption"
                      value={portfolioCaptionDraft}
                      onChangeText={onPortfolioCaptionDraftChange}
                      placeholder="Portfolio caption"
                    />
                    <ActionRow>
                      <PrimaryButton
                        label="Save"
                        onPress={() => onSavePortfolioCaption(portfolioItem.item)}
                        disabled={portfolioItem.captionSaveDisabled}
                      />
                      <PrimaryButton
                        label="Cancel"
                        variant="secondary"
                        onPress={onCancelPortfolioCaption}
                      />
                    </ActionRow>
                  </View>
                ) : (
                  <>
                    <Text style={styles.portfolioText} numberOfLines={1}>
                      {portfolioItem.captionLabel}
                    </Text>
                    <View style={styles.portfolioActions}>
                      <Text
                        style={styles.linkText}
                        onPress={() => onMovePortfolioMedia(portfolioItem.id, -1)}
                      >
                        Up
                      </Text>
                      <Text
                        style={styles.linkText}
                        onPress={() => onMovePortfolioMedia(portfolioItem.id, 1)}
                      >
                        Down
                      </Text>
                      <Text
                        style={styles.linkText}
                        onPress={() => onStartPortfolioCaptionEdit(portfolioItem.item)}
                      >
                        Edit
                      </Text>
                    </View>
                  </>
                )}
                <Pressable
                  style={styles.deleteOverlay}
                  onPress={() => onRemovePortfolioMedia(portfolioItem.id)}
                  accessibilityRole="button"
                >
                  <Trash2 color={palette.white} size={16} strokeWidth={2.6} />
                </Pressable>
              </View>
            ))}
          </View>
          {!data.hasPortfolioMedia ? (
            <EmptyState
              title="No portfolio yet"
              body="Upload photos of completed services."
            />
          ) : null}
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
    gap: spacing.md,
    padding: spacing.md,
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.sm,
  },
  portfolioTile: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.md,
    gap: spacing.xs,
    height: 150,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '48%',
  },
  portfolioImage: {
    alignSelf: 'stretch',
    height: '100%',
  },
  portfolioText: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    bottom: spacing.xs,
    color: palette.mint,
    fontSize: 13,
    fontWeight: '900',
    left: spacing.xs,
    paddingHorizontal: spacing.xs,
    position: 'absolute',
    right: spacing.xs,
  },
  portfolioActions: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: radius.sm,
    flexDirection: 'row',
    gap: spacing.sm,
    left: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    position: 'absolute',
    right: spacing.xs,
    top: spacing.xs,
  },
  portfolioEditor: {
    backgroundColor: palette.white,
    bottom: spacing.xs,
    gap: spacing.xs,
    left: spacing.xs,
    padding: spacing.xs,
    position: 'absolute',
    right: spacing.xs,
    top: spacing.xs,
  },
  deleteOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(220,38,38,0.88)',
    borderRadius: radius.pill,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.sm,
    top: spacing.sm,
    width: 32,
  },
  linkText: {
    color: palette.mint,
    fontSize: 13,
    fontWeight: '900',
  },
});
