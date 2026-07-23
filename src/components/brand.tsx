import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';

export function BrandMark({ size = 'lg' }: { size?: 'md' | 'lg' }) {
  const logoHeight = size === 'lg' ? 48 : 36;
  const logoWidth = size === 'lg' ? 180 : 140;

  return (
    <View style={styles.wrap}>
      <Image
        source={require('@/assets/images/Optisave_LgL-noBg.png')}
        style={{ width: logoWidth, height: logoHeight }}
        contentFit="contain"
      />
      <ThemedText variant="caption" color="textSecondary" style={styles.tag}>
        Panel para profesionales de la salud
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  tag: {
    fontFamily: Fonts.bold,
  },
});
