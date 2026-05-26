---
sidebar_position: 3
title: Modos de interacción
---

# Referencia — Modos de interacción

Variable interna: `interactionMode` ∈ `idle` | `route` | `evento`.

## Tabla de modos

| Modo | Activación | Clic en mapa | Efecto al activar otro modo |
|------|------------|--------------|------------------------------|
| `idle` | Por defecto; desactivar modo activo | Ninguno | — |
| `route` | **Modo Ruta** | Añade origen/destino (máx. 2; 3.er clic reinicia) | Cancela colocación de evento temporal |
| `evento` | **Añadir Evento** | Coloca marcador naranja + abre modal | Limpia puntos y línea de ruta |

## Exclusión mutua

- `route` y `evento` no pueden estar activos simultáneamente.
- **Nuevo tipo de Evento** no modifica `interactionMode`.

## Salida de modo

Pulsar de nuevo el botón del modo activo (`routeBtn` o `eventoModeBtn`) restaura `idle` y limpia estado asociado.

## Límite de puntos en modo ruta

| `routePoints.length` | Comportamiento al clic |
|----------------------|------------------------|
| 0 → 1 | Primer punto (origen) |
| 1 → 2 | Segundo punto (destino) |
| 2 | Reinicia: borra marcadores y empieza nuevo origen |
