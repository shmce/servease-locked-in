import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Field } from '../../../components/DesignKit';
import {
  CustomerCard,
  CustomerSection,
  customerText,
} from '../../../shared/components/CustomerUI';
import { RatingStarsInput } from '../../../components/RatingStarsInput';
import { ReviewSummary } from '../../../shared/models/types';
import { palette, radius } from '../../../theme/serveaseDesign';
import { useCustomerBookingReviewPanelViewModel } from '../viewModels/useCustomerBookingReviewPanelViewModel';

type CustomerBookingReviewPanelProps = {
  selectedReview: ReviewSummary | null;
  rating: string;
  reviewText: string;
  busyAction: string | null;
  onRatingChange: (value: string) => void;
  onReviewTextChange: (value: string) => void;
  onSubmitReview: () => void;
};

export function CustomerBookingReviewPanel({
  selectedReview,
  rating,
  reviewText,
  busyAction,
  onRatingChange,
  onReviewTextChange,
  onSubmitReview,
}: CustomerBookingReviewPanelProps) {
  const reviewPanel = useCustomerBookingReviewPanelViewModel({
    selectedReview,
    busyAction,
    rating,
  });
  const { data } = reviewPanel;
  const selectedRating = Number(rating);

  if (data.hasExistingReview) {
    return (
      <CustomerSection title="Your review">
        <CustomerCard>
          <Text style={styles.cardTitle}>{data.ratingLabel}</Text>
          <Text style={styles.cardMeta}>{data.reviewTextLabel}</Text>
        </CustomerCard>
      </CustomerSection>
    );
  }

  return (
    <CustomerSection title="Review provider">
      <View style={styles.ratingField}>
        <Text style={styles.ratingLabel}>Rating</Text>
        <View style={styles.ratingScale}>
          <RatingStarsInput
            rating={Number.isFinite(selectedRating) ? selectedRating : 0}
            onChange={(value) => onRatingChange(String(value))}
          />
        </View>
        <Text style={styles.ratingHint}>
          {Number.isFinite(selectedRating) ? selectedRating : 0}/5 stars
        </Text>
      </View>
      <Field
        label="Review"
        value={reviewText}
        onChangeText={onReviewTextChange}
        multiline
      />
      <Pressable
        style={[styles.submitButton, data.isSubmitDisabled && styles.submitButtonDisabled]}
        onPress={onSubmitReview}
        disabled={data.isSubmitDisabled}
        accessibilityRole="button"
      >
        <Text style={styles.submitButtonText}>Submit review</Text>
      </Pressable>
    </CustomerSection>
  );
}

const styles = StyleSheet.create({
  ratingField: {
    gap: 10,
  },
  ratingLabel: {
    color: '#202733',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0,
  },
  ratingScale: {
    flexDirection: 'row',
    gap: 12,
  },
  ratingHint: {
    ...customerText.meta,
  },

  cardTitle: {
    color: '#202733',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0,
  },
  cardMeta: {
    ...customerText.meta,
  },
  submitButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1FAF5',
    borderRadius: radius.pill,
    minHeight: 46,
  },

  submitButtonDisabled: {
    opacity: 0.55,
  },

  submitButtonText: {
    color: palette.mintDeep,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0,
  },
});
