---
sidebar_position: 2
title: Crear un tipo de evento
---

# Cómo crear un tipo de evento

Los tipos son el catálogo desde el que eliges al registrar eventos. Cada tipo define metadatos como descripción, radio de influencia y si el evento es **negativo** para el ruteo.

## Pasos

1. Pulsa **Nuevo tipo de Evento** (disponible en cualquier momento; no activa un modo en el mapa).
2. Completa el modal **Nuevo tipo de evento**:

   | Campo | Obligatorio | Ejemplo |
   |-------|-------------|---------|
   | Código / ID del tipo | Sí | `incendio_vehicular` |
   | Descripcion | Sí | `Vehículo en llamas en calzada` |
   | Duracion (opcional) | No | `60` |
   | Activo | — | Marcado por defecto |

3. Pulsa **Crear tipo**.
4. Cierra con **Cerrar** o clic fuera del panel.

## Resultado esperado

- Mensaje: *Tipo de evento creado.*
- El tipo aparece en el desplegable al registrar eventos, **si está activo**.

## Problemas frecuentes

| Síntoma | Solución |
|---------|----------|
| «Completa código y descripción.» | Rellena ambos campos obligatorios |
| «Error al crear el tipo.» | Puede haber código duplicado; revisa la API y [mensajes](../reference/mensajes-errores.md) |

:::tip Tipos inactivos
Los tipos con **Activo** desmarcado no se listan al registrar eventos (`solo_activos=true` en la API).
:::
