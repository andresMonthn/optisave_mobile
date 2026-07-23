import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { DetailHeader } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useAsyncData } from '@/hooks/use-async';
import { CitaService } from '@/services';
import { defaultWhatsAppMessage, whatsAppUrl } from '@/utils/agenda';
import { ageFromBirthDate, formatDate, formatTime } from '@/utils/format';

const STATUS_LABEL = {
  pendiente: { label: 'Pendiente', tone: 'warning' as const },
  confirmada: { label: 'Confirmada', tone: 'success' as const },
  cancelada: { label: 'Cancelada', tone: 'danger' as const },
  completada: { label: 'Completada', tone: 'neutral' as const },
};

export default function CitaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { doctor, userId } = useAuth();

  const { data: cita } = useAsyncData(
    () => CitaService.get(id!, userId ?? undefined),
    [id, userId],
  );

  const [waMessage, setWaMessage] = useState('');

  useEffect(() => {
    if (cita && doctor) {
      setWaMessage(defaultWhatsAppMessage(cita, doctor.fullName));
    }
  }, [cita?.id, doctor?.fullName]);

  if (!cita || !doctor) {
    return (
      <Screen header={<DetailHeader title="Detalle de cita" />}>
        <ThemedText variant="body" color="textSecondary">
          Cargando…
        </ThemedText>
      </Screen>
    );
  }

  const age = ageFromBirthDate(cita.patientBirthDate);
  const status = STATUS_LABEL[cita.status];
  const message = waMessage;

  return (
    <Screen header={<DetailHeader title="Detalle de cita" />}>
      <Card padding={Spacing.lg} contentStyle={styles.card}>
        <View style={styles.row}>
          <ThemedText variant="h2">{cita.patientName}</ThemedText>
          <Chip label={status.label} tone={status.tone} />
        </View>
        {age != null ? (
          <ThemedText variant="body" color="textSecondary">
            {age} años
          </ThemedText>
        ) : null}
        {cita.patientPhone ? (
          <ThemedText variant="callout" color="primary">
            {cita.patientPhone}
          </ThemedText>
        ) : null}
      </Card>

      <Card padding={Spacing.lg} contentStyle={styles.card}>
        <ThemedText variant="callout">Servicio</ThemedText>
        <ThemedText variant="body">{cita.serviceName}</ThemedText>
        <ThemedText variant="small" color="textSecondary">
          {formatDate(cita.startsAt)} · {formatTime(cita.startsAt)}
          {cita.endsAt ? ` – ${formatTime(cita.endsAt)}` : ''}
        </ThemedText>
      </Card>

      {cita.patientPhone ? (
        <Card padding={Spacing.lg} contentStyle={styles.card}>
          <ThemedText variant="callout">Mensaje de WhatsApp</ThemedText>
          <ThemedText variant="caption" color="textMuted">
            Edita el mensaje y envíalo manualmente con un toque (sin automatización).
          </ThemedText>
          <Input multiline value={message} onChangeText={setWaMessage} />
          <Button
            label="Abrir WhatsApp"
            icon="chatbubble-outline"
            fullWidth
            onPress={() => Linking.openURL(whatsAppUrl(cita.patientPhone!, message))}
          />
        </Card>
      ) : null}

      <Button label="Volver a la agenda" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
});
