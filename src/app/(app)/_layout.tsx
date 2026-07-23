import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="edit-profile" options={{ presentation: 'card' }} />
      <Stack.Screen name="edit-services" options={{ presentation: 'card' }} />
      <Stack.Screen name="edit-schedule" options={{ presentation: 'card' }} />
      <Stack.Screen name="cita/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="book-cita" options={{ presentation: 'card' }} />
    </Stack>
  );
}
