---
sidebar_position: 3
title: Eventos negativos y exclusión de zonas
---

# Eventos negativos y exclusión de zonas

No todos los eventos en el mapa modifican el cálculo de rutas. Esta distinción es central en el diseño de «ruta segura».

## Evento negativo vs no negativo

| Atributo | Efecto en UI | Efecto en ruteo |
|----------|--------------|-----------------|
| `evento_negativo = false` (o ausente) | Marcador **verde**, círculo verde | Solo informativo |
| `evento_negativo = true` | Marcador **rojo**, círculo rojo | Genera polígono de exclusión |

El flag proviene del **tipo de evento** asociado al registrar el incidente (configuración en Supabase / API).

## Cómo se construye la exclusión

1. Al pulsar **Calcular ruta**, el frontend consulta eventos cargados.
2. Filtra los que son negativos.
3. Para cada uno, genera un polígono circular aproximado (`circlePolygon`) con radio `evento.radius` o **10 metros**.
4. Envía la lista como `exclude_polygons` en el cuerpo de `POST /route`.
5. Valhalla intenta no atravesar esas áreas en el grafo peatonal.

:::warning Limitaciones
- La exclusión depende de la resolución del grafo OSM y de la geometría circular aproximada.
- Un marcador **verde** visible no garantiza desvío: es comportamiento esperado.
- Si no hay eventos negativos, la ruta equivale a la ruta peatonal más corta sin restricciones extra.
:::

## Opacidad del círculo de influencia

La opacidad del relleno usa `puntuacion` del tipo (normalizada entre 0.1 y 0.5). Es **visual**; no altera por sí sola el radio enviado a Valhalla.

## Decisión de diseño

Separar eventos informativos de eventos que **obligan** exclusión permite:

- Mostrar contexto urbano sin bloquear calles innecesariamente.
- Priorizar solo riesgos catalogados como negativos en el tipo.

## Más detalle técnico

- Implementación frontend: `buildExcludePolygons()` en `frontend/src/main.js`
- Proxy de ruta: `POST /route` en `backend/app/main.py`
- Esquema de tablas: [datos/supabase.md](../datos/supabase.md)
