---
sidebar_position: 4
title: Mensajes y errores
---

# Referencia — Mensajes y errores

## Alertas del navegador (`alert`)

| Mensaje | Disparador |
|---------|------------|
| `Evento registrado correctamente.` | `POST /eventos` exitoso |
| `Tipo de evento creado.` | `POST /tipo-eventos` exitoso |
| `Selecciona 2 puntos en el mapa para la ruta.` | **Calcular ruta** con `routePoints.length < 2` |
| `{API detail}` o `Error al calcular la ruta` | `POST /route` fallido |

## Errores en modales (`#evento-error`, `#tipo-error`, `#detalle-error`)

| Mensaje | Contexto |
|---------|----------|
| `Selecciona un tipo de evento.` | Guardar evento sin tipo |
| `No se pudieron cargar los tipos. ¿Está el backend en marcha y con Supabase configurado?` | Fallo `GET /tipo-eventos` |
| `Error al guardar.` | Fallo `POST /eventos` |
| `Completa código y descripción.` | Validación modal tipo |
| `Error al crear el tipo.` | Fallo `POST /tipo-eventos` |
| `No se puede eliminar: el evento no tiene ID.` | `DELETE` sin id |
| `Error al eliminar el evento.` | Fallo `DELETE /eventos/{id}` |

## Opciones del desplegable «Tipo de evento»

| Texto visible | Estado |
|---------------|--------|
| `Cargando…` | Petición en curso |
| `Selecciona un tipo…` | Placeholder válido |
| `{tipo} — {descripcion}` | Opción seleccionable |
| `No hay tipos — crea uno primero` | Lista vacía (deshabilitado) |
| `Error al cargar tipos` | Error de red/API |

## Valores por defecto en detalles

| Campo | Fallback |
|-------|----------|
| Tipo | `Sin tipo` |
| Descripción | `Sin descripción` |
| Fecha y hora | `Sin fecha` / `Fecha inválida` |
| Coordenadas | `lat, lng` formateadas |

## Formato de errores API (`formatApiError`)

Orden de extracción del mensaje:

1. `detail` (string)
2. `detail` (array de validación FastAPI → `msg`)
3. `message`
4. `Error desconocido`

## Errores solo en consola

| Evento | Comportamiento UI |
|--------|-------------------|
| Fallo `GET /eventos` al cargar | Sin mensaje en pantalla |
| Coordenadas inválidas | Evento descartado, `console.warn` |
| Fallo al construir polígonos de exclusión | `console` |
