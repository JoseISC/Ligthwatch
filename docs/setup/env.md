# 🔐 Variables de Entorno — Ligthwatch

## 📌 Objetivo

Definir las variables de entorno necesarias para la correcta configuración del backend, la conexión con Supabase y la integración con Valhalla, permitiendo un entorno seguro y portable.

---

## 📁 Archivo `.env.example`

Este archivo sirve como plantilla para que cada desarrollador configure su entorno local.

```env
# 🔧 Entorno de ejecución
APP_ENV=development
APP_HOST=127.0.0.1
APP_PORT=8000

# 🗄️ Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_or_service_key

# 🛣️ Valhalla
VALHALLA_URL=http://localhost:8002

# 📝 Configuración opcional
LOG_LEVEL=info
```

---

## 🧾 Descripción de variables

### 🔧 APP_ENV

Define el entorno de ejecución.

Valores posibles:

* development
* production

---

### 🌐 APP_HOST / APP_PORT

Configuran dónde se levanta el backend.

Ejemplo:

```
http://127.0.0.1:8000
```

---

### 🗄️ SUPABASE_URL

URL del proyecto Supabase.

Se obtiene desde:

* Settings → API → Project URL

---

### 🔑 SUPABASE_KEY

Clave de acceso a Supabase.

Tipos:

* anon key → uso frontend / pruebas
* service role key → uso backend (más permisos)

⚠️ **Importante:** No subir claves reales al repositorio.

---

### 🛣️ VALHALLA_URL

URL del servicio Valhalla.

Ejemplo local:

```
http://localhost:8002
```

---

### 📊 LOG_LEVEL (opcional)

Nivel de logs del backend.

Valores comunes:

* debug
* info
* warning
* error

---

## ⚠️ Buenas prácticas

* Nunca subir archivo `.env` real a GitHub
* Agregar `.env` al `.gitignore`
* Usar `.env.example` como referencia
* Validar variables al iniciar la app

---

## 🧪 Verificación

Para validar que las variables están funcionando:

```python
from dotenv import load_dotenv
import os

load_dotenv()

print(os.getenv(\"SUPABASE_URL\"))
print(os.getenv(\"VALHALLA_URL\"))
```

Debe retornar los valores configurados.

---

## 📁 Ubicación esperada

```bash
<raíz del repo>/
├── backend/
├── docs/
│   ├── README.md
│   ├── backend/
│   ├── datos/
│   ├── setup/
│   ├── proyecto/
│   └── dependencias/
├── .env
├── .env.example
└── README.md
```

---

## 🔄 Próximo paso

👉 Tarea 1.1.5 — Definir rol de cada componente en la arquitectura

---

## ✅ Estado

✔ Variables definidas
✔ Archivo `.env.example` listo
✔ Buenas prácticas documentadas
✔ Listo para integración con backend
