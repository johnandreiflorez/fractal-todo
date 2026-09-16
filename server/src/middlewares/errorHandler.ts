import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

export function notFound(_req: Request, _res: Response, next: NextFunction): void {
  next(new HttpError(404, 'Ruta no encontrada'));
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message });
    return;
  }

  if (env.NODE_ENV === 'development') {
    console.error(error);
  }

  const mensaje =
    error instanceof Error ? error.message : 'Error interno del servidor';
  res.status(500).json({ error: mensaje });
}