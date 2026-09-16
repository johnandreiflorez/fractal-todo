import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { UsuarioLogueado } from '../models/usuario.js';

const OPCIONES = { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions;

export function firmarAccessToken(usuario: UsuarioLogueado): string {
  return jwt.sign(
    { nombre: usuario.nombre, email: usuario.email },
    env.JWT_SECRET,
    { ...OPCIONES, subject: String(usuario.id) },
  );
}

export function verificarAccessToken(token: string): UsuarioLogueado {
  const payload = jwt.verify(token, env.JWT_SECRET);
  if (typeof payload === 'string' || payload.sub === undefined) {
    throw new Error('Token inválido');
  }
  return {
    id: Number(payload.sub),
    nombre: payload.nombre,
    email: payload.email,
  };
}