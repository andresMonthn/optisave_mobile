/**
 * Local mock dataset — used when Supabase env vars are not set.
 */

import type { Cita, Doctor, Review, SpecialtyOption } from '@/types';

function atToday(hour: number, minute = 0): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function atTomorrow(hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const SPECIALTY_OPTIONS: SpecialtyOption[] = [
  { id: 'sp-cardio', name: 'Cardiología', icon: 'heart-outline' },
  { id: 'sp-derma', name: 'Dermatología', icon: 'body-outline' },
  { id: 'sp-gineco', name: 'Ginecología', icon: 'female-outline' },
  { id: 'sp-pediatria', name: 'Pediatría', icon: 'happy-outline' },
  { id: 'sp-opto', name: 'Optometría', icon: 'eye-outline' },
  { id: 'sp-nutri', name: 'Nutrición', icon: 'nutrition-outline' },
  { id: 'sp-trauma', name: 'Traumatología', icon: 'fitness-outline' },
  { id: 'sp-psico', name: 'Psicología', icon: 'chatbubbles-outline' },
  { id: 'sp-odonto', name: 'Odontología', icon: 'medkit-outline' },
  { id: 'sp-general', name: 'Medicina General', icon: 'pulse-outline' },
];

/** @deprecated use SPECIALTY_OPTIONS */
export const SPECIALTIES = SPECIALTY_OPTIONS;

export const MOCK_DOCTOR: Doctor = {
  id: 'doc-001',
  fullName: 'Mariana Robles Fuentes',
  avatarUrl: 'https://i.pravatar.cc/400?img=47',
  licenseNumber: '7845123',
  phone: '55 1234 5678',
  bio: 'Me apasiona acompañar a mis pacientes con un enfoque humano y basado en evidencia clínica.',
  specialty: 'Cardiología',
  specialties: [{ id: 'sp-cardio', name: 'Cardiología', slug: 'cardiologia' }],
  clinics: [
    {
      id: 'cli-1',
      name: 'Consultorio Polanco — Torre Médica',
      addressLine: 'Av. Presidente Masaryk 111, Piso 4, Consultorio 402',
      city: 'Ciudad de México',
      state: 'CDMX',
      phone: '55 1234 5678',
      isPrimary: true,
    },
  ],
  services: [
    {
      id: 'svc-1',
      name: 'Consulta de primera vez',
      description: 'Valoración clínica completa',
      price: 1200,
      currency: 'MXN',
      durationMinutes: 45,
      isActive: true,
    },
    {
      id: 'svc-2',
      name: 'Consulta de seguimiento',
      price: 900,
      currency: 'MXN',
      durationMinutes: 30,
      isActive: true,
    },
  ],
  schedule: [
    { id: 'sch-1', weekday: 1, start: '10:00', end: '14:00', locationName: 'Consultorio Polanco' },
    { id: 'sch-1b', weekday: 1, start: '16:00', end: '20:00', locationName: 'Consultorio Polanco' },
    { id: 'sch-2', weekday: 2, start: '09:00', end: '14:00', locationName: 'Consultorio Polanco' },
    { id: 'sch-2b', weekday: 2, start: '16:00', end: '19:00', locationName: 'Consultorio Polanco' },
    { id: 'sch-3', weekday: 3, start: '10:00', end: '14:00', locationName: 'Consultorio Polanco' },
    { id: 'sch-4', weekday: 4, start: '10:00', end: '14:00', locationName: 'Consultorio Polanco' },
    { id: 'sch-5', weekday: 5, start: '09:00', end: '13:00', locationName: 'Consultorio Polanco' },
  ],
  ratingAvg: 4.8,
  ratingCount: 42,
  isActive: true,
  isVerified: true,
  hasCrmLicense: false,
};

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    reviewerName: 'Laura Méndez',
    rating: 5,
    comment: 'Excelente atención, muy clara al explicar el tratamiento.',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'rev-2',
    reviewerName: 'Carlos Ruiz',
    rating: 5,
    comment: 'Puntual, profesional y muy amable.',
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
];

export const MOCK_CITAS: Cita[] = [
  {
    id: 'cita-1',
    patientName: 'Laura Méndez',
    patientPhone: '5512345678',
    patientBirthDate: '1990-05-12',
    serviceId: 'svc-1',
    serviceName: 'Consulta de primera vez',
    startsAt: atToday(10, 30),
    endsAt: atToday(11, 15),
    status: 'confirmada',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'cita-2',
    patientName: 'Carlos Ruiz',
    patientPhone: '5587654321',
    patientBirthDate: '1985-11-03',
    serviceId: 'svc-2',
    serviceName: 'Consulta de seguimiento',
    startsAt: atToday(11, 30),
    endsAt: atToday(12, 0),
    status: 'pendiente',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'cita-3',
    patientName: 'Ana Torres',
    patientPhone: '5599887766',
    patientBirthDate: '2001-02-18',
    serviceId: 'svc-1',
    serviceName: 'Consulta de primera vez',
    startsAt: atToday(16, 30),
    endsAt: atToday(17, 15),
    status: 'confirmada',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'cita-4',
    patientName: 'Roberto Sánchez',
    patientPhone: '5544332211',
    patientBirthDate: '1978-08-25',
    serviceId: 'svc-2',
    serviceName: 'Consulta de seguimiento',
    startsAt: atTomorrow(10, 0),
    endsAt: atTomorrow(10, 30),
    status: 'pendiente',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];
