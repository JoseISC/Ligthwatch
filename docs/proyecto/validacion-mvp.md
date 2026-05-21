# ✅ Validación Técnica del MVP — Ligthwatch

## 📌 Objetivo

Verificar que el stack tecnológico definido permite implementar correctamente la funcionalidad mínima viable (MVP), asegurando que todos los componentes se integran sin conflictos.

---

## 🎯 Alcance del MVP

El sistema debe ser capaz de:

1. Crear incidentes
2. Consultar incidentes
3. Generar incidentes de prueba (nodos)
4. Calcular rutas seguras evitando zonas peligrosas
5. Integrarse correctamente con Valhalla

---

## 🧪 Checklist de Validación

### 🔹 Backend (FastAPI + Python)

* [ ] El servidor levanta correctamente (`uvicorn`)
* [ ] Existe endpoint `/health`
* [ ] Responde con `{ "status": "ok" }`
* [ ] No hay errores de importación de dependencias

---

### 🔹 Supabase (Base de datos)

* [ ] Conexión exitosa desde backend
* [ ] Inserción de incidentes funciona
* [ ] Consulta de incidentes funciona
* [ ] Datos incluyen latitud y longitud válidas

---

### 🔹 CRUD de incidentes

* [ ] `POST /incidentes` crea registros
* [ ] `GET /incidentes` devuelve datos
* [ ] `PUT /incidentes/{id}` actualiza
* [ ] `DELETE /incidentes/{id}` elimina
* [ ] Validaciones funcionan (Pydantic)

---

### 🔹 Valhalla (Motor de ruteo)

* [ ] Servicio levantado en Docker
* [ ] Endpoint accesible (`/route`)
* [ ] Responde a requests básicos
* [ ] Usa datos de OpenStreetMap correctamente

---

### 🔹 Integración backend → Valhalla

* [ ] Backend puede hacer requests a Valhalla
* [ ] Se envían coordenadas correctamente
* [ ] Se recibe una ruta válida
* [ ] Se parsea la respuesta correctamente

---

### 🔹 Lógica de rutas seguras

* [ ] Backend consulta incidentes desde Supabase
* [ ] Incidentes se transforman en zonas a evitar
* [ ] Se envían restricciones a Valhalla
* [ ] La ruta evita zonas con incidentes (al menos en lógica básica)

---

### 🔹 Datos de prueba (MVP)

* [ ] Existen incidentes de prueba cargados
* [ ] Se pueden simular zonas peligrosas
* [ ] Se puede probar la funcionalidad sin datos reales

---

## ⚠️ Riesgos detectados

### 1. Compatibilidad Python 3.14

* Algunas librerías pueden no estar completamente adaptadas
* Solución: validar instalación temprana

---

### 2. Complejidad de Valhalla

* Configuración inicial puede ser compleja
* Solución: usar Docker desde el inicio

---

### 3. Transformación de incidentes

* No existe implementación directa de “zonas peligrosas” en Valhalla
* Solución MVP:

  * usar puntos o radios simples
  * evitar sobre-optimización inicial

---

## 🧠 Decisiones clave para el MVP

* No usar Machine Learning en esta etapa
* Usar lógica simple de evasión (radio o bounding box)
* Priorizar integración funcional sobre precisión
* Validar flujo completo antes de optimizar

---

## 🔄 Flujo validado

1. Usuario solicita ruta segura
2. Backend recibe request
3. Backend consulta incidentes en Supabase
4. Backend transforma incidentes en restricciones
5. Backend envía request a Valhalla
6. Valhalla calcula ruta
7. Backend retorna resultado

---

## 📊 Resultado esperado

Si la validación es exitosa:

* El sistema puede generar rutas seguras básicas
* Todos los componentes funcionan integrados
* El proyecto está listo para avanzar a implementación real

---

## 🧪 Validación mínima obligatoria

Para aprobar esta tarea, debe existir:

* [ ] Backend funcionando
* [ ] Supabase conectado
* [ ] Valhalla respondiendo
* [ ] Endpoint `/ruta-segura` operativo (aunque sea básico)

---

## 📌 Estado

✔ Stack validado
✔ Riesgos identificados
✔ MVP técnicamente viable
✔ Listo para comenzar desarrollo funcional
