# Lista de Tareas — Reto Técnico Full-Stack

Aplicación web completa de lista de tareas: **React + TypeScript**, **Node.js + Express + TypeScript** y **PostgreSQL**. Incluye JWT, filtrado y búsqueda, categorías, etiquetas, tema claro/oscuro, operaciones en lote y **actualizaciones en tiempo real por WebSocket**.

## Stack

| Capa | Tecnología |
| --- | --- |
| Frontend | React 19, Vite 8, TypeScript, Tailwind CSS 4, **Julia DS** (sistema de diseño propio con design tokens), Lucide, TanStack Query 5, React Router 7, React Hook Form + Zod, **i18next + react-i18next** |
| Backend | Node.js, Express 5, TypeScript, Zod 4, `pg`, JWT (`jsonwebtoken`), `bcryptjs`, `ws` (WebSocket) |
| Base de datos | PostgreSQL 16 (Docker Compose) |

## Estructura

```
├── client/                # Frontend React (Vite)
│   └── src/
│       ├── componentes/   # Auth, Tarea, Categoria, Etiqueta, Layout, Comunes
│       ├── contexto/      # ContextoAuth
│       ├── design-system/ # Catálogo Julia DS: Button, Badge, Card, Modal, Campo, Entrada, Selector, etc.
│       ├── hooks/         # useAuth, useTareas, useCategorias, useEtiquetas
│       ├── i18n/          # Configuración i18next + recursos es/en
│       ├── servicios/     # Capa de llamadas a la API
│       ├── tipos/         # Tipos compartidos + type guards
│       └── utils/         # authStorage, helpers (filtros)
├── server/                # API Express
│   ├── sql/               # schema.sql, seed.sql, consultas_negocio.sql
│   └── src/               # rutas, controladores, servicios, repositorios, middlewares, ws
├── docs/
│   ├── architecture_rules.md
│   └── api.md             # Documentación de la API
├── docker-compose.yml     # PostgreSQL 16 (aplica schema + seed al arrancar)
└── Caso.txt               # Enunciado del reto
```

## Requisitos

- Node.js ≥ 20
- Docker (o un PostgreSQL local en `localhost:5432`)

## Puesta en marcha

```bash
# 1) Base de datos (crea el contenedor, el esquema y los datos de ejemplo)
docker compose up -d

# 2) Backend — http://localhost:4000
cd server
npm install
copy .env.example .env      # Windows; en Unix: cp .env.example .env
npm run dev

# 3) Frontend — http://localhost:5173 (proxy /api → :4000)
cd client
npm install
npm run dev
```

### Sin Docker

Crea una base `todo_list` y aplica los scripts con `psql` (la conexión se configura en `server/.env`):

```sql
\i server/sql/schema.sql
\i server/sql/seed.sql
```

## Configuración (server/.env)

| Variable | Descripción | Por defecto |
| --- | --- | --- |
| `PORT` | Puerto de la API | `4000` |
| `DATABASE_URL` | Cadena de conexión PostgreSQL | `postgres://todo:todo123@localhost:5432/todo_list` |
| `JWT_SECRET` | Secreto para firmar tokens | *(generar uno)* |
| `JWT_EXPIRES_IN` | Duración del token | `8h` |
| `CORS_ORIGIN` | Origen permitido para CORS | `http://localhost:5173` |
| `NODE_ENV` | `development` / `production` | `development` |

## Usuarios de ejemplo (seed)

| Email | Contraseña |
| --- | --- |
| `ana@demo.com` | `password123` |
| `carlos@demo.com` | `password123` |
| `lucia@demo.com` | `password123` |

## Actualizaciones en tiempo real (WebSocket)

- El backend expone un canal WebSocket en `GET /ws?token=<JWT>`. Las conexiones sin token válido se cierran con el código `4001`.
- Cada cambio en tareas, categorías o etiquetas emite un mensaje `{ tipo: "cambio", recursos: [...] }` **solo a las conexiones del mismo usuario**, de modo que varias pestañas o dispositivos se mantienen sincronizados.
- El cliente (`client/src/contexto/ContextoTiempoReal.tsx`) abre la conexión tras iniciar sesión, reconecta con retroceso exponencial (1 s → 15 s) e invalida las consultas de TanStack Query correspondientes; el estado se muestra como insignia en el encabezado.
- Incluye latido (ping/pong) en el servidor para descartar conexiones muertas y limpieza de listeners/temporizadores en el cliente (`useEffect` con función de limpieza).
- En desarrollo el proxy de Vite reenvía `/ws` al backend (`server.proxy['/ws'].ws`).

## Internacionalización (i18n)

- Todas las cadenas visibles de la interfaz pasan por el hook `useTranslation()` de `react-i18next` (regla del repositorio: sin texto hardcodeado en la UI).
- Idiomas: **Español** (por defecto) e **Inglés**. Detección automática según el idioma del navegador (con preferencia guardada) y selector ES/EN en el encabezado.
- Recursos en `client/src/i18n/es.ts` y `client/src/i18n/en.ts`. Incluye plurales (`{{count}}`) e interpolación; los mensajes de validación de formularios (Zod) también son claves traducibles.
- La etiqueta `<html lang>` se sincroniza con el idioma activo.

## Sistema de diseño (Julia DS)

- Estilos basados en **design tokens** semánticos (colores, tipografía, radios, sombras) definidos en `client/src/index.css` con Tailwind CSS 4 (`@theme inline`).
- Los componentes de negocio se construyen solo a partir del **catálogo** (`client/src/design-system/`: `Button`, `ButtonIcon`, `Badge`, `Card`, `Modal`, `Field`, `Input`, `Textarea`, `Select`, `Loader`, `ErrorMessage`, `EmptyState`) más iconos de **Lucide**.
- Temas claro/oscuro vía tokens y utilidades `dark:`; sin colores hardcodeados fuera de la definición de tokens.

## Testing

El proyecto incluye una suite de integración en el backend y una suite de extremo a extremo (E2E) en el frontend. Ninguna usa la base de desarrollo: trabajan contra bases dedicadas (`todo_list_test` y `todo_list_e2e`) que se recrean por corrida.

### Backend — Integración (Vitest)

Cubre la API con pruebas reales contra PostgreSQL (migración de esquema + ejecución):

| Comando (server) | Descripción |
| --- | --- |
| `npm run test:db:setup` | Recrea la base `todo_list_test` con el esquema vigente |
| `npm test` | Migra la base y ejecuta las 58 pruebas de integración |
| `npm run typecheck` | Verificación de tipos (`tsc --noEmit`) |

Suites en `server/tests/`: `auth.test.ts`, `tareas.test.ts`, `filtros.test.ts`, `categorias-etiquetas.test.ts` y `tiempo-real.test.ts`. Los datos se generan con `emailUnico()` para que cada ejecución quede aislada.

### Frontend — E2E (Playwright + Screenplay)

Validan el flujo completo navegador → Vite → API → PostgreSQL sobre la base `todo_list_e2e`:

| Comando (client) | Descripción |
| --- | --- |
| `npm run e2e:install` | Instala el navegador Chromium de Playwright |
| `npm run e2e` | Levanta API (`:4100`) y app (`:5175`) automáticamente y ejecuta los 18 escenarios |

La capa E2E sigue el patrón **Screenplay** (`client/e2e/`): actores con habilidades, tareas y preguntas de dominio, y page objects que solo usan claves i18n reales (`src/i18n/es.ts`/`en.ts`). Los escenarios cubren autenticación, gestión de tareas (crear/editar/completar/eliminar, filtros, búsqueda, orden y operaciones en lote), categorías, preferencias de idioma y tema, y la sincronización en vivo entre dos pestañas del mismo usuario.

## Scripts útiles

| Comando | Descripción |
| --- | --- |
| `npm run dev` (server) | API con recarga automática (`tsx watch`) |
| `npm run typecheck` (server) | Verificación de tipos (`tsc --noEmit`) |
| `npm run dev` (client) | Frontend con Vite (HMR) |
| `npm run build` (client) | `tsc -b` + build de producción |
| `npm run lint` (client) | Linter (`oxlint`) |
| `npm test` (server) | Suite de integración completa (recrea `todo_list_test`) |
| `npm run e2e` (client) | Suite E2E de Playwright (18 escenarios; arranca API y app) |
| `npm run preview` (client) | Sirve el build de producción |

## Endpoints (resumen)

- `POST /api/auth/registro`, `POST /api/auth/login`, `GET /api/auth/perfil`
- `GET|POST /api/tareas`, `PUT /api/tareas/:id`, `DELETE /api/tareas/:id`, `PATCH /api/tareas/:id/completar`
- `PATCH /api/tareas/batch`, `POST /api/tareas/batch/eliminar` (bonus)
- `GET|POST /api/categorias`, `PUT /api/categorias/:id`, `DELETE /api/categorias/:id`
- `GET|POST /api/etiquetas`

Detalles, ejemplos de request/response y filtros en [docs/api.md](docs/api.md).

## Consultas de inteligencia de negocio

Las 10 consultas solicitadas están en `server/sql/consultas_negocio.sql`, con comentarios que indican la pregunta que responde cada una. Se pueden ejecutar en su totalidad:

```bash
docker exec -i fractal_todo_db psql -U todo -d todo_list < server/sql/consultas_negocio.sql
```

Cubren: participación de usuarios, tasa de completado por prioridad, rendimiento por categoría, patrones de productividad, tareas vencidas, uso de etiquetas, retención semanal, distribución de prioridad, tendencias estacionales y benchmarking del 10 % superior.