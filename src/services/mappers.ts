/**
 * Row (snake_case, Supabase) → domain (camelCase) mappers.
 */

import type { Database } from '@/lib/database.types';
import type { Cita, Clinic, Doctor, Especialidad, Paciente, Review, ScheduleSlot, Service } from '@/types';
import { citaRowToStartsAt } from '@/utils/citas-db';

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

type CitaRowJoined = Tables['citas']['Row'] & {
  pacientes?: Pick<Tables['pacientes']['Row'], 'full_name' | 'birth_date' | 'phone'> | null;
  servicios?: { name: string } | null;
  sedes?: { name: string } | null;
};

export function mapPaciente(r: Tables['pacientes']['Row']): Paciente {
  return {
    id: r.id,
    doctorId: r.doctor_id,
    fullName: r.full_name,
    birthDate: r.birth_date ?? undefined,
    phone: r.phone,
    email: r.email ?? undefined,
    createdAt: r.created_at,
  };
}

export function mapCita(r: CitaRowJoined): Cita {
  const startsAt = citaRowToStartsAt(r.fecha, r.hora_inicio);
  const endsAt = citaRowToStartsAt(r.fecha, r.hora_fin);
  return {
    id: r.id,
    patientId: r.paciente_id,
    patientName: r.pacientes?.full_name ?? 'Paciente',
    patientPhone: r.pacientes?.phone,
    patientBirthDate: r.pacientes?.birth_date ?? undefined,
    serviceId: r.servicio_id ?? undefined,
    serviceName: r.servicios?.name ?? 'Consulta',
    sedeId: r.sede_id ?? undefined,
    fecha: r.fecha,
    horaInicio: r.hora_inicio.slice(0, 5),
    horaFin: r.hora_fin.slice(0, 5),
    startsAt,
    endsAt,
    status: r.status,
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
