import { Redirect } from 'expo-router';

import { useAuth } from '@/context/auth';

/** Entry point — routes into the right group once auth has initialized. */
export default function Index() {
  const { isAuthenticated, initializing } = useAuth();
  if (initializing) return null;
  return <Redirect href={isAuthenticated ? '/agenda' : '/login'} />;
}
