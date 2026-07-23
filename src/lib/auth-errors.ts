/** Detect Supabase / JWT clock-skew errors (emulator time out of sync). */
export function isJwtClockSkewError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /jwt issued at future|issued at future|clock skew|token is expired/i.test(message);
}
