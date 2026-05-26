# Testing — Backend

El backend usa **pytest** como framework de testing, con `pytest-cov` para cobertura y `pytest-mock` para mocking.

---

## Estructura de archivos

```
backend/
├── pytest.ini          # Configuración de pytest
├── .coveragerc         # Configuración de cobertura
└── test/
    ├── conftest.py                  # Fixtures compartidos
    ├── test_health.py               # GET /health
    ├── test_routing.py              # POST /route
    ├── test_eventos.py              # /eventos y /tipo-eventos
    ├── test_supabase_client.py      # get_supabase()
    ├── test_integration_supabase.py # Integración real con Supabase local
    └── test_integration_valhalla.py # Integración real con Valhalla (Testcontainers)
```

---

## Cómo correr los tests

Desde el directorio `backend/` (donde vive `pytest.ini`):

```bash
cd backend
pytest
```

Esto ejecuta todos los tests unitarios con cobertura sobre `app/`, imprime el reporte en terminal y genera un HTML en `htmlcov/`.

### Solo tests unitarios (sin integración)

```bash
pytest -m "not integration"
```

### Solo tests de integración

```bash
pytest -m integration
```

> Los tests de integración con Supabase requieren `supabase start` corriendo en `127.0.0.1:54321` y `54322`. Si no está disponible, se saltan automáticamente.
> Los tests de integración con Valhalla usan **Testcontainers** y requieren Docker. Si `testcontainers` no está instalado, el módulo se omite (`pytest.importorskip`).

### Ver cobertura en HTML

```bash
pytest
# Luego abrir: backend/htmlcov/index.html
```

---

## Configuración (`pytest.ini`)

| Opción | Valor |
|--------|-------|
| `testpaths` | `test` |
| `python_files` | `test_*.py` |
| `cobertura` | `--cov=app --cov-report=term-missing --cov-report=html` |
| Marcadores | `integration` |
| Verbosidad | `-v` |
| Warnings | `DeprecationWarning` ignorado |

---

## Fixtures (`conftest.py`)

| Fixture | Alcance | Descripción |
|---------|---------|-------------|
| `_reset_supabase_cache` | `autouse` (función) | Limpia el singleton `_supabase` entre tests para evitar contaminación de estado |
| `mock_supabase` | función | `MagicMock` que simula la API encadenable del cliente Supabase (`mocker.MagicMock()`) |
| `client` | función | `TestClient` de FastAPI con la dependencia `_supabase_dep` reemplazada por el mock |
| `client_no_supabase` | función | `TestClient` sin override — para probar el camino de error 503 |
| `supabase_local` | sesión | Salta los tests si Supabase no está corriendo en los puertos esperados (`54321`, `54322`) |
| `supabase_client` | sesión | Cliente Supabase real conectado a la instancia local (usando JWT de desarrollo) |
| `db_transaction` | función | Conecta a Postgres, abre una transacción y hace ROLLBACK al final para aislar datos |
| `integration_client` | función | `TestClient` con el cliente Supabase real inyectado |

---

## Descripción de cada archivo de test

### `test_health.py` — `GET /health`

Prueba el endpoint de health check mockeando `httpx.AsyncClient.get`:

| Test | Escenario | Resultado esperado |
|------|-----------|-------------------|
| `test_health_ok` | Valhalla responde 200 | `status=ok`, `valhalla=ok` |
| `test_health_valhalla_down` | Valhalla responde 500 | `status=ok`, `valhalla=degraded` |
| `test_health_valhalla_unreachable` | `httpx` lanza excepción | `status=ok`, `valhalla=unreachable` |

---

### `test_routing.py` — `POST /route`

Prueba el proxy a Valhalla mockeando `httpx.AsyncClient` completo (context manager async):

| Test | Escenario | Resultado esperado |
|------|-----------|-------------------|
| `test_route_valid` | Valhalla responde con trip válido | HTTP 200, body contiene `trip` |
| `test_route_valhalla_unreachable` | `httpx.RequestError` | HTTP 503 |
| `test_route_valhalla_error` | `httpx.HTTPStatusError` 400 | HTTP 400 (reenviado) |
| `test_route_exclude_polygons` | Request con `exclude_polygons` | HTTP 200 |

---

### `test_eventos.py` — `/eventos` y `/tipo-eventos`

Usa `client` y `mock_supabase` del `conftest.py`. Simula la cadena de métodos del cliente Supabase.

**`GET /eventos`**

| Test | Escenario | Resultado esperado |
|------|-----------|-------------------|
| `test_list_eventos_enriches_with_tipo_data` | Evento en BD con tipo asociado | 200, campos de tipo enriquecidos en la respuesta |
| `test_list_eventos_empty` | Sin eventos | 200, lista vacía `[]` |

**`POST /eventos`**

| Test | Escenario | Resultado esperado |
|------|-----------|-------------------|
| `test_create_evento_missing_fields` | Faltan `latitud`/`longitud` | 422 (validación Pydantic) |
| `test_create_evento_invalid_tipo` | `tipo_evento` no existe o inactivo | 400 |
| `test_create_evento_success` | Tipo válido, insert exitoso | 201, body con `id` y campos enriquecidos |
| `test_create_evento_insert_returns_no_data` | Supabase devuelve lista vacía | 500 |

**`DELETE /eventos/{id}`**

| Test | Escenario | Resultado esperado |
|------|-----------|-------------------|
| `test_delete_evento_not_found` | ID inexistente | 404 |
| `test_delete_evento_success` | ID válido | 204 (No Content) |

**`GET /tipo-eventos`**

| Test | Escenario | Resultado esperado |
|------|-----------|-------------------|
| `test_list_tipo_eventos_solo_activos` | `solo_activos=true` (default) | 200, filtra por `activo=True` |
| `test_list_tipo_eventos_todos` | `solo_activos=false` | 200, devuelve activos e inactivos |

**`POST /tipo-eventos`**

| Test | Escenario | Resultado esperado |
|------|-----------|-------------------|
| `test_create_tipo_evento_success` | Datos válidos | 201 con registro creado |
| `test_create_tipo_evento_no_data_returned` | Supabase devuelve vacío | 500 |
| `test_create_tipo_evento_missing_fields` | Body vacío `{}` | 422 |

**Error 503**

| Test | Escenario | Resultado esperado |
|------|-----------|-------------------|
| `test_endpoint_returns_503_when_supabase_not_configured` | Sin `SUPABASE_URL`/`KEY` en env | 503 con detalle sobre variable faltante |

---

### `test_supabase_client.py` — `get_supabase()`

Prueba el módulo `supabase_client.py` directamente:

| Test | Escenario | Resultado esperado |
|------|-----------|-------------------|
| `test_get_supabase_with_env_vars` | Variables definidas (`URL`, `KEY`, `SCHEMA`) | Devuelve cliente no nulo |
| `test_get_supabase_custom_schema` | Schema personalizado | Devuelve cliente no nulo |
| `test_get_supabase_missing_env_vars` | Sin `SUPABASE_URL` ni `SUPABASE_KEY` | Lanza `RuntimeError` con mensaje específico |

---

### `test_integration_supabase.py` — Integración con Supabase local

Marcados con `@pytest.mark.integration`. Requieren `supabase start`.

| Test | Descripción |
|------|-------------|
| `test_list_tipo_eventos_integration` | Lista tipos reales; espera al menos 5, incluyendo `robo` y `asalto` |
| `test_create_tipo_evento_integration` | Crea un tipo con UUID único y valida respuesta 201 |
| `test_duplicate_tipo_evento_integration` | Intenta duplicar tipo; espera 400/500 o `APIError` |
| `test_create_evento_integration` | Crea evento `robo`; valida enriquecimiento completo (descripcion, puntuacion, radius) |
| `test_list_eventos_integration` | Lista eventos; valida que tengan `tipo_evento` y `descripcion_evento` |
| `test_soft_delete_evento_integration` | Crea evento, lo borra, verifica que no aparece en GET |
| `test_foreign_key_rejection_integration` | Evento con tipo inexistente → 400 |
| `test_inactive_tipo_evento_rejection_integration` | Tipo inactivo → 400 |
| `test_evento_geo_bounds_integration` | Coordenadas límite válidas (0, 90, -90, 180, -180) → 201 |
| `test_tipo_evento_crud_full_cycle_integration` | Ciclo completo: crear tipo, listarlo, verificarlo |

---

### `test_integration_valhalla.py` — Integración con Valhalla (Testcontainers)

Marcados con `@pytest.mark.integration`. Requieren Docker y el paquete `testcontainers`.

Levanta el contenedor `viktornr/valhalla-tiles:latest` en el puerto 8002 (espera hasta 5 minutos).

| Test | Descripción |
|------|-------------|
| `test_valhalla_health` | `GET /health` con Valhalla real → `status=ok`, `valhalla=ok` |
| `test_route_pedestrian` | `POST /route` entre dos puntos reales → 200 con `trip.legs` no vacío |

---

## Dependencias necesarias para testing

Las siguientes dependencias **no están en `backend/requirements.txt`** y deben instalarse aparte:

```bash
pip install pytest pytest-mock pytest-cov
# Para tests de integración con Supabase:
pip install psycopg2-binary pyjwt
# Para tests de integración con Valhalla:
pip install testcontainers requests
```
