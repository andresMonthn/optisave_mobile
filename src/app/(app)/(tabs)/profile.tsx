import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Icon, type IconName } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/header';
import { SectionHeader } from '@/components/ui/section-header';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/hooks/use-theme';
import { DoctorService } from '@/services';
import { cedulaVerificationMeta } from '@/utils/format';

function SettingRow({
  icon,
  label,
  hint,
  onPress,
  danger,
}: {
  icon: IconName;
  label: string;
  hint?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const { colors } = useTheme();
  const color = danger ? colors.danger : colors.text;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.settingRow, pressed && styles.pressed]}>
      <Icon name={icon} size={20} tint={danger ? colors.danger : colors.textSecondary} />
      <View style={styles.flex}>
        <ThemedText variant="body" style={{ color }}>
          {label}
        </ThemedText>
        {hint ? (
          <ThemedText variant="caption" color="textMuted">
            {hint}
          </ThemedText>
        ) : null}
      </View>
      <Icon name="chevron-forward" size={18} color="textMuted" />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { doctor, userId, refreshDoctor, signOut } = useAuth();
  const [publishing, setPublishing] = useState(false);

  if (!doctor) {
    return (
      <Screen scroll={false}>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  const cedulaMeta = cedulaVerificationMeta(doctor.isVerified);
  const servicesCount = doctor.services.filter((s) => s.isActive).length;
  const scheduleDays = new Set(doctor.schedule.map((s) => s.weekday)).size;

  async function onTogglePublish() {
    if (doctor!.isActive) {
      Alert.alert('Ocultar perfil', 'Tu ficha dejará de mostrarse en el directorio público.', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Ocultar',
          style: 'destructive',
          onPress: async () => {
            setPublishing(true);
            try {
              await DoctorService.unpublishProfile(userId ?? doctor!.id);
              await refreshDoctor();
            } finally {
              setPublishing(false);
            }
          },
        },
      ]);
      return;
    }

    setPublishing(true);
    try {
      const result = await DoctorService.publishProfile(userId ?? doctor!.id);
      await refreshDoctor();
      if (result.error) Alert.alert('No se pudo publicar', result.error);
      else if (result.message) Alert.alert('Perfil publicado', result.message);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo publicar el perfil.');
    } finally {
      setPublishing(false);
    }
  }

  return (
    <Screen header={<ScreenHeader subtitle="Configura tu negocio" title="Gestión" />}>
      <Card padding={Spacing.lg} contentStyle={styles.summary}>
        <View style={styles.summaryRow}>
          <Avatar name={doctor.fullName} uri={doctor.avatarUrl} size={56} />
          <View style={styles.flex}>
            <ThemedText variant="h2">{doctor.fullName}</ThemedText>
            <ThemedText variant="small" color="textSecondary">
              {doctor.specialty}
            </ThemedText>
          </View>
        </View>
        <View style={styles.chips}>
          <Chip label={cedulaMeta.label} icon={cedulaMeta.icon} tone={cedulaMeta.tone} />
          <Chip
            label={doctor.isActive ? 'Publicado' : 'Oculto'}
            icon={doctor.isActive ? 'eye' : 'eye-off-outline'}
            tone={doctor.isActive ? 'success' : 'warning'}
          />
        </View>
        <ThemedText variant="caption" color="textMuted">
          {servicesCount} servicios activos · {doctor.clinics.length} sedes · {scheduleDays} días con horario
        </ThemedText>
      </Card>

      <View style={styles.section}>
        <SectionHeader title="Perfil y datos" />
        <Card padding={Spacing.sm}>
          <SettingRow
            icon="create-outline"
            label="Datos del doctor"
            hint="Nombre, cédula, teléfono, bio, especialidad"
            onPress={() => router.push('/edit-profile')}
          />
        </Card>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Citas" subtitle="Alimenta tu agenda y las reservas" />
        <Card padding={Spacing.sm}>
          <SettingRow
            icon="cash-outline"
            label="Servicios y costos"
            onPress={() => router.push('/edit-services')}
          />
          <SettingRow
            icon="time-outline"
            label="Horarios de atención"
            hint="Soporta horario partido por día"
            onPress={() => router.push('/edit-schedule')}
          />
        </Card>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Directorio" />
        <Card padding={Spacing.lg} contentStyle={styles.publishCard}>
          <ThemedText variant="small" color="textSecondary">
            {doctor.isActive
              ? 'Tu perfil es visible en el directorio. La vista pública está en la pestaña Vista paciente.'
              : 'Publica tu perfil para aparecer en optisave.app. Verificamos tu cédula al publicar.'}
          </ThemedText>
          <Button
            label={doctor.isActive ? 'Ocultar perfil' : 'Publicar perfil'}
            variant={doctor.isActive ? 'ghost' : 'primary'}
            loading={publishing}
            onPress={onTogglePublish}
            fullWidth
          />
        </Card>
        <Card padding={Spacing.sm}>
          <SettingRow
            icon="eye-outline"
            label="Ver vista paciente"
            hint="Previsualiza cómo te ven en el directorio"
            onPress={() => router.push('/patient-view')}
          />
        </Card>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Cuenta" />
        <Card padding={Spacing.sm}>
          <SettingRow icon="log-out-outline" label="Cerrar sesión" danger onPress={signOut} />
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    gap: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  section: {
    gap: Spacing.md,
  },
  publishCard: {
    gap: Spacing.md,
  },
  flex: {
    flex: 1,
    gap: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  pressed: {
    opacity: 0.6,
  },
});
