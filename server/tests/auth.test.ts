import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app.js';
import { emailUnico, PASSWORD, registrarUsuario } from './helpers.js';

describe('Endpoints de autenticación', () => {
  it('registra un usuario y devuelve token + perfil', async () => {
    const email = emailUnico('ana');
    const respuesta = await request(app)
      .post('/api/auth/registro')
      .send({ nombre: 'Ana Prueba', email, password: PASSWORD });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body).toMatchObject({
      token: expect.any(String),
      usuario: {
        id: expect.any(Number),
        nombre: 'Ana Prueba',
        email,
      },
    });
  });

  it('normaliza el email a minúsculas', async () => {
    const email = emailUnico('Caso').toUpperCase();
    const respuesta = await request(app)
      .post('/api/auth/registro')
      .send({ nombre: 'Caso Prueba', email, password: PASSWORD });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body).toMatchObject({ usuario: { email: email.toLowerCase() } });
  });

  it('rechaza con 400 un email con espacios', async () => {
    const respuesta = await request(app)
      .post('/api/auth/registro')
      .send({ nombre: 'Caso Prueba', email: '  CASE@Test.LOCAL ', password: PASSWORD });

    expect(respuesta.status).toBe(400);
  });

  it('rechaza con 409 un email ya registrado', async () => {
    const email = emailUnico();
    await request(app)
      .post('/api/auth/registro')
      .send({ nombre: 'Primero', email, password: PASSWORD });

    const respuesta = await request(app)
      .post('/api/auth/registro')
      .send({ nombre: 'Segundo', email, password: PASSWORD });

    expect(respuesta.status).toBe(409);
    expect(respuesta.body).toMatchObject({ error: expect.stringContaining('email') });
  });

  it('rechaza con 400 un registro inválido', async () => {
    const respuesta = await request(app)
      .post('/api/auth/registro')
      .send({ nombre: 'X', email: 'no-es-un-email', password: 'corta' });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body).toMatchObject({ error: expect.stringContaining('Validación') });
  });

  it('inicia sesión con credenciales correctas', async () => {
    const sesion = await registrarUsuario('Login Correcto');
    const respuesta = await request(app)
      .post('/api/auth/login')
      .send({ email: sesion.usuario.email, password: PASSWORD });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toMatchObject({
      token: expect.any(String),
      usuario: { email: sesion.usuario.email },
    });
  });

  it('rechaza con 401 una contraseña incorrecta', async () => {
    const sesion = await registrarUsuario('Login Incorrecto');
    const respuesta = await request(app)
      .post('/api/auth/login')
      .send({ email: sesion.usuario.email, password: 'clave-equivocada' });

    expect(respuesta.status).toBe(401);
    expect(respuesta.body).toMatchObject({ error: expect.stringContaining('Credenciales') });
  });

  it('rechaza con 401 un email inexistente', async () => {
    const respuesta = await request(app)
      .post('/api/auth/login')
      .send({ email: 'no-registrado@test.local', password: PASSWORD });

    expect(respuesta.status).toBe(401);
  });

  it('sirve el perfil del usuario autenticado', async () => {
    const sesion = await registrarUsuario('Perfil Prueba');
    const respuesta = await request(app)
      .get('/api/auth/perfil')
      .set('Authorization', `Bearer ${sesion.token}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toMatchObject({
      id: sesion.usuario.id,
      nombre: sesion.usuario.nombre,
      email: sesion.usuario.email,
    });
  });

  it('protege el perfil: sin token devuelve 401', async () => {
    const respuesta = await request(app).get('/api/auth/perfil');
    expect(respuesta.status).toBe(401);
    expect(respuesta.body).toMatchObject({ error: 'Token de acceso requerido' });
  });

  it('protege el perfil: token inválido devuelve 401', async () => {
    const respuesta = await request(app)
      .get('/api/auth/perfil')
      .set('Authorization', 'Bearer token-invalido');

    expect(respuesta.status).toBe(401);
    expect(respuesta.body).toMatchObject({ error: 'Token inválido o expirado' });
  });
});

describe('Infraestructura de la API', () => {
  it('responde en /api/health', async () => {
    const respuesta = await request(app).get('/api/health');
    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toMatchObject({ estado: 'ok' });
  });

  it('devuelve 404 JSON en rutas desconocidas', async () => {
    const respuesta = await request(app).get('/api/ruta-inexistente');
    expect(respuesta.status).toBe(404);
    expect(respuesta.body).toMatchObject({ error: 'Ruta no encontrada' });
  });
});