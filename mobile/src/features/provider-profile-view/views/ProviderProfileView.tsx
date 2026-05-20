import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Mail, Phone, Star, User } from 'lucide-react-native';
import {
  Card,
  EmptyState,
  Field,
  PrimaryButton,
  Section,
  TopBar,
} from '../../../components/DesignKit';
import { ProfileInfoRow } from '../../../components/AppDisplay';
import { palette, radius, spacing, type } from '../../../theme/serveaseDesign';
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
  onStartReviewReply: (reviewId: string) => void;
  onReviewReplyTextChange: (value: string) => void;
  onCancelReviewReply: () => void;
  onSubmitReviewReply: () => void;
};

const accountIcons: Record<string, typeof User> = {
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
        title="Provider Profile"
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
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.content}>
          <Card>
            <View style={styles.profileHero}>
              <View style={styles.profileAvatarLarge}>
                <Text style={styles.profileAvatarLargeText}>
                  {data.avatarInitial}
                </Text>
              </View>
              <Text style={styles.detailTitle}>{data.businessDisplayName}</Text>
              <Text style={styles.cardMeta}>{data.profileSummary}</Text>
            </View>
          </Card>

          <Section title="Account">
            {data.accountRows.map((row) => (
              <ProfileInfoRow
                key={row.key}
                icon={accountIcons[row.key]}
                label={row.label}
                value={row.value}
              />
            ))}
          </Section>

          <Section title="Portfolio Preview">
            <View style={styles.portfolioGrid}>
              {data.portfolioPreview.map((item) => (
                <View key={item.id} style={styles.portfolioTile}>
                  <Image source={{ uri: item.fileUrl }} style={styles.portfolioImage} />
                  {item.caption ? (
                    <Text style={styles.portfolioText} numberOfLines={1}>
                      {item.caption}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
            {!data.hasPortfolioMedia ? (
              <EmptyState
                title="No portfolio yet"
                body="Upload work samples to build trust."
              />
            ) : null}
            <PrimaryButton
              label="Manage Portfolio"
              variant="secondary"
              onPress={onManagePortfolio}
            />
          </Section>

          <Section title="My Reviews">
            {data.reviewCards.map((review) => (
              <Card key={review.id}>
                <View style={styles.ratingRow}>
                  <Star color="#FFC107" fill="#FFC107" size={14} />
                  <Text style={styles.cardTitle}>{review.ratingLabel}</Text>
                  <Text style={styles.cardMeta}> · {review.reviewerName}</Text>
                </View>
                <Text style={styles.cardBody}>{review.reviewText}</Text>
                {replyingToReviewId === review.id ? (
                  <>
                    <Field
                      label="Your reply"
                      value={reviewReplyText}
                      onChangeText={onReviewReplyTextChange}
                      multiline
                    />
                    <View style={styles.twoButtons}>
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
                  <Text
                    style={styles.linkText}
                    onPress={() => onStartReviewReply(review.id)}
                  >
                    Reply to this review
                  </Text>
                )}
              </Card>
            ))}
            {!data.hasReviews ? (
              <EmptyState
                title="No reviews yet"
                body="Customer reviews will appear here once received."
              />
            ) : null}
          </Section>
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
  profileHero: {
    alignItems: 'center',
  },
  profileAvatarLarge: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    borderRadius: radius.pill,
    height: 96,
    justifyContent: 'center',
    position: 'relative',
    width: 96,
  },
  profileAvatarLargeText: {
    color: palette.white,
    fontSize: 40,
    fontWeight: '900',
  },
  detailTitle: {
    ...type.title,
    color: palette.ink,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  cardTitle: {
    ...type.section,
    color: palette.ink,
  },
  cardBody: {
    ...type.body,
    color: palette.body,
  },
  cardMeta: {
    ...type.caption,
    color: palette.muted,
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  portfolioTile: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.md,
    gap: spacing.xs,
    height: 150,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '47%',
  },
  portfolioImage: {
    height: '100%',
    width: '100%',
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
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  linkText: {
    color: palette.mint,
    fontSize: 13,
    fontWeight: '900',
  },
  twoButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
