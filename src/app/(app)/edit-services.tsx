import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DetailHeader } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { ServicioService } from '@/services';
import type { Service } from '@/types';
import { useAsyncData } from '@/hooks/use-async';

export default function EditServicesScreen() {
  const router = useRouter();
  const { doctor, userId, refreshDoctor } = useAuth();
  const { data: services, reload } = useAsyncData(
    () => ServicioService.list(userId ?? undefined),
    [userId],
  );

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function startEdit(service: Service) {
    setEditingId(service.id);
    setName(service.name);
    setDescription(service.description ?? '');
    setPrice(String(service.price));
    setDuration(service.durationMinutes ? String(service.durationMinutes) : '');
  }

  function resetForm() {
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice('');
    setDuration('');
  }

  async function onSave() {
    if (!doctor || !name.trim()) return;
    setSaving(true);
    try {
      await ServicioService.upsert(userId ?? doctor.id, {
        id: editingId ?? undefined,
        name: name.trim(),
        description: description.trim() || undefined,
        price: parseFloat(price) || 0,
        currency: 'MXN',
        durationMinutes: duration ? parseInt(duration, 10) || undefined : undefined,
        isActive: true,
      });
      await reload();
      await refreshDoctor();
      resetForm();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen header={<DetailHeader title="Servicios y costos" />}>
      <Card padding={Spacing.lg} contentStyle={styles.card}>
        <ThemedText variant="callout">{editingId ? 'Editar servicio' : 'Nuevo servicio'}</ThemedText>
        <Input label="Nombre" icon="medkit-outline" value={name} onChangeText={setName} />
        <Input label="Descripción" value={description} onChangeText={setDescription} multiline />
        <View style={styles.row}>
          <Input
            label="Precio (MXN)"
            icon="cash-outline"
            keyboardType="decimal-pad"
            value={price}
            onChangeText={setPrice}
            containerStyle={styles.col}
          />
          <Input
            label="Duración (min)"
            keyboardType="number-pad"
            value={duration}
            onChangeText={setDuration}
            containerStyle={styles.col}
          />
        </View>
        <View style={styles.actions}>
          {editingId ? <Button label="Cancelar" variant="ghost" onPress={resetForm} /> : null}
          <Button label={editingId ? 'Actualizar' : 'Agregar'} onPress={onSave} loading={saving} style={styles.grow} />
        </View>
      </Card>

      <ThemedText variant="callout">Tus servicios</ThemedText>
      <View style={styles.list}>
        {(services ?? doctor?.services ?? []).map((s) => (
          <Card key={s.id} padding={Spacing.lg} onPress={() => startEdit(s)} contentStyle={styles.serviceCard}>
            <ThemedText variant="body">{s.name}</ThemedText>
            <ThemedText variant="small" color="textSecondary">
              ${s.price.toLocaleString('es-MX')} {s.currency}
              {s.durationMinutes ? ` · ${s.durationMinutes} min` : ''}
            </ThemedText>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.lg,
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
  list: {
    gap: Spacing.md,
  },
  serviceCard: {
    gap: Spacing.xs,
  },
});
