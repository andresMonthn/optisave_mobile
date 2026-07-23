# optisave_mobile — Esquema de Base de Datos

Proyecto Supabase: `optisave_mobile`
Ref: `qglqyogsbhnlajliumbd` · Región: us-east-1 · Postgres 17

Backend del **directorio médico para doctores** (tipo Doctoralia). Solo doctores tienen cuenta (auth); no hay app de pacientes. Los pacientes interactúan solo vía el sitio web público del directorio.

---

## Modelo de negocio reflejado en el esquema

- **Gratis**: el doctor se registra, publica su perfil, sedes, servicios y horarios informativos. Aparece en el directorio con buen SEO.
- **De paga (licencia `optisave_app`, CRM)**: agenda real con citas agendables por pacientes. Vive en otro repo/producto (`optisave_app`). Este proyecto solo guarda el flag de licencia y los datos puente para generar el link de registro de paciente (`https://www.optisave.app/public/registro-paciente?...`).

---

## Tablas

### `especialidades`
Catálogo de especialidades médicas.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | default `gen_random_uuid()` |
| name | text unique | |
| slug | text unique | |
| created_at | timestamptz | |

### `doctores`
Perfil del doctor. 1:1 con `auth.users` (mismo `id`).

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK, FK → `auth.users.id` | |
| full_name | text | |
| license_number | text | nullable — cédula profesional |
| phone | text | nullable |
| bio | text | nullable |
| avatar_url | text | nullable |
| is_active | boolean | default `true` |
| avg_rating | numeric(3,2) | default `0` — **recalculado por trigger**, no editable por el doctor |
| review_count | integer | default `0` — **recalculado por trigger**, no editable por el doctor |
| has_crm_license | boolean | default `false` — solo backend/service_role lo cambia |
| crm_activated_at | timestamptz | nullable — no público (columna oculta a anon/authenticated) |
| crm_booking_token | text | nullable, unique — no público |
| crm_module_id | uuid | nullable — no público |
| created_at / updated_at | timestamptz | `updated_at` vía trigger `moddatetime` |

### `doctor_especialidades`
Puente N:N doctor ↔ especialidad.

| Columna | Tipo |
|---|---|
| doctor_id | uuid, FK → `doctores.id` |
| especialidad_id | uuid, FK → `especialidades.id` |

PK compuesta `(doctor_id, especialidad_id)`.

### `sedes`
Consultorios/clínicas del doctor. Un doctor puede tener varias.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| doctor_id | uuid, FK → `doctores.id` | |
| name | text | |
| address / city / state / phone | text | nullable |
| geo | geography(Point,4326) | PostGIS — para búsquedas por cercanía a futuro |
| is_primary | boolean | default `false` — única sede primaria por doctor (unique index parcial) |
| created_at / updated_at | timestamptz | |

### `servicios`
Servicios y costos que ofrece cada doctor.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| doctor_id | uuid, FK → `doctores.id` | |
| name / description | text | |
| price | numeric(10,2) | |
| currency | text | default `'MXN'` |
| duration_minutes | integer | nullable |
| is_active | boolean | default `true` |
| created_at / updated_at | timestamptz | |

### `horarios`
Horarios **informativos** (no reservas). Estándar de día:

**1 = domingo · 2 = lunes · 3 = martes · 4 = miércoles · 5 = jueves · 6 = viernes · 7 = sábado**

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| doctor_id | uuid, FK → `doctores.id` | |
| location_id | uuid, FK → `sedes.id` | nullable |
| day_of_week | smallint | check `1..7` |
| start_time / end_time | time | check `start_time < end_time` |
| is_active | boolean | default `true` |
| created_at / updated_at | timestamptz | |

### `resenas`
Reseñas de pacientes (sin cuenta) sobre doctores, con moderación manual.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| doctor_id | uuid, FK → `doctores.id` | |
| reviewer_name | text | |
| reviewer_email | text | nullable |
| rating | smallint | check `1..5` |
| comment | text | nullable |
| status | enum `review_status` | `pending` \| `approved` \| `rejected` |
| created_at | timestamptz | |
| moderated_at | timestamptz | nullable — se autocompleta por trigger al cambiar `status` |

---

## Functions / Triggers

| Nombre | Tipo | Qué hace |
|---|---|---|
| `handle_new_user()` | trigger AFTER INSERT en `auth.users` | crea automáticamente la fila en `doctores` |
| `refresh_doctor_rating()` | trigger AFTER INSERT/UPDATE(status)/DELETE en `resenas` | recalcula `avg_rating` y `review_count` en `doctores` |
| `set_reviews_moderated_at()` | trigger BEFORE UPDATE(status) en `resenas` | pone `moderated_at = now()` al cambiar `status` |
| `moddatetime` (extensión) | trigger BEFORE UPDATE | actualiza `updated_at` en `doctores`, `sedes`, `servicios`, `horarios` |

Las funciones de trigger (`handle_new_user`, `refresh_doctor_rating`) tienen revocado el `EXECUTE` a `anon`/`authenticated` — no son invocables como RPC público, solo corren internamente.

---

## RLS — resumen de permisos

| Tabla | Lectura pública (anon + authenticated) | Escritura |
|---|---|---|
| `especialidades` | ✅ todo | ❌ ninguna vía API (solo dashboard/service_role) |
| `doctores` | ✅ excepto `crm_activated_at`, `crm_booking_token`, `crm_module_id` (bloqueadas a nivel de columna) | el propio doctor: solo `full_name, license_number, phone, bio, avatar_url, is_active`. Todo lo demás (rating, licencia CRM) solo backend |
| `doctor_especialidades` | ✅ todo | el propio doctor (`auth.uid() = doctor_id`) |
| `sedes` | ✅ todo | el propio doctor |
| `servicios` | ✅ todo | el propio doctor |
| `horarios` | ✅ todo | el propio doctor |
| `resenas` | ✅ solo `status = 'approved'` | INSERT público (siempre entra como `pending`); UPDATE/DELETE solo vía dashboard (service_role) |

---

## Credenciales del proyecto (para la app móvil)

- **Project URL**: `https://qglqyogsbhnlajliumbd.supabase.co`
- **anon/publishable key**: ver sección de variables de entorno en el chat (no se expone aquí por buenas prácticas de manejo del archivo).
