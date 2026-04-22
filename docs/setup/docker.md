# Docker — Configuración de contenedores

Variables de entorno: ver `docs/setup/env.md`.

## Archivos creados/modificados

| Archivo | Acción |
|---|---|
| `backend/Dockerfile` | Creado |
| `frontend/Dockerfile` | Creado |
| `docker-compose.yml` | Actualizado |
| `backend/app/main.py` | Corregida URL interna de Valhalla |
| `frontend/vite.config.js` | Proxy `/api` → backend (solo `npm run dev`, no Nginx) |

---

## Desarrollo frontend con Vite (sin Docker)

En local, `frontend/vite.config.js` define un **proxy**: las peticiones del navegador a `/api/...` se reenvían a `http://127.0.0.1:8000/...`, de modo que el JS puede usar el mismo origen que el dev server. Detalle en `docs/frontend/main.md`.

La imagen **Nginx** del contenedor `frontend` solo sirve estáticos: **no** incluye ese proxy. Para el build en contenedor, suele usarse `VITE_API_URL` al compilar o el fallback a `http://localhost:8000` si el usuario abre el navegador en la misma máquina que el backend.

---

## Servicios orquestados

```
docker compose up --build
```

| Servicio | Puerto local | Descripción |
|---|---|---|
| `valhalla` | 8002 | Motor de ruteo |
| `backend` | 8000 | API FastAPI |
| `frontend` | 5173 | Interfaz web (Nginx) |

---

## backend/Dockerfile

- Imagen base: `python:3.12-slim`
- Instala dependencias desde `requirements.txt`
- Ejecuta uvicorn en `0.0.0.0:8000`

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app/ .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## frontend/Dockerfile

Build multi-stage: Node compila los assets estáticos y Nginx los sirve.

- Stage 1 (`build`): `node:20-alpine` — `npm install` + `npm run build`
- Stage 2 (`serve`): `nginx:alpine` — sirve `dist/` en puerto 80

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## Corrección de red interna

Dentro de Docker Compose los contenedores se comunican por nombre de servicio, no por `localhost`. Por eso se actualizó `backend/app/main.py`:

- Antes: `http://localhost:8002/route`
- Después: `http://valhalla:8002/route`

---

## Variables de entorno

El backend carga automáticamente el archivo `.env` de la raíz del proyecto (definido en `docker-compose.yml` con `env_file: .env`). Las variables de Supabase deben estar en ese archivo.

---

## Notas

- Python 3.14 no tiene imagen estable en Docker Hub al momento de la configuración; se usa `python:3.12-slim` que es compatible con todas las dependencias del proyecto.
- El frontend en producción Docker se sirve como build estático desde Nginx, no como servidor de desarrollo Vite.
