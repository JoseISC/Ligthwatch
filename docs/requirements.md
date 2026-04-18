# 📄 requirements.txt — Ligthwatch

## 📌 Objetivo

Generar el archivo `requirements.txt` inicial del proyecto, incluyendo las dependencias necesarias para levantar el backend, conectarse a Supabase, consumir Valhalla y manejar configuración por variables de entorno.

---

## 📦 Archivo `requirements.txt`

```txt
fastapi==0.116.1
uvicorn[standard]==0.35.0
requests==2.32.4
pydantic==2.11.7
python-dotenv==1.1.1
supabase==2.15.3
sqlalchemy==2.0.41
alembic==1.16.4
```

---

## 🧾 Descripción de cada dependencia

### fastapi

Framework principal para construir la API REST del proyecto.

### uvicorn[standard]

Servidor ASGI para ejecutar la aplicación FastAPI en entorno local o de desarrollo.

### requests

Permite realizar solicitudes HTTP hacia servicios externos, como Valhalla.

### pydantic

Se utiliza para validación de datos, tipado y definición de esquemas de entrada y salida.

### python-dotenv

Permite cargar variables de entorno desde un archivo `.env`.

### supabase

Cliente oficial de Python para conectarse a Supabase y operar sobre PostgreSQL vía API.

### sqlalchemy

Se incluye como soporte para modelado o acceso más estructurado a datos si el proyecto lo requiere.

### alembic

Herramienta para manejar migraciones de base de datos.

---

## ⚠️ Consideraciones técnicas

* Este archivo contiene solo las dependencias necesarias para el **MVP backend**.
* No se incluyen todavía librerías de Machine Learning como `scikit-learn`, porque no son críticas para la primera entrega.
* Las versiones están fijadas para reducir errores de compatibilidad entre entornos.
* Si más adelante se implementa análisis predictivo, se podrá crear una sección adicional o un `requirements-ml.txt`.

---

## 📁 Ubicación esperada

```bash
Ligthwatch/
├── app/
├── docs/
├── requirements.txt
└── README.md
```

---

## ▶️ Instalación

Una vez creado el archivo, las dependencias se instalan con:

```bash
pip install -r requirements.txt
```

---

## ✅ Resultado esperado

Al ejecutar la instalación:

* FastAPI debe quedar disponible
* Uvicorn debe poder levantar el servidor
* Supabase debe poder importarse sin errores
* El proyecto debe quedar listo para la configuración del entorno en la siguiente tarea

---

## 📌 Estado

✔ Archivo `requirements.txt` definido
✔ Dependencias mínimas del MVP cubiertas
✔ Listo para continuar con `.env.example` en la tarea 1.1.4
