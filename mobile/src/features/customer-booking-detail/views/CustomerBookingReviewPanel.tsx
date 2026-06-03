import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { Field } from '../../../components/DesignKit';
import {
  CustomerCard,
  CustomerSection,
  customerText,
} from '../../../shared/components/CustomerUI';
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
  });
  const { data } = reviewPanel;
  const selectedRating = Math.min(5, Math.max(1, Number(rating) || 5));

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
          {[1, 2, 3, 4, 5].map((value) => {
            const isSelected = selectedRating === value;
            const isFilled = selectedRating >= value;

            return (
              <Pressable
                key={value}
                style={[styles.ratingStep, isSelected && styles.ratingStepSelected]}
                onPress={() => onRatingChange(String(value))}
                accessibilityRole="button"
                accessibilityLabel={`Give ${value} out of 5 stars`}
                accessibilityState={{ selected: isSelected }}
              >
                <Star
                  color={isFilled ? palette.mint : palette.faint}
                  fill={isFilled ? palette.mint : 'transparent'}
                  size={22}
                  strokeWidth={2.4}
                />
                <Text style={[styles.ratingStepText, isSelected && styles.ratingStepTextSelected]}>
                  {value}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.ratingHint}>{selectedRating}/5 stars</Text>
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
    gap: 8,
  },
  ratingStep: {
    alignItems: 'center',
    backgroundColor: '#F8FAFB',
    borderColor: 'transparent',
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    minHeight: 58,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  ratingStepSelected: {
    backgroundColor: '#F1FAF5',
    borderColor: '#BDE8D0',
  },
  ratingStepText: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0,
  },
  ratingStepTextSelected: {
    color: palette.mintDeep,
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
    backgroundColor: '#F1FAF5',
    borderRadius: radius.pill,
    justifyContent: 'center',
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
