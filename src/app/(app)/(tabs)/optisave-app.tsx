import { openBrowserAsync } from 'expo-web-browser';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/header';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/hooks/use-theme';

const PRICING_URL = 'https://www.optisave.app/pricing';
const CRM_URL = 'https://www.optisave.app';

export default function OptisaveAppScreen() {
  const { colors } = useTheme();
  const { doctor } = useAuth();
  const hasLicense = !!doctor?.hasCrmLicense;

  return (
    <Screen header={<ScreenHeader subtitle="Plataforma clínica" title="OptiSave CRM" />}>
      <Card padding={Spacing.lg} tone="strong" contentStyle={styles.intro}>
        <ThemedText variant="h2">OptiSave CRM</ThemedText>
        <ThemedText variant="body" color="textSecondary">
          {hasLicense
            ? 'Tu licencia está activa. Gestiona expediente clínico, inventario y facturación en la plataforma completa.'
            : 'El directorio gratuito te da visibilidad. OptiSave CRM es el producto de pago para operar tu consultorio a escala.'}
        </ThemedText>
        <Chip
          label={hasLicense ? 'Licencia activa' : 'Sin licencia CRM'}
          icon={hasLicense ? 'checkmark-circle' : 'information-circle-outline'}
          tone={hasLicense ? 'success' : 'info'}
        />
      </Card>

      <Card padding={Spacing.lg} contentStyle={styles.features}>
        {[
          { icon: 'document-text-outline' as const, title: 'Expediente clínico', desc: 'Historial, recetas y notas' },
          { icon: 'people-outline' as const, title: 'Importación de pacientes', desc: 'Escala tu base existente' },
          { icon: 'stats-chart-outline' as const, title: 'Analytics', desc: 'Métricas de tu práctica' },
          { icon: 'shield-checkmark' as const, title: 'NOM-024', desc: 'Privacidad y auditoría documental' },
        ].map((f) => (
          <View key={f.title} style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: colors.primarySoft }]}>
              <Icon name={f.icon} size={20} tint={colors.primary} />
            </View>
            <View style={styles.flex}>
              <ThemedText variant="callout">{f.title}</ThemedText>
              <ThemedText variant="small" color="textSecondary">
                {f.desc}
              </ThemedText>
            </View>
          </View>
        ))}
      </Card>

      {hasLicense ? (
        <Button label="Abrir OptiSave CRM" iconRight="open-outline" fullWidth onPress={() => openBrowserAsync(CRM_URL)} />
      ) : (
        <>
          <ThemedText variant="body" color="textSecondary">
            Cuando tu consultorio crezca, el CRM conecta con tu perfil del directorio para una operación clínica
            oportuna.
          </ThemedText>
          <Button
            label="Ver planes y precios"
            iconRight="open-outline"
            fullWidth
            onPress={() => openBrowserAsync(PRICING_URL)}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    gap: Spacing.sm,
  },
  features: {
    gap: Spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
    gap: 2,
  },
});
