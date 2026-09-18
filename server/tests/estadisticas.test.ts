import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app.js';
import { conToken, registrarUsuario } from './helpers.js';

describe('Estadísticas de tareas', () => {
  it('protege el endpoint con autenticación', async () => {
    const respuesta = await request(app).get('/api/estadisticas');
    expect(respuesta.status).toBe(401);
  });

  it('devuelve resumen en cero y las cinco prioridades para un usuario nuevo', async () => {
    const sesion = await registrarUsuario('Estadísticas Vacías');
    const respuesta = await request(app)
      .get('/api/estadisticas')
      .set(conToken(sesion.token));

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.resumen).toEqual({
      total: 0,
      completadas: 0,
      pendientes: 0,
      vencidas: 0,
      tasa_completado: 0,
    });
    expect(respuesta.body.por_prioridad).toEqual([
      { prioridad: 1, total: 0, completadas: 0 },
      { prioridad: 2, total: 0, completadas: 0 },
      { prioridad: 3, total: 0, completadas: 0 },
      { prioridad: 4, total: 0, completadas: 0 },
      { prioridad: 5, total: 0, completadas: 0 },
    ]);
    expect(respuesta.body.por_categoria).toEqual([]);
  });

  it('agrega resumen, prioridad y categoría de las tareas del usuario', async () => {
    const sesion = await registrarUsuario('Estadísticas Completas');
    const { token } = sesion;

    const categoria = await request(app)
      .post('/api/categorias')
      .set(conToken(token))
      .send({ nombre: 'Trabajo', color: '#60a5fa' });
    const categoriaId = Number(categoria.body.id);

    await request(app)
      .post('/api/tareas')
      .set(conToken(token))
      .send({
        titulo: 'Vencida',
        prioridad: 1,
        categoria_id: categoriaId,
        fecha_vencimiento: '2000-01-01',
      })
      .expect(201);

    const completada = await request(app)
      .post('/api/tareas')
      .set(conToken(token))
      .send({ titulo: 'Hecha', prioridad: 3, categoria_id: categoriaId })
      .expect(201);

    await request(app)
      .post('/api/tareas')
      .set(conToken(token))
      .send({ titulo: 'Sin categoría', prioridad: 3, fecha_vencimiento: '2999-12-31' })
      .expect(201);

    await request(app)
      .patch(`/api/tareas/${Number(completada.body.id)}/completar`)
      .set(conToken(token))
      .send({ completada: true })
      .expect(200);

    const respuesta = await request(app)
      .get('/api/estadisticas')
      .set(conToken(token));

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.resumen).toEqual({
      total: 3,
      completadas: 1,
      pendientes: 2,
      vencidas: 1,
      tasa_completado: 33.3,
    });
    expect(respuesta.body.por_prioridad).toEqual([
      { prioridad: 1, total: 1, completadas: 0 },
      { prioridad: 2, total: 0, completadas: 0 },
      { prioridad: 3, total: 2, completadas: 1 },
      { prioridad: 4, total: 0, completadas: 0 },
      { prioridad: 5, total: 0, completadas: 0 },
    ]);
    expect(respuesta.body.por_categoria).toEqual([
      {
        categoria_id: categoriaId,
        categoria_nombre: 'Trabajo',
        categoria_color: '#60a5fa',
        total: 2,
        completadas: 1,
      },
      {
        categoria_id: null,
        categoria_nombre: null,
        categoria_color: null,
        total: 1,
        completadas: 0,
      },
    ]);
  });

  it('aísla las estadísticas entre usuarios', async () => {
    const duena = await registrarUsuario('Dueña Estadísticas');
    const intruso = await registrarUsuario('Intruso Estadísticas');

    await request(app)
      .post('/api/tareas')
      .set(conToken(duena.token))
      .send({ titulo: 'Privada', prioridad: 5 })
      .expect(201);

    const respuesta = await request(app)
      .get('/api/estadisticas')
      .set(conToken(intruso.token));

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.resumen.total).toBe(0);
    expect(respuesta.body.por_categoria).toEqual([]);
  });
});
