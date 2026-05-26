---
sidebar_position: 1
title: Primeros pasos con Ligthwatch
description: Del entorno en marcha a tu primer tipo de evento, evento registrado y ruta calculada.
---

# Primeros pasos con Ligthwatch

En este tutorial llevarás la aplicación desde cero hasta tres resultados concretos:

1. Abrir el mapa y ver que el entorno responde.
2. Crear un **tipo de evento** y registrar un **evento** en el mapa.
3. Calcular tu **primera ruta peatonal** que evita zonas peligrosas.

:::info ¿Para quién es esto?
Está pensado para usuarios que abren Ligthwatch por primera vez. No necesitas conocer Valhalla ni Supabase; solo seguir los pasos en orden.
:::

## Lo que necesitas

- **Docker** (recomendado) o backend + frontend en local.
- Navegador web moderno (Chrome, Firefox, Edge).
- Unos 15 minutos.

:::tip Documentación de instalación
Si aún no levantaste el proyecto, consulta el [README del repositorio](https://github.com/SofiLA3S004/Ligthwatch/blob/main/README.md) y [Docker Compose](../setup/docker.md) antes de continuar.
:::

## Paso 1 — Levantar el entorno

Desde la raíz del proyecto:

```bash
docker compose up --build
```

Espera a que los servicios estén activos:

| Servicio   | URL |
|------------|-----|
| Aplicación web | [http://localhost:5173](http://localhost:5173) |
| API backend    | [http://localhost:8000](http://localhost:8000) |

:::note Desarrollo sin Docker
Alternativa: `uvicorn` en `backend/` y `npm run dev` en `frontend/`. La URL de la app suele ser la misma (`5173`).
:::

## Paso 2 — Abrir el mapa

1. Abre [http://localhost:5173](http://localhost:5173).
2. Comprueba que el título de la pestaña es **Safe Route — Mapa**.
3. Deberías ver el mapa centrado en la zona de Santiago y la barra superior con tres botones:

   - **Modo Ruta**
   - **Añadir Evento**
   - **Nuevo tipo de Evento**

Si el mapa carga pero no aparecen datos al guardar, revisa [variables de entorno](../setup/env.md).

## Paso 3 — Crear tu primer tipo de evento

Antes de registrar un evento necesitas al menos un tipo en el catálogo.

1. Pulsa **Nuevo tipo de Evento**.
2. En el modal, completa:
   - **Código / ID del tipo:** `incendio_vehicular`
   - **Descripcion:** `Vehículo en llamas en vía pública`
3. Deja **Activo** marcado.
4. Pulsa **Crear tipo**.
5. Confirma el mensaje *«Tipo de evento creado.»* y cierra el modal.

:::tip Siguiente paso
Para más opciones del formulario, ver [Cómo crear un tipo de evento](../how-to/crear-tipo-evento.md).
:::

## Paso 4 — Registrar tu primer evento

1. Pulsa **Añadir Evento** (el botón queda activo).
2. Lee la ayuda inferior: *Modo Evento: haz clic en el mapa…*
3. Haz clic en un punto del mapa → aparece un marcador **naranja** y el modal **Registrar Evento**.
4. En **Tipo de evento**, elige `incendio_vehicular`.
5. Pulsa **Guardar Evento**.
6. Verás *«Evento registrado correctamente.»* y un marcador **verde** o **rojo** según la configuración del tipo.

¡Ya tienes un evento persistido en Supabase y visible en el mapa!

## Paso 5 — Calcular tu primera ruta

1. Pulsa **Modo Ruta**.
2. **Primer clic** en el mapa → origen.
3. **Segundo clic** → destino. La ayuda mostrará *Puntos listos.*
4. Pulsa **Calcular ruta** en la barra inferior.
5. Observa la **línea roja** y el zoom automático al recorrido.

:::warning Eventos que desvían la ruta
Solo los eventos cuyo tipo es **negativo** influyen en la exclusión de zonas. Si tu tipo no es negativo, la ruta puede pasar cerca del marcador sin desviarse. Más detalle en [Eventos negativos y exclusión de zonas](../explanation/eventos-negativos-y-exclusion.md).
:::

## Paso 6 — Comprobar que todo quedó guardado

1. Recarga la página (`F5` o `Ctrl+R`).
2. El evento del paso 4 debe seguir visible.
3. Repite **Modo Ruta** con otros dos puntos si quieres practicar de nuevo.

## Qué has aprendido

| Resultado | Dónde profundizar |
|-----------|-------------------|
| Entorno y mapa | [Interfaz de usuario](../reference/interfaz.md) |
| Tipos y eventos | [Guías prácticas](../how-to/registrar-evento.md) |
| Rutas seguras | [Cómo calcular una ruta](../how-to/calcular-ruta-segura.md) |
| Por qué funciona así | [Explicación](../explanation/introduccion-ligthwatch.md) |

## Siguientes pasos

- Consulta [Guías prácticas](../how-to/consultar-eliminar-evento.md) para tareas específicas.
- Usa [Referencia](../reference/mensajes-errores.md) cuando veas un mensaje de error.
- Lee [Explicación](../explanation/arquitectura-servicios.md) si quieres entender backend, Valhalla y Supabase.
