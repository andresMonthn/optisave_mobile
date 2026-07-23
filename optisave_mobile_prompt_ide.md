
---

## Contexto de negocio (léelo antes de tocar código)

OptiSave tiene **dos productos separados, con objetivos distintos**, y la app móvil que vamos a modificar es **solo uno de ellos**:

### 1. OptiSave Mobile (este proyecto — el que vamos a modificar)
**Objetivo: exposición en internet y captación de citas.** Es la puerta de entrada gratuita para la nueva generación de doctores que necesitan "estar en el mapa" antes que optimizar su operación interna. Incluye:
- Directorio público de doctores (perfil, sedes, servicios, horarios, reseñas)
- Motor de agenda de citas (reserva real de horario disponible)
- Notificaciones (confirmación/recordatorio de cita)
- SEO por posicionamiento real (ubicación + reputación genuina — **nunca posicionamiento pagado**, es una decisión de producto/marca)
- Cada doctor obtiene un link público de su perfil (ruta aún no creada, formato esperado: `optisave.app/doctores/{id-o-slug}`) que puede publicar libremente donde quiera: redes sociales, Google Business, tarjetas, etc. Ese tráfico externo entra a `optisave.app` y ahí se genera el SEO real (clics, tiempo en sitio, backlinks).

### 2. OptiSave CRM (otro producto — NO se toca en este cambio)
**Objetivo: operación clínica oportuna del consultorio**, para doctores con más años de experiencia que ya sienten el dolor de gestionar volumen. Incluye expediente clínico electrónico, gestión documental con autocompletado de datos, importación de pacientes, analytics, registro por QR, inventarios, y cumplimiento NOM-024 (privacidad, auditoría de quién ve/crea/modifica un documento). **Este backend ya existe y está resuelto** — el CRM no es parte de este cambio, solo se menciona para que el agente entienda que la app móvil NO debe duplicar esta funcionalidad ni intentar resolver NOM-024 aquí.

**Regla de separación**: si una funcionalidad es sobre *conseguir* al paciente o *agendar* con él → va en OptiSave Mobile. Si es sobre *atender* al paciente una vez que ya está en consulta (expediente, documentos clínicos, inventario) → es del CRM y no se toca aquí.

---

## Pantallas/paneles a implementar en la APK

### Navegación — exactamente 4 pantallas

No agregar pantallas adicionales. La navegación de la app es:
1. **Agenda** — implementar completamente (ver especificación detallada más abajo)
2. **Perfil** — configuración del negocio (ver detalle abajo)
3. **Vista Paciente** — lo que ve el público (ver detalle abajo)
4. **OptiSave** — panel de promoción del CRM (ver detalle abajo). **No es un dashboard de analytics ni de vistas de perfil** — no implementar contadores ni métricas aquí. Es, en esencia, un landing page pequeño dentro de la app: explica qué es el CRM OptiSave y sus features, para que el doctor gratuito considere contratarlo. Minimalista, sin imágenes/ilustraciones decorativas (esta es la única pantalla donde aplica esa restricción de diseño).

## Panel "Perfil" (privado, solo el doctor logueado)
Aquí el doctor configura **todo** lo que alimenta su perfil público y su operación de citas. Todo debe cuadrar 1:1 con las tablas ya existentes en el backend (Supabase, proyecto `optisave_mobile`):
- Datos del doctor: nombre, cédula, teléfono, bio, avatar (tabla `doctores`)
- Especialidades (tabla `doctor_especialidades` + catálogo `especialidades`)
- Sedes/consultorios — puede tener varias (tabla `sedes`)
- Servicios y precios (tabla `servicios`)
- Horarios — **debe soportar horario partido/quebrado** (ej. abre 10:00, cierra 14:00 por la comida, reabre 16:00, cierra 20:00): esto se logra con **múltiples filas por mismo día** en la tabla `horarios`, no un solo rango por día. La UI debe permitir "+ agregar otro horario" para el mismo día de la semana.
- Estándar de día de la semana ya fijo en el backend: **1=domingo, 2=lunes, 3=martes, 4=miércoles, 5=jueves, 6=viernes, 7=sábado**

### Panel "OptiSave" (landing del CRM, privado, solo el doctor logueado)
No confundir con un dashboard: es un **landing page pequeño dentro de la app**, cuyo único objetivo es explicar el CRM OptiSave y sus features para motivar al doctor gratuito a contratarlo. No incluye analytics, contadores de vistas ni navegación compleja — es contenido + un llamado a la acción (ej. "Contratar CRM" / "Más información"). Minimalista, sin imágenes/ilustraciones decorativas.

### Panel "Vista Paciente" (público, lo que ve cualquier visitante en `optisave.app`)
- El perfil público del doctor tal cual lo configuró en el panel Perfil: nombre, especialidad, sedes, servicios, precios, horarios (incluyendo los partidos), reseñas aprobadas, rating promedio
- Botón/flujo para agendar cita (usa el motor de agenda mencionado arriba)
- **Nota de diseño**: esta vista es la que se indexa para SEO y la que se comparte por redes sociales/Google Business vía el link público del perfil

---

## Notas de UI/UX importantes

- Todo lo que se configura en "Perfil" debe reflejarse exactamente en "Vista Paciente" — no debe haber campos en el front que no tengan su columna correspondiente en el backend, ni columnas en el backend que la UI no exponga.
- **Aclaración de alcance**: la instrucción de "sin imágenes decorativas, minimalista tipo landing chiquito" aplica únicamente a la pantalla del **CRM OptiSave** (otro producto, no se toca en este cambio). La app móvil (OptiSave Mobile) sí puede/debe tener una interfaz visual normal, no minimalista forzada.

## Agenda de citas — especificación de UI (pantalla "Agenda", implementación completa)

Construir tipo **Google Calendar**, adaptado a móvil:
- Vista de horas del día (eje vertical de tiempo), con las citas dibujadas como bloques sobre su horario correspondiente
- **Scroll libre** (no paginado por franjas fijas) para moverse por las horas del día
- Al **tocar (tap/push) una cita**, se abre el detalle de esa cita con: nombre del paciente, edad, número telefónico, servicio agendado
- Debe reflejar correctamente los horarios partidos/quebrados configurados en "Perfil" (ej. hueco entre 14:00 y 16:00 sin citas disponibles ahí)

## Notificaciones — especificación real (no automatizadas, plan gratis)

- Son **notificaciones push dentro de la propia app**, no SMS ni WhatsApp automático — el plan gratis no incluye mensajería automatizada.
- Evento a notificar: "Nuevo paciente registró una cita" (cuando un paciente agenda desde Vista Paciente).
- Dentro del detalle de la cita (ver arriba), agregar un **botón de WhatsApp** que abra un deep link a WhatsApp con el número del paciente y un **mensaje predeterminado editable** (ej. confirmación de la cita) — un solo clic, sin fricción. El envío real del mensaje lo hace el doctor manualmente desde WhatsApp normal (no hay automatización de envío, es solo el atajo del deep link).

---

## Pendientes conocidos (no bloquean este cambio, pero avísalo si tocas algo relacionado)

- Validación de traslape entre horarios del mismo día (ej. 10-15 y 14-20 que se pisan) — no implementada aún, backend lo permite sin bloquear.
- Constraint de concurrencia para evitar doble-reserva del mismo horario por dos pacientes al mismo tiempo — pendiente de diseño a nivel de base de datos (índice único), no implementado todavía.
