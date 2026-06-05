import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import { CustomerBookingReviewPanel } from './CustomerBookingReviewPanel';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import type { ReviewSummary } from '../../../shared/models/types';

type CustomerBookingReviewSheetProps = {
  providerName: string;
  visible: boolean;
  selectedReview: ReviewSummary | null;
  rating: string;
  reviewText: string;
  busyAction: string | null;
  onClose: () => void;
  onRatingChange: (value: string) => void;
  onReviewTextChange: (value: string) => void;
  onSubmitReview: () => void;
};

export function CustomerBookingReviewSheet({
  providerName,
  visible,
  selectedReview,
  rating,
  reviewText,
  busyAction,
  onClose,
  onRatingChange,
  onReviewTextChange,
  onSubmitReview,
}: CustomerBookingReviewSheetProps) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.sheetOverlay}>
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close review"
        />

        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Review your booking</Text>
              <Text style={styles.sheetMeta}>with {providerName}</Text>
            </View>
            <Pressable
              style={styles.sheetClose}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close review"
            >
              <X color={palette.ink} size={18} strokeWidth={2.2} />
            </Pressable>
          </View>

          <View style={styles.sheetBody}>
            <CustomerBookingReviewPanel
              selectedReview={selectedReview}
              rating={rating}
              reviewText={reviewText}
              busyAction={busyAction}
              onRatingChange={onRatingChange}
              onReviewTextChange={onReviewTextChange}
              onSubmitReview={onSubmitReview}
            />
          </View>

          <Pressable onPress={onClose} accessibilityRole="button">
            <Text style={styles.sheetSkip}>Skip for now</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: palette.white,
    borderRadius: 18,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    marginTop: 'auto',
    maxHeight: '85%',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    width: '100%',
  },
  sheetBody: {
    maxHeight: '88%',
  },
  sheetClose: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  sheetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sheetMeta: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0,
  },
  sheetOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.48)',
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    width: '100%',
  },
  sheetSkip: {
    color: palette.mintDeep,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
    paddingTop: spacing.sm,
    textAlign: 'center',
  },
  sheetTitle: {
    color: '#202733',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0,
  },
});
