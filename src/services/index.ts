/**
 * Data services — Supabase first, mock fallback when not configured.
 */

import { MOCK_DOCTOR, MOCK_REVIEWS, SPECIALTY_OPTIONS } from '@/data/mock';
import { supabase } from '@/lib/supabase';
import {
  mapClinic,
  mapDoctor,
  mapJoinedSpecialties,
  mapReview,
  mapSchedule,
  mapService,
  mapEspecialidad,
} from '@/services/mappers';
import { verifyCedula } from '@/services/cedula-verification';
import type { DashboardSummary, Doctor, Especialidad, PublishProfileResult, Review, Service, SpecialtyOption } from '@/types';

const delay = (ms = 250) => new Promise<void>((r) => setTimeout(r, ms));

let mockDoctor: Doctor = structuredClone(MOCK_DOCTOR);

/** Public columns only — audit fields stay server-side. */
const DOCTOR_PUBLIC_COLUMNS =
  'id, full_name, license_number, phone, bio, avatar_url, is_active, is_verified, avg_rating, review_count, has_crm_license, created_at, updated_at';

const SLUG_ICON: Record<string, SpecialtyOption['icon']> = {
  medicina: 'pulse-outline',
  'medicina-general': 'pulse-outline',
  optometria: 'eye-outline',
  ortodoncia: 'medkit-outline',
  podologia: 'body-outline',
  cardiologia: 'heart-outline',
  dermatologia: 'body-outline',
  ginecologia: 'female-outline',
  pediatria: 'happy-outline',
  nutricion: 'nutrition-outline',
  traumatologia: 'fitness-outline',
  psicologia: 'chatbubbles-outline',
  odontologia: 'medkit-outline',
};

function iconForSlug(slug: string): SpecialtyOption['icon'] {
  return SLUG_ICON[slug] ?? 'medical-outline';
}

async function loadDoctorRelations(userId: string) {
  const sb = supabase!;
  const [specRes, sedesRes, serviciosRes, horariosRes] = await Promise.all([
    sb
      .from('doctor_especialidades')
      .select('especialidad_id, especialidades(name, slug)')
      .eq('doctor_id', userId),
    sb.from('sedes').select('*').eq('doctor_id', userId).order('is_primary', { ascending: false }),
    sb.from('servicios').select('*').eq('doctor_id', userId).order('name'),
    sb.from('horarios').select('*').eq('doctor_id', userId).eq('is_active', true).order('day_of_week'),
  ]);

  const clinics = (sedesRes.data ?? []).map(mapClinic);
  const clinicNames = Object.fromEntries(clinics.map((c) => [c.id, c.name]));
  const schedule = (horariosRes.data ?? []).map((h) =>
    mapSchedule(h, h.location_id ? clinicNames[h.location_id] : undefined),
  );

  return {
    specialties: mapJoinedSpecialties((specRes.data ?? []) as never),
    clinics,
    services: (serviciosRes.data ?? []).map(mapService),
    schedule,
  };
}

/* ------------------------------------------------------------------ */
/*  Especialidades                                                     */
/* ------------------------------------------------------------------ */

export const EspecialidadService = {
  async listOptions(): Promise<SpecialtyOption[]> {
    if (supabase) {
      const { data } = await supabase.from('especialidades').select('*').order('name');
      if (data?.length) {
        return data.map((e) => ({
          id: e.id,
          name: e.name,
          icon: iconForSlug(e.slug),
        }));
      }
    }
    await delay();
    return SPECIALTY_OPTIONS;
  },

  async list(): Promise<Especialidad[]> {
    if (supabase) {
      const { data } = await supabase.from('especialidades').select('*').order('name');
      if (data) return data.map(mapEspecialidad);
    }
    await delay();
    return SPECIALTY_OPTIONS.map((s) => ({ id: s.id, name: s.name, slug: s.id }));
  },

  async setForDoctor(doctorId: string, especialidadId: string): Promise<void> {
    if (supabase) {
      await supabase.from('doctor_especialidades').delete().eq('doctor_id', doctorId);
      await supabase.from('doctor_especialidades').insert({ doctor_id: doctorId, especialidad_id: especialidadId });
      return;
    }
    await delay();
  },
};

/* ------------------------------------------------------------------ */
/*  Doctor                                                             */
/* ------------------------------------------------------------------ */

export type DoctorPatch = Partial<
  Pick<Doctor, 'fullName' | 'licenseNumber' | 'phone' | 'bio' | 'avatarUrl' | 'isActive'>
> & { especialidadId?: string };

export const DoctorService = {
  async getCurrent(userId?: string): Promise<Doctor> {
    if (supabase && userId) {
      const { data: row, error } = await supabase
        .from('doctores')
        .select(DOCTOR_PUBLIC_COLUMNS)
        .eq('id', userId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (row) {
        const related = await loadDoctorRelations(userId);
        return mapDoctor(row, related);
      }
    }
    await delay();
    return mockDoctor;
  },

  async update(id: string, patch: DoctorPatch): Promise<Doctor> {
    if (supabase) {
      const payload: Record<string, unknown> = {};
      if (patch.fullName !== undefined) payload.full_name = patch.fullName;
      if (patch.licenseNumber !== undefined) payload.license_number = patch.licenseNumber;
      if (patch.phone !== undefined) payload.phone = patch.phone;
      if (patch.bio !== undefined) payload.bio = patch.bio;
      if (patch.avatarUrl !== undefined) payload.avatar_url = patch.avatarUrl;
      if (patch.isActive !== undefined) payload.is_active = patch.isActive;

      if (Object.keys(payload).length) {
        const { error } = await supabase.from('doctores').update(payload).eq('id', id);
        if (error) throw new Error(error.message);
      }
      if (patch.especialidadId) {
        await EspecialidadService.setForDoctor(id, patch.especialidadId);
      }
      return this.getCurrent(id);
    }

    await delay();
    mockDoctor = {
      ...mockDoctor,
      ...patch,
      fullName: patch.fullName ?? mockDoctor.fullName,
      bio: patch.bio ?? mockDoctor.bio,
      isActive: patch.isActive ?? mockDoctor.isActive,
    };
    if (patch.isActive && mockDoctor.licenseNumber) {
      mockDoctor.isVerified = true;
    }
    return mockDoctor;
  },

  async setActive(id: string, isActive: boolean): Promise<Doctor> {
    return this.update(id, { isActive });
  },

  /**
   * Publish profile: verify cédula via Edge Function, then activate.
   * Unpublish skips verification.
   */
  async publishProfile(id: string): Promise<PublishProfileResult> {
    const current = await this.getCurrent(id);

    if (!current.licenseNumber?.trim()) {
      return {
        doctor: current,
        verified: false,
        error: 'Agrega tu cédula profesional en Editar perfil antes de publicar.',
      };
    }

    const verification = await verifyCedula();
    if (!verification.verified) {
      return {
        doctor: current,
        verified: false,
        error: verification.error ?? 'La cédula no pudo verificarse ante la SEP.',
      };
    }

    const doctor = await this.update(id, { isActive: true });
    return {
      doctor,
      verified: true,
      message: verification.message ?? 'Perfil publicado con cédula verificada.',
    };
  },

  async unpublishProfile(id: string): Promise<Doctor> {
    return this.setActive(id, false);
  },
};

/* ------------------------------------------------------------------ */
/*  Servicios                                                          */
/* ------------------------------------------------------------------ */

export type ServiceInput = Pick<Service, 'name' | 'description' | 'price' | 'currency' | 'durationMinutes' | 'isActive'>;

export const ServicioService = {
  async list(doctorId?: string): Promise<Service[]> {
    if (supabase && doctorId) {
      const { data } = await supabase.from('servicios').select('*').eq('doctor_id', doctorId).order('name');
      if (data) return data.map(mapService);
    }
    await delay();
    return mockDoctor.services;
  },

  async upsert(doctorId: string, service: ServiceInput & { id?: string }): Promise<Service[]> {
    if (supabase) {
      const payload = {
        doctor_id: doctorId,
        name: service.name,
        description: service.description ?? null,
        price: service.price,
        currency: service.currency ?? 'MXN',
        duration_minutes: service.durationMinutes ?? null,
        is_active: service.isActive ?? true,
      };
      if (service.id) {
        await supabase.from('servicios').update(payload).eq('id', service.id);
      } else {
        await supabase.from('servicios').insert(payload);
      }
      return this.list(doctorId);
    }
    await delay();
    if (service.id) {
      mockDoctor.services = mockDoctor.services.map((s) =>
        s.id === service.id ? { ...s, ...service, id: s.id } : s,
      );
    } else {
      mockDoctor.services.push({ ...service, id: `svc-${Date.now()}`, currency: service.currency ?? 'MXN', isActive: true });
    }
    return mockDoctor.services;
  },
};

/* ------------------------------------------------------------------ */
/*  Reviews                                                            */
/* ------------------------------------------------------------------ */

export const ReviewService = {
  async list(doctorId?: string): Promise<Review[]> {
    if (supabase && doctorId) {
      const { data } = await supabase
        .from('resenas')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      if (data) return data.map(mapReview);
    }
    await delay();
    return MOCK_REVIEWS;
  },
};

/* ------------------------------------------------------------------ */
/*  Dashboard                                                          */
/* ------------------------------------------------------------------ */

export const DashboardService = {
  async get(doctorId?: string): Promise<DashboardSummary> {
    const doctor = await DoctorService.getCurrent(doctorId);
    const scheduleDays = new Set(doctor.schedule.map((s) => s.weekday)).size;
    return {
      servicesCount: doctor.services.filter((s) => s.isActive).length,
      clinicsCount: doctor.clinics.length,
      scheduleDays,
      ratingAvg: doctor.ratingAvg,
      ratingCount: doctor.ratingCount,
    };
  },
};
