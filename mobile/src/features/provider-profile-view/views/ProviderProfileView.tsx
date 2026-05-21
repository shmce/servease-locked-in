import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Mail, MessageSquare, Phone, Star, User } from 'lucide-react-native';
import {
  Card,
  EmptyState,
  Field,
  PrimaryButton,
  TopBar,
} from '../../../components/DesignKit';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import {
  CurrentUserProfile,
  ProviderPortfolioMediaSummary,
  ReviewSummary,
} from '../../../shared/models/types';
import {
  ScreenContent,
  ScreenScroll,
} from '../../../shared/components/ScreenLayout';
import { useProviderProfileViewModel } from '../viewModels/useProviderProfileViewModel';

type ProviderProfileViewScreenProps = {
  profile: CurrentUserProfile | null;
  providerPortfolioMedia: ProviderPortfolioMediaSummary[];
  ownReviews: ReviewSummary[];
  replyingToReviewId: string | null;
  reviewReplyText: string;
  busyAction: string | null;
  onBack: () => void;
  onEditProfile: () => void;
  onManagePortfolio: () => void;
  onStartReviewReply: (reviewId: string) => void;
  onReviewReplyTextChange: (value: string) => void;
  onCancelReviewReply: () => void;
  onSubmitReviewReply: () => void;
};

const rowIcon: Record<string, typeof User> = {
  name: User,
  email: Mail,
  phone: Phone,
};

export function ProviderProfileViewScreen({
  profile,
  providerPortfolioMedia,
  ownReviews,
  replyingToReviewId,
  reviewReplyText,
  busyAction,
  onBack,
  onEditProfile,
  onManagePortfolio,
  onStartReviewReply,
  onReviewReplyTextChange,
  onCancelReviewReply,
  onSubmitReviewReply,
}: ProviderProfileViewScreenProps) {
  const providerProfile = useProviderProfileViewModel({
    profile,
    providerPortfolioMedia,
    ownReviews,
  });
  const { data } = providerProfile;

  return (
    <>
      <TopBar
        title="My Profile"
        subtitle="Public business profile"
        onBack={onBack}
        right={
          <PrimaryButton
            label="Edit"
            variant="secondary"
            onPress={onEditProfile}
          />
        }
      />
      <ScreenScroll>
        <ScreenContent>

          {/* Hero */}
          <View style={styles.heroCard}>
            <View style={styles.heroAvatar}>
              <Text style={styles.heroAvatarText}>{data.avatarInitial}</Text>
            </View>
            <Text style={styles.heroName}>{data.businessDisplayName}</Text>
            <Text style={styles.heroSummary}>{data.profileSummary}</Text>
          </View>

          {/* Account info */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>Account Details</Text>
            {data.accountRows.map((row, index) => {
              const Icon = rowIcon[row.key] ?? User;
              return (
                <View
                  key={row.key}
                  style={[
                    styles.infoRow,
                    index < data.accountRows.length - 1 && styles.infoRowDivider,
                  ]}
                >
                  <View style={styles.infoIconBg}>
                    <Icon color={palette.mint} size={16} strokeWidth={2.2} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.infoLabel}>{row.label}</Text>
                    <Text style={styles.infoValue}>{row.value}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Portfolio */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Portfolio</Text>
            {data.hasPortfolioMedia ? (
              <View style={styles.portfolioGrid}>
                {data.portfolioPreview.map((item) => (
                  <View key={item.id} style={styles.portfolioTile}>
                    <Image source={{ uri: item.fileUrl }} style={styles.portfolioImage} />
                    {item.caption ? (
                      <Text style={styles.portfolioCaption} numberOfLines={1}>
                        {item.caption}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : (
              <EmptyState
                title="No portfolio yet"
                body="Upload work samples to build trust with customers."
              />
            )}
            <PrimaryButton
              label="Manage Portfolio"
              variant="secondary"
              onPress={onManagePortfolio}
            />
          </View>

          {/* Reviews */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Customer Reviews</Text>
            {data.hasReviews ? (
              data.reviewCards.map((review) => (
                <Card key={review.id}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.ratingRow}>
                      <Star color="#FFC107" fill="#FFC107" size={13} />
                      <Text style={styles.ratingText}>{review.ratingLabel}</Text>
                    </View>
                    <Text style={styles.reviewerName}>{review.reviewerName}</Text>
                  </View>
                  <Text style={styles.reviewText}>{review.reviewText}</Text>
                  {replyingToReviewId === review.id ? (
                    <>
                      <Field
                        label="Your reply"
                        value={reviewReplyText}
                        onChangeText={onReviewReplyTextChange}
                        multiline
                      />
                      <View style={styles.replyActions}>
                        <PrimaryButton
                          label={busyAction === 'review-reply' ? 'Sending...' : 'Submit Reply'}
                          onPress={onSubmitReviewReply}
                          disabled={busyAction === 'review-reply'}
                        />
                        <PrimaryButton
                          label="Cancel"
                          variant="secondary"
                          onPress={onCancelReviewReply}
                        />
                      </View>
                    </>
                  ) : (
                    <Pressable
                      style={styles.replyButton}
                      onPress={() => onStartReviewReply(review.id)}
                    >
                      <MessageSquare color={palette.mint} size={14} strokeWidth={2.2} />
                      <Text style={styles.replyButtonText}>Reply to this review</Text>
                    </Pressable>
                  )}
                </Card>
              ))
            ) : (
              <EmptyState
                title="No reviews yet"
                body="Customer reviews will appear here once received."
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

  heroCard: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.base,
  },
  heroAvatar: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    borderRadius: radius.pill,
    height: 88,
    justifyContent: 'center',
    width: 88,
  },
  heroAvatarText: {
    color: palette.white,
    fontSize: 36,
    fontWeight: '900',
  },
  heroName: {
    color: palette.ink,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  heroSummary: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
    textAlign: 'center',
  },

  sectionCard: {
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  sectionLabel: {
    color: palette.faint,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.base,
    minHeight: 56,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  infoRowDivider: {
    borderBottomColor: palette.lineSoft,
    borderBottomWidth: 1,
  },
  infoIconBg: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.sm,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  infoLabel: {
    color: palette.faint,
    fontSize: 11,
    fontWeight: '700',
  },
  infoValue: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },

  sectionBlock: {
    gap: spacing.sm,
  },

  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  portfolioTile: {
    backgroundColor: palette.mintSoft,
    borderRadius: radius.md,
    height: 150,
    overflow: 'hidden',
    width: '48%',
  },
  portfolioImage: {
    height: '100%',
    width: '100%',
  },
  portfolioCaption: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    bottom: spacing.xs,
    color: palette.ink,
    fontSize: 11,
    fontWeight: '700',
    left: spacing.xs,
    paddingHorizontal: spacing.xs,
    position: 'absolute',
    right: spacing.xs,
  },

  reviewHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  ratingText: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  reviewerName: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  reviewText: {
    color: palette.body,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19,
  },
  replyActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  replyButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  replyButtonText: {
    color: palette.mint,
    fontSize: 13,
    fontWeight: '700',
  },
});
