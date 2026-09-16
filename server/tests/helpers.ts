import request from 'supertest';
import { expect } from 'vitest';
import { app } from '../src/app.js';

export interface SesionDePrueba {
  token: string;
  usuario: {
    id: number;
    nombre: string;
    email: string;
  };
}

export const PASSWORD = 'password123';

let contador = 0;

export function emailUnico(prefijo = 'usuario'): string {
  contador += 1;
  return `${prefijo}-${Date.now()}-${contador}@test.local`;
}

export async function registrarUsuario(
  nombre = 'Usuario de Prueba',
): Promise<SesionDePrueba> {
  const email = emailUnico();
  const respuesta = await request(app)
    .post('/api/auth/registro')
    .send({ nombre, email, password: PASSWORD });
  expect(respuesta.status).toBe(201);
  const sesion: unknown = respuesta.body;
  return sesion as SesionDePrueba;
}

export function conToken(token: string): {
  Authorization: string;
} {
  return { Authorization: `Bearer ${token}` };
}