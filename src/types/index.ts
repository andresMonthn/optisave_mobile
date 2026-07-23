/**
 * OptiSave Mobile — domain types aligned with optisave_mobile Supabase schema.
 */

import type { IconName } from '@/components/ui/icon';

export type UUID = string;

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
