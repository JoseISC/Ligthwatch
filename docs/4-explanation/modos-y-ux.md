---
sidebar_position: 4
title: Modos de interacción y UX
---

# Por qué los modos son mutuamente excluyentes

La interfaz usa tres estados de interacción (`idle`, `route`, `evento`) en lugar de permitir todas las acciones a la vez sobre el mapa.

## Problema que evita

Un único **clic en el mapa** no puede significar simultáneamente:

- «Aquí va un evento», y
- «Este es origen o destino de la ruta».

Sin modos, el usuario registraría eventos por error al trazar rutas, o movería puntos de ruta al intentar colocar incidentes.

## Comportamiento al cambiar de modo

| Transición | Efecto |
|------------|--------|
| Ruta → Evento | `clearRouteMode()`: borra pins y línea |
| Evento → Ruta | `clearEventoPlacement()`: quita marcador naranja y cierra modal |
| Cualquiera → idle | Limpia el estado del modo saliente |

**Nuevo tipo de Evento** abre un modal sin tocar el modo del mapa: es configuración de catálogo, no geolocalización inmediata.

## Barra de ayuda contextual

`#modeHint` reduce la carga cognitiva: el texto cambia según cuántos puntos de ruta hay o si el usuario está en modo evento. El botón **Calcular ruta** solo aparece cuando hay exactamente dos puntos, evitando llamadas prematuras a Valhalla.

## Accesibilidad

- Botones de modo exponen `aria-pressed` para lectores de pantalla.
- Modales usan `role="dialog"` y `aria-modal="true"`.
- El hint usa `aria-live="polite"` para anunciar cambios de instrucción.

Referencia exacta de textos: [Modos de interacción](../reference/modos-interaccion.md).
