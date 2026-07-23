import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { DoctorPublicProfile } from '@/components/doctor-public-profile';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/header';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/hooks/use-theme';
import { useAsyncData } from '@/hooks/use-async';
import { ReviewService } from '@/services';

export default function PatientViewScreen() {
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
      <DoctorPublicProfile doctor={doctor} reviews={reviews ?? []} preview />
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
