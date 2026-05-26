---
sidebar_position: 3
title: Calcular una ruta segura
---

# Cómo calcular una ruta segura (peatonal)

Obtén un recorrido a pie entre dos puntos. El sistema intenta evitar zonas de eventos **negativos** cuando Valhalla lo permite.

## Pasos

1. Pulsa **Modo Ruta** en la barra superior.
2. Haz **clic** en el mapa para el **origen**.
3. Haz **segundo clic** para el **destino**.
4. Cuando la ayuda muestre *Puntos listos.*, pulsa **Calcular ruta** en la barra inferior.
5. Observa la línea roja y el encuadre automático del mapa.

## Salir del modo ruta

Pulsa de nuevo **Modo Ruta**. Se eliminan marcadores de origen/destino y la línea dibujada.

## Reiniciar origen y destino

Si ya tienes dos puntos, un **tercer clic** en el mapa borra la selección anterior y empieza una nueva desde el origen.

## Problemas frecuentes

| Síntoma | Solución |
|---------|----------|
| «Selecciona 2 puntos en el mapa para la ruta.» | Define origen y destino antes de calcular |
| «Error al calcular la ruta» | Comprueba que Valhalla y el backend estén activos |
| La ruta no evita un marcador verde | Solo eventos **negativos** generan exclusión; ver [explicación](../explanation/eventos-negativos-y-exclusion.md) |

:::note Coste de ruta
La aplicación usa ruteo **peatonal** (`pedestrian`) con preferencia por el camino más corto.
:::
