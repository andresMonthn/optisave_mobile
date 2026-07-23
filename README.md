# OptiSave Mobile 🩺

App móvil de **administración para doctores**, al estilo Doctoralia. El doctor
se registra y su **ficha profesional** queda lista para ser visible en OptiSave;
desde la app gestiona su **status, agenda, pacientes, opiniones y analíticas**,
con acceso directo al CRM completo en [optisave.app](https://optisave.app).

> Esta app es el panel del **doctor**. La búsqueda/reserva por parte del paciente
> vive en la web (no en esta app).

## ✨ Características

- **Onboarding en 2 pasos**: el doctor se registra y ya está visible.
- **Ficha profesional completa**: foto propia y del consultorio, especialidad,
  experiencia, **cédulas profesionales**, dirección con “cómo llegar”, horarios,
  precio de consulta, idiomas, **zona libre “por qué hago lo que hago”**,
  tarjetas de áreas de especialidad (colesterol, cirugías, etc.), opiniones
  verificadas y calificación promedio.
- **Dashboard** con status/visibilidad del perfil y **analíticas** (citas de hoy,
  próximas, ingresos del mes, vistas de perfil, reservas de la semana).
- **Agenda** con máquina de estados: `pendiente → confirmada → completada`,
  además de `cancelada` / `no asistió`.
- **Pacientes** con búsqueda, ficha e historial de citas.
- **UI glassmorphism**, **barra de navegación flotante** (estilo Mercado Libre),
  temas claro/oscuro con colores de convención (sin neón), tipografía **Arial /
  Arial Black**, y **sin bordes** en tarjetas ni botones de analíticas.

## 🧱 Stack

Expo SDK 57 · React Native 0.86 · React 19 · expo-router (typed routes) ·
expo-glass-effect + expo-blur (vidrio) · Supabase (auth + datos) · TypeScript.

## 🚀 Arranque

```bash
npm install
npx expo start
```

Abre en Expo Go, emulador Android / simulador iOS, o web (`w`).

**La app corre sin backend** usando datos de ejemplo. Para conectar Supabase
(auth y datos reales), sigue [`supabase/README.md`](./supabase/README.md):
crea el proyecto, corre [`supabase/schema.sql`](./supabase/schema.sql) y pon tus
credenciales en `.env` (ver [`.env.example`](./.env.example)).

## 📁 Estructura

```
src/
  app/                      # rutas (expo-router)
    (auth)/                 # login + registro
    (app)/
      (tabs)/               # dashboard, agenda, pacientes, perfil
      appointment/[id]      # detalle de cita
      patient/[id]          # detalle de paciente
      edit-profile          # edición de la ficha
  components/                # UI (glass, cards, tab bar, filas, secciones)
  constants/theme.ts         # design system (colores, Arial, spacing, glass)
  context/auth.tsx           # sesión (Supabase o mock)
  services/                  # capa de datos (Supabase con fallback a mock)
  data/mock.ts               # dataset de ejemplo
  lib/supabase.ts            # cliente Supabase
  types/                     # modelo de dominio
supabase/                    # schema.sql + guía de configuración
```

## 🔤 Nota sobre la tipografía

iOS y web usan **Arial** de forma nativa. Android no incluye Arial y recurre a
su equivalente del sistema (`sans-serif` / `sans-serif-black`); no se empaqueta
la fuente propietaria de Arial.
