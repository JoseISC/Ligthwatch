---
sidebar_position: 1
title: Registrar un evento en el mapa
---

# Cómo registrar un evento en el mapa

Registra un incidente o alerta georreferenciada eligiendo ubicación y tipo.

:::prerequisite
Debe existir al menos un **tipo de evento activo**. Si el desplegable está vacío, crea uno primero con [Cómo crear un tipo de evento](crear-tipo-evento.md).
:::

## Pasos

1. Pulsa **Añadir Evento** en la barra superior.
2. Haz clic en el mapa en la ubicación deseada.
3. En el modal **Registrar Evento**, selecciona un valor en **Tipo de evento**.
4. Revisa **Ubicación** (coordenadas en solo lectura).
5. Pulsa **Guardar Evento**.

## Resultado esperado

- Mensaje: *Evento registrado correctamente.*
- Marcador permanente en el mapa (verde o rojo) con círculo de influencia.
- El modo evento se desactiva automáticamente.

## Cancelar sin guardar

- Pulsa **Cancelar** en el modal, o
- Haz clic fuera del panel.

El marcador naranja temporal desaparece.

## Problemas frecuentes

| Síntoma | Solución |
|---------|----------|
| «Selecciona un tipo de evento.» | Elige una opción distinta de *Selecciona un tipo…* |
| Desplegable deshabilitado | Crea un tipo activo ([crear-tipo-evento](crear-tipo-evento.md)) |
| «Error al guardar.» | Verifica backend en `http://localhost:8000` y [mensajes de error](../reference/mensajes-errores.md) |
