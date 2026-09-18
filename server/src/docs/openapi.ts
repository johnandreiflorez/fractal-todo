// =============================================================================
// Especificación OpenAPI 3.0.0 de la API REST de Fractal To-Do.
// Se sirve en GET /api/docs mediante swagger-ui-express (ver app.ts).
// Cada operación documenta respuestas de éxito (200/201/204) y de error
// (400/401/404/409) con ejemplos fieles al errorHandler ({ error: mensaje }).
// =============================================================================
import { error400, error401, error404, error409, bearerAuth, esquemaError } from './shared.js';

export const openapiDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Fractal To-Do API',
    description:
      'API REST de la lista de tareas Fractal To-Do. \n\n' +
      'Endpoints públicos: registro, login y health. El resto de endpoints ' +
      'requiere el token JWT devuelto en login/registro (botón "Authorize").',
    version: '1.0.0',
  },
  components: {
    securitySchemes: {
      bearerAuth,
    },
    schemas: {
      ErrorRespuesta: esquemaError,
      Health: {
        type: 'object',
        properties: {
          estado: { type: 'string', example: 'ok' },
          timestamp: { type: 'string', format: 'date-time', example: '2026-09-16T10:00:00.000Z' },
        },
        required: ['estado', 'timestamp'],
      },
      Usuario: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nombre: { type: 'string', example: 'Ana García' },
          email: { type: 'string', format: 'email', example: 'ana@correo.com' },
        },
        required: ['id', 'nombre', 'email'],
      },
      Sesion: {
        type: 'object',
        properties: {
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ejemplo' },
          usuario: { $ref: '#/components/schemas/Usuario' },
        },
        required: ['token', 'usuario'],
      },
      RegistroEntrada: {
        type: 'object',
        properties: {
          nombre: { type: 'string', minLength: 1, maxLength: 80, example: 'Ana García' },
          email: { type: 'string', format: 'email', example: 'ana@correo.com' },
          password: { type: 'string', minLength: 6, example: 'secreto123' },
        },
        required: ['nombre', 'email', 'password'],
      },
      LoginEntrada: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email', example: 'ana@correo.com' },
          password: { type: 'string', minLength: 6, example: 'secreto123' },
        },
        required: ['email', 'password'],
      },
      Categoria: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 3 },
          usuario_id: { type: 'integer', example: 1 },
          nombre: { type: 'string', example: 'Personal' },
          color: { type: 'string', nullable: true, example: '#a78bfa' },
          creado_en: { type: 'string', format: 'date-time' },
          actualizado_en: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'usuario_id', 'nombre', 'color', 'creado_en', 'actualizado_en'],
      },
      NuevaCategoria: {
        type: 'object',
        properties: {
          nombre: { type: 'string', minLength: 1, maxLength: 100, example: 'Personal' },
          color: { type: 'string', maxLength: 20, example: '#a78bfa' },
        },
        required: ['nombre'],
      },
      ActualizarCategoria: {
        type: 'object',
        description: 'Al menos un campo es obligatorio.',
        properties: {
          nombre: { type: 'string', minLength: 1, maxLength: 100, example: 'Personal y familia' },
          color: { type: 'string', maxLength: 20, example: '#34d399' },
        },
      },
      Tarea: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 12 },
          usuario_id: { type: 'integer', example: 1 },
          categoria_id: { type: 'integer', nullable: true, example: 3 },
          titulo: { type: 'string', example: 'Comprar verduras' },
          descripcion: { type: 'string', nullable: true, example: 'Mercado del barrio' },
          prioridad: { type: 'integer', minimum: 1, maximum: 5, example: 2 },
          completada: { type: 'boolean', example: false },
          fecha_vencimiento: { type: 'string', nullable: true, format: 'date', example: '2026-09-18' },
          completada_en: { type: 'string', nullable: true, format: 'date-time' },
          creado_en: { type: 'string', format: 'date-time' },
          actualizado_en: { type: 'string', format: 'date-time' },
          etiquetas: { type: 'array', items: { type: 'string' }, example: ['compras', 'casa'] },
          categoria_nombre: { type: 'string', nullable: true, example: 'Personal' },
          categoria_color: { type: 'string', nullable: true, example: '#a78bfa' },
        },
        required: [
          'id',
          'usuario_id',
          'categoria_id',
          'titulo',
          'descripcion',
          'prioridad',
          'completada',
          'fecha_vencimiento',
          'completada_en',
          'creado_en',
          'actualizado_en',
          'etiquetas',
          'categoria_nombre',
          'categoria_color',
        ],
      },
      NuevaTarea: {
        type: 'object',
        properties: {
          titulo: { type: 'string', minLength: 1, maxLength: 120, example: 'Preparar presentación' },
          descripcion: { type: 'string', nullable: true, example: 'Slides + demo' },
          prioridad: { type: 'integer', minimum: 1, maximum: 5, example: 2 },
          categoria_id: { type: 'integer', nullable: true, example: 1 },
          fecha_vencimiento: { type: 'string', nullable: true, format: 'date', example: '2026-09-30' },
          etiquetas: { type: 'array', items: { type: 'string' }, example: ['trabajo', 'reunion'] },
        },
        required: ['titulo'],
      },
      ActualizarTarea: {
        type: 'object',
        description: 'Al menos un campo es obligatorio.',
        properties: {
          titulo: { type: 'string', minLength: 1, maxLength: 120, example: 'Informe final' },
          descripcion: { type: 'string', nullable: true, example: 'Versión 2' },
          prioridad: { type: 'integer', minimum: 1, maximum: 5, example: 3 },
          categoria_id: { type: 'integer', nullable: true, example: 2 },
          fecha_vencimiento: { type: 'string', nullable: true, format: 'date', example: '2026-10-01' },
          etiquetas: { type: 'array', items: { type: 'string' }, example: ['informe'] },
        },
      },
      Completar: {
        type: 'object',
        properties: {
          completada: { type: 'boolean', example: true },
        },
        required: ['completada'],
      },
      BatchActualizar: {
        type: 'object',
        properties: {
          ids: { type: 'array', items: { type: 'integer' }, example: [12, 13] },
          cambios: {
            type: 'object',
            description: 'Al menos un campo. Claves válidas: completada, prioridad, categoria_id, etiquetas.',
            example: { completada: true },
          },
        },
        required: ['ids', 'cambios'],
      },
      BatchEliminar: {
        type: 'object',
        properties: {
          ids: { type: 'array', items: { type: 'integer' }, example: [12, 13] },
        },
        required: ['ids'],
      },
      ResultadoLote: {
        type: 'object',
        properties: {
          afectadas: { type: 'integer', example: 2 },
          omitidas: { type: 'integer', example: 0 },
        },
        required: ['afectadas', 'omitidas'],
      },
      Etiqueta: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 3 },
          usuario_id: { type: 'integer', example: 1 },
          nombre: { type: 'string', example: 'gimnasio' },
          creado_en: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'usuario_id', 'nombre', 'creado_en'],
      },
      NuevaEtiqueta: {
        type: 'object',
        properties: {
          nombre: { type: 'string', minLength: 1, maxLength: 40, example: 'gimnasio' },
        },
        required: ['nombre'],
      },
      ResumenEstadisticas: {
        type: 'object',
        properties: {
          total: { type: 'integer', example: 12 },
          completadas: { type: 'integer', example: 7 },
          pendientes: { type: 'integer', example: 5 },
          vencidas: { type: 'integer', example: 2 },
          tasa_completado: {
            type: 'number',
            description: 'Porcentaje de tareas completadas (0 a 100, un decimal).',
            example: 58.3,
          },
        },
        required: ['total', 'completadas', 'pendientes', 'vencidas', 'tasa_completado'],
      },
      EstadisticaPrioridad: {
        type: 'object',
        properties: {
          prioridad: { type: 'integer', minimum: 1, maximum: 5, example: 1 },
          total: { type: 'integer', example: 4 },
          completadas: { type: 'integer', example: 1 },
        },
        required: ['prioridad', 'total', 'completadas'],
      },
      EstadisticaCategoria: {
        type: 'object',
        properties: {
          categoria_id: { type: 'integer', nullable: true, example: 2 },
          categoria_nombre: { type: 'string', nullable: true, example: 'Trabajo' },
          categoria_color: { type: 'string', nullable: true, example: '#60a5fa' },
          total: { type: 'integer', example: 6 },
          completadas: { type: 'integer', example: 4 },
        },
        required: ['categoria_id', 'categoria_nombre', 'categoria_color', 'total', 'completadas'],
      },
      Estadisticas: {
        type: 'object',
        properties: {
          resumen: { $ref: '#/components/schemas/ResumenEstadisticas' },
          por_prioridad: {
            type: 'array',
            items: { $ref: '#/components/schemas/EstadisticaPrioridad' },
          },
          por_categoria: {
            type: 'array',
            items: { $ref: '#/components/schemas/EstadisticaCategoria' },
          },
        },
        required: ['resumen', 'por_prioridad', 'por_categoria'],
      },
    },
    responses: {
      BadRequest: error400,
      Unauthorized: error401,
      NotFound: error404(),
      Conflicto: error409(),
    },
  },
  paths: {
    '/api/health': {
      get: {
        summary: 'Estado del servicio',
        description: 'Endpoint público de comprobación de salud del API.',
        tags: ['Sistema'],
        responses: {
          200: {
            description: 'Servicio operativo',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Health' },
                example: { estado: 'ok', timestamp: '2026-09-16T10:00:00.000Z' },
              },
            },
          },
        },
      },
    },

    '/api/auth/registro': {
      post: {
        summary: 'Registrar una cuenta',
        description:
          'Crea un usuario y devuelve una sesión (usuario + token JWT). Sin autenticación.',
        tags: ['Autenticación'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegistroEntrada' },
              example: { nombre: 'Ana García', email: 'ana@correo.com', password: 'secreto123' },
            },
          },
        },
        responses: {
          201: {
            description: 'Cuenta creada y sesión iniciada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Sesion' },
                example: {
                  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ejemplo',
                  usuario: { id: 1, nombre: 'Ana García', email: 'ana@correo.com' },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          409: { $ref: '#/components/responses/Conflicto' },
        },
      },
    },

    '/api/auth/login': {
      post: {
        summary: 'Iniciar sesión',
        description:
          'Valida credenciales y devuelve sesión (usuario + token JWT). Sin autenticación.',
        tags: ['Autenticación'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginEntrada' },
              example: { email: 'ana@correo.com', password: 'secreto123' },
            },
          },
        },
        responses: {
          200: {
            description: 'Sesión iniciada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Sesion' },
                example: {
                  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ejemplo',
                  usuario: { id: 1, nombre: 'Ana García', email: 'ana@correo.com' },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: {
            description: 'Credenciales inválidas',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorRespuesta' },
                example: { error: 'Credenciales inválidas' },
              },
            },
          },
        },
      },
    },

    '/api/auth/perfil': {
      get: {
        summary: 'Obtener perfil del usuario autenticado',
        description: 'Devuelve los datos públicos del usuario dueño del token.',
        tags: ['Autenticación'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Perfil del usuario',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Usuario' },
                example: { id: 1, nombre: 'Ana García', email: 'ana@correo.com' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/api/tareas': {
      get: {
        summary: 'Listar tareas',
        description:
          'Devuelve las tareas del usuario. Admite filtros por query: completada, categoria, prioridad, fecha_vencimiento (YYYY-MM-DD o rango YYYY-MM-DD,YYYY-MM-DD), busqueda, etiquetas (separadas por coma), ordenar y direccion.',
        tags: ['Tareas'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'completada', in: 'query', required: false, schema: { type: 'boolean', enum: [true, false] }, description: 'Filtrar por estado' },
          { name: 'categoria', in: 'query', required: false, schema: { type: 'integer', minimum: 1 }, description: 'Filtrar por id de categoría' },
          { name: 'prioridad', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 5 }, description: 'Filtrar por prioridad' },
          { name: 'fecha_vencimiento', in: 'query', required: false, schema: { type: 'string' }, description: 'YYYY-MM-DD o rango separado por coma' },
          { name: 'busqueda', in: 'query', required: false, schema: { type: 'string' }, description: 'Buscar por texto en título/descripción' },
          { name: 'etiquetas', in: 'query', required: false, schema: { type: 'string' }, description: 'Etiquetas separadas por coma' },
          { name: 'ordenar', in: 'query', required: false, schema: { type: 'string', enum: ['creado_en', 'fecha_vencimiento', 'prioridad', 'titulo'] }, description: 'Campo de ordenación' },
          { name: 'direccion', in: 'query', required: false, schema: { type: 'string', enum: ['asc', 'desc'] }, description: 'Dirección del orden' },
        ],
        responses: {
          200: {
            description: 'Lista de tareas del usuario',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Tarea' } },
                examples: {
                  lista: {
                    summary: 'Varias tareas',
                    value: [
                      {
                        id: 12,
                        usuario_id: 1,
                        categoria_id: 3,
                        titulo: 'Comprar verduras',
                        descripcion: 'Mercado del barrio',
                        prioridad: 2,
                        completada: false,
                        fecha_vencimiento: '2026-09-18',
                        completada_en: null,
                        creado_en: '2026-09-10T09:00:00.000Z',
                        actualizado_en: '2026-09-10T09:00:00.000Z',
                        etiquetas: ['compras', 'casa'],
                        categoria_nombre: 'Personal',
                        categoria_color: '#a78bfa',
                      },
                      {
                        id: 13,
                        usuario_id: 1,
                        categoria_id: null,
                        titulo: 'Enviar informe',
                        descripcion: null,
                        prioridad: 4,
                        completada: true,
                        fecha_vencimiento: null,
                        completada_en: '2026-09-11T12:30:00.000Z',
                        creado_en: '2026-09-11T10:00:00.000Z',
                        actualizado_en: '2026-09-11T12:30:00.000Z',
                        etiquetas: [],
                        categoria_nombre: null,
                        categoria_color: null,
                      },
                      {
                        id: 14,
                        usuario_id: 1,
                        categoria_id: 1,
                        titulo: 'Pagar facturas',
                        descripcion: null,
                        prioridad: 3,
                        completada: false,
                        fecha_vencimiento: '2026-09-25',
                        completada_en: null,
                        creado_en: '2026-09-12T08:00:00.000Z',
                        actualizado_en: '2026-09-12T08:00:00.000Z',
                        etiquetas: [],
                        categoria_nombre: 'Trabajo',
                        categoria_color: '#60a5fa',
                      },
                    ],
                  },
                  vacia: {
                    summary: 'Sin tareas',
                    value: [],
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        summary: 'Crear una tarea',
        description: 'Crea una tarea y devuelve su versión detallada con etiquetas y categoría.',
        tags: ['Tareas'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/NuevaTarea' },
              examples: {
                completa: {
                  summary: 'Tarea completa',
                  value: {
                    titulo: 'Preparar presentación',
                    descripcion: 'Slides + demo',
                    prioridad: 2,
                    categoria_id: 1,
                    fecha_vencimiento: '2026-09-30',
                    etiquetas: ['trabajo', 'reunion'],
                  },
                },
                minima: {
                  summary: 'Solo título',
                  value: { titulo: 'Llamar al cliente' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Tarea creada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Tarea' },
                example: {
                  id: 15,
                  usuario_id: 1,
                  categoria_id: 1,
                  titulo: 'Preparar presentación',
                  descripcion: 'Slides + demo',
                  prioridad: 2,
                  completada: false,
                  fecha_vencimiento: '2026-09-30',
                  completada_en: null,
                  creado_en: '2026-09-16T10:00:00.000Z',
                  actualizado_en: '2026-09-16T10:00:00.000Z',
                  etiquetas: ['trabajo', 'reunion'],
                  categoria_nombre: 'Trabajo',
                  categoria_color: '#60a5fa',
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/api/tareas/batch': {
      patch: {
        summary: 'Actualizar varias tareas en lote',
        description: 'Aplica los mismos cambios (completada, prioridad, categoria_id o etiquetas) a varias tareas.',
        tags: ['Tareas'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BatchActualizar' },
              examples: {
                marcar: {
                  summary: 'Marcar como completadas',
                  value: { ids: [12, 13], cambios: { completada: true } },
                },
                mover: {
                  summary: 'Mover de categoría',
                  value: { ids: [14, 15], cambios: { categoria_id: 3 } },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Resultado del lote',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ResultadoLote' },
                example: { afectadas: 2, omitidas: 0 },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/api/tareas/batch/eliminar': {
      post: {
        summary: 'Eliminar varias tareas en lote',
        description: 'Elimina el conjunto de tareas indicado por ids.',
        tags: ['Tareas'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BatchEliminar' },
              example: { ids: [12, 13] },
            },
          },
        },
        responses: {
          200: {
            description: 'Resultado del lote',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ResultadoLote' },
                example: { afectadas: 2, omitidas: 1 },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/api/tareas/{id}': {
      put: {
        summary: 'Actualizar una tarea',
        description: 'Actualiza los campos enviados (al menos uno) y devuelve la tarea detallada.',
        tags: ['Tareas'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Id de la tarea' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ActualizarTarea' },
              examples: {
                simple: {
                  summary: 'Cambiar título y prioridad',
                  value: { titulo: 'Preparar presentación final', prioridad: 1 },
                },
                completa: {
                  summary: 'Actualizar varios campos',
                  value: {
                    titulo: 'Informe',
                    descripcion: 'Versión 2',
                    prioridad: 3,
                    categoria_id: 2,
                    fecha_vencimiento: '2026-10-01',
                    etiquetas: ['informe'],
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Tarea actualizada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Tarea' },
                example: {
                  id: 15,
                  usuario_id: 1,
                  categoria_id: 2,
                  titulo: 'Informe',
                  descripcion: 'Versión 2',
                  prioridad: 3,
                  completada: false,
                  fecha_vencimiento: '2026-10-01',
                  completada_en: null,
                  creado_en: '2026-09-16T10:00:00.000Z',
                  actualizado_en: '2026-09-16T11:00:00.000Z',
                  etiquetas: ['informe'],
                  categoria_nombre: 'Personal',
                  categoria_color: '#a78bfa',
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        summary: 'Eliminar una tarea',
        description: 'Elimina la tarea indicada. Respuesta sin cuerpo (204).',
        tags: ['Tareas'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Id de la tarea' },
        ],
        responses: {
          204: { description: 'Tarea eliminada (sin cuerpo)' },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/api/tareas/{id}/completar': {
      patch: {
        summary: 'Cambiar estado de completado',
        description: 'Marca o desmarca una tarea como completada.',
        tags: ['Tareas'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Id de la tarea' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Completar' },
              examples: {
                completar: { summary: 'Marcar como completada', value: { completada: true } },
                reabrir: { summary: 'Reabrir', value: { completada: false } },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Tarea con estado actualizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Tarea' },
                example: {
                  id: 12,
                  usuario_id: 1,
                  categoria_id: 3,
                  titulo: 'Comprar verduras',
                  descripcion: 'Mercado del barrio',
                  prioridad: 2,
                  completada: true,
                  fecha_vencimiento: '2026-09-18',
                  completada_en: '2026-09-16T12:00:00.000Z',
                  creado_en: '2026-09-10T09:00:00.000Z',
                  actualizado_en: '2026-09-16T12:00:00.000Z',
                  etiquetas: ['compras', 'casa'],
                  categoria_nombre: 'Personal',
                  categoria_color: '#a78bfa',
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/api/categorias': {
      get: {
        summary: 'Listar categorías',
        description: 'Devuelve las categorías del usuario ordenadas por nombre.',
        tags: ['Categorías'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Lista de categorías',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Categoria' } },
                examples: {
                  lista: {
                    summary: 'Con varias categorías',
                    value: [
                      { id: 1, usuario_id: 1, nombre: 'Personal', color: '#a78bfa', creado_en: '2026-09-01T08:00:00.000Z', actualizado_en: '2026-09-01T08:00:00.000Z' },
                      { id: 2, usuario_id: 1, nombre: 'Trabajo', color: '#60a5fa', creado_en: '2026-09-01T08:00:00.000Z', actualizado_en: '2026-09-01T08:00:00.000Z' },
                    ],
                  },
                  vacia: { summary: 'Sin categorías', value: [] },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        summary: 'Crear una categoría',
        description: 'Crea una categoría con nombre (obligatorio) y color (opcional).',
        tags: ['Categorías'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/NuevaCategoria' },
              examples: {
                valida: {
                  summary: 'Con color',
                  value: { nombre: 'Personal', color: '#a78bfa' },
                },
                soloNombre: {
                  summary: 'Sin color',
                  value: { nombre: 'Compras' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Categoría creada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Categoria' },
                example: { id: 3, usuario_id: 1, nombre: 'Personal', color: '#a78bfa', creado_en: '2026-09-16T10:00:00.000Z', actualizado_en: '2026-09-16T10:00:00.000Z' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          409: {
            description: 'Ya existe una categoría con ese nombre',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorRespuesta' },
                example: { error: 'Ya existe una categoría con ese nombre' },
              },
            },
          },
        },
      },
    },

    '/api/categorias/{id}': {
      put: {
        summary: 'Actualizar una categoría',
        description: 'Renombra y/o cambia el color de una categoría (al menos un campo).',
        tags: ['Categorías'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Id de la categoría' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ActualizarCategoria' },
              examples: {
                renombrar: {
                  summary: 'Renombrar categoría',
                  value: { nombre: 'Personal y familia' },
                },
                cambiarColor: {
                  summary: 'Cambiar color',
                  value: { color: '#34d399' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Categoría actualizada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Categoria' },
                example: { id: 3, usuario_id: 1, nombre: 'Personal y familia', color: '#34d399', creado_en: '2026-09-16T10:00:00.000Z', actualizado_en: '2026-09-16T11:00:00.000Z' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
          409: {
            description: 'Ya existe una categoría con ese nombre',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorRespuesta' },
                example: { error: 'Ya existe una categoría con ese nombre' },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Eliminar una categoría',
        description: 'Elimina la categoría indicada. Respuesta sin cuerpo (204).',
        tags: ['Categorías'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Id de la categoría' },
        ],
        responses: {
          204: { description: 'Categoría eliminada (sin cuerpo)' },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/api/etiquetas': {
      get: {
        summary: 'Listar etiquetas',
        description: 'Devuelve las etiquetas del usuario (las que están en uso).',
        tags: ['Etiquetas'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Lista de etiquetas',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Etiqueta' } },
                examples: {
                  lista: {
                    summary: 'Con etiquetas',
                    value: [
                      { id: 1, usuario_id: 1, nombre: 'trabajo', creado_en: '2026-09-01T08:00:00.000Z' },
                      { id: 2, usuario_id: 1, nombre: 'casa', creado_en: '2026-09-01T08:00:00.000Z' },
                    ],
                  },
                  vacia: { summary: 'Sin etiquetas', value: [] },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        summary: 'Crear una etiqueta',
        description: 'Crea una etiqueta con nombre (obligatorio). Si ya existe, la reutiliza.',
        tags: ['Etiquetas'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/NuevaEtiqueta' },
              example: { nombre: 'gimnasio' },
            },
          },
        },
        responses: {
          201: {
            description: 'Etiqueta creada o existente',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Etiqueta' },
                example: { id: 3, usuario_id: 1, nombre: 'gimnasio', creado_en: '2026-09-16T10:00:00.000Z' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/estadisticas': {
      get: {
        summary: 'Obtener estadísticas de tareas',
        description:
          'Agrega las tareas del usuario: resumen general, desglose por prioridad (siempre las 5) y por categoría (incluye las tareas sin categoría).',
        tags: ['Estadísticas'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Estadísticas del usuario',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Estadisticas' },
                example: {
                  resumen: {
                    total: 12,
                    completadas: 7,
                    pendientes: 5,
                    vencidas: 2,
                    tasa_completado: 58.3,
                  },
                  por_prioridad: [
                    { prioridad: 1, total: 4, completadas: 1 },
                    { prioridad: 2, total: 3, completadas: 2 },
                    { prioridad: 3, total: 2, completadas: 1 },
                    { prioridad: 4, total: 2, completadas: 2 },
                    { prioridad: 5, total: 1, completadas: 1 },
                  ],
                  por_categoria: [
                    {
                      categoria_id: 2,
                      categoria_nombre: 'Trabajo',
                      categoria_color: '#60a5fa',
                      total: 6,
                      completadas: 4,
                    },
                    {
                      categoria_id: null,
                      categoria_nombre: null,
                      categoria_color: null,
                      total: 3,
                      completadas: 1,
                    },
                  ],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
  },
};