# 📊 Resultados de Tests — Backend

Resultados actualizados de la ejecución de tests unitarios del backend.

**Fecha de ejecución:** 2026-05-22  
**Framework:** pytest 9.0.3  
**Python:** 3.12.10

---

## 📈 Resumen General

| Métrica | Valor |
|---------|-------|
| **Tests totales** | 24 (unitarios) + 12 (integración) = 36 |
| **Tests ejecutados** | 24 |
| **Tests pasados** | 24 ✔ |
| **Tests fallados** | 0 ❌ |
| **Tests omitidos (integración)** | 12 |
| **Cobertura total** | **98%** |

---

## 🧪 Resultados por Archivo de Test

### `test_eventos.py` — `/eventos` y `/tipo-eventos`

| Test | Estado |
|------|--------|
| `test_list_eventos_enriches_with_tipo_data` | ✔ PASSED |
| `test_list_eventos_empty` | ✔ PASSED |
| `test_create_evento_missing_fields` | ✔ PASSED |
| `test_create_evento_invalid_tipo` | ✔ PASSED |
| `test_create_evento_success` | ✔ PASSED |
| `test_create_evento_insert_returns_no_data` | ✔ PASSED |
| `test_delete_evento_not_found` | ✔ PASSED |
| `test_delete_evento_success` | ✔ PASSED |
| `test_list_tipo_eventos_solo_activos` | ✔ PASSED |
| `test_list_tipo_eventos_todos` | ✔ PASSED |
| `test_create_tipo_evento_success` | ✔ PASSED |
| `test_create_tipo_evento_no_data_returned` | ✔ PASSED |
| `test_create_tipo_evento_missing_fields` | ✔ PASSED |
| `test_endpoint_returns_503_when_supabase_not_configured` | ✔ PASSED |

**Resultado:** 14/14 ✔

---

### `test_health.py` — `GET /health`

| Test | Estado |
|------|--------|
| `test_health_ok` | ✔ PASSED |
| `test_health_valhalla_down` | ✔ PASSED |
| `test_health_valhalla_unreachable` | ✔ PASSED |

**Resultado:** 3/3 ✔

---

### `test_routing.py` — `POST /route`

| Test | Estado |
|------|--------|
| `test_route_valid` | ✔ PASSED |
| `test_route_valhalla_unreachable` | ✔ PASSED |
| `test_route_valhalla_error` | ✔ PASSED |
| `test_route_exclude_polygons` | ✔ PASSED |

**Resultado:** 4/4 ✔

---

### `test_supabase_client.py` — `get_supabase()`

| Test | Estado |
|------|--------|
| `test_get_supabase_with_env_vars` | ✔ PASSED |
| `test_get_supabase_custom_schema` | ✔ PASSED |
| `test_get_supabase_missing_env_vars` | ✔ PASSED |

**Resultado:** 3/3 ✔

---

### Tests de Integración (omitidos)

Los siguientes tests requieren servicios externos (Supabase local, Docker) y fueron omitidos en esta ejecución:

| Archivo | Tests | Requisito |
|---------|-------|-----------|
| `test_integration_supabase.py` | 10 tests | `supabase start` corriendo |
| `test_integration_valhalla.py` | 2 tests | Docker + Testcontainers |

Para ejecutar los tests de integración:
```bash
pytest -m integration
```

---

## 📊 Cobertura de Código

### Resumen de Cobertura

| Archivo | Statements | Missing | Cover |
|---------|------------|---------|-------|
| `app/main.py` | 152 | 4 | **97%** |
| `app/supabase_client.py` | 14 | 0 | **100%** |
| **Total** | **166** | **4** | **98%** |

### Líneas sin cubrir (`app/main.py`)

Las siguientes líneas no fueron ejecutadas durante los tests unitarios:

| Líneas | Razón probable |
|--------|----------------|
| 257-263 | Código de inicio del servidor (`if __name__ == "__main__"`), ejecutado solo cuando se corre el archivo directamente |

> Nota: Estas líneas están excluidas explícitamente en la configuración de cobertura por diseño (`pragma: no cover` en patrones similares).

---

## 📁 Reportes Generados

Los siguientes reportes fueron generados automáticamente:

| Tipo | Ubicación | Descripción |
|------|-----------|-------------|
| HTML Coverage | `backend/htmlcov/index.html` | Reporte interactivo de cobertura con navegación por archivo |
| Terminal | stdout | Resumen inmediato después de la ejecución |
| Allure Results | `backend/allure-results/` | Resultados en formato JSON para Allure Report |

Para abrir el reporte de cobertura en el navegador:
```bash
# Windows
start backend\htmlcov\index.html

# WSL/Linux
xdg-open backend/htmlcov/index.html
```

---

## ✅ Estado

✔ Todos los tests unitarios pasan (24/24)  
✔ Cobertura excelente (98%)  
✔ `supabase_client.py` con 100% de cobertura  
✔ `main.py` con 97% de cobertura (líneas no cubiertas son de inicio del servidor)  
✔ Reportes HTML generados correctamente  
✔ Listo para integración continua

---

**Próxima ejecución:** Para actualizar estos resultados, correr:
```bash
cd backend
pytest -m "not integration"
```
