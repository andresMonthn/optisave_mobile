import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
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
import { HorarioService } from '@/services';
import type { ScheduleSlot } from '@/types';
import { WEEKDAYS_LONG } from '@/utils/format';

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export default function EditScheduleScreen() {
  const { colors } = useTheme();
  const { doctor, userId, refreshDoctor } = useAuth();
  const { data: slots, reload, loading } = useAsyncData(
    () => HorarioService.list(userId ?? undefined),
    [userId],
  );

  const [draft, setDraft] = useState<Partial<ScheduleSlot> | null>(null);
  const [saving, setSaving] = useState(false);

  function startAdd(weekday: number) {
    setDraft({ weekday, start: '09:00', end: '14:00' });
  }

  function startEdit(slot: ScheduleSlot) {
    setDraft({ ...slot });
  }

  async function onSave() {
    if (!doctor || !draft?.weekday || !draft.start || !draft.end) return;
    setSaving(true);
    try {
      await HorarioService.upsert(userId ?? doctor.id, {
        id: draft.id,
        weekday: draft.weekday,
        start: draft.start,
        end: draft.end,
        locationId: draft.locationId,
      });
      await reload();
      await refreshDoctor();
      setDraft(null);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!doctor) return;
    await HorarioService.remove(id, userId ?? doctor.id);
    await reload();
    await refreshDoctor();
    setDraft(null);
  }

  const byDay = WEEK_ORDER.map((wd) => ({
    weekday: wd,
    label: WEEKDAYS_LONG[wd],
    items: (slots ?? []).filter((s) => s.weekday === wd),
  }));

  return (
    <Screen header={<DetailHeader title="Horarios de atención" />}>
      <Card padding={Spacing.lg} tone="strong" contentStyle={styles.info}>
        <ThemedText variant="small" color="textSecondary">
          Puedes agregar varios horarios el mismo día (horario partido). Ejemplo: 10:00–14:00 y 16:00–20:00.
        </ThemedText>
      </Card>

      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        byDay.map(({ weekday, label, items }) => (
          <Card key={weekday} padding={Spacing.lg} contentStyle={styles.dayCard}>
            <View style={styles.dayHeader}>
              <ThemedText variant="callout">{label}</ThemedText>
              <Chip label="+ Agregar otro horario" tone="primary" onPress={() => startAdd(weekday)} />
            </View>
            {items.length ? (
              items.map((s) => (
                <Pressable key={s.id} onPress={() => startEdit(s)} style={styles.slotRow}>
                  <ThemedText variant="body">
                    {s.start} – {s.end}
                  </ThemedText>
                  {s.locationName ? (
                    <ThemedText variant="caption" color="textMuted">
                      {s.locationName}
                    </ThemedText>
                  ) : null}
                </Pressable>
              ))
            ) : (
              <ThemedText variant="small" color="textMuted">
                Cerrado
              </ThemedText>
            )}
          </Card>
        ))
      )}

      {draft ? (
        <Card padding={Spacing.lg} contentStyle={styles.form}>
          <ThemedText variant="callout">
            {draft.id ? 'Editar horario' : 'Nuevo horario'} — {WEEKDAYS_LONG[draft.weekday!]}
          </ThemedText>
          <View style={styles.row}>
            <Input label="Inicio" value={draft.start ?? ''} onChangeText={(v) => setDraft({ ...draft, start: v })} containerStyle={styles.col} />
            <Input label="Fin" value={draft.end ?? ''} onChangeText={(v) => setDraft({ ...draft, end: v })} containerStyle={styles.col} />
          </View>
          <View style={styles.actions}>
            {draft.id ? (
              <Button label="Eliminar" variant="ghost" onPress={() => onDelete(draft.id!)} />
            ) : (
              <Button label="Cancelar" variant="ghost" onPress={() => setDraft(null)} />
            )}
            <Button label="Guardar" onPress={onSave} loading={saving} style={styles.grow} />
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  info: {
    gap: Spacing.sm,
  },
  dayCard: {
    gap: Spacing.sm,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  slotRow: {
    paddingVertical: Spacing.sm,
    gap: 2,
  },
  form: {
    gap: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  col: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  grow: {
    flex: 1,
  },
});
