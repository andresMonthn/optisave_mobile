import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { DoctorPublicProfile } from '@/components/doctor-public-profile';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Icon, type IconName } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/header';
import { SectionHeader } from '@/components/ui/section-header';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/hooks/use-theme';
import { useAsyncData } from '@/hooks/use-async';
import { ReviewService } from '@/services';

function SettingRow({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const { colors } = useTheme();
  const color = danger ? colors.danger : colors.text;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.settingRow, pressed && styles.pressed]}>
      <Icon name={icon} size={20} tint={danger ? colors.danger : colors.textSecondary} />
      <ThemedText variant="body" style={[styles.flex, { color }]}>
        {label}
      </ThemedText>
      <Icon name="chevron-forward" size={18} color="textMuted" />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { doctor, userId, signOut } = useAuth();
  const { data: reviews } = useAsyncData(() => ReviewService.list(userId ?? undefined), [userId]);

  if (!doctor) {
    return (
      <Screen scroll={false}>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      header={
        <ScreenHeader
          subtitle="Administra tu ficha"
          title="Mi perfil"
          right={<IconButton name="create-outline" onPress={() => router.push('/edit-profile')} />}
        />
      }>
      <DoctorPublicProfile doctor={doctor} reviews={reviews ?? []} />

      <View style={styles.section}>
        <SectionHeader title="Gestión" />
        <Card padding={Spacing.sm}>
          <SettingRow icon="create-outline" label="Editar perfil" onPress={() => router.push('/edit-profile')} />
          <SettingRow icon="cash-outline" label="Servicios y costos" onPress={() => router.push('/edit-services')} />
          <SettingRow icon="time-outline" label="Horarios" onPress={() => router.push('/edit-schedule')} />
          <SettingRow icon="eye-outline" label="Vista paciente" onPress={() => router.push('/patient-view')} />
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
  section: {
    gap: Spacing.md,
  },
  flex: {
    flex: 1,
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
