---
sidebar_position: 2
title: Elementos del mapa
---

# Referencia — Elementos del mapa

| Elemento | Color / forma | Clase / origen | Significado |
|----------|---------------|----------------|-------------|
| Marcador temporal | Naranja, punto | `.evento-marker-dot` | Ubicación pendiente al registrar evento |
| Marcador evento (no negativo) | Verde `#22c55e` | `.evento-marker-dot` | Evento persistido, no excluye ruta |
| Marcador evento (negativo) | Rojo `#dc2626` | `.evento-marker-dot` | Evento que puede generar `exclude_polygons` |
| Círculo de influencia | Relleno semitransparente | Capa `fill` GeoJSON | Radio = `evento.radius` o **10** m por defecto |
| Opacidad del círculo | — | `puntuacion / 10` (clamp 0.1–0.5) | Intensidad visual |
| Pin origen/destino | Pin MapLibre default | `maplibregl.Marker` | Puntos de ruta en modo ruta |
| Línea de ruta | Rojo `#ff0000`, grosor 5 | Capa `route` | Polilínea decodificada de Valhalla |

## Tooltip de marcadores

| Estado | Atributo `title` |
|--------|------------------|
| Colocación temporal | `Ubicación del Evento` |
| Evento guardado | `tipo_evento` o `Evento` |

## Coordenadas en modales

Formato: `lat, lng` con **6** decimales (`toFixed(6)`).
