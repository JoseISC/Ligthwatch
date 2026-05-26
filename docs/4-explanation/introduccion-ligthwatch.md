---
sidebar_position: 1
title: Qué es Ligthwatch
---

# Qué es Ligthwatch y a quién va dirigido

**Ligthwatch** (interfaz: *Safe Route — Mapa*) es un generador de **rutas seguras** para desplazamiento peatonal. Resuelve el problema de planificar un recorrido entre dos puntos **evitando zonas** asociadas a incidentes georreferenciados, en lugar de mostrar solo la ruta más corta en línea recta o por calles sin contexto de riesgo.

## Problema que aborda

En entornos urbanos pueden existir incidentes (obras, manifestaciones, zonas de riesgo, accidentes) que conviene rodear. Ligthwatch:

1. **Centraliza eventos** en un mapa con persistencia (Supabase).
2. **Clasifica** cada evento por tipo (catálogo configurable).
3. **Calcula rutas** con Valhalla, enviando exclusiones cuando el tipo es **negativo**.

## Público objetivo

| Perfil | Uso típico |
|--------|------------|
| Usuario final / operador | Registrar eventos, consultar el mapa, pedir rutas |
| Equipo académico / desarrollo | Integrar backend, datos y motor de ruteo |
| Revisor técnico | Documentación en `docs/backend/`, `docs/setup/` |

:::note Alcance del MVP
La aplicación es una **SPA de una pantalla**: sin autenticación, sin panel de administración separado ni filtros avanzados en la UI.
:::

## Principios de diseño en la interfaz

- **Mapa primero:** toda acción relevante ocurre sobre el mapa o en modales contextuales.
- **Modos excluyentes:** evitar conflictos entre «colocar evento» y «elegir puntos de ruta».
- **Catálogo de tipos:** separar *qué es* un evento (tipo) de *dónde ocurrió* (coordenadas).

## Relación con otras documentaciones

| Tipo Diátaxis | Carpeta |
|---------------|---------|
| Aprender haciendo | [Tutoriales](../tutorials/primeros-pasos.md) |
| Resolver una tarea | [Guías prácticas](../how-to/registrar-evento.md) |
| Consultar datos exactos | [Referencia](../reference/interfaz.md) |
| Entender el sistema | Esta sección y [Arquitectura](arquitectura-servicios.md) |
