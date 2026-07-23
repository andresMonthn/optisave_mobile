/**
 * Data services — Supabase first, mock fallback when not configured.
 */

import { MOCK_CITAS, MOCK_DOCTOR, MOCK_REVIEWS, SPECIALTY_OPTIONS } from '@/data/mock';
import { supabase } from '@/lib/supabase';
import {
  mapClinic,
  mapCita,
  mapDoctor,
  mapJoinedSpecialties,
  mapPaciente,
  mapReview,
  mapSchedule,
  mapService,
  mapEspecialidad,
  weekdayToDbDay,
} from '@/services/mappers';
import { verifyCedula } from '@/services/cedula-verification';
import type {
  AppNotification,
  Cita,
  DashboardSummary,
  Doctor,
  Especialidad,
  Paciente,
  PublishProfileResult,
  Review,
  ScheduleSlot,
  Service,
  SpecialtyOption,
} from '@/types';
import {
  citaPartsFromIso,
  dateToIsoDate,
  isUpcomingCita,
  normalizePhone,
} from '@/utils/citas-db';

const delay = (ms = 250) => new Promise<void>((r) => setTimeout(r, ms));

let mockDoctor: Doctor = structuredClone(MOCK_DOCTOR);
let mockCitas: Cita[] = structuredClone(MOCK_CITAS);

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

/* ------------------------------------------------------------------ */
/*  Pacientes                                                          */
/* ------------------------------------------------------------------ */

export type PacienteInput = {
  fullName: string;
  phone: string;
  birthDate?: string;
  email?: string;
};

export const PacienteService = {
  async upsertByPhone(doctorId: string, input: PacienteInput): Promise<string> {
    const phone = normalizePhone(input.phone);

    if (supabase) {
      const { data: existing } = await supabase
        .from('pacientes')
        .select('id')
        .eq('doctor_id', doctorId)
        .eq('phone', phone)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('pacientes')
          .update({
            full_name: input.fullName.trim(),
            birth_date: input.birthDate ?? null,
            email: input.email ?? null,
          })
          .eq('id', existing.id);
        return existing.id;
      }

      const { data, error } = await supabase
        .from('pacientes')
        .insert({
          doctor_id: doctorId,
          full_name: input.fullName.trim(),
          phone,
          birth_date: input.birthDate ?? null,
          email: input.email ?? null,
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    }

    await delay();
    return `paciente-mock-${phone}`;
  },

  async get(id: string, doctorId?: string): Promise<Paciente | undefined> {
    if (supabase && doctorId) {
      const { data } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', id)
        .eq('doctor_id', doctorId)
        .maybeSingle();
      if (data) return mapPaciente(data);
    }
    return undefined;
  },
};

/* ------------------------------------------------------------------ */
/*  Citas (agenda)                                                     */
/* ------------------------------------------------------------------ */

const CITA_SELECT = '*, pacientes(full_name, birth_date, phone), servicios(name), sedes(name)';

function filterUpcoming(citas: Cita[]): Cita[] {
  const now = new Date();
  return citas.filter((c) => {
    if (!c.fecha || !c.horaInicio) {
      return new Date(c.startsAt) >= now;
    }
    return isUpcomingCita(c.fecha, c.horaInicio, now);
  });
}

export const CitaService = {
  async listForDay(doctorId: string | undefined, date: Date): Promise<Cita[]> {
    const fecha = dateToIsoDate(date);

    if (supabase && doctorId) {
      const { data, error } = await supabase
        .from('citas')
        .select(CITA_SELECT)
        .eq('doctor_id', doctorId)
        .eq('fecha', fecha)
        .neq('status', 'cancelada')
        .order('hora_inicio');
      if (error) {
        console.warn('[CitaService.listForDay]', error.message);
        return [];
      }
      if (data) return data.map((r) => mapCita(r as never));
      return [];
    }

    await delay();
    return mockCitas.filter((c) => {
      const d = new Date(c.startsAt);
      return (
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate() &&
        c.status !== 'cancelada'
      );
    });
  },

  async listUpcoming(doctorId?: string): Promise<Cita[]> {
    const today = dateToIsoDate(new Date());

    if (supabase && doctorId) {
      const { data, error } = await supabase
        .from('citas')
        .select(CITA_SELECT)
        .eq('doctor_id', doctorId)
        .gte('fecha', today)
        .neq('status', 'cancelada')
        .order('fecha')
        .order('hora_inicio')
        .limit(50);
      if (error) {
        console.warn('[CitaService.listUpcoming]', error.message);
        return [];
      }
      return filterUpcoming((data ?? []).map((r) => mapCita(r as never)));
    }

    await delay();
    return mockCitas.filter((c) => new Date(c.startsAt) >= new Date() && c.status !== 'cancelada');
  },

  async get(id: string, doctorId?: string): Promise<Cita | undefined> {
    if (supabase && doctorId) {
      const { data } = await supabase
        .from('citas')
        .select(CITA_SELECT)
        .eq('id', id)
        .eq('doctor_id', doctorId)
        .maybeSingle();
      if (data) return mapCita(data as never);
      return undefined;
    }
    await delay();
    return mockCitas.find((c) => c.id === id);
  },

  async create(
    doctorId: string,
    input: {
      patientName: string;
      patientPhone: string;
      patientBirthDate?: string;
      patientEmail?: string;
      serviceId: string;
      serviceName: string;
      startsAt: string;
      durationMinutes: number;
      sedeId?: string;
    },
  ): Promise<Cita> {
    const { fecha, hora_inicio, hora_fin } = citaPartsFromIso(input.startsAt, input.durationMinutes);
    const createdAt = new Date().toISOString();

    if (supabase) {
      const pacienteId = await PacienteService.upsertByPhone(doctorId, {
        fullName: input.patientName,
        phone: input.patientPhone,
        birthDate: input.patientBirthDate,
        email: input.patientEmail,
      });

      const { data, error } = await supabase
        .from('citas')
        .insert({
          doctor_id: doctorId,
          paciente_id: pacienteId,
          servicio_id: input.serviceId,
          sede_id: input.sedeId ?? null,
          fecha,
          hora_inicio,
          hora_fin,
          status: 'pendiente',
        })
        .select(CITA_SELECT)
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Ese horario ya fue reservado. Elige otro horario disponible.');
        }
        throw error;
      }
      if (data) return mapCita(data as never);
    }

    await delay();
    const endsAt = new Date(new Date(input.startsAt).getTime() + input.durationMinutes * 60_000).toISOString();
    const cita: Cita = {
      id: `cita-${Date.now()}`,
      patientName: input.patientName,
      patientPhone: normalizePhone(input.patientPhone),
      patientBirthDate: input.patientBirthDate,
      serviceId: input.serviceId,
      serviceName: input.serviceName,
      sedeId: input.sedeId,
      fecha,
      horaInicio: hora_inicio.slice(0, 5),
      horaFin: hora_fin.slice(0, 5),
      startsAt: input.startsAt,
      endsAt,
      status: 'pendiente',
      createdAt,
    };
    mockCitas = [...mockCitas, cita];
    return cita;
  },
};

/* ------------------------------------------------------------------ */
/*  Horarios                                                           */
/* ------------------------------------------------------------------ */

export type HorarioInput = {
  id?: string;
  weekday: number;
  start: string;
  end: string;
  locationId?: string;
  isActive?: boolean;
};

export const HorarioService = {
  async list(doctorId?: string): Promise<ScheduleSlot[]> {
    if (supabase && doctorId) {
      const { data: rows } = await supabase
        .from('horarios')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('day_of_week')
        .order('start_time');
      if (rows) {
        const sedes = await supabase.from('sedes').select('id, name').eq('doctor_id', doctorId);
        const names = Object.fromEntries((sedes.data ?? []).map((s) => [s.id, s.name]));
        return rows.map((h) => mapSchedule(h, h.location_id ? names[h.location_id] : undefined));
      }
    }
    await delay();
    return mockDoctor.schedule;
  },

  async upsert(doctorId: string, slot: HorarioInput): Promise<ScheduleSlot[]> {
    if (supabase) {
      const payload = {
        doctor_id: doctorId,
        day_of_week: weekdayToDbDay(slot.weekday),
        start_time: slot.start.length === 5 ? `${slot.start}:00` : slot.start,
        end_time: slot.end.length === 5 ? `${slot.end}:00` : slot.end,
        location_id: slot.locationId ?? null,
        is_active: slot.isActive ?? true,
      };
      if (slot.id) {
        await supabase.from('horarios').update(payload).eq('id', slot.id);
      } else {
        await supabase.from('horarios').insert(payload);
      }
      return this.list(doctorId);
    }
    await delay();
    if (slot.id) {
      mockDoctor.schedule = mockDoctor.schedule.map((s) =>
        s.id === slot.id
          ? { ...s, weekday: slot.weekday, start: slot.start, end: slot.end, locationId: slot.locationId }
          : s,
      );
    } else {
      mockDoctor.schedule.push({
        id: `sch-${Date.now()}`,
        weekday: slot.weekday,
        start: slot.start,
        end: slot.end,
        locationId: slot.locationId,
      });
    }
    return mockDoctor.schedule;
  },

  async remove(id: string, doctorId: string): Promise<ScheduleSlot[]> {
    if (supabase) {
      await supabase.from('horarios').delete().eq('id', id);
      return this.list(doctorId);
    }
    await delay();
    mockDoctor.schedule = mockDoctor.schedule.filter((s) => s.id !== id);
    return mockDoctor.schedule;
  },
};

/* ------------------------------------------------------------------ */
/*  In-app notifications                                               */
/* ------------------------------------------------------------------ */

const NOTIF_READ_KEY = 'optisave.notifications.read';

async function readIds(): Promise<Set<string>> {
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    const raw = await AsyncStorage.getItem(NOTIF_READ_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

async function saveReadIds(ids: Set<string>): Promise<void> {
  const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
  await AsyncStorage.setItem(NOTIF_READ_KEY, JSON.stringify([...ids]));
}

export const NotificationService = {
  async list(doctorId?: string): Promise<AppNotification[]> {
    const citas = await CitaService.listUpcoming(doctorId);
    const read = await readIds();
    const recent = citas
      .filter((c) => c.status === 'pendiente')
      .slice(0, 10)
      .map((c) => ({
        id: `notif-${c.id}`,
        title: 'Tienes una nueva cita',
        body: `${c.patientName} agendó ${c.serviceName}`,
        citaId: c.id,
        createdAt: c.createdAt,
        read: read.has(`notif-${c.id}`),
      }));
    return recent.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async markRead(id: string): Promise<void> {
    const read = await readIds();
    read.add(id);
    await saveReadIds(read);
  },

  async unreadCount(doctorId?: string): Promise<number> {
    const list = await this.list(doctorId);
    return list.filter((n) => !n.read).length;
  },
};
