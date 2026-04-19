# 🗄️ Base de datos — Supabase (esquema actual)

## Objetivo

Documentar las tablas y relaciones del proyecto en Supabase utilizadas por la aplicación (incidentes y tipos de incidente).

---

## Tabla `TipoIncidentes`

Catálogo de tipos de incidente. Cada fila define una categoría reutilizable.

| Columna | Tipo | Descripción |
|--------|------|-------------|
| `tipo_incidente` | `varchar` | Clave primaria. Identificador único del tipo (por ejemplo, nombre corto o código). |
| `created_at` | `timestamptz` | Fecha y hora de creación del registro. |
| `descripcion_incidente` | `text` | Descripción detallada del tipo de incidente. |
| `activo` | `bool` | Indica si el tipo está habilitado o en uso. |
| `duracion` | `int4` | Duración asociada al tipo (valor entero). |

**Clave primaria:** `tipo_incidente`

---

## Tabla `Incidentes`

Registros de incidentes concretos, con ubicación geográfica y vínculo al tipo.

| Columna | Tipo | Descripción |
|--------|------|-------------|
| `id` | `int8` | Clave primaria. Identificador numérico del incidente. |
| `created_at` | `timestamptz` | Fecha y hora de creación del registro. |
| `tipo_incidente` | `varchar` | Clave foránea hacia `TipoIncidentes.tipo_incidente`. |
| `activo` | `bool` | Indica si el incidente está activo. |
| `latitud` | `float8` | Latitud de la ubicación del incidente. |
| `longitud` | `float8` | Longitud de la ubicación del incidente. |

**Clave primaria:** `id`

---

## Relaciones

- **`Incidentes.tipo_incidente` → `TipoIncidentes.tipo_incidente`**
  - Relación muchos a uno: un tipo puede tener muchos incidentes; cada incidente referencia un solo tipo.

---

## Uso en el backend

El backend consulta la tabla `Incidentes` (por ejemplo, listados vía cliente Supabase). Las variables de conexión se documentan en `docs/setup/env.md`.
