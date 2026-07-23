import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BrandMark } from '@/components/brand';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, mode } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 3 && password.length >= 4;

  async function onSubmit() {
    setError(null);
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) setError(error);
    // On success, the auth guard swaps to the app group automatically.
  }

  return (
    <Screen tabBarInset={false} contentContainerStyle={styles.content}>
      <View style={styles.brand}>
        <BrandMark />
      </View>

      <View style={styles.heading}>
        <ThemedText variant="h1">Bienvenido de vuelta</ThemedText>
        <ThemedText variant="body" color="textSecondary">
          Inicia sesión para administrar tu consulta.
        </ThemedText>
      </View>

      {mode === 'mock' ? (
        <Chip
          label="Modo demo — inicia con cualquier correo"
          icon="flask-outline"
          tone="info"
          style={styles.demoChip}
        />
      ) : null}

      <Card padding={Spacing.lg} contentStyle={styles.card}>
        <Input
          label="Correo electrónico"
          icon="mail-outline"
          placeholder="tucorreo@ejemplo.com"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
        />
        <Input
          label="Contraseña"
          icon="lock-closed-outline"
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {error ? (
          <ThemedText variant="small" color="danger">
            {error}
          </ThemedText>
        ) : null}
        <Button
          label="Iniciar sesión"
          onPress={onSubmit}
          loading={loading}
          disabled={!canSubmit}
          fullWidth
          iconRight="arrow-forward"
        />
      </Card>

      <View style={styles.footer}>
        <ThemedText variant="small" color="textSecondary">
          ¿Aún no tienes cuenta?
        </ThemedText>
        <Pressable onPress={() => router.push('/register')} hitSlop={8}>
          <ThemedText variant="small" color="primary">
            Regístrate gratis
          </ThemedText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  brand: {
    alignItems: 'flex-start',
  },
  heading: {
    gap: 4,
  },
  demoChip: {
    alignSelf: 'flex-start',
  },
  card: {
    gap: Spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
});
