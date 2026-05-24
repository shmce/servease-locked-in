import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Star } from 'lucide-react-native';
import {
  Card,
  Field,
  PrimaryButton,
  Section,
} from '../../../components/DesignKit';
import { ReviewSummary } from '../../../shared/models/types';
import { palette, type } from '../../../theme/serveaseDesign';
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
      <Section title="Your review">
        <Card>
          <Text style={styles.cardTitle}>{data.ratingLabel}</Text>
          <Text style={styles.cardMeta}>{data.reviewTextLabel}</Text>
        </Card>
      </Section>
    );
  }

  return (
    <Section title="Review provider">
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
      <PrimaryButton
        label="Submit review"
        variant="secondary"
        onPress={onSubmitReview}
        disabled={data.isSubmitDisabled}
      />
    </Section>
  );
}

const styles = StyleSheet.create({
  ratingField: {
    gap: 10,
  },
  ratingLabel: {
    color: palette.body,
    fontSize: 13,
    fontWeight: '500',
  },
  ratingScale: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingStep: {
    alignItems: 'center',
    backgroundColor: palette.input,
    borderColor: 'transparent',
    borderRadius: 12,
    borderWidth: 2,
    flex: 1,
    gap: 4,
    minHeight: 58,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  ratingStepSelected: {
    backgroundColor: palette.mintSoft,
    borderColor: palette.mint,
  },
  ratingStepText: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  ratingStepTextSelected: {
    color: palette.mintDeep,
  },
  ratingHint: {
    ...type.caption,
    color: palette.muted,
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  cardMeta: {
    ...type.caption,
    color: palette.muted,
  },
});
