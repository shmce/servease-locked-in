import { MessageSquare, Star } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  ProviderButton,
  ProviderCard,
  ProviderContent,
  ProviderEmptyState,
  ProviderHeader,
  ProviderScreen,
  ProviderSection,
  ProviderTextField,
  providerText,
} from '../../../shared/components/ProviderUI';
import { ReviewSummary } from '../../../shared/models/types';
import { palette, spacing } from '../../../theme/serveaseDesign';
import { useProviderReviewsViewModel } from '../viewModels/useProviderReviewsViewModel';

type ProviderReviewsScreenProps = {
  ownReviews: ReviewSummary[];
  replyingToReviewId: string | null;
  reviewReplyText: string;
  busyAction: string | null;
  onBack: () => void;
  onStartReviewReply: (reviewId: string) => void;
  onReviewReplyTextChange: (value: string) => void;
  onCancelReviewReply: () => void;
  onSubmitReviewReply: () => void;
};

export function ProviderReviewsScreen({
  ownReviews,
  replyingToReviewId,
  reviewReplyText,
  busyAction,
  onBack,
  onStartReviewReply,
  onReviewReplyTextChange,
  onCancelReviewReply,
  onSubmitReviewReply,
}: ProviderReviewsScreenProps) {
  const reviews = useProviderReviewsViewModel({
    busyAction,
    ownReviews,
    replyingToReviewId,
  });
  const { data, actions } = reviews;

  return (
    <ProviderScreen>
      <ProviderContent>
        <ProviderHeader
          title="Customer Reviews"
          subtitle="Read and reply to customer feedback"
          onBack={onBack}
        />

        <ProviderSection title="Reviews">
          {data.hasReviews ? (
            <View style={styles.reviewList}>
              {data.reviewCards.map((review) => (
                <ProviderCard key={review.id}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.ratingRow}>
                      <Star color="#FFC107" fill="#FFC107" size={13} />
                      <Text style={styles.ratingText}>{review.ratingLabel}</Text>
                    </View>
                    <Text style={styles.reviewerName}>{review.reviewerName}</Text>
                  </View>
                  <Text style={styles.reviewText}>{review.reviewText}</Text>
                  {review.isReplying ? (
                    <>
                      <ProviderTextField
                        label="Your reply"
                        value={reviewReplyText}
                        onChangeText={onReviewReplyTextChange}
                        multiline
                      />
                      <View style={styles.replyActions}>
                        <ProviderButton
                          label={review.replyButtonLabel}
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
                      accessibilityRole="button"
                      accessibilityLabel="Reply to this review"
                    >
                      <MessageSquare color={palette.mintDeep} size={14} strokeWidth={2.2} />
                      <Text style={styles.replyButtonText}>Reply to this review</Text>
                    </Pressable>
                  )}
                </ProviderCard>
              ))}
              {data.pagination.totalPages > 1 ? (
                <PaginationControls
                  pageLabel={data.pagination.pageLabel}
                  hasPreviousPage={data.pagination.hasPreviousPage}
                  hasNextPage={data.pagination.hasNextPage}
                  onPrevious={actions.goToPreviousPage}
                  onNext={actions.goToNextPage}
                />
              ) : null}
            </View>
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

function PaginationControls({
  pageLabel,
  hasPreviousPage,
  hasNextPage,
  onPrevious,
  onNext,
}: {
  pageLabel: string;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <View style={styles.paginationRow}>
      <Pressable
        style={[styles.paginationButton, !hasPreviousPage && styles.paginationButtonDisabled]}
        onPress={onPrevious}
        disabled={!hasPreviousPage}
        accessibilityRole="button"
        accessibilityState={{ disabled: !hasPreviousPage }}
        accessibilityLabel="Previous reviews page"
      >
        <Text
          style={[
            styles.paginationButtonText,
            !hasPreviousPage && styles.paginationButtonTextDisabled,
          ]}
        >
          Previous
        </Text>
      </Pressable>
      <Text style={styles.paginationLabel}>{pageLabel}</Text>
      <Pressable
        style={[styles.paginationButton, !hasNextPage && styles.paginationButtonDisabled]}
        onPress={onNext}
        disabled={!hasNextPage}
        accessibilityRole="button"
        accessibilityState={{ disabled: !hasNextPage }}
        accessibilityLabel="Next reviews page"
      >
        <Text
          style={[
            styles.paginationButtonText,
            !hasNextPage && styles.paginationButtonTextDisabled,
          ]}
        >
          Next
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  reviewList: {
    gap: spacing.md,
  },
  paginationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
  },
  paginationButton: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: '#DCEEE5',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 38,
    minWidth: 88,
    paddingHorizontal: spacing.sm,
  },
  paginationButtonDisabled: {
    opacity: 0.48,
  },
  paginationButtonText: {
    color: palette.mintDeep,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
  },
  paginationButtonTextDisabled: {
    color: '#9AA3AE',
  },
  paginationLabel: {
    color: '#6D7480',
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0,
    textAlign: 'center',
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
    ...providerText.action,
  },
});
