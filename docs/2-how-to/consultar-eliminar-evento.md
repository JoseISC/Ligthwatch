---
sidebar_position: 4
title: Consultar y eliminar un evento
---

# Cómo consultar y eliminar un evento

Consulta la ficha de un evento existente o elimínalo del mapa y de la base de datos.

## Consultar detalles

1. Sin activar **Modo Ruta** ni **Añadir Evento**, haz clic en un marcador de evento (verde o rojo).
2. Se abre el modal **Detalles del Evento** con:
   - Tipo
   - Descripción
   - Fecha y hora
   - Ubicación (coordenadas)
3. Pulsa **Cerrar** o haz clic fuera para salir sin cambios.

## Eliminar un evento

1. Abre **Detalles del Evento** (pasos anteriores).
2. Pulsa **Eliminar evento**.
3. El marcador desaparece del mapa y el modal se cierra.

## Valores por defecto en detalles

Si faltan datos en la base, la interfaz muestra textos de respaldo. Consulta la tabla en [Valores por defecto](../reference/mensajes-errores.md#valores-por-defecto-en-detalles).

## Problemas frecuentes

| Síntoma | Solución |
|---------|----------|
| «No se puede eliminar: el evento no tiene ID.» | Evento sin identificador válido en BD |
| «Error al eliminar el evento.» | Backend caído o evento ya eliminado |
