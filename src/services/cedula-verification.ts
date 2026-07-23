/**
 * Invokes the `verificar-cedula` Edge Function.
 * The function reads the doctor JWT, checks license_number against SEP,
 * and sets is_verified via service_role (never client-side).
 */

import { supabase } from '@/lib/supabase';

export type CedulaVerificationResult = {
  verified: boolean;
  message?: string;
  error?: string;
};

function parseVerificationResponse(data: unknown): CedulaVerificationResult {
  if (!data || typeof data !== 'object') {
    return { verified: false, error: 'Respuesta inválida del servidor.' };
  }

  const body = data as Record<string, unknown>;
  const verified =
    body.verified === true || body.is_verified === true || body.success === true;

  if (verified) {
    return {
      verified: true,
      message: typeof body.message === 'string' ? body.message : 'Cédula verificada ante la SEP.',
    };
  }

  const errorMsg =
    (typeof body.error === 'string' && body.error) ||
    (typeof body.message === 'string' && body.message) ||
    'No se pudo verificar la cédula profesional.';

  return { verified: false, error: errorMsg };
}

export async function verifyCedula(): Promise<CedulaVerificationResult> {
  if (!supabase) {
    await new Promise((r) => setTimeout(r, 400));
    return { verified: true, message: 'Modo demo: cédula aceptada.' };
  }

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session?.access_token) {
    return { verified: false, error: 'Tu sesión expiró. Vuelve a iniciar sesión.' };
  }

  const { data, error } = await supabase.functions.invoke('verificar-cedula');

  if (error) {
    return { verified: false, error: error.message ?? 'Error al contactar el servicio de verificación.' };
  }

  return parseVerificationResponse(data);
}
