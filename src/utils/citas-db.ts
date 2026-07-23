/** Helpers for `pacientes` / `citas` columns (fecha + hora_inicio/hora_fin). */

export function dateToIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function timeFromDate(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}:00`;
}

export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
}

/** Build local ISO datetime from DB `fecha` + `hora`. */
export function citaRowToStartsAt(fecha: string, hora: string): string {
  const [y, mo, d] = fecha.split('-').map(Number);
  const [h, min] = hora.split(':').map(Number);
  return new Date(y, mo - 1, d, h, min, 0).toISOString();
}

export function citaPartsFromIso(
  startsAtIso: string,
  durationMinutes: number,
): { fecha: string; hora_inicio: string; hora_fin: string } {
  const start = new Date(startsAtIso);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  return {
    fecha: dateToIsoDate(start),
    hora_inicio: timeFromDate(start),
    hora_fin: timeFromDate(end),
  };
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('52')) return digits.slice(2);
  return digits;
}

/** True if cita is still in the future (local time). */
export function isUpcomingCita(fecha: string, horaInicio: string, now = new Date()): boolean {
  const today = dateToIsoDate(now);
  if (fecha > today) return true;
  if (fecha < today) return false;
  return parseTimeToMinutes(horaInicio) >= now.getHours() * 60 + now.getMinutes();
}
