# Backend — `app/main.py` (Safe Route API)

## Rol del módulo

`backend/app/main.py` define la aplicación **FastAPI** (`Safe Route API`): expone el proxy de rutas hacia **Valhalla**, el **health check** y los endpoints de **incidentes** sobre **Supabase** mediante el cliente en `backend/app/supabase_client.py`.

La documentación OpenAPI interactiva está disponible en el servidor en `/docs` (Swagger UI).

---

## Dependencias externas

| Recurso | Uso | Configuración |
|--------|-----|----------------|
| Valhalla | `GET /health` (estado), `POST /route` (ruteo) | `VALHALLA_URL` por defecto `http://valhalla:8002` en código |
| Supabase | Tipos e incidentes | `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SCHEMA` (ver `docs/setup/env.md`) |

Si faltan variables de Supabase, los endpoints que usan la base responden **503** con el detalle correspondiente.

---

## Endpoints

### Status

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Estado de la API y reachability de Valhalla (`status`, `valhalla`: `ok` \| `degraded` \| `unreachable`) |

### Routing

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/route` | Envía el cuerpo a Valhalla `/route` y devuelve la respuesta (incluye polilínea en `trip.legs[0].shape`). Errores HTTP de Valhalla se reenvían; fallo de red → **503**. |

Cuerpo típico: `locations` (exactamente dos puntos `lon`/`lat`), `costing` (p. ej. `pedestrian`), `costing_options` opcional.

### Incidentes (Supabase)

Tablas y columnas: `docs/datos/supabase.md`.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/tipo-incidentes` | Lista filas de `TipoIncidentes`. Query: `solo_activos` (boolean, default `true`) — si es `true`, solo `activo = true`. Sirve para poblar un selector antes de crear un incidente. |
| POST | `/tipo-incidentes` | Inserta un tipo. Respuesta **201** con el registro creado. |
| POST | `/incidentes` | Inserta en `Incidentes`. Exige que `tipo_incidente` exista en `TipoIncidentes` y esté **activo**; si no → **400**. Respuesta **201** con el registro creado. |

#### Cuerpo `POST /tipo-incidentes`

| Campo | Tipo | Notas |
|-------|------|--------|
| `tipo_incidente` | string | Clave primaria, no vacía |
| `descripcion_incidente` | string | Obligatorio |
| `activo` | boolean | Default `true` |
| `duracion` | entero opcional | Columna homónima en `TipoIncidentes` (ver `docs/datos/supabase.md`) |

#### Cuerpo `POST /incidentes`

| Campo | Tipo | Notas |
|-------|------|--------|
| `tipo_incidente` | string | Debe coincidir con un tipo activo listable vía `GET /tipo-incidentes` |
| `latitud` | number | |
| `longitud` | number | |
| `activo` | boolean | Default `true` |

Los campos `id` y `created_at` los completa la base al insertar.

---

## Flujo recomendado (frontend)

1. `GET /tipo-incidentes` (o con `solo_activos=true`) para mostrar opciones.
2. El usuario elige un `tipo_incidente`.
3. `POST /incidentes` con ese valor y coordenadas.

---

## CORS

Middleware configurado con `allow_origins=["*"]` para desarrollo; ajustar en producción si hace falta un origen concreto.
