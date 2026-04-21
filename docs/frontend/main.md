# Frontend — mapa (Vite + MapLibre)

## Objetivo

Describir la interfaz web que vive en `frontend/`: mapa interactivo, **cálculo de rutas** vía Valhalla (a través del backend) y **gestión de incidentes y tipos de incidente** contra la API FastAPI, que a su vez usa Supabase.

---

## Stack y archivos principales

| Elemento | Uso |
|----------|-----|
| [Vite](https://vitejs.dev/) | Build y servidor de desarrollo |
| [MapLibre GL JS](https://maplibre.org/) | Mapa y marcadores |
| [@mapbox/polyline](https://github.com/mapbox/polyline) | Decodificar la polilínea de Valhalla (precisión 6) |

| Archivo | Rol |
|---------|-----|
| `frontend/index.html` | Contenedor `#map`, barra de herramientas, área de pistas y `#modalRoot` |
| `frontend/src/main.js` | Lógica del mapa, modos de interacción, llamadas `fetch` a la API |
| `frontend/src/map-ui.css` | Estilos de la barra flotante, pistas, modales y marcador de incidente |
| `frontend/vite.config.js` | Proxy de desarrollo `/api` → backend (ver más abajo) |

---

## URL base de la API (`apiUrl`)

Las peticiones se resuelven así:

1. Si existe **`VITE_API_URL`** en tiempo de build (variable de entorno de Vite), se usa como prefijo (sin barra final obligatoria; el código normaliza).
2. Si no hay `VITE_API_URL` y el entorno es **desarrollo** (`import.meta.env.DEV`), se usa el prefijo **`/api`**, que Vite reenvía al backend según `vite.config.js` (por defecto `http://127.0.0.1:8000`).
3. En **producción** sin `VITE_API_URL`, el fallback es `http://localhost:8000`.

Así el mismo código sirve para `npm run dev` (proxy, sin problemas de CORS con el origen del dev server) y para builds estáticos apuntando al host donde corre FastAPI.

**Build con API remota:** por ejemplo:

`VITE_API_URL=https://api.ejemplo.com npm run build`

---

## Barra de herramientas

Controles fijos en la esquina superior izquierda:

| Control | Acción |
|---------|--------|
| **Calcular ruta** | Envía los dos puntos marcados en el mapa a `POST /route` (mismo comportamiento que antes: dos clics sucesivos; al tercer clic se reinicia la pareja de puntos). |
| **Añadir incidente** | Activa o desactiva el **modo incidente** (`aria-pressed`). En modo incidente, un clic en el mapa coloca un **marcador distintivo** y abre el modal de registro. |
| **Nuevo tipo de incidente** | Abre un modal para crear un tipo en Supabase vía `POST /tipo-incidentes`. |

Con el modo incidente activo, un texto de ayuda aparece abajo al centro indicando que hay que hacer clic en el mapa.

---

## Flujo: añadir incidente

1. Activar **Añadir incidente**.
2. Clic en el mapa → se guardan latitud y longitud y se muestra el modal.
3. El modal solicita **`GET /tipo-incidentes?solo_activos=true`** y rellena un `<select>` con los tipos (descripción visible; valor enviado: `tipo_incidente`).
4. **Guardar incidente** → `POST /incidentes` con `tipo_incidente`, `latitud`, `longitud`, `activo: true`.
5. **Cancelar** o clic en el fondo del modal → se elimina el marcador provisional y la posición pendiente; se puede volver a marcar en el mismo modo.

Si no hay tipos activos, el desplegable indica que hay que crear un tipo primero.

---

## Flujo: nuevo tipo de incidente

El formulario envía `POST /tipo-incidentes` con:

- `tipo_incidente` (código único)
- `descripcion_incidente`
- `activo` (checkbox)
- `duracion` (opcional; entero; debe existir la columna homónima en Supabase — ver `docs/datos/supabase.md`)

---

## Desarrollo local

- Backend en el puerto **8000** (por ejemplo `uvicorn` o Docker).
- Frontend: `cd frontend && npm install && npm run dev` — Vite suele usar el puerto **5173** y enruta `/api/*` al backend.

---

## Referencias

| Tema | Documento |
|------|-----------|
| Endpoints HTTP | `docs/backend/main.md` |
| Esquema Supabase | `docs/datos/supabase.md` |
| Variables `.env` | `docs/setup/env.md` |
| Docker | `docs/setup/docker.md` |
