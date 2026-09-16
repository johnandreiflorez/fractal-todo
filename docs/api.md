# API de Lista de Tareas

Documentación de la API REST del reto full-stack. Servidor Express 5 + TypeScript, base de datos PostgreSQL.

**Base URL (desarrollo):** `http://localhost:4000/api`

Durante el desarrollo del frontend también está disponible vía el proxy de Vite en `http://localhost:5173/api`.

## Convenciones generales

- **Formato:** JSON.
- **Autenticación:** las rutas protegidas requieren el encabezado `Authorization: Bearer <token>`.
- **Errores:** todos los errores usan el formato `{ "error": "<mensaje>" }` con códigos HTTP apropiados.
- **Fechas:** `fecha_vencimiento` en `YYYY-MM-DD`. `creado_en`, `actualizado_en` y `completada_en` son cadenas ISO 8601.
- **Prioridad:** entero entre 1 (urgente) y 5 (baja). La API aplica el valor por defecto `3` al crear.
- **Rate limiting:** 300 peticiones / 15 min global y 20 / 5 min en `/auth`.

| Código | Significado |
| --- | --- |
| 200 | OK |
| 201 | Recurso creado |
| 204 | Eliminado sin contenido |
| 400 | Validación de entrada fallida |
| 401 | Token faltante, inválido o expirado |
| 404 | Recurso no encontrado |
| 409 | Conflicto (email duplicado, etc.) |
| 429 | Rate limit excedido |
| 500 | Error interno (el mensaje real puede ocultarse en producción) |

## Autenticación

### `POST /api/auth/registro`

Registra un usuario y devuelve la sesión.

```json
// Request
{ "nombre": "Ana García", "email": "ana@demo.com", "password": "password123" }
```

```json
// 201 Created
{
  "usuario": { "id": 1, "nombre": "Ana García", "email": "ana@demo.com" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

- `nombre`: 2–100 caracteres (obligatorio)
- `email`: válido (se normaliza a minúsculas)
- `password`: 8–200 caracteres
- Errores: `400` validación, `409` si el email ya está registrado.

### `POST /api/auth/login`

```json
// Request
{ "email": "ana@demo.com", "password": "password123" }
```

```json
// 200 OK
{
  "usuario": { "id": 1, "nombre": "Ana García", "email": "ana@demo.com" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

Errores: `400` validación, `401` credenciales inválidas.

### `GET /api/auth/perfil` *(protegido)*

```json
// 200 OK
{ "id": 1, "nombre": "Ana García", "email": "ana@demo.com" }
```

## Tareas

La tarea devuelta siempre incluye las relaciones combinadas:

```json
{
  "id": 10,
  "usuario_id": 1,
  "categoria_id": 2,
  "titulo": "Preparar informe mensual",
  "descripcion": "Incluir métricas del último mes",
  "prioridad": 2,
  "completada": false,
  "fecha_vencimiento": "2026-10-01",
  "completada_en": null,
  "creado_en": "2026-09-15T10:12:33.123Z",
  "actualizado_en": "2026-09-15T10:12:33.123Z",
  "etiquetas": ["trabajo", "urgente"],
  "categoria_nombre": "Trabajo",
  "categoria_color": "#6366f1"
}
```

### `GET /api/tareas` *(protegido)*

Devuelve todas las tareas del usuario autenticado, ordenadas por `creado_en DESC` por defecto.

Parámetros de consulta (todos opcionales):

| Parámetro | Descripción | Ejemplo |
| --- | --- | --- |
| `completada` | `true` o `false` | `?completada=false` |
| `categoria` | ID de categoría | `?categoria=2` |
| `prioridad` | 1–5 | `?prioridad=1` |
| `fecha_vencimiento` | una fecha o rango `desde,hasta` | `?fecha_vencimiento=2026-09-01,2026-10-01` |
| `busqueda` | texto en título o descripción (insensible a mayúsculas) | `?busqueda=informe` |
| `etiquetas` | nombres separados por coma | `?etiquetas=trabajo,urgente` |
| `ordenar` | `creado_en`, `fecha_vencimiento`, `prioridad`, `titulo` | `?ordenar=prioridad` |
| `direccion` | `asc` o `desc` | `?direccion=asc` |

```json
// 200 OK
[ { "id": 10, "titulo": "Preparar informe mensual", "etiquetas": ["trabajo"], ... } ]
```

### `POST /api/tareas` *(protegido)*

```json
// Request
{
  "titulo": "Comprar café",
  "descripcion": "Granos de la tostaduría de la esquina",
  "prioridad": 5,
  "categoria_id": 1,
  "fecha_vencimiento": "2026-09-20",
  "etiquetas": ["compras", "hogar"]
}
```

- `titulo`: obligatorio, 1–255 caracteres.
- `descripcion`: opcional, hasta 5000; `null` para limpiar.
- `prioridad`: opcional (1–5, por defecto 3).
- `categoria_id`: opcional, ID de categoría del usuario; `null` para quitar.
- `fecha_vencimiento`: opcional, `YYYY-MM-DD`; `null` para quitar.
- `etiquetas`: opcional, máximo 20 nombres (1–50 caracteres c/u). Crea las que falten automáticamente.

```json
// 201 Created
{ "id": 11, "titulo": "Comprar café", "prioridad": 5, "etiquetas": ["compras", "hogar"], ... }
```

### `PUT /api/tareas/:id` *(protegido)*

Actualización parcial: basta enviar los campos que cambian (al menos uno). Mismos campos que `POST /api/tareas`, con `titulo` opcional. `etiquetas: []` elimina todas las etiquetas.

```json
// Request: { "titulo": "Comprar café de especialidad" }
// 200 OK:  { "id": 11, "titulo": "Comprar café de especialidad", ... }
```

### `PATCH /api/tareas/:id/completar` *(protegido)*

```json
// Request
{ "completada": true }
```

```json
// 200 OK
{ "id": 11, "completada": true, "completada_en": "2026-09-15T12:00:00.000Z", ... }
```

### `DELETE /api/tareas/:id` *(protegido)*

Elimina la tarea. Responde `204 No Content`.

### Operaciones en lote (bonus)

#### `PATCH /api/tareas/batch` *(protegido)*

Actualiza hasta 100 tareas del mismo usuario.

```json
// Request
{
  "ids": [11, 12, 13],
  "cambios": { "completada": true, "prioridad": 2 }
}
```

```json
// 200 OK
{ "afectadas": 3, "omitidas": 0 }
```

- `cambios` admite `completada`, `prioridad`, `categoria_id`, `etiquetas`.
- Los ids que no pertenecen al usuario se omiten silenciosamente.
- `404` si ninguna tarea pertenece al usuario.

#### `POST /api/tareas/batch/eliminar` *(protegido)*

```json
// Request
{ "ids": [11, 12] }
```

```json
// 200 OK
{ "afectadas": 2, "omitidas": 0 }
```

- `404` si ninguna tarea pertenece al usuario.

## Categorías

```json
{ "id": 1, "usuario_id": 1, "nombre": "Trabajo", "color": "#6366f1",
  "creado_en": "...", "actualizado_en": "..." }
```

### `GET /api/categorias` *(protegido)*
Lista las categorías del usuario. → `200` con array.

### `POST /api/categorias` *(protegido)*
```json
// Request: { "nombre": "Personal", "color": "#22c55e" }
// 201 Created: { "id": 2, "nombre": "Personal", "color": "#22c55e", ... }
```
- `nombre`: obligatorio, 1–100. `color`: opcional, hasta 20 caracteres; `null` para quitar. `409` si el nombre ya existe.

### `PUT /api/categorias/:id` *(protegido)*
Actualización parcial (al menos un campo). `404` si no existe o no pertenece al usuario.

### `DELETE /api/categorias/:id` *(protegido)*
Elimina la categoría; las tareas asociadas quedan `categoria_id = NULL`. → `204`.

## Etiquetas

```json
{ "id": 1, "usuario_id": 1, "nombre": "trabajo", "creado_en": "..." }
```

### `GET /api/etiquetas` *(protegido)*
Lista las etiquetas del usuario (mayúsculas y minúsculas diferenciadas). → `200` con array.

### `POST /api/etiquetas` *(protegido)*
```json
// Request: { "nombre": "personal" }
// 201 Created: { "id": 2, "usuario_id": 1, "nombre": "personal", ... }
```
- `nombre`: obligatorio, 1–50. `409` si ya existe.

## Notas de seguridad

- Consultas a PostgreSQL 100 % parametrizadas (sin interpolación de SQL).
- `helmet` para cabeceras de seguridad, `cors` restringido a `CORS_ORIGIN`, `morgan` como logging de requests.
- Passwords con `bcryptjs` (sal de 10 rondas); nunca se devuelve el hash.
- Validez del token JWT: 8 horas por defecto (`JWT_EXPIRES_IN`).