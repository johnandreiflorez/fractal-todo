import { z } from 'zod';

const etiquetasArray = z
  .array(z.string().trim().min(1, 'Etiqueta vacía').max(50, 'Etiqueta demasiado larga'))
  .max(20, 'Máximo 20 etiquetas por tarea');

export const esquemaRegistro = z
  .object({
    nombre: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
    email: z.email('Email inválido').trim().toLowerCase(),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .max(200, 'La contraseña no puede exceder 200 caracteres'),
  })
  .strict();

export const esquemaLogin = z
  .object({
    email: z.email('Email inválido').trim().toLowerCase(),
    password: z.string().min(1, 'La contraseña es obligatoria'),
  })
  .strict();

export const esquemaParamId = z.object({
  id: z.coerce.number().int().positive('ID inválido'),
});

const tituloRequerido = z
  .string()
  .trim()
  .min(1, 'El título es obligatorio')
  .max(255);

const camposComunes = {
  descripcion: z.string().max(5000, 'Descripción demasiado larga').nullable().optional(),
  prioridad: z.number().int().min(1, 'Prioridad entre 1 y 5').max(5).optional(),
  categoria_id: z.number().int().positive('ID de categoría inválido').nullable().optional(),
  fecha_vencimiento: z
    .string()
    .date('Fecha de vencimiento inválida (formato YYYY-MM-DD)')
    .nullable()
    .optional(),
  etiquetas: etiquetasArray.optional(),
};

export const esquemaNuevaTarea = z
  .object({ titulo: tituloRequerido, ...camposComunes })
  .strict();

export const esquemaActualizarTarea = z
  .object({ titulo: tituloRequerido.optional(), ...camposComunes })
  .strict()
  .refine(
    (datos) => Object.values(datos).some((v) => v !== undefined),
    { message: 'Debe enviarse al menos un campo para actualizar' },
  );

export const esquemaCompletar = z
  .object({ completada: z.boolean() })
  .strict();

export const esquemaQueryTareas = z
  .object({
    completada: z
      .enum(['true', 'false'])
      .optional()
      .transform((v) => (v === undefined ? undefined : v === 'true')),
    categoria: z.coerce.number().int().positive().optional(),
    prioridad: z.coerce.number().int().min(1).max(5).optional(),
    fecha_vencimiento: z.string().max(40).optional(),
    busqueda: z.string().trim().max(255).optional(),
    etiquetas: z.string().max(1000).optional(),
    ordenar: z
      .enum(['creado_en', 'fecha_vencimiento', 'prioridad', 'titulo'])
      .optional(),
    direccion: z.enum(['asc', 'desc']).optional(),
  })
  .strict();

export const esquemaNuevaCategoria = z
  .object({
    nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(100),
    color: z.string().trim().max(20).optional().nullable(),
  })
  .strict();

export const esquemaActualizarCategoria = z
  .object({
    nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(100).optional(),
    color: z.string().trim().max(20).optional().nullable(),
  })
  .strict()
  .refine(
    (datos) => datos.nombre !== undefined || datos.color !== undefined,
    { message: 'Debe enviarse al menos un campo para actualizar' },
  );

export const esquemaNuevaEtiqueta = z
  .object({
    nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(50),
  })
  .strict();

export const esquemaBatch = z
  .object({
    ids: z.array(z.number().int().positive()).min(1, 'Se requiere al menos un id').max(100),
    cambios: z
      .object({
        completada: z.boolean().optional(),
        prioridad: z.number().int().min(1).max(5).optional(),
        categoria_id: z.number().int().positive().nullable().optional(),
        etiquetas: etiquetasArray.optional(),
      })
      .strict()
      .refine(
        (c) =>
          c.completada !== undefined ||
          c.prioridad !== undefined ||
          c.categoria_id !== undefined ||
          c.etiquetas !== undefined,
        { message: 'Los cambios deben incluir al menos un campo' },
      ),
  })
  .strict();

export const esquemaBatchEliminar = z
  .object({
    ids: z.array(z.number().int().positive()).min(1, 'Se requiere al menos un id').max(100),
  })
  .strict();