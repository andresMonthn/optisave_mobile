/**
 * Authentication context — Supabase when configured, mock otherwise.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { isJwtClockSkewError } from '@/lib/auth-errors';
import { DoctorService } from '@/services';
import type { Doctor } from '@/types';

const MOCK_SESSION_KEY = 'optisave.auth.mock';

export type RegisterInput = {
  email: string;
  password: string;
  fullName: string;
  especialidadId?: string;
  phone?: string;
  bio?: string;
  licenseNumber?: string;
};

export type AuthResult = { error?: string; needsConfirmation?: boolean };

type AuthContextValue = {
  initializing: boolean;
  isAuthenticated: boolean;
  mode: 'supabase' | 'mock';
  userId: string | null;
  email: string | null;
  doctor: Doctor | null;
  loadingDoctor: boolean;
  refreshDoctor: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (input: RegisterInput) => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const mode: 'supabase' | 'mock' = isSupabaseConfigured ? 'supabase' : 'mock';

  const [initializing, setInitializing] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [mockEmail, setMockEmail] = useState<string | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loadingDoctor, setLoadingDoctor] = useState(false);

  const userId = session?.user?.id ?? (mockEmail ? 'doc-001' : null);
  const email = session?.user?.email ?? mockEmail;
  const isAuthenticated = mode === 'supabase' ? !!session : !!mockEmail;

  const loadDoctor = useCallback(async (uid?: string) => {
    setLoadingDoctor(true);
    try {
      const d = await DoctorService.getCurrent(uid);
      setDoctor(d);
    } catch (e) {
      if (isJwtClockSkewError(e) && supabase) {
        console.warn('[auth] session clock skew — signing out', e);
        await supabase.auth.signOut();
        setSession(null);
      } else {
        console.warn('[auth] loadDoctor failed', e);
      }
      setDoctor(null);
    } finally {
      setLoadingDoctor(false);
    }
  }, []);

  const refreshDoctor = useCallback(async () => {
    if (isAuthenticated) await loadDoctor(userId ?? undefined);
  }, [isAuthenticated, userId, loadDoctor]);

  useEffect(() => {
    let active = true;

    async function boot() {
      if (supabase) {
        const { data, error } = await supabase.auth.getSession();
        if (error && isJwtClockSkewError(error)) {
          await supabase.auth.signOut();
          if (active) setSession(null);
        } else if (active) {
          setSession(data.session);
        }
      } else {
        const raw = await AsyncStorage.getItem(MOCK_SESSION_KEY);
        if (active && raw) {
          try {
            setMockEmail(JSON.parse(raw).email ?? null);
          } catch {
            setMockEmail(null);
          }
        }
      }
      if (active) setInitializing(false);
    }

    boot();

    const sub = supabase?.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => {
      active = false;
      sub?.data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadDoctor(userId ?? undefined);
    } else {
      setDoctor(null);
    }
  }, [isAuthenticated, userId, loadDoctor]);

  const signIn = useCallback<AuthContextValue['signIn']>(async (emailArg, password) => {
    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email: emailArg, password });
      if (error && isJwtClockSkewError(error)) {
        return {
          error:
            'La hora del dispositivo no coincide con el servidor. Activa fecha y hora automáticas en el emulador e intenta de nuevo.',
        };
      }
      return { error: error?.message };
    }
    await AsyncStorage.setItem(MOCK_SESSION_KEY, JSON.stringify({ email: emailArg }));
    setMockEmail(emailArg);
    return {};
  }, []);

  const signUp = useCallback<AuthContextValue['signUp']>(async (input) => {
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: { data: { full_name: input.fullName, role: 'doctor' } },
      });
      if (error) return { error: error.message };

      const uid = data.user?.id;
      if (uid) {
        try {
          await DoctorService.update(uid, {
            fullName: input.fullName,
            phone: input.phone,
            bio: input.bio,
            licenseNumber: input.licenseNumber,
            especialidadId: input.especialidadId,
          });
        } catch (e) {
          console.warn('[auth] profile seed failed — account created anyway', e);
        }
      }
      if (!data.session) return { needsConfirmation: true };
      return {};
    }

    await DoctorService.update('doc-001', {
      fullName: input.fullName,
      phone: input.phone,
      bio: input.bio ?? '',
      licenseNumber: input.licenseNumber,
    });
    await AsyncStorage.setItem(MOCK_SESSION_KEY, JSON.stringify({ email: input.email }));
    setMockEmail(input.email);
    return {};
  }, []);

  const signOut = useCallback<AuthContextValue['signOut']>(async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setSession(null);
    } else {
      await AsyncStorage.removeItem(MOCK_SESSION_KEY);
      setMockEmail(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      initializing,
      isAuthenticated,
      mode,
      userId,
      email,
      doctor,
      loadingDoctor,
      refreshDoctor,
      signIn,
      signUp,
      signOut,
    }),
    [
      initializing,
      isAuthenticated,
      mode,
      userId,
      email,
      doctor,
      loadingDoctor,
      refreshDoctor,
      signIn,
      signUp,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
