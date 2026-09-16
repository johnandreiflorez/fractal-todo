import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny, z } from 'zod';
import { badRequest } from '../utils/httpError.js';

interface Esquemas {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
}

function validarUno(
  campo: 'body' | 'params',
  dato: unknown,
  esquema: ZodTypeAny,
): z.ZodTypeAny['_output'] {
  const resultado = esquema.safeParse(dato);
  if (!resultado.success) {
    throw badRequest(
      `Validación de ${campo} fallida: ${resultado.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ')}`,
    );
  }
  return resultado.data;
}

export function validate(esquemas: Esquemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (esquemas.params) {
        const params = validarUno('params', req.params, esquemas.params);
        req.params = params as Request['params'];
      }
      if (esquemas.body) {
        req.body = validarUno('body', req.body, esquemas.body);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}