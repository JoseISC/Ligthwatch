# Testing — Frontend

El frontend usa **Vitest** como framework de testing, con entorno **jsdom** para simular el DOM del navegador y cobertura mediante **v8**.

---

## Estructura de archivos

```
frontend/
├── vitest.config.js    # Configuración de Vitest
├── package.json        # Scripts y dependencias
└── test/
    ├── main.test.js     # utils.js: apiUrl, formatFecha, formatApiError
    ├── counter.test.js  # counter.js: setupCounter
    └── circles.test.js  # geo.js: circleCoords, circlePolygon
```

---

## Cómo correr los tests

Desde el directorio `frontend/`:

```bash
cd frontend
npm install   # solo la primera vez
npm test
```

`npm test` ejecuta `vitest` en modo watch por defecto. Para una sola pasada sin watch:

```bash
npx vitest run
```

### Con cobertura

```bash
npx vitest run --coverage
```

Genera el reporte de cobertura en `frontend/coverage/`. Abrir `coverage/index.html` para la vista HTML.

### Con UI interactiva

```bash
npx vitest --ui
```

Abre una interfaz web en `http://localhost:51204` para explorar tests, resultados y cobertura.

---

## Configuración (`vitest.config.js`)

| Opción | Valor |
|--------|-------|
| `environment` | `jsdom` (simula el DOM del navegador) |
| `globals` | `true` (permite usar `describe`, `it`, `expect` sin importar) |
| `coverage.provider` | `v8` |
| `coverage.reporter` | `html`, `text`, `text-summary` |
| `coverage.include` | `src/**/*.js` |
| `coverage.exclude` | `src/main.js`, `**/*.config.js` |

> `src/main.js` está excluido de cobertura porque contiene efectos secundarios del DOM (inicialización del mapa) que no se pueden aislar fácilmente en jsdom.

---

## Descripción de cada archivo de test

### `main.test.js` — Utilidades (`src/utils.js`)

Prueba tres funciones exportadas de `utils.js`:

#### `apiUrl(path)`

Construye la URL completa hacia la API según el entorno.

| Test | Escenario | Resultado esperado |
|------|-----------|-------------------|
| `antepone /api en modo dev` | `import.meta.env.DEV = true` | `/api/eventos` |
| `usa VITE_API_URL cuando esta definido` | `DEV=false`, `VITE_API_URL=http://localhost:8000` | `http://localhost:8000/eventos` |
| `elimina la barra final de VITE_API_URL` | URL con `/` al final | Sin doble barra |
| `agrega la barra inicial cuando el path no la trae` | Path sin `/` inicial | URL con `/` normalizado |
| `cae al fallback en produccion sin VITE_API_URL` | `VITE_API_URL` vacío | `http://localhost:8000/eventos` |

#### `formatFecha(fecha)`

Formatea una fecha ISO para mostrar en la UI.

| Test | Escenario | Resultado esperado |
|------|-----------|-------------------|
| `null` | `null` | `"Sin fecha"` |
| `undefined` | `undefined` | `"Sin fecha"` |
| Cadena vacía | `""` | `"Sin fecha"` |
| Fecha ISO válida | `"2026-04-24T22:01:50..."` | Contiene `"2026"` |
| Cadena no parseable | `"no-es-una-fecha"` | `"Fecha inválida"` |

#### `formatApiError(data)`

Normaliza respuestas de error de la API a un string legible.

| Test | Escenario | Resultado esperado |
|------|-----------|-------------------|
| `{ detail: "Error" }` | `detail` como string | `"Error"` |
| `null` / `undefined` | Sin datos | `"Error desconocido"` |
| Array de errores FastAPI | `detail: [{ msg, loc }]` | Mensajes separados por `;` |
| Array con items sin `msg` | `detail: ["error simple", {...}]` | Contiene `"error simple"` |
| `{ message: "..." }` | Sin `detail` pero con `message` | Devuelve el `message` |
| Objeto sin `detail` ni `message` | `{ code: 500 }` | JSON stringificado |
| Referencia circular | Objeto con `self = self` | `"Error desconocido"` |

---

### `counter.test.js` — Contador (`src/counter.js`)

Prueba la función `setupCounter(button)` que inicializa un botón contador:

| Test | Escenario | Resultado esperado |
|------|-----------|-------------------|
| `inicializa el contador en 0` | Botón recién creado | `innerHTML = "Count is 0"` |
| `incrementa el contador en cada click` | Tres clicks sucesivos | `"Count is 1"` → `"Count is 3"` |

---

### `circles.test.js` — Geometría de círculos (`src/geo.js`)

Prueba dos funciones que generan polígonos circulares para el mapa:

#### `circleCoords(lng, lat, radioGrados, numPoints)`

Genera coordenadas de un círculo expresado en grados.

| Test | Escenario | Resultado esperado |
|------|-----------|-------------------|
| `cierra el anillo` | 4 puntos + centro `(0,0)` | `coords[0] === coords[4]` (5 puntos) |
| `genera puntos en ángulos esperados` | Radio 0.01 con 4 puntos | Coordenadas cardinales aproximadas |
| `respeta el centro especificado` | Centro `(-70, -33)`, radio 0.005 | Todos los puntos dentro del bounding box |
| `solo el punto repetido cuando numPoints=1` | 1 punto | 2 coords iguales |

#### `circlePolygon(lng, lat, radioMetros, numPoints)`

Genera coordenadas de un círculo expresado en metros, compensando la latitud.

| Test | Escenario | Resultado esperado |
|------|-----------|-------------------|
| `cierra el anillo` | 4 puntos | `coords[0] === coords[4]` |
| `radio correcto en grados` | 111 320 m (≈ 1 grado) | Primer coord `≈ 1` grado |
| `compensa la latitud` | Mismo radio, lat 0° vs lat −60° | Radio en longitud mayor en −60° |
| `16 puntos` | `numPoints=16` | 17 coords, primero = último |

---

## Dependencias de testing

Incluidas como `devDependencies` en `package.json`:

| Paquete | Versión | Uso |
|---------|---------|-----|
| `vitest` | ^4.1.5 | Framework de testing |
| `@vitest/coverage-v8` | ^4.1.5 | Proveedor de cobertura v8 |
| `@vitest/ui` | ^4.1.5 | UI interactiva (opcional) |
| `jsdom` | ^29.1.0 | Entorno DOM para Vitest |
| `@testing-library/dom` | ^10.4.1 | Helpers para queries de DOM |
| `@testing-library/jest-dom` | ^6.9.1 | Matchers adicionales de DOM |
