import type { Request } from 'express';
import { noAutorizado } from './httpError.js';

export function idUsuarioLogueado(req: Request): number {
  const usuario = req.user;
  if (!usuario) {
    throw noAutorizado();
  }
  return usuario.id;
}