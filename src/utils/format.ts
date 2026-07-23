import type { Tone } from '@/components/ui/chip';

export const WEEKDAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
export const WEEKDAYS_LONG = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];
const MONTHS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];

export function formatMoney(amount: number, currency = 'MXN'): string {
  const n = Math.round(amount).toLocaleString('es-MX');
  return `$${n} ${currency}`;
}

export function formatMoneyShort(amount: number): string {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`;
  return `$${Math.round(amount)}`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'p.m.' : 'a.m.';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** "Hoy", "Mañana", "Ayer", or a weekday + date. */
export function formatDayLabel(iso: string): string {
  const d = new Date(iso);
  const today = startOfDay(new Date());
  const target = startOfDay(d);
  const diffDays = Math.round((target - today) / 86400000);
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Mañana';
  if (diffDays === -1) return 'Ayer';
  return `${WEEKDAYS_LONG[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function ageFromBirthDate(iso?: string): number | null {
  if (!iso) return null;
  const b = new Date(iso);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

export function verificationMeta(isActive: boolean): {
  label: string;
  tone: Tone;
  icon: 'shield-checkmark' | 'time' | 'close-circle';
} {
  return isActive
    ? { label: 'Publicado', tone: 'success', icon: 'shield-checkmark' }
    : { label: 'Oculto', tone: 'warning', icon: 'time' };
}

/** Badge for SEP cédula verification (public is_verified flag). */
export function cedulaVerificationMeta(isVerified: boolean): {
  label: string;
  tone: Tone;
  icon: 'shield-checkmark' | 'ribbon-outline' | 'close-circle';
} {
  return isVerified
    ? { label: 'Cédula verificada', tone: 'success', icon: 'shield-checkmark' }
    : { label: 'Cédula sin verificar', tone: 'warning', icon: 'ribbon-outline' };
}
