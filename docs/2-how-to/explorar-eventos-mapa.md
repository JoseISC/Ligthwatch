---
sidebar_position: 5
title: Explorar eventos en el mapa
---

# Cómo explorar eventos en el mapa

Visualiza incidentes ya guardados y navega por el territorio sin registrar ni calcular rutas.

## Pasos

1. Abre la aplicación en el navegador.
2. Espera a que el mapa termine de cargar.
3. Los eventos activos aparecen automáticamente como marcadores con círculo de influencia.
4. Usa arrastre del ratón y los controles **+** / **-** / brújula para desplazarte y hacer zoom.

## Qué observar

| Elemento | Significado |
|----------|-------------|
| Marcador verde | Evento no negativo (informativo para ruteo) |
| Marcador rojo | Evento negativo (puede excluir zona en rutas) |
| Círculo semitransparente | Radio de influencia del tipo de evento |

Referencia completa: [Elementos del mapa](../reference/elementos-mapa.md).

## Si no ves eventos

- Comprueba que el backend responda en `http://localhost:8000`.
- Verifica que existan registros en Supabase con coordenadas válidas.
- Los errores de carga no se muestran en pantalla; revisa la consola del navegador (F12).

:::info Persistencia
Tras recargar la página, los eventos guardados deben seguir visibles si el backend y Supabase están operativos.
:::
