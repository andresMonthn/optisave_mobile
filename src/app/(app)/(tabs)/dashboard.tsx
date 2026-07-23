import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { Rating } from '@/components/ui/rating';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/header';
import { SectionHeader } from '@/components/ui/section-header';
import { StatCard } from '@/components/ui/stat-card';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/hooks/use-theme';
import { useAsyncData } from '@/hooks/use-async';
import { DashboardService, DoctorService } from '@/services';
import { cedulaVerificationMeta } from '@/utils/format';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function DashboardScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { doctor, userId, refreshDoctor } = useAuth();

  const { data: summary } = useAsyncData(() => DashboardService.get(userId ?? undefined), [userId]);

  const [active, setActive] = useState(!!doctor?.isActive);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => setActive(!!doctor?.isActive), [doctor?.isActive]);

  async function toggleActive(next: boolean) {
    if (!userId && !doctor) return;

    if (!next) {
      setActive(false);
      await DoctorService.unpublishProfile(userId ?? doctor!.id);
      await refreshDoctor();
      return;
    }

    setPublishing(true);
    try {
      const result = await DoctorService.publishProfile(userId ?? doctor!.id);
      if (!result.verified) {
        setActive(false);
        Alert.alert('No se pudo publicar', result.error ?? 'Verifica tu cédula profesional.');
        return;
      }
      setActive(true);
      await refreshDoctor();
      Alert.alert('Perfil publicado', result.message ?? 'Tu cédula fue verificada ante la SEP.');
    } catch (e) {
      setActive(false);
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo publicar el perfil.');
    } finally {
      setPublishing(false);
    }
  }

  if (!doctor) {
    return (
      <Screen scroll={false}>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  const firstName = doctor.fullName.split(' ')[0];
  const cedulaMeta = cedulaVerificationMeta(doctor.isVerified);

  return (
    <Screen
      header={
        <ScreenHeader
          subtitle={greeting()}
          title={firstName}
          right={
            <Pressable onPress={() => router.push('/profile')}>
              <Avatar uri={doctor.avatarUrl} name={doctor.fullName} size={46} />
            </Pressable>
          }
        />
      }>
      <Card padding={Spacing.lg} tone="strong" contentStyle={styles.statusCard}>
        <View style={styles.statusTop}>
          <View style={styles.statusLeft}>
            <Chip
              label={active ? 'Perfil visible' : 'Perfil oculto'}
              icon={active ? 'eye' : 'eye-off-outline'}
              tone={active ? 'success' : 'warning'}
            />
            <Chip label={cedulaMeta.label} icon={cedulaMeta.icon} tone={cedulaMeta.tone} />
            <Rating value={doctor.ratingAvg} count={doctor.ratingCount} />
          </View>
          <View style={styles.switchWrap}>
            {publishing ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <>
                <ThemedText variant="caption" color={active ? 'success' : 'textMuted'}>
                  {active ? 'Activo' : 'Inactivo'}
                </ThemedText>
                <Switch
                  value={active}
                  onValueChange={toggleActive}
                  disabled={publishing}
                  trackColor={{ true: colors.primary, false: colors.backgroundAlt }}
                  thumbColor={colors.onPrimary}
                />
              </>
            )}
          </View>
        </View>
        <ThemedText variant="small" color="textSecondary">
          {active
            ? 'Tu ficha aparece en el directorio OptiSave para pacientes de tu zona.'
            : 'Al publicar verificamos tu cédula profesional ante la SEP antes de activar tu perfil.'}
        </ThemedText>
      </Card>

      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <StatCard
            label="Servicios"
            value={String(summary?.servicesCount ?? doctor.services.length)}
            icon="medkit-outline"
            accent="primary"
          />
        </View>
        <View style={styles.gridItem}>
          <StatCard
            label="Consultorios"
            value={String(summary?.clinicsCount ?? doctor.clinics.length)}
            icon="location-outline"
            accent="info"
          />
        </View>
        <View style={styles.gridItem}>
          <StatCard
            label="Días con horario"
            value={String(summary?.scheduleDays ?? 0)}
            icon="calendar-outline"
            accent="success"
          />
        </View>
        <View style={styles.gridItem}>
          <StatCard
            label="Reseñas"
            value={String(summary?.ratingCount ?? doctor.ratingCount)}
            icon="star"
            accent="accent"
          />
        </View>
      </View>

      <SectionHeader title="Acciones rápidas" />
      <View style={styles.actions}>
        <Card padding={Spacing.lg} onPress={() => router.push('/edit-profile')} contentStyle={styles.actionCard}>
          <Icon name="create-outline" size={22} color="primary" />
          <ThemedText variant="callout">Editar perfil</ThemedText>
          <ThemedText variant="small" color="textSecondary">
            Nombre, bio, cédula y especialidad
          </ThemedText>
        </Card>
        <Card padding={Spacing.lg} onPress={() => router.push('/edit-services')} contentStyle={styles.actionCard}>
          <Icon name="cash-outline" size={22} color="primary" />
          <ThemedText variant="callout">Servicios y costos</ThemedText>
          <ThemedText variant="small" color="textSecondary">
            Administra precios y descripciones
          </ThemedText>
        </Card>
        <Card padding={Spacing.lg} onPress={() => router.push('/patient-view')} contentStyle={styles.actionCard}>
          <Icon name="eye-outline" size={22} color="primary" />
          <ThemedText variant="callout">Vista paciente</ThemedText>
          <ThemedText variant="small" color="textSecondary">
            Previsualiza tu ficha pública
          </ThemedText>
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
  statusCard: {
    gap: Spacing.md,
  },
  statusTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLeft: {
    gap: Spacing.sm,
    flex: 1,
  },
  switchWrap: {
    alignItems: 'center',
    gap: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  gridItem: {
    width: '47%',
    flexGrow: 1,
  },
  actions: {
    gap: Spacing.md,
  },
  actionCard: {
    gap: Spacing.xs,
  },
});
