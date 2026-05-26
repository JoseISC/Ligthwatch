# 🧱 Rol de Cada Componente en la Arquitectura — Ligthwatch

## 📌 Objetivo

Definir la función de cada tecnología y componente dentro de la arquitectura del proyecto, para dejar claro cómo se conectan entre sí y qué responsabilidad cumple cada uno en el sistema.

---

## 🧩 Componentes principales

### 🐍 Python 3.14.4

Es el lenguaje principal del proyecto.

**Rol en el sistema:**

* Implementar la lógica del backend
* Procesar incidentes
* Conectarse con Supabase
* Consumir la API de Valhalla
* Exponer endpoints REST

---

### ⚡ FastAPI

Es el framework backend principal.

**Rol en el sistema:**

* Crear la API REST del proyecto
* Definir endpoints como:

  * `POST /incidentes`
  * `GET /incidentes`
  * `PUT /incidentes/{id}`
  * `DELETE /incidentes/{id}`
  * `POST /ruta-segura`
* Validar datos de entrada y salida
* Generar documentación automática con Swagger

---

### 🗄️ Supabase (PostgreSQL)

Es la plataforma de persistencia de datos.

**Rol en el sistema:**

* Almacenar los incidentes georreferenciados
* Guardar datos históricos y actuales
* Permitir consultas filtradas por tipo, fecha o ubicación
* Servir como base de datos principal del backend

**Datos esperados:**

* id
* tipo
* latitud
* longitud
* fecha
* nivel_riesgo
* descripcion

---

### 🛣️ Valhalla 3.6.3

Es el motor de ruteo del sistema.

**Rol en el sistema:**

* Calcular rutas entre origen y destino
* Recibir restricciones geográficas o zonas a evitar
* Generar rutas más seguras en función de incidentes cargados
* Servir como núcleo de la funcionalidad principal del proyecto

---

### 🗺️ OpenStreetMap (OSM)

Es la fuente de datos geográficos base.

**Rol en el sistema:**

* Proveer la cartografía necesaria para Valhalla
* Entregar información de calles, caminos y nodos
* Permitir construir la red vial sobre la cual se calculan rutas

---

### 🧭 MapLibre GL JS (proyecto `frontend`)

Es la librería de visualización de mapas del cliente web (Vite + MapLibre GL JS).

**Rol en el sistema:**

* Mostrar el mapa interactivo (estilo remoto vía OpenFreeMap)
* Marcar dos puntos y solicitar una ruta al backend (`POST /route` → Valhalla)
* Modo **incidente**: colocar un marcador, elegir un tipo desde `GET /tipo-incidentes` y enviar `POST /incidentes`
* Formulario para **nuevo tipo de incidente** (`POST /tipo-incidentes`)

**Documentación detallada:** `docs/frontend/main.md`.

---

### 🐳 Docker

Es la herramienta de contenerización del proyecto.

**Rol en el sistema:**

* Facilitar el levantamiento local de servicios
* Ejecutar Valhalla de forma aislada
* Reproducir el entorno de desarrollo
* Simplificar pruebas e instalación del sistema

---

### 🔄 Git / GitHub

Son las herramientas de control de versiones y colaboración.

**Rol en el sistema:**

* Versionar el código fuente
* Gestionar ramas de trabajo
* Centralizar el repositorio del proyecto
* Facilitar trabajo colaborativo del equipo

---

### 🔗 REST API

Es el estilo de comunicación entre componentes.

**Rol en el sistema:**

* Permitir interacción entre cliente y backend
* Permitir al backend consultar o exponer información
* Servir de puente entre la capa lógica y futuros clientes externos

---

## 🔁 Relación entre componentes

El flujo general del sistema será el siguiente:

1. El backend recibe una solicitud de creación o consulta de incidentes.
2. FastAPI procesa la solicitud.
3. Supabase almacena o devuelve la información.
4. Cuando se solicita una ruta segura:

   * el backend consulta incidentes en Supabase
   * transforma esos incidentes en zonas a evitar
   * envía la solicitud a Valhalla
5. Valhalla calcula la ruta usando datos de OpenStreetMap.
6. El backend devuelve la ruta como respuesta.
7. El cliente web (MapLibre) puede mostrar la ruta y gestionar altas de incidentes y tipos contra la API.

---

## 🧠 Resumen de responsabilidades

| Componente     | Responsabilidad principal    |
| -------------- | ---------------------------- |
| Python         | Lógica del sistema           |
| FastAPI        | API backend                  |
| Supabase       | Persistencia de incidentes   |
| Valhalla       | Cálculo de rutas             |
| OpenStreetMap  | Datos geográficos            |
| MapLibre GL JS | Mapa, rutas e incidentes (frontend) |
| Docker         | Entorno reproducible         |
| Git/GitHub     | Control de versiones         |
| REST API       | Comunicación entre servicios |

---

## 📌 Decisiones de arquitectura

* El sistema se diseña con un backend desacoplado
* La base de datos se separa del motor de ruteo
* Valhalla funciona como servicio independiente
* FastAPI actúa como punto central de integración
* El frontend no es prioritario en el MVP
* La arquitectura permite crecer hacia analítica o Machine Learning

---

## ✅ Estado

✔ Roles de componentes definidos
✔ Arquitectura general explicada
✔ Base conceptual lista para la configuración del entorno
✔ Documento útil para README, presentación o Jira
