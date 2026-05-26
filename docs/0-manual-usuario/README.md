---
sidebar_position: 0
title: Manual de usuario
slug: /manual
---

# Manual de usuario — Ligthwatch

Documentación de la aplicación web **Safe Route — Mapa**, organizada según el marco [Diátaxis](https://diataxis.fr/) y preparada para [Docusaurus](https://docusaurus.io/).

## ¿Qué es Ligthwatch?

Sistema para **generar rutas peatonales seguras** usando Valhalla, evitando zonas de eventos peligrosos almacenados en Supabase, y para **registrar y consultar incidentes** en un mapa interactivo.

:::tip Empieza aquí
Si es tu primera vez, sigue el tutorial [Primeros pasos](../tutorials/primeros-pasos.md).
:::

## Estructura Diátaxis

### Tutoriales — Aprendizaje

Guías lineales que te llevan de la mano hasta un primer resultado.

| Documento | Descripción |
|-----------|-------------|
| [Primeros pasos](../1-tutorials/primeros-pasos.md) | Entorno, primer tipo, primer evento y primera ruta |

### Guías prácticas — Tareas

Respuestas directas a «¿cómo hago X?». Asumen que ya abriste la aplicación.

| Documento | Descripción |
|-----------|-------------|
| [Registrar un evento](../2-how-to/registrar-evento.md) | Colocar y guardar un incidente |
| [Crear un tipo de evento](../2-how-to/crear-tipo-evento.md) | Ampliar el catálogo de tipos |
| [Calcular una ruta segura](../2-how-to/calcular-ruta-segura.md) | Origen, destino y cálculo |
| [Consultar y eliminar un evento](../2-how-to/consultar-eliminar-evento.md) | Ficha y borrado |
| [Explorar eventos en el mapa](../2-how-to/explorar-eventos-mapa.md) | Navegación sin editar |

### Referencia — Información

Descripción precisa de interfaz, modos y mensajes.

| Documento | Descripción |
|-----------|-------------|
| [Interfaz de usuario](../3-reference/interfaz.md) | Botones, modales, layout |
| [Elementos del mapa](../3-reference/elementos-mapa.md) | Marcadores, colores, capas |
| [Modos de interacción](../3-reference/modos-interaccion.md) | `idle`, `route`, `evento` |
| [Mensajes y errores](../3-reference/mensajes-errores.md) | Alertas y textos de error |

### Explicación — Comprensión

Contexto, arquitectura y decisiones de diseño.

| Documento | Descripción |
|-----------|-------------|
| [Qué es Ligthwatch](../4-explanation/introduccion-ligthwatch.md) | Problema, público, alcance MVP |
| [Arquitectura de servicios](../4-explanation/arquitectura-servicios.md) | Frontend, backend, Supabase, Valhalla |
| [Eventos negativos y exclusión](../4-explanation/eventos-negativos-y-exclusion.md) | Por qué algunos eventos desvían la ruta |
| [Modos y UX](../4-explanation/modos-y-ux.md) | Por qué los modos son excluyentes |

## Integración con Docusaurus

Estructura de carpetas bajo `docs/`:

```text
docs/
├── tutorials/          # Learning-oriented
├── how-to/             # Task-oriented
├── reference/          # Information-oriented
├── explanation/        # Understanding-oriented
└── manual-usuario/     # Índice (esta página)
```

Cada carpeta incluye `_category_.json` para la barra lateral de Docusaurus. Los archivos usan frontmatter (`title`, `sidebar_position`) y admonitions (`:::note`, `:::tip`, `:::warning`, `:::info`).

Ejemplo de `sidebars.js` (fragmento):

```javascript
module.exports = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Manual de usuario',
      link: { type: 'doc', id: 'manual-usuario/README' },
      items: [
        {
          type: 'category',
          label: 'Tutoriales',
          link: { type: 'generated-index', dirName: 'tutorials' },
        },
        {
          type: 'category',
          label: 'Guías prácticas',
          link: { type: 'generated-index', dirName: 'how-to' },
        },
        {
          type: 'category',
          label: 'Referencia',
          link: { type: 'generated-index', dirName: 'reference' },
        },
        {
          type: 'category',
          label: 'Explicación',
          link: { type: 'generated-index', dirName: 'explanation' },
        },
      ],
    },
  ],
};
```

## Documentación técnica relacionada

| Tema | Enlace |
|------|--------|
| API y backend | [backend/main.md](../z-tecnical-documentation/backend/main.md) |
| Mapa y frontend | [frontend/main.md](../z-tecnical-documentation/frontend/main.md) |
| Supabase | [datos/supabase.md](../z-tecnical-documentation/datos/supabase.md) |
| Docker | [setup/docker.md](../z-tecnical-documentation/setup/docker.md) |
| Índice general | [docs/README.md](../z-tecnical-documentation/README.md) |
