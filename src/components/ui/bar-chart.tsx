import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type BarChartProps = {
  data: number[];
  labels?: string[];
  height?: number;
  /** Index to highlight (e.g. today). Defaults to the last bar. */
  highlightIndex?: number;
};

/** Minimal borderless bar chart for the weekly-bookings widget. */
export function BarChart({ data, labels, height = 96, highlightIndex }: BarChartProps) {
  const { colors } = useTheme();
  const max = Math.max(1, ...data);
  const active = highlightIndex ?? data.length - 1;

  return (
    <View>
      <View style={[styles.bars, { height }]}>
        {data.map((v, i) => {
          const h = Math.max(6, (v / max) * (height - 8));
          const isActive = i === active;
          return (
            <View key={i} style={styles.col}>
              {v > 0 ? (
                <ThemedText variant="caption" color="textMuted" style={styles.value}>
                  {v}
                </ThemedText>
              ) : null}
              <View
                style={[
                  styles.bar,
                  {
                    height: h,
                    backgroundColor: isActive ? colors.primary : colors.primarySoft,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>
      {labels ? (
        <View style={styles.labels}>
          {labels.map((l, i) => (
            <ThemedText
              key={i}
              variant="caption"
              color={i === active ? 'primary' : 'textMuted'}
              style={styles.label}>
              {l}
            </ThemedText>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  col: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
  },
  value: {
    fontSize: 10,
  },
  bar: {
    width: '78%',
    borderRadius: Radius.sm,
  },
  labels: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  label: {
    flex: 1,
    textAlign: 'center',
  },
});
