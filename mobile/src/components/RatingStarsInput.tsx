import { Pressable, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { StyleSheet } from 'react-native';
import { palette } from '../theme/serveaseDesign';

type RatingStarsInputProps = {
  maxRating?: number;
  rating: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

const STAR_FILL_COLOR = '#FFC107';
const STAR_OUTLINE_COLOR = '#D9DFE5';

export function RatingStarsInput({
  maxRating = 5,
  rating,
  onChange,
  disabled = false,
}: RatingStarsInputProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: maxRating }, (_, index) => {
        const value = index + 1;
        const isFilled = value <= rating;

        return (
          <Pressable
            key={value}
            onPress={() => onChange(value)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={`Rate ${value} out of ${maxRating} stars`}
            accessibilityState={{ selected: isFilled, disabled }}
          >
            <Star
              color={isFilled ? STAR_FILL_COLOR : STAR_OUTLINE_COLOR}
              fill={isFilled ? STAR_FILL_COLOR : 'transparent'}
              size={22}
              strokeWidth={2.4}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
});
