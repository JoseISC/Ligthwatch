# Manual de usuario — Ligthwatch (Safe Route)

Guía para usar la aplicación web de mapa: consultar eventos, registrar nuevos incidentes y calcular rutas peatonales que evitan zonas marcadas como peligrosas.

---

## Índice

1. [Introducción](#introducción)
2. [Antes de empezar](#antes-de-empezar)
3. [Pantalla principal](#pantalla-principal)
4. [Elementos del mapa](#elementos-del-mapa)
5. [Flujos paso a paso](#flujos-paso-a-paso)
6. [Modos de interacción](#modos-de-interacción)
7. [Mensajes y errores](#mensajes-y-errores)
8. [Preguntas frecuentes](#preguntas-frecuentes)
9. [Más información](#más-información)

---

## Introducción

**Ligthwatch** (título de la pestaña del navegador: *Safe Route — Mapa*) es una aplicación de una sola pantalla centrada en un mapa interactivo. Permite:

- **Ver eventos** georreferenciados (incidentes, alertas, etc.) guardados en la base de datos.
- **Registrar nuevos eventos** eligiendo un tipo y una ubicación en el mapa.
- **Calcular rutas peatonales** entre dos puntos; el sistema intenta **evitar zonas** asociadas a eventos marcados como **negativos** (peligrosos).

No hay login ni menús adicionales: toda la interacción ocurre sobre el mapa y en ventanas modales.

---

## Antes de empezar

La aplicación requiere que el **backend**, **Valhalla** y **Supabase** estén configurados y en ejecución.

| Entorno | Cómo levantar | URL de la app |
|---------|---------------|---------------|
| Docker (recomendado) | Ver [README del proyecto](../../README.md) y [Docker Compose](../setup/docker.md) | [http://localhost:5173](http://localhost:5173) |
| Desarrollo local | `cd frontend` → `npm install` → `npm run dev` | Suele ser [http://localhost:5173](http://localhost:5173) (Vite) |

Abre la URL en el navegador. Si el mapa carga pero no aparecen tipos de evento o no se guardan datos, revisa que el backend responda en [http://localhost:8000](http://localhost:8000) y que las variables de entorno estén correctas ([configuración de entorno](../setup/env.md)).

---

## Pantalla principal

```
┌─────────────────────────────────────────────────────────────┐
│ [Modo Ruta]  [Añadir Evento]  [Nuevo tipo de Evento]      │  ← barra superior
│                                                             │
│                      MAPA (pantalla completa)               │
│                                                             │
│                                    [+] [-] [brújula]        │  ← controles MapLibre
│                                                             │
│         ┌───────────────────────────────────────┐             │
│         │  Texto de ayuda  [Calcular ruta]      │             │  ← barra inferior (según modo)
│         └───────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

### Barra de herramientas (arriba a la izquierda)

| Botón | Función |
|-------|---------|
| **Modo Ruta** | Activa o desactiva el modo para elegir origen y destino |
| **Añadir Evento** | Activa o desactiva el modo para colocar un evento en el mapa |
| **Nuevo tipo de Evento** | Abre el formulario para crear un tipo en el catálogo (sin cambiar el modo del mapa) |

### Barra de ayuda (parte inferior)

Muestra instrucciones según el modo activo. En modo ruta, cuando hay dos puntos seleccionados, aparece el botón **Calcular ruta**.

### Controles del mapa

En la esquina del mapa: zoom **+** / **-** y brújula (controles estándar de MapLibre). Puedes arrastrar el mapa para desplazarte en cualquier momento.

---

## Elementos del mapa

| Elemento | Apariencia | Significado |
|----------|------------|-------------|
| Marcador **naranja** | Punto pequeño naranja | Ubicación temporal mientras registras un evento (antes de guardar) |
| Marcador **verde** | Punto verde | Evento guardado que **no** se considera negativo para el ruteo |
| Marcador **rojo** | Punto rojo | Evento **negativo**: su zona puede excluirse al calcular rutas |
| **Círculo semitransparente** | Área verde o roja alrededor del marcador | Zona de influencia del evento (radio según configuración del tipo) |
| **Línea roja** | Trazo grueso sobre calles/caminos | Ruta peatonal calculada entre origen y destino |
| **Pins por defecto** (modo ruta) | Marcadores estándar de MapLibre | Origen y destino de la ruta |

---

## Flujos paso a paso

### Flujo A — Explorar el mapa y ver eventos existentes

1. Abre la aplicación en el navegador.
2. Espera a que cargue el mapa (centrado inicialmente en la zona de Santiago).
3. Los eventos guardados aparecen automáticamente como marcadores con su círculo de influencia.
4. Desplázate y haz zoom para explorar el territorio.

---

### Flujo B — Consultar detalles y eliminar un evento

1. Sin activar ningún modo especial, haz **clic** sobre un marcador de evento (verde o rojo).
2. Se abre el modal **Detalles del Evento** con:
   - **Tipo**
   - **Descripción** (o «Sin descripción» si no hay texto)
   - **Fecha y hora** (formato local, ej. `22/04/2026, 14:30`)
   - **Ubicación** (coordenadas)
3. Para cerrar sin cambios: pulsa **Cerrar** o haz clic fuera del panel.
4. Para eliminar: pulsa **Eliminar evento**. El marcador desaparece del mapa y el modal se cierra.

---

### Flujo C — Registrar un nuevo evento

1. Pulsa **Añadir Evento** (el botón queda visualmente activado).
2. Lee la ayuda inferior: *«Modo Evento: haz clic en el mapa para colocar el marcador. Luego elige el tipo de evento.»*
3. Haz **clic** en el mapa donde quieras el evento → aparece un marcador naranja y el modal **Registrar Evento**.
4. En **Tipo de evento**, elige una opción del desplegable (debe existir al menos un tipo activo; si no hay, sigue el [Flujo D](#flujo-d--crear-un-tipo-de-evento)).
5. Revisa **Ubicación** (coordenadas, solo lectura).
6. Pulsa **Guardar Evento**.
7. Verás el mensaje *«Evento registrado correctamente.»* y el nuevo marcador en el mapa.

**Cancelar:** **Cancelar** en el modal o clic fuera → se quita el marcador naranja temporal.

---

### Flujo D — Crear un tipo de evento

Los tipos son el catálogo desde el que eliges al registrar un evento. Deben existir **antes** de poder guardar eventos.

1. Pulsa **Nuevo tipo de Evento** (desde cualquier momento).
2. Completa el modal **Nuevo tipo de evento**:
   - **Código / ID del tipo** (obligatorio), ej. `incendio_vehicular`
   - **Descripcion** (obligatorio)
   - **Duracion (opcional)**
   - **Activo** (marcado por defecto; solo los tipos activos aparecen al registrar eventos)
3. Pulsa **Crear tipo**.
4. Verás *«Tipo de evento creado.»*
5. Cierra con **Cerrar** o clic fuera.
6. Vuelve al [Flujo C](#flujo-c--registrar-un-nuevo-evento); el nuevo tipo debería aparecer en el desplegable si está activo.

---

### Flujo E — Calcular una ruta segura (peatonal)

1. Pulsa **Modo Ruta**.
2. **Primer clic** en el mapa → punto de **origen**. Ayuda: *«Modo Ruta: haz clic en el mapa para añadir el punto de origen.»*
3. **Segundo clic** → punto de **destino**. Ayuda: *«Ahora haz clic para añadir el punto de destino.»* y luego *«Puntos listos.»*
4. Pulsa **Calcular ruta** en la barra de ayuda inferior.
5. La ruta se dibuja en **rojo** y el mapa hace zoom para mostrar todo el recorrido.
6. La ruta evita, cuando es posible, las zonas de eventos marcados como **negativos** (marcadores y círculos rojos).

**Salir del modo:** vuelve a pulsar **Modo Ruta** (se limpian marcadores y línea).

**Reiniciar puntos:** si ya tienes origen y destino, un **tercer clic** en el mapa borra la selección anterior y empieza de nuevo con un nuevo origen.

---

## Modos de interacción

Solo puede estar activo **un modo a la vez** entre ruta y evento:

| Modo | Se activa con | Clic en el mapa |
|------|---------------|-----------------|
| Ninguno (reposo) | Por defecto o al desactivar un modo | Sin acción especial |
| Ruta | **Modo Ruta** | Añade origen/destino (máx. 2; el 3.er clic reinicia) |
| Evento | **Añadir Evento** | Coloca marcador y abre **Registrar Evento** |

- Activar **Modo Ruta** mientras estabas en modo evento cancela la colocación del evento temporal.
- Activar **Añadir Evento** mientras estabas en modo ruta limpia los puntos de ruta.
- **Nuevo tipo de Evento** no cambia el modo del mapa.

Para salir de un modo, pulsa de nuevo el mismo botón (**Modo Ruta** o **Añadir Evento**).

---

## Mensajes y errores

### Mensajes de confirmación (`alert` del navegador)

| Mensaje | Cuándo aparece |
|---------|----------------|
| Evento registrado correctamente. | Tras guardar un evento con éxito |
| Tipo de evento creado. | Tras crear un tipo con éxito |
| Selecciona 2 puntos en el mapa para la ruta. | Pulsaste **Calcular ruta** sin origen y destino |
| *(texto de la API)* o Error al calcular la ruta | Fallo al obtener la ruta desde el servidor |

### Errores en modales

| Mensaje | Qué hacer |
|---------|-----------|
| Selecciona un tipo de evento. | Elige una opción válida en el desplegable antes de **Guardar Evento** |
| No se pudieron cargar los tipos. ¿Está el backend en marcha y con Supabase configurado? | Levanta backend y revisa [configuración](../setup/env.md) |
| Error al guardar. | Revisa conexión y respuesta del servidor; el detalle puede venir de la API |
| Completa código y descripción. | Rellena **Código / ID del tipo** y **Descripcion** |
| Error al crear el tipo. | Revisa conexión; puede haber código duplicado u otro error de la API |
| No se puede eliminar: el evento no tiene ID. | Evento corrupto o sin identificador en base de datos |
| Error al eliminar el evento. | Revisa que el backend esté activo y el evento exista |

### Opciones del desplegable «Tipo de evento»

| Texto | Significado |
|-------|-------------|
| Cargando… | Esperando respuesta del servidor |
| Selecciona un tipo… | Debes elegir una opción |
| No hay tipos — crea uno primero | Usa **Nuevo tipo de Evento** (Flujo D) |
| Error al cargar tipos | Fallo de red o backend; revisa la consola del navegador |

### Valores mostrados en detalles

| Campo | Si falta dato |
|-------|---------------|
| Tipo | Sin tipo |
| Descripción | Sin descripción |
| Fecha y hora | Sin fecha / Fecha inválida |

---

## Preguntas frecuentes

### No veo eventos después de recargar la página

Comprueba que el backend esté en marcha y que Supabase tenga eventos con coordenadas válidas. Si el servidor no responde, los eventos no se cargan (el error solo aparece en la consola del desarrollador, no en pantalla).

### El desplegable de tipos está vacío o deshabilitado

Crea al menos un tipo con **Nuevo tipo de Evento** y déjalo **Activo**. Solo los tipos activos se listan al registrar eventos.

### La ruta no evita un evento que veo en el mapa

Solo los eventos cuyo tipo está marcado como **negativo** (`evento_negativo`) generan zonas de exclusión para Valhalla. Los marcadores **verdes** son informativos pero no fuerzan desvíos en la ruta.

### Pulsé un tercer punto en modo ruta y desapareció mi selección

Es el comportamiento esperado: con dos puntos ya colocados, un nuevo clic **reinicia** origen y destino para que puedas elegir otra ruta.

### ¿Puedo usar la app sin Docker?

Sí, con backend (`uvicorn`) y frontend (`npm run dev`) por separado. Consulta el [README del proyecto](../../README.md) para los pasos de instalación.

---

## Más información

Documentación técnica (no orientada al usuario final):

| Tema | Enlace |
|------|--------|
| Mapa, API del frontend, variables | [frontend/main.md](../frontend/main.md) |
| Tablas y datos en Supabase | [datos/supabase.md](../datos/supabase.md) |
| Docker y servicios | [setup/docker.md](../setup/docker.md) |
| Índice completo de documentación | [docs/README.md](../README.md) |

---

*Proyecto académico Ligthwatch — Generador de rutas seguras.*
