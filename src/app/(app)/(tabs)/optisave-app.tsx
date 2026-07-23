import { Image } from 'expo-image';
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
    <Screen header={<ScreenHeader subtitle="Plataforma clínica" title="OptiSave App" />}>
      <Card padding={0} tone="strong">
        <Image source={require('@/assets/images/baner.png')} style={styles.hero} contentFit="cover" />
        <View style={styles.heroBody}>
          <Image source={require('@/assets/images/Optisave_LgL-noBg.png')} style={styles.logo} contentFit="contain" />
          <ThemedText variant="h2">OptiSave App</ThemedText>
          <ThemedText variant="body" color="textSecondary">
            {hasLicense
              ? 'Tu licencia CRM está activa. Gestiona citas reales, expedientes y facturación desde la plataforma completa.'
              : 'El directorio gratuito te da visibilidad. OptiSave App es el CRM de pago con agenda real, expediente clínico e inventario.'}
          </ThemedText>
          <Chip
            label={hasLicense ? 'Licencia activa' : 'Sin licencia CRM'}
            icon={hasLicense ? 'checkmark-circle' : 'information-circle-outline'}
            tone={hasLicense ? 'success' : 'info'}
          />
        </View>
      </Card>

      <Card padding={Spacing.lg} contentStyle={styles.features}>
        {[
          { icon: 'calendar' as const, title: 'Agenda con citas reales', desc: 'Pacientes reservan en línea' },
          { icon: 'document-text-outline' as const, title: 'Expediente clínico', desc: 'Historial, recetas y notas' },
          { icon: 'cash-outline' as const, title: 'Facturación e inventario', desc: 'Operación completa del consultorio' },
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
        <Button
          label="Abrir OptiSave App"
          iconRight="open-outline"
          fullWidth
          onPress={() => openBrowserAsync(CRM_URL)}
        />
      ) : (
        <>
          <Card padding={Spacing.lg} tone="strong" contentStyle={styles.landing}>
            <ThemedText variant="callout">Potencia tu consulta con OptiSave App</ThemedText>
            <ThemedText variant="small" color="textSecondary">
              Conecta tu perfil del directorio con el CRM completo: agenda agendable, expedientes y analíticas de tu
              práctica.
            </ThemedText>
          </Card>
          <Button
            label="Ver planes y precios"
            iconRight="open-outline"
            fullWidth
            onPress={() => openBrowserAsync(PRICING_URL)}
          />
          <ThemedText variant="caption" color="textMuted" style={styles.note}>
            Se abrirá optisave.app en tu navegador.
          </ThemedText>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    height: 120,
  },
  heroBody: {
    padding: Spacing.lg,
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  logo: {
    width: 160,
    height: 48,
    marginBottom: Spacing.xs,
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
  landing: {
    gap: Spacing.sm,
  },
  note: {
    textAlign: 'center',
  },
});
