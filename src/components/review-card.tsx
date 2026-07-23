import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Rating } from '@/components/ui/rating';
import { Spacing } from '@/constants/theme';
import type { Review } from '@/types';
import { formatDate } from '@/utils/format';

export function ReviewCard({ review }: { review: Review }) {
  return (
    <Card padding={Spacing.lg} contentStyle={styles.card}>
      <View style={styles.header}>
        <Avatar name={review.reviewerName} size={40} />
        <View style={styles.flex}>
          <ThemedText variant="callout" numberOfLines={1}>
            {review.reviewerName}
          </ThemedText>
          <ThemedText variant="caption" color="textMuted">
            {formatDate(review.createdAt)}
          </ThemedText>
        </View>
      </View>

      <Rating value={review.rating} showValue={false} />

      {review.comment ? (
        <ThemedText variant="body" color="textSecondary">
          {review.comment}
        </ThemedText>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  flex: {
    flex: 1,
    gap: 1,
  },
});
