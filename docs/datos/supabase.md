# 🗄️ Base de datos — Supabase (esquema actual)

## Objetivo

Documentar las tablas y relaciones del proyecto en Supabase utilizadas por la aplicación (eventos y tipos de evento).

---

## Tabla `TipoEventos`

Catálogo de tipos de evento. Cada fila define una categoría reutilizable.

| Columna | Tipo | Descripción |
|--------|------|-------------|
| `tipo_evento` | `varchar` | Clave primaria. Identificador único del tipo (por ejemplo, nombre corto o código). |
| `created_at` | `timestamptz` | Fecha y hora de creación del registro. |
| `descripcion_evento` | `text` | Descripción detallada del tipo de evento. Se muestra en el modal de detalles del evento en el mapa. |
| `activo` | `bool` | Indica si el tipo está habilitado o en uso. |
| `duracion` | `int4` | Duración asociada al tipo (valor entero). |
| `puntuacion` | `float8` | Puntuación asociada al tipo de evento. |
| `radius` | `float8` | Radio de influencia del tipo de evento. |
| `evento_negativo` | `bool` | Indica si el tipo de evento es negativo (afecta negativamente la ruta). |

**Clave primaria:** `tipo_evento`

---

## Tabla `eventos`

Registros de eventos concretos, con ubicación geográfica y vínculo al tipo.

| Columna | Tipo | Descripción |
|--------|------|-------------|
| `id` | `int8` | Clave primaria. Identificador numérico del evento. |
| `created_at` | `timestamptz` | Fecha y hora de creación del registro. |
| `tipo_evento` | `varchar` | Clave foránea hacia `TipoEventos.tipo_evento`. |
| `descripcion` | `text` | Descripción libre del evento (opcional, ingresada por el usuario). |
| `activo` | `bool` | Indica si el evento está activo. |
| `latitud` | `float8` | Latitud de la ubicación del evento. |
| `longitud` | `float8` | Longitud de la ubicación del evento. |

**Clave primaria:** `id`

---

## Relaciones

- **`eventos.tipo_evento` → `TipoEventos.tipo_evento`**
  - Relación muchos a uno: un tipo puede tener muchos eventos; cada evento referencia un solo tipo.

---

## Uso en el backend

El backend consulta y escribe en `TipoEventos` y `eventos` vía cliente Supabase. Las variables de conexión se documentan en `docs/setup/env.md`.

Al listar o crear eventos (`GET /eventos`, `POST /eventos`), el backend enriquece cada evento con los campos `descripcion_evento`, `evento_negativo`, `puntuacion` y `radius` provenientes de `TipoEventos`, de modo que el frontend puede mostrar la descripción del tipo sin necesidad de una segunda consulta.

**Coherencia de nombres:** PostgREST expone los nombres de columna tal cual están en PostgreSQL. Si el JSON de la API usa `duracion`, la tabla debe tener la columna `duracion` (mismo nombre). Si en un entorno aparece un error del tipo "column not found in schema cache", revisar que la migración en Supabase coincida con `docs/datos/supabase.md` y con los modelos en `backend/app/main.py`.

---

## Uso en el frontend

El mapa (`docs/frontend/main.md`) lista tipos con `GET /tipo-eventos` y crea eventos con `POST /eventos`. Los tipos nuevos se envían con `POST /tipo-eventos`.

En el modal de detalles del evento, la descripción mostrada proviene de `TipoEventos.descripcion_evento` (campo `descripcion_evento` en la respuesta del backend). Si no existe, se muestra la descripción libre del evento (`descripcion`); si tampoco existe, se muestra "Sin descripción".
