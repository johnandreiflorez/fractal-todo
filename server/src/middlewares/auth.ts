import type { NextFunction, Request, Response } from 'express';
import { verificarAccessToken } from '../utils/jwt.js';
import { noAutorizado } from '../utils/httpError.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const encabezado = req.headers.authorization ?? '';
  const [tipo, token] = encabezado.split(' ');

  if (tipo !== 'Bearer' || !token) {
    next(noAutorizado('Token de acceso requerido'));
    return;
  }

  try {
    req.user = verificarAccessToken(token);
    next();
  } catch {
    next(noAutorizado('Token inválido o expirado'));
  }
}