import { rateLimit } from 'express-rate-limit';
import { env } from '../config/env.js';

const esPrueba = env.NODE_ENV === 'test';

const mensaje = (mensaje: string) => JSON.stringify({ error: mensaje });
const headers = {
  standardHeaders: 'draft-8',
  legacyHeaders: false,
} as const;

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: esPrueba ? 10_000 : 300,
  ...headers,
  message: mensaje('Demasiadas peticiones. Intenta de nuevo más tarde.'),
});

export const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: esPrueba ? 10_000 : 20,
  ...headers,
  message: mensaje('Demasiados intentos de autenticación. Intenta de nuevo en 5 minutos.'),
});