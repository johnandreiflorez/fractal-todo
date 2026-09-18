# Lista de Tareas — Reto Técnico Full-Stack

Aplicación web completa de lista de tareas: **React + TypeScript**, **Node.js + Express + TypeScript** y **PostgreSQL**. Incluye JWT, filtrado y búsqueda, categorías, etiquetas, tema claro/oscuro, operaciones en lote, **panel de estadísticas**, **exportación a CSV/JSON**, **actualizaciones en tiempo real por WebSocket**, **arrastrar y soltar** y **atajos de teclado**.

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
│       ├── componentes/   # Auth, Tarea, Categoria, Etiqueta, Estadisticas, Layout, Comunes
│       ├── contexto/      # ContextoAuth, ContextoTiempoReal
│       ├── design-system/ # Catálogo Julia DS: Button, Badge, Card, Modal, Campo, Entrada, Selector, etc.
│       ├── hooks/         # useAuth, useTareas, useCategorias, useEtiquetas, useEstadisticas
│       ├── i18n/          # Configuración i18next + recursos es/en
│       ├── servicios/     # Capa de llamadas a la API
│       ├── tipos/         # Tipos compartidos + type guards
│       └── utils/         # authStorage, helpers (filtros), exportar (CSV/JSON)
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
- Cada cambio en tareas, categorías o etiquetas emite un mensaje `{ tipo: "cambio", recursos: [...] }` **solo a las conexiones del mismo usuario**, de modo que varias pestañas o dispositivos se mantienen sincronizados. Los cambios que afectan agregados incluyen además el recurso `estadisticas`.
- El cliente (`client/src/contexto/ContextoTiempoReal.tsx`) abre la conexión tras iniciar sesión, reconecta con retroceso exponencial (1 s → 15 s) e invalida las consultas de TanStack Query correspondientes; el estado se muestra como insignia en el encabezado.
- Incluye latido (ping/pong) en el servidor para descartar conexiones muertas y limpieza de listeners/temporizadores en el cliente (`useEffect` con función de limpieza).
- En desarrollo el proxy de Vite reenvía `/ws` al backend (`server.proxy['/ws'].ws`).

## Panel de estadísticas y exportación

- El backend expone `GET /api/estadisticas`, que agrega en SQL las tareas del usuario: resumen (total, completadas, pendientes, vencidas y tasa de completado), desglose por prioridad (siempre las 5) y por categoría (incluye las tareas sin categoría).
- El panel vive bajo las categorías en la barra lateral (`client/src/componentes/Estadisticas/PanelEstadisticas.tsx`) y se refresca en vivo porque el canal WebSocket invalida la consulta `['estadisticas']`. En pantallas pequeñas aparece como acordeón con una pestaña; en escritorio siempre está visible.
- Desde la cabecera de la lista de tareas se pueden descargar **todas** las tareas del usuario en **CSV** o **JSON** (`client/src/utils/exportar.ts`). El CSV incluye BOM UTF-8 para Excel y neutraliza fórmulas; el JSON conserva la estructura completa de cada tarea.

## Arrastrar y soltar y atajos de teclado

- **Arrastrar y soltar** (Pointer Events, funciona con ratón, táctil y lápiz): al arrastrar una tarea aparecen dos zonas fijas de destino. Soltarla en la **izquierda** la elimina (con confirmación); soltarla en la **derecha** la marca como completada o la reabre según su estado. La lógica vive en `client/src/componentes/Tarea/ItemTarea.tsx` (gesto por puntero con umbral y captura), `ListaTareas.tsx` (orquesta el soltado) y `ZonasArrastre.tsx` (zonas presentacionales); los botones existentes siguen siendo la alternativa accesible.
- **Atajos de teclado** mediante el hook reutilizable `client/src/hooks/useAtajosTeclado.ts`, que ignora la pulsación cuando el foco está en un campo de texto, `textarea`, `select` o un elemento editable, y se desactiva con formularios abiertos:

  | Atajo | Acción |
  | --- | --- |
  | `N` | Nueva tarea |
  | `C` | Nueva categoría |
  | `Ctrl`/`Cmd` + `A` | Seleccionar todas las visibles |
  | `X` | Completar las seleccionadas |
  | `Shift` + `X` | Reabrir las seleccionadas |
  | `Delete` | Eliminar las seleccionadas |

- Los controles relevantes exponen `aria-keyshortcuts` y muestran la tecla con el componente `Tecla` del sistema de diseño.

## Internacionalización (i18n)

- Todas las cadenas visibles de la interfaz pasan por el hook `useTranslation()` de `react-i18next` (regla del repositorio: sin texto hardcodeado en la UI).
- Idiomas: **Español** (por defecto) e **Inglés**. Detección automática según el idioma del navegador (con preferencia guardada) y selector ES/EN en el encabezado.
- Recursos en `client/src/i18n/es.ts` y `client/src/i18n/en.ts`. Incluye plurales (`{{count}}`) e interpolación; los mensajes de validación de formularios (Zod) también son claves traducibles.
- La etiqueta `<html lang>` se sincroniza con el idioma activo.

## Sistema de diseño (Julia DS)

- Estilos basados en **design tokens** semánticos (colores, tipografía, radios, sombras) definidos en `client/src/index.css` con Tailwind CSS 4 (`@theme inline`).
- Los componentes de negocio se construyen solo a partir del **catálogo** (`client/src/design-system/`: `Button`, `BotonIcono`, `Badge`, `Card`, `Modal`, `Campo`, `Entrada`, `AreaTexto`, `Selector`, `IndicadorCarga`, `MensajeError`, `EstadoVacio`, `Tecla`) más iconos de **Lucide**.
- Temas claro/oscuro vía tokens y utilidades `dark:`; sin colores hardcodeados fuera de la definición de tokens.

## Testing

El proyecto incluye una suite de integración en el backend y una suite de extremo a extremo (E2E) en el frontend. Ninguna usa la base de desarrollo: trabajan contra bases dedicadas (`todo_list_test` y `todo_list_e2e`) que se recrean por corrida.

### Backend — Integración (Vitest)

Cubre la API con pruebas reales contra PostgreSQL (migración de esquema + ejecución):

| Comando (server) | Descripción |
| --- | --- |
| `npm run test:db:setup` | Recrea la base `todo_list_test` con el esquema vigente |
| `npm test` | Migra la base y ejecuta las 62 pruebas de integración |
| `npm run typecheck` | Verificación de tipos (`tsc --noEmit`) |

Suites en `server/tests/`: `auth.test.ts`, `tareas.test.ts`, `filtros.test.ts`, `categorias-etiquetas.test.ts`, `estadisticas.test.ts` y `tiempo-real.test.ts`. Los datos se generan con `emailUnico()` para que cada ejecución quede aislada.

### Frontend — E2E (Playwright + Screenplay)

Validan el flujo completo navegador → Vite → API → PostgreSQL sobre la base `todo_list_e2e`:

| Comando (client) | Descripción |
| --- | --- |
| `npm run e2e:install` | Instala el navegador Chromium de Playwright |
| `npm run e2e` | Levanta API (`:4100`) y app (`:5175`) automáticamente y ejecuta los 28 escenarios |

La capa E2E sigue el patrón **Screenplay** (`client/e2e/`): actores con habilidades, tareas y preguntas de dominio, y page objects que solo usan claves i18n reales (`src/i18n/es.ts`/`en.ts`). Los escenarios cubren autenticación, gestión de tareas (crear/editar/completar/eliminar, filtros, búsqueda, orden y operaciones en lote), categorías, preferencias de idioma y tema, la sincronización en vivo entre dos pestañas del mismo usuario, la descarga de las tareas en CSV y JSON, y los atajos de teclado y el arrastrar y soltar.

## Scripts útiles

| Comando | Descripción |
| --- | --- |
| `npm run dev` (server) | API con recarga automática (`tsx watch`) |
| `npm run typecheck` (server) | Verificación de tipos (`tsc --noEmit`) |
| `npm run dev` (client) | Frontend con Vite (HMR) |
| `npm run build` (client) | `tsc -b` + build de producción |
| `npm run lint` (client) | Linter (`oxlint`) |
| `npm test` (server) | Suite de integración completa (recrea `todo_list_test`) |
| `npm run e2e` (client) | Suite E2E de Playwright (28 escenarios; arranca API y app) |
| `npm run preview` (client) | Sirve el build de producción |
| `npm run apk` (client) | Build web + `cap sync` + `gradlew assembleDebug` (APK Android) |
| `npm run cap:sync` (client) | Build web y sincroniza los assets con el proyecto Android |
| `npm run cap:open` (client) | Abre el proyecto Android en Android Studio |

## App móvil (Android con Capacitor)

El cliente se empaqueta como app nativa con **Capacitor** (`client/capacitor.config.ts`, appId `com.fractal.tareas`, `webDir: dist`). La app carga los assets locales y consume la API por HTTPS mediante la variable `VITE_API_URL` (ver [Despliegue](#despliegue-backend--base-de-datos)); sin ella usaría rutas relativas, que en el WebView no existen.

### Requisitos

- **Node.js 20+** y **JDK 17** (`JAVA_HOME`).
- **Android Studio** (o solo el *Command-line Tools* + SDK 34) y `ANDROID_HOME`/`ANDROID_SDK_ROOT` configurados.
- La variable `VITE_API_URL` apuntando al backend desplegado.

### Generar el APK

```bash
cd client
# 1) Indica la API desplegada (sin barra final, sin /api)
#    PowerShell:  $env:VITE_API_URL="https://tu-api.onrender.com"
export VITE_API_URL="https://tu-api.onrender.com"

npm run build          # compila el frontend
npx cap sync android   # copia dist/ al proyecto Android
cd android && ./gradlew assembleDebug   # Windows: gradlew.bat assembleDebug
```

El APK queda en `client/android/app/build/outputs/apk/debug/app-debug.apk`. Para una versión firmada usa `assembleRelease` con un keystore (`cd android && ./gradlew assembleRelease`). También puede abrirse el proyecto con `npm run cap:open` y compilar desde Android Studio.

> El backend debe exponerse por **HTTPS** (para `wss://` también): Android bloquea el tráfico en claro por defecto. Los orígenes `capacitor://localhost`, `http://localhost` y `https://localhost` ya están permitidos en el CORS del servidor.

## Despliegue (backend + base de datos)

**Sí, el APK necesita el backend accesible desde Internet.** El APK solo contiene el frontend; la API y PostgreSQL deben estar alojados (la app del teléfono no puede hablar con `localhost` de tu PC).

### Recomendación de hosting

| Componente | Opción recomendada | Alternativas |
| --- | --- | --- |
| **PostgreSQL** | **Neon** (serverless, free tier, `?sslmode=require`) | Supabase, Railway Postgres, Render Postgres |
| **API (Node + WebSocket)** | **Render** (Web Service con Docker; soporta WebSocket) | Railway, Fly.io, Koyeb, VPS propio |
| **Todo en uno** | **Railway** (API + Postgres en el mismo panel) | — |

> ⚠️ Los planes gratuitos de Render **duermen** el servicio tras unos minutos de inactividad (la primera petición tarda unos segundos y el WebSocket se reconecta solo). Si quieres siempre-activo, usa Railway/Fly.io o un plan de pago. Verifica precios y límites vigentes en cada proveedor.

### Despliegue con Render + Neon (Blueprint)

El repo incluye `render.yaml` en la raíz, listo para el flujo *Blueprint* de Render:

1. **Neon**: crea un proyecto y copia la cadena `postgresql://...?sslmode=require`.
2. **Carga el esquema y los datos** (desde tu equipo, con `psql`):
   ```bash
   psql "postgresql://USUARIO:CLAVE@HOST/BD?sslmode=require" -f server/sql/schema.sql
   psql "postgresql://USUARIO:CLAVE@HOST/BD?sslmode=require" -f server/sql/seed.sql
   ```
3. **Blueprint**: Render → *New* → *Blueprint* → conecta este repositorio. Detecta `render.yaml` y crea el servicio `fractal-todo-api` (Docker, health check `/api/health`, `JWT_SECRET` autogenerado).
4. **Variables**: cuando lo pida, pega `DATABASE_URL` (Neon) y `CORS_ORIGIN` (déjalo vacío si solo usas el APK).
5. **APK**: compílalo con la URL pública del servicio, p. ej. `VITE_API_URL=https://fractal-todo-api.onrender.com`.

### Pasos manuales (cualquier proveedor)

1. **Base de datos**: crea un Postgres (p. ej. Neon) y carga el esquema y los datos de ejemplo:
   ```bash
   psql "postgresql://USUARIO:CLAVE@HOST/BD?sslmode=require" -f server/sql/schema.sql
   psql "postgresql://USUARIO:CLAVE@HOST/BD?sslmode=require" -f server/sql/seed.sql
   ```
2. **API**: despliega `server/` usando el `Dockerfile` incluido (Render → *New Web Service* → Docker, con contexto de build `server/`; o Railway → *Deploy from repo* subcarpeta `server`). Health check: `GET /api/health`.
3. **Variables de entorno** del servicio:
   - `DATABASE_URL` → cadena de conexión con `sslmode=require`.
   - `JWT_SECRET` → al menos 32 caracteres aleatorios.
   - `CORS_ORIGIN` → origen del frontend web si lo despliegas (separados por coma). Los orígenes de Capacitor se añaden solos. Usa `*` solo como último recurso.
   - `NODE_ENV=production` y `JWT_EXPIRES_IN` (opcional).
4. **Frontend web (opcional)**: despliega `client/` como sitio estático (`npm run build` → `dist/`) en Render Static Site, Vercel o Netlify.
5. **APK**: compílalo con `VITE_API_URL=https://tu-api...` como se explicó arriba.


## Endpoints (resumen)

- `POST /api/auth/registro`, `POST /api/auth/login`, `GET /api/auth/perfil`
- `GET|POST /api/tareas`, `PUT /api/tareas/:id`, `DELETE /api/tareas/:id`, `PATCH /api/tareas/:id/completar`
- `PATCH /api/tareas/batch`, `POST /api/tareas/batch/eliminar` (bonus)
- `GET|POST /api/categorias`, `PUT /api/categorias/:id`, `DELETE /api/categorias/:id`
- `GET|POST /api/etiquetas`
- `GET /api/estadisticas` (agregados para el panel)

Detalles, ejemplos de request/response y filtros en [docs/api.md](docs/api.md).

## Consultas de inteligencia de negocio

Las 10 consultas solicitadas están en `server/sql/consultas_negocio.sql`, con comentarios que indican la pregunta que responde cada una. Se pueden ejecutar en su totalidad:

```bash
docker exec -i fractal_todo_db psql -U todo -d todo_list < server/sql/consultas_negocio.sql
```

Cubren: participación de usuarios, tasa de completado por prioridad, rendimiento por categoría, patrones de productividad, tareas vencidas, uso de etiquetas, retención semanal, distribución de prioridad, tendencias estacionales y benchmarking del 10 % superior.