# 📊 Resultados de Tests — Frontend

Resultados actualizados de la ejecución de tests unitarios del frontend.

**Fecha de ejecución:** 2026-05-22  
**Framework:** Vitest 4.1.5  
**Entorno:** jsdom 29.1.0

---

## 📈 Resumen General

| Métrica | Valor |
|---------|-------|
| **Archivos de test** | 3 |
| **Tests totales** | 29 |
| **Tests pasados** | 29 ✔ |
| **Tests fallados** | 0 ❌ |
| **Cobertura Statements** | **100%** (56/56) |
| **Cobertura Branches** | **100%** (22/22) |
| **Cobertura Functions** | **100%** (9/9) |
| **Cobertura Lines** | **100%** (45/45) |

---

## 🧪 Resultados por Archivo de Test

### `main.test.js` — Utilidades (`src/utils.js`)

| Test | Estado |
|------|--------|
| `apiUrl` — antepone /api en modo dev | ✔ PASSED |
| `apiUrl` — usa VITE_API_URL cuando esta definido | ✔ PASSED |
| `apiUrl` — elimina la barra final de VITE_API_URL | ✔ PASSED |
| `apiUrl` — agrega la barra inicial cuando el path no la trae | ✔ PASSED |
| `apiUrl` — cae al fallback en produccion sin VITE_API_URL | ✔ PASSED |
| `formatFecha` — null → "Sin fecha" | ✔ PASSED |
| `formatFecha` — undefined → "Sin fecha" | ✔ PASSED |
| `formatFecha` — cadena vacía → "Sin fecha" | ✔ PASSED |
| `formatFecha` — fecha ISO válida → año correcto | ✔ PASSED |
| `formatFecha` — cadena no parseable → "Fecha inválida" | ✔ PASSED |
| `formatFecha` — caso adicional de formato | ✔ PASSED |
| `formatApiError` — { detail: "Error" } → string directo | ✔ PASSED |
| `formatApiError` — null/undefined → "Error desconocido" | ✔ PASSED |
| `formatApiError` — array de errores FastAPI → mensajes unidos | ✔ PASSED |
| `formatApiError` — array con items sin msg → contenido simple | ✔ PASSED |
| `formatApiError` — { message: "..." } → usa message | ✔ PASSED |
| `formatApiError` — objeto sin detail ni message → JSON stringificado | ✔ PASSED |
| `formatApiError` — referencia circular → fallback seguro | ✔ PASSED |
| `formatApiError` — caso adicional de validación | ✔ PASSED |

**Resultado:** 19/19 ✔

---

### `counter.test.js` — Contador (`src/counter.js`)

| Test | Estado |
|------|--------|
| `inicializa el contador en 0` | ✔ PASSED |
| `incrementa el contador en cada click` | ✔ PASSED |

**Resultado:** 2/2 ✔

---

### `circles.test.js` — Geometría de círculos (`src/geo.js`)

| Test | Estado |
|------|--------|
| `circleCoords` — cierra el anillo | ✔ PASSED |
| `circleCoords` — genera puntos en ángulos esperados | ✔ PASSED |
| `circleCoords` — respeta el centro especificado | ✔ PASSED |
| `circleCoords` — solo el punto repetido cuando numPoints=1 | ✔ PASSED |
| `circlePolygon` — cierra el anillo | ✔ PASSED |
| `circlePolygon` — radio correcto en grados | ✔ PASSED |
| `circlePolygon` — compensa la latitud | ✔ PASSED |
| `circlePolygon` — 16 puntos → 17 coords | ✔ PASSED |

**Resultado:** 8/8 ✔

---

## 📊 Cobertura de Código

### Resumen Detallado

| Métrica | Cubiertas | Total | Porcentaje |
|---------|-----------|-------|------------|
| Statements | 56 | 56 | **100%** |
| Branches | 22 | 22 | **100%** |
| Functions | 9 | 9 | **100%** |
| Lines | 45 | 45 | **100%** |

### Archivos con Cobertura

| Archivo | Cobertura | Descripción |
|---------|-----------|-------------|
| `src/utils.js` | 100% | `apiUrl`, `formatFecha`, `formatApiError` |
| `src/counter.js` | 100% | `setupCounter` |
| `src/geo.js` | 100% | `circleCoords`, `circlePolygon` |

> Nota: `src/main.js` está excluido de cobertura por diseño (contiene inicialización del mapa con efectos secundarios del DOM que no se pueden aislar en jsdom).

---

## 📁 Reportes Generados

Los siguientes reportes fueron generados automáticamente:

| Tipo | Ubicación | Descripción |
|------|-----------|-------------|
| HTML Coverage | `frontend/coverage/index.html` | Reporte interactivo con vista por archivo y línea |
| Terminal | stdout | Resumen de tests y cobertura |
| Allure Results | `frontend/allure-results/` | Resultados en formato JSON con metadata |
| Allure Report | `frontend/allure-report/` | Reporte HTML visual de Allure (pre-generado) |

Para abrir el reporte de cobertura:
```bash
# Windows
start frontend\coverage\index.html
```

Para ver el reporte interactivo de Allure:
```bash
cd frontend
npm run allure:serve
```

---

## 🔧 Configuración de Cobertura

| Opción | Valor |
|--------|-------|
| Provider | `v8` (nativo de Node.js/V8) |
| Include | `src/**/*.js` |
| Exclude | `src/main.js`, `**/*.config.js` |
| Reporters | `html`, `text`, `text-summary` |

La exclusión de `src/main.js` está justificada porque:
1. Inicializa el mapa MapLibre GL JS (requiere APIs del navegador)
2. Tiene efectos secundarios del DOM (agrega elementos al `document`)
3. No contiene lógica de negocio testable unitariamente

---

## ✅ Estado

✔ Todos los tests pasan (29/29)  
✔ Cobertura perfecta en todas las métricas (100%)  
✔ `utils.js` — 19 tests validan todas las ramas  
✔ `counter.js` — inicialización y clicks funcionan  
✔ `geo.js` — geometría de círculos validada  
✔ Reportes HTML generados correctamente  
✔ Integración con Allure configurada  
✔ Listo para integración continua

---

**Próxima ejecución:** Para actualizar estos resultados, correr:
```bash
cd frontend
npx vitest run --coverage
```

Para modo watch interactivo:
```bash
npm test
```
