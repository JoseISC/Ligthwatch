# 🧩 Stack Tecnológico — Ligthwatch

## 📌 Objetivo

Definir las tecnologías oficiales del proyecto para asegurar consistencia en el desarrollo, despliegue e integración de componentes.

---

## 🧰 Stack del Proyecto

### 🐍 Backend

* **Lenguaje:** Python
* **Versión:** 3.14.4
* **Uso:** Desarrollo del backend, lógica de negocio y API REST.

---

### ⚡ Framework API

* **Framework:** FastAPI
* **Uso:** Construcción de endpoints REST, validación de datos y documentación automática (Swagger).

---

### 🗄️ Base de Datos

* **Plataforma:** Supabase
* **Motor:** PostgreSQL
* **Uso:** Almacenamiento de incidentes georreferenciados y consultas de datos.

---

### 🛣️ Motor de Ruteo

* **Motor:** Valhalla
* **Versión:** 3.6.3
* **Uso:** Generación de rutas optimizadas considerando restricciones geográficas.

---

### 🗺️ Datos Geográficos

* **Fuente:** OpenStreetMap (OSM)
* **Uso:** Proveer datos de calles, caminos y geografía base para el ruteo.

---

### 🧭 Visualización (futuro frontend)

* **Librería:** MapLibre GL JS
* **Versión:** 3.23.0
* **Uso:** Visualización de mapas y rutas en una posible interfaz gráfica.

---

### 🐳 Contenerización

* **Herramienta:** Docker
* **Uso:** Levantar servicios como Valhalla y backend de forma reproducible.

---

### 🔄 Control de Versiones

* **Herramienta:** Git
* **Repositorio:** GitHub
* **Uso:** Control de versiones y trabajo colaborativo.

---

### 🔗 Comunicación

* **Arquitectura:** REST API
* **Uso:** Comunicación entre frontend (futuro), backend y servicios externos.

---

## 🧠 Arquitectura General (Resumen)

| Componente | Rol                   |
| ---------- | --------------------- |
| FastAPI    | Exponer endpoints     |
| Supabase   | Persistencia de datos |
| Valhalla   | Cálculo de rutas      |
| OSM        | Datos geográficos     |
| Docker     | Entorno reproducible  |
| GitHub     | Gestión del código    |

---

## 📌 Notas Técnicas

* Se prioriza un enfoque modular (backend desacoplado).
* El sistema está diseñado para escalar hacia:

  * Machine Learning (riesgo de zonas)
  * Visualización en mapa
* Valhalla se ejecuta como servicio independiente.
* Supabase se consume vía API.

---

## ✅ Estado

✔ Stack definido
✔ Versiones establecidas
✔ Listo para configuración de entorno (Historia 1.2)
