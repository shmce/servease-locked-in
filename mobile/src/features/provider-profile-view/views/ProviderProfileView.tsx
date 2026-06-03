import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Mail, MessageSquare, Phone, Star, User } from 'lucide-react-native';
import {
  ProviderButton,
  ProviderCard,
  ProviderContent,
  ProviderEmptyState,
  ProviderHeader,
  ProviderIconBlock,
  ProviderScreen,
  ProviderSection,
  ProviderTextField,
  providerText,
} from '../../../shared/components/ProviderUI';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import {
  CurrentUserProfile,
  ProviderPortfolioMediaSummary,
  ReviewSummary,
} from '../../../shared/models/types';
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
  onViewAllReviews: () => void;
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
  onViewAllReviews,
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
    <ProviderScreen>
      <ProviderContent>
        <ProviderHeader
          title="My Profile"
          subtitle="Public business profile"
          onBack={onBack}
          right={
            <ProviderButton
              label="Edit"
              variant="secondary"
              onPress={onEditProfile}
            />
          }
        />

        <ProviderCard style={styles.heroCard}>
          <View style={styles.heroAvatar}>
            <Text style={styles.heroAvatarText}>{data.avatarInitial}</Text>
          </View>
          <Text style={styles.heroName}>{data.businessDisplayName}</Text>
          <Text style={styles.heroSummary}>{data.profileSummary}</Text>
        </ProviderCard>

        <ProviderSection title="Account Details">
          <ProviderCard style={styles.sectionCard}>
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
                  <ProviderIconBlock compact>
                    <Icon color={palette.mintDeep} size={16} strokeWidth={2.2} />
                  </ProviderIconBlock>
                  <View style={styles.flex}>
                    <Text style={styles.infoLabel}>{row.label}</Text>
                    <Text style={styles.infoValue}>{row.value}</Text>
                  </View>
                </View>
              );
            })}
          </ProviderCard>
        </ProviderSection>

        <ProviderSection title="Portfolio">
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
            <ProviderEmptyState
              title="No portfolio yet"
              body="Upload work samples to build trust with customers."
            />
          )}
          <ProviderButton
            label="Manage Portfolio"
            variant="secondary"
            onPress={onManagePortfolio}
          />
        </ProviderSection>

        <ProviderSection
          title="Customer Reviews"
          action={
            data.hasMoreReviews ? (
              <Pressable
                onPress={onViewAllReviews}
                accessibilityRole="button"
                accessibilityLabel="View all customer reviews"
              >
                <Text style={styles.sectionAction}>View all</Text>
              </Pressable>
            ) : null
          }
        >
          {data.hasReviews ? (
            data.reviewCards.map((review) => (
              <ProviderCard key={review.id}>
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
                    <ProviderTextField
                      label="Your reply"
                      value={reviewReplyText}
                      onChangeText={onReviewReplyTextChange}
                      multiline
                    />
                    <View style={styles.replyActions}>
                      <ProviderButton
                        label={busyAction === 'review-reply' ? 'Sending...' : 'Submit Reply'}
                        onPress={onSubmitReviewReply}
                        disabled={busyAction === 'review-reply'}
                      />
                      <ProviderButton
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
                    <MessageSquare color={palette.mintDeep} size={14} strokeWidth={2.2} />
                    <Text style={styles.replyButtonText}>Reply to this review</Text>
                  </Pressable>
                )}
              </ProviderCard>
            ))
          ) : (
            <ProviderEmptyState
              title="No reviews yet"
              body="Customer reviews will appear here once received."
            />
          )}
        </ProviderSection>
      </ProviderContent>
    </ProviderScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  heroCard: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.base,
  },
  heroAvatar: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderColor: '#A7E5C2',
    borderWidth: 1,
    borderRadius: radius.pill,
    height: 88,
    justifyContent: 'center',
    width: 88,
  },
  heroAvatarText: {
    color: palette.mintDeep,
    fontSize: 36,
    fontWeight: '600',
  },
  heroName: {
    color: '#202733',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  heroSummary: {
    ...providerText.body,
    textAlign: 'center',
  },

  sectionCard: {
    gap: 0,
    overflow: 'hidden',
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
  infoLabel: {
    color: '#6D7480',
    fontSize: 11,
    fontWeight: '500',
  },
  infoValue: {
    color: '#202733',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
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
    color: '#202733',
    fontSize: 11,
    fontWeight: '600',
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
    color: '#202733',
    fontSize: 13,
    fontWeight: '600',
  },
  reviewerName: {
    color: '#6D7480',
    fontSize: 12,
    fontWeight: '500',
  },
  reviewText: {
    ...providerText.body,
  },
  sectionAction: {
    ...providerText.action,
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
    color: palette.mintDeep,
    fontSize: 13,
    fontWeight: '600',
  },
});
