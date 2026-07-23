/**
 * Row (snake_case, Supabase) → domain (camelCase) mappers.
 */

import type { Database } from '@/lib/database.types';
import type { Clinic, Doctor, Especialidad, Review, ScheduleSlot, Service } from '@/types';

type Tables = Database['public']['Tables'];

type EspecialidadJoin = {
  especialidad_id: string;
  especialidades: { name: string; slug: string } | null;
};

/** DB day_of_week: 1=dom … 7=sáb → UI weekday: 0=dom … 6=sáb */
export function dbDayToWeekday(dayOfWeek: number): number {
  return dayOfWeek === 1 ? 0 : dayOfWeek - 1;
}

/** UI weekday → DB day_of_week */
export function weekdayToDbDay(weekday: number): number {
  return weekday === 0 ? 1 : weekday + 1;
}

export function mapEspecialidad(r: Tables['especialidades']['Row']): Especialidad {
  return { id: r.id, name: r.name, slug: r.slug };
}

export function mapClinic(r: Tables['sedes']['Row']): Clinic {
  return {
    id: r.id,
    name: r.name,
    addressLine: r.address ?? '',
    city: r.city ?? '',
    state: r.state ?? '',
    phone: r.phone ?? undefined,
    isPrimary: r.is_primary,
  };
}

export function mapService(r: Tables['servicios']['Row']): Service {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? undefined,
    price: Number(r.price),
    currency: r.currency,
    durationMinutes: r.duration_minutes ?? undefined,
    isActive: r.is_active,
  };
}

export function mapSchedule(
  r: Tables['horarios']['Row'],
  locationName?: string,
): ScheduleSlot {
  return {
    id: r.id,
    weekday: dbDayToWeekday(r.day_of_week),
    start: r.start_time.slice(0, 5),
    end: r.end_time.slice(0, 5),
    locationId: r.location_id ?? undefined,
    locationName,
  };
}

export function mapDoctor(
  r: Tables['doctores']['Row'],
  related?: {
    specialties?: Especialidad[];
    clinics?: Clinic[];
    services?: Service[];
    schedule?: ScheduleSlot[];
  },
): Doctor {
  const specialties = related?.specialties ?? [];
  return {
    id: r.id,
    fullName: r.full_name,
    avatarUrl: r.avatar_url,
    licenseNumber: r.license_number ?? undefined,
    phone: r.phone ?? undefined,
    bio: r.bio ?? '',
    specialty: specialties[0]?.name ?? 'Medicina General',
    specialties,
    clinics: related?.clinics ?? [],
    services: related?.services ?? [],
    schedule: related?.schedule ?? [],
    ratingAvg: Number(r.avg_rating) || 0,
    ratingCount: r.review_count,
    isActive: r.is_active,
    isVerified: r.is_verified ?? false,
    hasCrmLicense: r.has_crm_license,
  };
}

export function mapReview(r: Tables['resenas']['Row']): Review {
  return {
    id: r.id,
    reviewerName: r.reviewer_name,
    rating: r.rating,
    comment: r.comment ?? undefined,
    createdAt: r.created_at,
  };
}

export function mapJoinedSpecialties(rows: EspecialidadJoin[]): Especialidad[] {
  return rows
    .filter((r) => r.especialidades)
    .map((r) => ({
      id: r.especialidad_id,
      name: r.especialidades!.name,
      slug: r.especialidades!.slug,
    }));
}
