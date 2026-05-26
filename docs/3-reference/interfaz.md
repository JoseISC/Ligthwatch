---
sidebar_position: 1
title: Interfaz de usuario
---

# Referencia — Interfaz de usuario

Descripción neutra de la pantalla única de Ligthwatch (*Safe Route — Mapa*).

## Layout general

```
┌─────────────────────────────────────────────────────────────┐
│ [Modo Ruta]  [Añadir Evento]  [Nuevo tipo de Evento]        │
│                         MAPA                                │
│                                    [+] [-] [brújula]        │
│         ┌───────────────────────────────────────┐           │
│         │  #modeHint  [Calcular ruta]           │           │
│         └───────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

| Región | ID / selector | Rol |
|--------|---------------|-----|
| Mapa | `#map` | Contenedor MapLibre (`role="application"`) |
| Barra superior | `.map-toolbar` | Acciones principales (`aria-label="Acciones"`) |
| Ayuda inferior | `#modeHint` | Instrucciones y botón calcular (`role="status"`) |
| Modales | `#modalRoot` | Contenedor dinámico de diálogos |

## Barra de herramientas

| ID | Etiqueta | `aria-pressed` | Acción |
|----|----------|----------------|--------|
| `routeBtn` | Modo Ruta | `true` / `false` | Alterna modo ruta |
| `eventoModeBtn` | Añadir Evento | `true` / `false` | Alterna modo evento |
| `newTipoBtn` | Nuevo tipo de Evento | — | Abre modal de tipo |

## Barra de ayuda (`#modeHint`)

| Modo | Texto | Botón adicional |
|------|-------|-----------------|
| Ruta, 0 puntos | `Modo Ruta: haz clic en el mapa para añadir el punto de origen.` | — |
| Ruta, 1 punto | `Ahora haz clic para añadir el punto de destino.` | — |
| Ruta, 2 puntos | `Puntos listos.` | **Calcular ruta** (`#calcRouteBtn`) |
| Evento | `Modo Evento: haz clic en el mapa para colocar el marcador. Luego elige el tipo de evento.` | — |
| Inactivo | *(oculto)* | — |

## Modal — Registrar Evento

| Campo | Control | Obligatorio |
|-------|---------|-------------|
| Título | `Registrar Evento` | — |
| Tipo de evento | `#evento-tipo` (`select`) | Sí |
| Ubicación | `#evento-coords` (`readonly`) | Auto |
| Errores | `#evento-error` | — |
| Cancelar | `#evento-cancel` | — |
| Guardar Evento | `#evento-submit` | — |

## Modal — Detalles del Evento

| Campo | Control | Solo lectura |
|-------|---------|--------------|
| Título | `Detalles del Evento` | — |
| Tipo | `#detalle-tipo` | Sí |
| Descripción | `#detalle-desc` | Sí |
| Fecha y hora | `#detalle-fecha` | Sí |
| Ubicación | `#detalle-coords` | Sí |
| Cerrar | `#detalle-cancel` | — |
| Eliminar evento | `#detalle-delete` | — |

## Modal — Nuevo tipo de evento

| Campo | Control | Obligatorio |
|-------|---------|-------------|
| Título | `Nuevo tipo de evento` | — |
| Código / ID del tipo | `#tipo-codigo` | Sí |
| Descripcion | `#tipo-desc` | Sí |
| Duracion (opcional) | `#tipo-dur` | No |
| Activo | `#tipo-activo` (checkbox, default `checked`) | — |
| Cerrar | `#tipo-cancel` | — |
| Crear tipo | `#tipo-submit` | — |

## Controles MapLibre

| Control | Función |
|---------|---------|
| Zoom + / − | Acercar / alejar |
| Brújula | Orientación y rotación del mapa |
| Arrastre | Pan del mapa |

Estilo de tiles: OpenFreeMap `liberty`. Centro inicial: `[-70.66, -33.45]`, zoom `10`.
