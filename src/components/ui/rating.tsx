import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type RatingProps = {
  value: number;
  count?: number;
  size?: number;
  showValue?: boolean;
};

export function Rating({ value, count, size = 16, showValue = true }: RatingProps) {
  const { colors } = useTheme();
  const rounded = Math.round(value);

  return (
    <View style={styles.row}>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Icon
            key={i}
            name={i <= rounded ? 'star' : 'star-outline'}
            size={size}
            tint={colors.star}
          />
        ))}
      </View>
      {showValue ? (
        <ThemedText variant="small" style={{ fontFamily: Fonts.bold }}>
          {value.toFixed(1)}
        </ThemedText>
      ) : null}
      {count != null ? (
        <ThemedText variant="small" color="textMuted">
          ({count})
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  stars: {
    flexDirection: 'row',
    gap: 1,
  },
});
