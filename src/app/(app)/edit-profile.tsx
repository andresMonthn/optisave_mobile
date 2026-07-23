import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { DetailHeader } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { EspecialidadService } from '@/services';
import { DoctorService } from '@/services';
import type { SpecialtyOption } from '@/types';
import { useAsyncData } from '@/hooks/use-async';

export default function EditProfileScreen() {
  const router = useRouter();
  const { doctor, userId, refreshDoctor } = useAuth();
  const { data: specialtyOptions } = useAsyncData(() => EspecialidadService.listOptions(), []);

  const [fullName, setFullName] = useState(doctor?.fullName ?? '');
  const [licenseNumber, setLicenseNumber] = useState(doctor?.licenseNumber ?? '');
  const [phone, setPhone] = useState(doctor?.phone ?? '');
  const [bio, setBio] = useState(doctor?.bio ?? '');
  const [specialtyId, setSpecialtyId] = useState(doctor?.specialties[0]?.id ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!doctor) return;
    setFullName(doctor.fullName);
    setLicenseNumber(doctor.licenseNumber ?? '');
    setPhone(doctor.phone ?? '');
    setBio(doctor.bio);
    setSpecialtyId(doctor.specialties[0]?.id ?? '');
  }, [doctor]);

  async function onSave() {
    if (!doctor) return;
    setSaving(true);
    try {
      await DoctorService.update(userId ?? doctor.id, {
        fullName: fullName.trim(),
        licenseNumber: licenseNumber.trim() || undefined,
        phone: phone.trim() || undefined,
        bio: bio.trim(),
        especialidadId: specialtyId || undefined,
      });
      await refreshDoctor();
      router.back();
    } finally {
      setSaving(false);
    }
  }

  const options: SpecialtyOption[] = specialtyOptions ?? [];

  return (
    <Screen header={<DetailHeader title="Editar perfil" />}>
      <Card padding={Spacing.lg} contentStyle={styles.card}>
        <Input label="Nombre completo" icon="person-outline" value={fullName} onChangeText={setFullName} />
        <Input
          label="Cédula profesional"
          icon="ribbon-outline"
          value={licenseNumber}
          onChangeText={setLicenseNumber}
          placeholder="N.º de cédula"
          hint="Opcional. Se verifica ante la SEP únicamente al publicar tu perfil."
        />
        <Input label="Teléfono" icon="call-outline" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />

        <View>
          <ThemedText variant="small" color="textSecondary" style={styles.label}>
            Especialidad
          </ThemedText>
          <View style={styles.wrap}>
            {options.map((s) => (
              <Chip
                key={s.id}
                label={s.name}
                icon={s.icon}
                tone="primary"
                selected={specialtyId === s.id}
                onPress={() => setSpecialtyId(s.id)}
              />
            ))}
          </View>
        </View>

        <Input
          label="Sobre mí"
          placeholder="Cuéntales a tus pacientes qué te mueve como profesional…"
          multiline
          value={bio}
          onChangeText={setBio}
        />
      </Card>

      <Button label="Guardar cambios" onPress={onSave} loading={saving} fullWidth icon="checkmark" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
});
