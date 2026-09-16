import type { UsuarioLogueado } from '../models/usuario.js';

declare module 'express-serve-static-core' {
  interface Request {
    user?: UsuarioLogueado;
  }
}