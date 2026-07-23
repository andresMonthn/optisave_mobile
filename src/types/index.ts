/**
 * OptiSave Mobile — domain types aligned with optisave_mobile Supabase schema.
 */

import type { IconName } from '@/components/ui/icon';

export type UUID = string;

export type CitaStatus = 'pendiente' | 'confirmada' | 'cancelada' | 'completada';

/** Patient record (tabla `pacientes`). */
export interface Paciente {
  id: UUID;
  doctorId: UUID;
  fullName: string;
  birthDate?: string;
  phone: string;
  email?: string;
  createdAt: string;
}

/** Booked appointment (tabla `citas` + join `pacientes`). */
export interface Cita {
  id: UUID;
  patientId?: UUID;
  patientName: string;
  patientPhone?: string;
  patientBirthDate?: string;
  serviceId?: UUID;
  serviceName: string;
  sedeId?: UUID;
  /** YYYY-MM-DD — columna `fecha` en BD. */
  fecha?: string;
  /** HH:MM — columnas `hora_inicio` / `hora_fin` en BD. */
  horaInicio?: string;
  horaFin?: string;
  /** Derivado de fecha + hora para la UI del calendario. */
  startsAt: string;
  endsAt?: string | null;
  status: CitaStatus;
  createdAt: string;
}

/** In-app notification (plan gratis — sin push nativo automatizado). */
export interface AppNotification {
  id: UUID;
  title: string;
  body: string;
  citaId?: UUID;
  createdAt: string;
  read: boolean;
}

export interface Especialidad {
  id: UUID;
  name: string;
  slug: string;
}

/** A consulting office / clinic (sede). */
export interface Clinic {
  id: UUID;
  name: string;
  addressLine: string;
  city: string;
  state: string;
  phone?: string;
  isPrimary?: boolean;
}

/** Service offered by the doctor with price. */
export interface Service {
  id: UUID;
  name: string;
  description?: string;
  price: number;
  currency: string;
  durationMinutes?: number;
  isActive: boolean;
}

/** One weekly availability window. `weekday`: 0=Sun … 6=Sat (UI convention). */
export interface ScheduleSlot {
  id: UUID;
  weekday: number;
  start: string;
  end: string;
  locationId?: UUID;
  locationName?: string;
}

/** The doctor's public profile + admin metadata. */
export interface Doctor {
  id: UUID;
  fullName: string;
  avatarUrl?: string | null;
  licenseNumber?: string;
  phone?: string;
  bio: string;
  specialty: string;
  specialties: Especialidad[];
  clinics: Clinic[];
  services: Service[];
  schedule: ScheduleSlot[];
  ratingAvg: number;
  ratingCount: number;
  isActive: boolean;
  /** Public flag — set only by the verificar-cedula Edge Function. */
  isVerified: boolean;
  hasCrmLicense: boolean;
}

export type PublishProfileResult = {
  doctor: Doctor;
  verified: boolean;
  message?: string;
  error?: string;
};

export interface Review {
  id: UUID;
  reviewerName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

/** UI helper for specialty chips in forms. */
export interface SpecialtyOption {
  id: UUID;
  name: string;
  icon: IconName;
}

/** Aggregated numbers for the dashboard. */
export interface DashboardSummary {
  servicesCount: number;
  clinicsCount: number;
  scheduleDays: number;
  ratingAvg: number;
  ratingCount: number;
}
