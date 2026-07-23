import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { DetailHeader } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/hooks/use-theme';
import { useAsyncData } from '@/hooks/use-async';
import { CitaService } from '@/services';
import type { Service } from '@/types';
import { availableSlots, datesWithSchedule } from '@/utils/agenda';
import { formatDayLabel } from '@/utils/format';

export default function BookCitaScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { doctor, userId } = useAuth();

  const activeServices = useMemo(
    () => (doctor?.services ?? []).filter((s) => s.isActive),
    [doctor?.services],
  );

  const bookableDates = useMemo(
    () => (doctor ? datesWithSchedule(doctor.schedule) : []),
    [doctor],
  );

  const [service, setService] = useState<Service | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [slotIso, setSlotIso] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const selectedDate = date ?? bookableDates[0] ?? null;
  const selectedService = service ?? activeServices[0] ?? null;
  const duration = selectedService?.durationMinutes ?? 30;

  const dateKey = selectedDate?.toISOString() ?? '';
  const { data: dayCitas, loading: loadingSlots } = useAsyncData(
    () => (selectedDate ? CitaService.listForDay(userId ?? undefined, selectedDate) : Promise.resolve([])),
    [userId, dateKey],
  );

  const slots = useMemo(() => {
    if (!doctor || !selectedDate) return [];
    return availableSlots(selectedDate, doctor.schedule, dayCitas ?? [], duration);
  }, [doctor, selectedDate, dayCitas, duration]);

  async function onSubmit() {
    if (!doctor || !selectedService || !selectedDate || !slotIso || !name.trim() || !phone.trim()) return;
    setSaving(true);
    try {
      await CitaService.create(userId ?? doctor.id, {
        patientName: name.trim(),
        patientPhone: phone.trim(),
        patientBirthDate: birthDate.trim() || undefined,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        startsAt: slotIso,
        durationMinutes: duration,
        sedeId: doctor.clinics.find((c) => c.isPrimary)?.id ?? doctor.clinics[0]?.id,
      });
      setDone(true);
    } catch (e) {
      Alert.alert(
        'No se pudo agendar',
        e instanceof Error ? e.message : 'Intenta de nuevo con otro horario.',
      );
    } finally {
      setSaving(false);
    }
  }

  if (!doctor) {
    return (
      <Screen header={<DetailHeader title="Agendar cita" />}>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  if (!activeServices.length || !bookableDates.length) {
    return (
      <Screen header={<DetailHeader title="Agendar cita" />}>
        <Card padding={Spacing.lg}>
          <ThemedText variant="body" color="textSecondary">
            {!activeServices.length
              ? 'Agrega al menos un servicio activo en Perfil para permitir reservas.'
              : 'Configura horarios de atención en Perfil para habilitar citas.'}
          </ThemedText>
        </Card>
        <Button label="Volver" variant="ghost" onPress={() => router.back()} />
      </Screen>
    );
  }

  if (done) {
    return (
      <Screen header={<DetailHeader title="Cita registrada" />}>
        <Card padding={Spacing.lg} contentStyle={styles.gap}>
          <ThemedText variant="h2">¡Listo!</ThemedText>
          <ThemedText variant="body" color="textSecondary">
            Tu cita quedó registrada. El doctor recibirá la notificación «Tienes una nueva cita» en su Agenda.
          </ThemedText>
        </Card>
        <Button label="Volver a vista paciente" fullWidth onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen header={<DetailHeader title="Agendar cita" />}>
      <Card padding={Spacing.lg} contentStyle={styles.gap}>
        <ThemedText variant="callout">Servicio</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {activeServices.map((s) => (
            <Chip
              key={s.id}
              label={s.name}
              tone="primary"
              selected={selectedService?.id === s.id}
              onPress={() => {
                setService(s);
                setSlotIso(null);
              }}
            />
          ))}
        </ScrollView>
      </Card>

      <Card padding={Spacing.lg} contentStyle={styles.gap}>
        <ThemedText variant="callout">Fecha</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {bookableDates.map((d) => (
            <Chip
              key={d.toISOString()}
              label={formatDayLabel(d.toISOString())}
              selected={selectedDate?.toDateString() === d.toDateString()}
              onPress={() => {
                setDate(d);
                setSlotIso(null);
              }}
            />
          ))}
        </ScrollView>
      </Card>

      <Card padding={Spacing.lg} contentStyle={styles.gap}>
        <ThemedText variant="callout">Horario disponible</ThemedText>
        {loadingSlots ? (
          <ActivityIndicator color={colors.primary} />
        ) : slots.length ? (
          <View style={styles.chipsWrap}>
            {slots.map((s) => (
              <Chip
                key={s.startsAt}
                label={s.label}
                tone="primary"
                selected={slotIso === s.startsAt}
                onPress={() => setSlotIso(s.startsAt)}
              />
            ))}
          </View>
        ) : (
          <ThemedText variant="small" color="textMuted">
            No hay horarios libres este día. Prueba otra fecha.
          </ThemedText>
        )}
      </Card>

      <Card padding={Spacing.lg} contentStyle={styles.gap}>
        <ThemedText variant="callout">Datos del paciente</ThemedText>
        <Input label="Nombre completo" value={name} onChangeText={setName} />
        <Input label="Teléfono" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Input
          label="Fecha de nacimiento (opcional)"
          placeholder="AAAA-MM-DD"
          value={birthDate}
          onChangeText={setBirthDate}
        />
      </Card>

      <Button
        label="Confirmar cita"
        fullWidth
        loading={saving}
        disabled={!slotIso || !name.trim() || !phone.trim()}
        onPress={onSubmit}
      />
      <Button label="Cancelar" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: {
    gap: Spacing.sm,
  },
  chips: {
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
});
