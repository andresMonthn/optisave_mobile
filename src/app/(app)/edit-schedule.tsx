import { StyleSheet, View } from 'react-native';

import { ScheduleView } from '@/components/profile-sections';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { DetailHeader } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';

export default function EditScheduleScreen() {
  const { doctor } = useAuth();

  return (
    <Screen header={<DetailHeader title="Horarios de atención" />}>
      <Card padding={Spacing.lg} tone="strong" contentStyle={styles.info}>
        <ThemedText variant="small" color="textSecondary">
          Los horarios son informativos para el directorio. Para agenda con citas reales necesitas OptiSave App (CRM).
        </ThemedText>
      </Card>

      {doctor?.schedule.length ? (
        <ScheduleView slots={doctor.schedule} />
      ) : (
        <Card padding={Spacing.xl} contentStyle={styles.empty}>
          <ThemedText variant="body" color="textSecondary">
            Aún no tienes horarios registrados en la base de datos.
          </ThemedText>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  info: {
    gap: Spacing.sm,
  },
  empty: {
    alignItems: 'center',
  },
});
