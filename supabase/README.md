# Backend (Supabase) — puesta en marcha

La app funciona **sin backend** usando datos de ejemplo (mock). Cuando quieras
conectar datos reales, sigue estos pasos. No se necesita nada más para arrancar.

## 1. Crea el proyecto

1. Entra a <https://supabase.com> → **New project**.
2. Elige nombre, contraseña de base de datos y región (cercana a México, p. ej. `us-east`).
3. Espera a que termine de aprovisionar (~2 min).

## 2. Crea el esquema

1. En el Dashboard: **SQL Editor → New query**.
2. Copia **todo** el contenido de [`schema.sql`](./schema.sql) y pégalo.
3. Pulsa **Run**. Esto crea tablas, enums, políticas de seguridad (RLS),
   triggers y el catálogo de especialidades.

Qué hace el esquema:

- Tablas: `doctors`, `specialties`, `clinics`, `doctor_licenses`,
  `doctor_focus_areas`, `doctor_schedules`, `patients`, `appointments`, `reviews`.
- **RLS activado**: cada doctor solo ve y edita lo suyo; las fichas
  publicadas (`is_published = true`) son legibles públicamente; `patients` y
  `appointments` son privados.
- Trigger `on_auth_user_created`: al registrarse un doctor se crea
  automáticamente su fila en `doctors`.
- Trigger de calificación: recalcula `rating_avg` / `rating_count` al cambiar reseñas.

## 3. Copia las credenciales a la app

1. En el Dashboard: **Project Settings → API**.
2. Copia:
   - **Project URL** →  `EXPO_PUBLIC_SUPABASE_URL`
   - **anon / publishable key** →  `EXPO_PUBLIC_SUPABASE_ANON_KEY`
3. En la raíz del proyecto (`optisave-mobile/`), crea el archivo **`.env`**
   (puedes copiar `.env.example`) y pega los valores:

   ```dotenv
   EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

4. Reinicia el servidor de Expo **limpiando la caché** (las variables se
   incrustan al compilar):

   ```bash
   npx expo start -c
   ```

En cuanto detecta esas dos variables, la app deja de usar mock y habla con
Supabase automáticamente (auth real + datos). Si no están, sigue en modo demo.

## 4. (Opcional) Autenticación por correo

- **Authentication → Providers → Email** ya viene activado.
- Para pruebas rápidas puedes desactivar *Confirm email*
  (**Authentication → Sign In / Providers → Email → Confirm email = off**)
  para que el registro inicie sesión de inmediato. En producción, déjalo activo.

## Seguridad

- La `anon key` es segura de exponer en la app: está protegida por RLS.
- **Nunca** pongas la `service_role` key en variables `EXPO_PUBLIC_*`.
- Regenerar los tipos TypeScript tras cambiar el esquema:

  ```bash
  npx supabase gen types typescript --project-id <TU_REF> > src/lib/database.types.ts
  ```
