// Helpers de respuestas OpenAPI compartidas por la spec (respuestas de error).
export const esquemaError = {
  type: 'object',
  properties: {
    error: { type: 'string', example: 'Mensaje de error' },
  },
  required: ['error'],
} as const;

export const error401 = {
  description: 'No autorizado: falta o es inválido el token Bearer',
  content: {
    'application/json': {
      schema: esquemaError,
      examples: {
        faltaToken: {
          summary: 'Sin token',
          value: { error: 'Token de acceso requerido' },
        },
        tokenInvalido: {
          summary: 'Token inválido o expirado',
          value: { error: 'Token inválido o expirado' },
        },
      },
    },
  },
} as const;

export const error404 = (mensaje = 'Recurso no encontrado') =>
  ({
    description: 'No encontrado: el recurso no existe o no pertenece al usuario',
    content: {
      'application/json': {
        schema: esquemaError,
        examples: {
          noEncontrado: {
            summary: 'Ejemplo',
            value: { error: mensaje },
          },
        },
      },
    },
  }) as const;

export const error400 = {
  description: 'Solicitud inválida o validación (zod) fallida',
  content: {
    'application/json': {
      schema: esquemaError,
      examples: {
        validacion: {
          summary: 'Error de validación de body',
          value: {
            error: 'Validación de body fallida: nombre: El nombre es obligatorio',
          },
        },
        idInvalido: {
          summary: 'ID no numérico en la ruta',
          value: { error: 'Validación de params fallida: id: ID inválido' },
        },
        cuerpoVacio: {
          summary: 'PUT/PATCH sin campos a actualizar',
          value: { error: 'Debe enviarse al menos un campo para actualizar' },
        },
      },
    },
  },
} as const;

export const error409 = (mensaje = 'Conflicto con un recurso existente') =>
  ({
    description: 'Conflicto: recurso duplicado (email o nombre ya registrado)',
    content: {
      'application/json': {
        schema: esquemaError,
        examples: {
          conflicto: {
            summary: 'Ejemplo',
            value: { error: mensaje },
          },
        },
      },
    },
  }) as const;

export const bearerAuth = {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description:
    'Token de acceso obtenido en POST /api/auth/login o /api/auth/registro. Enviar como encabezado: Authorization: Bearer <token>',
} as const;