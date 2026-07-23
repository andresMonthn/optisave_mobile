/** Helpers for the day calendar (Google Calendar–style agenda). */

import type { Cita, ScheduleSlot } from '@/types';

export const HOUR_HEIGHT = 64;
export const DEFAULT_DAY_START = 7 * 60;
export const DEFAULT_DAY_END = 21 * 60;

export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
}

export function minutesToLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function isoToMinutes(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

export function sameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfDayDate(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

/** Working windows for a JS weekday (0=Sun … 6=Sat). */
export function slotsForWeekday(schedule: ScheduleSlot[], weekday: number): ScheduleSlot[] {
  return schedule
    .filter((s) => s.weekday === weekday)
    .sort((a, b) => parseTimeToMinutes(a.start) - parseTimeToMinutes(b.start));
}

export function dayBounds(
  schedule: ScheduleSlot[],
  weekday: number,
  citas: Cita[],
  date: Date,
): { start: number; end: number } {
  const slots = slotsForWeekday(schedule, weekday);
  let start = DEFAULT_DAY_START;
  let end = DEFAULT_DAY_END;

  if (slots.length) {
    start = Math.min(...slots.map((s) => parseTimeToMinutes(s.start))) - 60;
    end = Math.max(...slots.map((s) => parseTimeToMinutes(s.end))) + 60;
  }

  citas
    .filter((c) => sameCalendarDay(new Date(c.startsAt), date))
    .forEach((c) => {
      const s = isoToMinutes(c.startsAt);
      const e = c.endsAt ? isoToMinutes(c.endsAt) : s + 30;
      start = Math.min(start, s - 30);
      end = Math.max(end, e + 30);
    });

  start = Math.max(0, Math.floor(start / 60) * 60);
  end = Math.min(24 * 60, Math.ceil(end / 60) * 60);
  return { start, end };
}

export function citaDurationMinutes(cita: Cita): number {
  if (cita.endsAt) {
    return Math.max(15, isoToMinutes(cita.endsAt) - isoToMinutes(cita.startsAt));
  }
  return 30;
}

export function isMinuteInSlots(minute: number, slots: ScheduleSlot[]): boolean {
  return slots.some((s) => {
    const a = parseTimeToMinutes(s.start);
    const b = parseTimeToMinutes(s.end);
    return minute >= a && minute < b;
  });
}

export function defaultWhatsAppMessage(cita: Cita, doctorName: string): string {
  const when = new Date(cita.startsAt);
  const date = when.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
  const time = when.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  return `Hola ${cita.patientName}, soy ${doctorName}. Te confirmo tu cita de ${cita.serviceName} el ${date} a las ${time}. ¿Te funciona este horario?`;
}

export function whatsAppUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '');
  const normalized = digits.length === 10 ? `52${digits}` : digits;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export type TimeSlotOption = { startsAt: string; label: string };

/** Open slots for booking (respects split schedule + existing citas). */
export function availableSlots(
  date: Date,
  schedule: ScheduleSlot[],
  citas: Cita[],
  durationMinutes: number,
): TimeSlotOption[] {
  const weekday = date.getDay();
  const daySlots = slotsForWeekday(schedule, weekday);
  if (!daySlots.length) return [];

  const dayCitas = citas.filter(
    (c) => sameCalendarDay(new Date(c.startsAt), date) && c.status !== 'cancelada',
  );
  const options: TimeSlotOption[] = [];
  const step = 30;
  const now = new Date();

  for (const window of daySlots) {
    let cursor = parseTimeToMinutes(window.start);
    const windowEnd = parseTimeToMinutes(window.end);
    while (cursor + durationMinutes <= windowEnd) {
      const startDate = new Date(date);
      startDate.setHours(Math.floor(cursor / 60), cursor % 60, 0, 0);
      const endMin = cursor + durationMinutes;

      const overlaps = dayCitas.some((c) => {
        const cs = isoToMinutes(c.startsAt);
        const ce = c.endsAt ? isoToMinutes(c.endsAt) : cs + 30;
        return cursor < ce && endMin > cs;
      });

      const isPast = sameCalendarDay(date, now) && startDate <= now;
      if (!overlaps && !isPast) {
        options.push({ startsAt: startDate.toISOString(), label: minutesToLabel(cursor) });
      }
      cursor += step;
    }
  }
  return options;
}

export function datesWithSchedule(schedule: ScheduleSlot[], daysAhead = 14): Date[] {
  const weekdays = new Set(schedule.map((s) => s.weekday));
  const out: Date[] = [];
  const base = startOfDayDate(new Date());
  for (let i = 0; i < daysAhead; i++) {
    const d = addDays(base, i);
    if (weekdays.has(d.getDay())) out.push(d);
  }
  return out;
}
