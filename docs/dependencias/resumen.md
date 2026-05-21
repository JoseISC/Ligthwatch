# 📦 Dependencias del Proyecto — Ligthwatch

## 📌 Objetivo

Definir las librerías necesarias para el backend del proyecto, separando claramente entre dependencias **críticas para el MVP** y dependencias **opcionales o futuras**, asegurando un entorno liviano y funcional.

---

## ⚙️ Dependencias Base (MVP)

Estas librerías son **obligatorias** para que el sistema funcione en su primera versión.

### 🚀 API y servidor

* **fastapi**
  Framework principal para construir la API REST.

* **uvicorn[standard]**
  Servidor ASGI para ejecutar FastAPI.

---

### 📡 Comunicación y requests

* **requests**
  Permite realizar llamadas HTTP (ej: integración con Valhalla).

---

### 🧾 Validación de datos

* **pydantic**
  Validación de datos y definición de esquemas.

---

### 🗄️ Base de datos

* **supabase**
  Cliente oficial para conectarse a Supabase desde Python.

* **sqlalchemy** *(opcional pero recomendado)*
  Abstracción para manejo de datos si se necesita mayor control.

* **alembic**
  Manejo de migraciones de base de datos.

---

### 🔐 Configuración

* **python-dotenv**
  Manejo de variables de entorno desde archivo `.env`.

---

## 🧠 Dependencias Futuras (NO MVP)

Estas librerías **NO son necesarias para la entrega inicial**, pero están consideradas para evolución del proyecto.

* **scikit-learn**
  Modelos de Machine Learning para predicción de zonas de riesgo.

* **numpy**
  Soporte matemático para análisis de datos.

---

## 📋 Clasificación de Dependencias

| Tipo                   | Librerías                                                     |
| ---------------------- | ------------------------------------------------------------- |
| Críticas (MVP)         | fastapi, uvicorn, requests, pydantic, supabase, python-dotenv |
| Base de datos avanzada | sqlalchemy, alembic                                           |
| Futuras (ML)           | scikit-learn, numpy                                           |

---

## ⚠️ Decisiones Técnicas

* Se **evita sobrecargar el entorno inicial** con librerías innecesarias.
* Machine Learning se implementará en una fase posterior.
* SQLAlchemy es opcional ya que Supabase puede usarse directamente vía API.
* Alembic se incluye para mantener buenas prácticas desde el inicio.

---

## 🔄 Próximo paso

👉 Generar archivo `requirements.txt` con estas dependencias (Tarea 1.1.3)

---

## ✅ Estado

✔ Dependencias definidas
✔ Separación MVP vs futuro
✔ Listo para generar entorno reproducible
