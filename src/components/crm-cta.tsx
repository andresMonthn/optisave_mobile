import { openBrowserAsync } from 'expo-web-browser';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const CRM_URL = 'https://optisave.app';

/** Cross-sell to the full OptiSave CRM (the "real" business platform). */
export function CrmCta() {
  const { colors } = useTheme();
  return (
    <Card padding={Spacing.lg} tone="strong" contentStyle={styles.card}>
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft }]}>
          <Icon name="rocket-outline" size={22} tint={colors.primary} />
        </View>
        <View style={styles.flex}>
          <ThemedText variant="callout">Lleva tu consulta más lejos</ThemedText>
          <ThemedText variant="small" color="textSecondary">
            Expediente clínico, recetas, inventario y facturación en OptiSave CRM.
          </ThemedText>
        </View>
      </View>
      <Button
        label="Abrir optisave.app"
        variant="secondary"
        iconRight="open-outline"
        fullWidth
        onPress={() => openBrowserAsync(CRM_URL)}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
    gap: 2,
  },
});
