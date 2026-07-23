import { useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { DoctorPublicProfile } from '@/components/doctor-public-profile';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/header';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/hooks/use-theme';
import { useAsyncData } from '@/hooks/use-async';
import { ReviewService } from '@/services';

export default function PatientViewScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { doctor, userId } = useAuth();
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
    <Screen header={<ScreenHeader subtitle="Directorio público" title="Vista paciente" />}>
      <DoctorPublicProfile doctor={doctor} reviews={reviews ?? []} preview bookable />
      <Button
        label="Agendar cita (simular paciente)"
        icon="calendar-outline"
        fullWidth
        onPress={() => router.push('/book-cita')}
        style={styles.bookBtn}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookBtn: {
    marginTop: Spacing.md,
  },
});
