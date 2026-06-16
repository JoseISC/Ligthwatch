# Guía de Instalación — Ligthwatch

## Requisitos previos

- [Docker](https://docs.docker.com/get-docker/) y [Docker Compose](https://docs.docker.com/compose/install/) (recomendado)
- [Git](https://git-scm.com/downloads)
- Opcional (desarrollo sin Docker): [Python 3.12+](https://www.python.org/downloads/) y [Node.js 20+](https://nodejs.org/)
- Una cuenta en [Supabase](https://supabase.com) para la base de datos

---

## Paso 1: Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd LigthwatchV2
```

---

## Paso 2: Configurar Supabase

1. Inicia sesión o crea una cuenta en [supabase.com](https://supabase.com).
2. Crea un nuevo proyecto.
3. Una vez creado, ve a **Settings → API** y copia los siguientes valores:
   - **Project URL** → será tu `SUPABASE_URL`
   - **anon public key** → será tu `SUPABASE_KEY`

### Crear las tablas

Ejecuta el siguiente SQL en el **SQL Editor** de Supabase:

```sql
CREATE TABLE IF NOT EXISTS "TipoEventos" (
    tipo_evento       TEXT PRIMARY KEY,
    descripcion_evento TEXT NOT NULL,
    activo            BOOLEAN DEFAULT TRUE,
    duracion          INTEGER
);

CREATE TABLE IF NOT EXISTS "eventos" (
    id             BIGSERIAL PRIMARY KEY,
    tipo_evento    TEXT NOT NULL REFERENCES "TipoEventos"(tipo_evento),
    latitud        DOUBLE PRECISION NOT NULL,
    longitud       DOUBLE PRECISION NOT NULL,
    activo         BOOLEAN DEFAULT TRUE,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Paso 3: Configurar variables de entorno

Copia el archivo de ejemplo y edítalo con tus datos:

```bash
cp .env.example .env
```

Edita `.env` con los valores de Supabase:

```env
APP_ENV=development
APP_HOST=127.0.0.1
APP_PORT=8000

SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu_anon_key

VALHALLA_URL=http://localhost:8002
```

---

## Paso 4: Iniciar la aplicación (Docker Compose)

Desde la raíz del proyecto ejecuta:

```bash
docker compose up --build
```

Esto levantará tres servicios:

| Servicio   | Puerto | Descripción               |
|------------|--------|---------------------------|
| `valhalla` | 8002   | Motor de ruteo            |
| `backend`  | 8000   | API FastAPI               |
| `frontend` | 5173   | Interfaz web              |

La primera vez la descarga de imágenes puede tomar varios minutos.

---

## Paso 5: Acceder a la aplicación

- **Frontend:** abre [http://localhost:5173](http://localhost:5173) en el navegador
- **API (Swagger UI):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health check:** [http://localhost:8000/health](http://localhost:8000/health)

---

## Desarrollo sin Docker (opcional)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r ../requirements.txt
uvicorn main:app --reload --port 8000
```

Asegúrate de tener Valhalla corriendo en `http://localhost:8002` (por ejemplo con Docker: `docker run -p 8002:8002 viktornr/valhalla-tiles:latest`).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend se abrirá en [http://localhost:5173](http://localhost:5173) y el proxy de Vite redirigirá las peticiones `/api` al backend en `http://127.0.0.1:8000`.

---

## Verificación

1. Abre [http://localhost:5173](http://localhost:5173) — deberías ver el mapa de MapLibre.
2. En la consola del navegador (F12) no deben aparecer errores de conexión.
3. Visita [http://localhost:8000/health](http://localhost:8000/health) — debería responder `{"status": "ok", "valhalla": "ok"}`.

---

## Solución de problemas

| Problema                          | Posible causa                           | Solución                                      |
|-----------------------------------|-----------------------------------------|-----------------------------------------------|
| El frontend no carga el mapa      | API key de MapLibre faltante            | Verifica la configuración en `frontend/src/main.js` |
| Error 503 en `/health`            | Valhalla no está corriendo              | Revisa `docker compose logs valhalla`         |
| Error 503 en endpoints de datos   | Variables de Supabase incorrectas       | Verifica `SUPABASE_URL` y `SUPABASE_KEY` en `.env` |
| Puerto 8000/5173 ocupado          | Otro proceso usando el puerto           | Cambia el puerto en `.env` o detén el otro proceso |
