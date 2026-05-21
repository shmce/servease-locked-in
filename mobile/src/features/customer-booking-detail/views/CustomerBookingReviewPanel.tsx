import { StyleSheet, Text } from 'react-native';
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
      <Field
        label="Rating"
        value={rating}
        onChangeText={onRatingChange}
        keyboardType="number-pad"
      />
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
