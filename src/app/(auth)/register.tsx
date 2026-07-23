import { useRouter } from 'expo-router';
import { useState } from 'react';
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
import { useAsyncData } from '@/hooks/use-async';
import { EspecialidadService } from '@/services';
import type { SpecialtyOption } from '@/types';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { data: specialtyOptions } = useAsyncData(() => EspecialidadService.listOptions(), []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [specialtyId, setSpecialtyId] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [bio, setBio] = useState('');

  const canSubmit =
    fullName.trim().length >= 2 && email.includes('@') && password.length >= 6;
  const options: SpecialtyOption[] = specialtyOptions ?? [];

  async function onCreate() {
    setError(null);
    setLoading(true);
    const { error, needsConfirmation } = await signUp({
      email: email.trim(),
      password,
      fullName: fullName.trim(),
      especialidadId: specialtyId || undefined,
      phone: phone.trim() || undefined,
      licenseNumber: licenseNumber.trim() || undefined,
      bio: bio.trim() || undefined,
    });
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    if (needsConfirmation) {
      router.replace('/login');
    }
  }

  return (
    <Screen tabBarInset={false} header={<DetailHeader title="Crear cuenta" />}>
      <ThemedText variant="h2">Regístrate gratis</ThemedText>
      <ThemedText variant="small" color="textSecondary" style={styles.subtitle}>
        Solo necesitas correo y contraseña. Completa tu perfil cuando quieras; la cédula se verifica
        únicamente al publicar.
      </ThemedText>

      <Card padding={Spacing.lg} contentStyle={styles.card}>
        <Input
          label="Nombre completo"
          icon="person-outline"
          placeholder="Mariana Robles Fuentes"
          value={fullName}
          onChangeText={setFullName}
        />
        <Input
          label="Correo electrónico"
          icon="mail-outline"
          placeholder="tucorreo@ejemplo.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Input
          label="Contraseña"
          icon="lock-closed-outline"
          placeholder="Mínimo 6 caracteres"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Input
          label="Teléfono (opcional)"
          icon="call-outline"
          placeholder="55 1234 5678"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <View>
          <ThemedText variant="small" color="textSecondary" style={styles.fieldLabel}>
            Especialidad (opcional)
          </ThemedText>
          <View style={styles.wrap}>
            {options.map((s) => (
              <Chip
                key={s.id}
                label={s.name}
                icon={s.icon}
                tone="primary"
                selected={specialtyId === s.id}
                onPress={() => setSpecialtyId(specialtyId === s.id ? '' : s.id)}
              />
            ))}
          </View>
        </View>

        <Input
          label="Cédula profesional (opcional)"
          icon="ribbon-outline"
          value={licenseNumber}
          onChangeText={setLicenseNumber}
          hint="La verificamos ante la SEP solo cuando publiques tu perfil."
        />
        <Input
          label="Sobre mí (opcional)"
          placeholder="Cuéntales a tus pacientes qué te mueve…"
          multiline
          value={bio}
          onChangeText={setBio}
        />

        {error ? (
          <ThemedText variant="small" color="danger">
            {error}
          </ThemedText>
        ) : null}

        <Button
          label="Crear cuenta"
          onPress={onCreate}
          loading={loading}
          disabled={!canSubmit}
          fullWidth
          iconRight="arrow-forward"
        />
      </Card>

      <View style={styles.footer}>
        <ThemedText variant="small" color="textSecondary">
          ¿Ya tienes cuenta?
        </ThemedText>
        <ThemedText variant="small" color="primary" onPress={() => router.replace('/login')}>
          Inicia sesión
        </ThemedText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    marginTop: -Spacing.sm,
    marginBottom: Spacing.xs,
  },
  card: {
    gap: Spacing.lg,
  },
  fieldLabel: {
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
});
