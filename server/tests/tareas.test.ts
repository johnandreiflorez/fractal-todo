import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app.js';
import { conToken, PASSWORD, registrarUsuario } from './helpers.js';

describe('Endpoints de tareas (CRUD)', () => {
  it('exige autenticación en GET /api/tareas', async () => {
    const respuesta = await request(app).get('/api/tareas');
    expect(respuesta.status).toBe(401);
  });

  it('empieza sin tareas para un usuario nuevo', async () => {
    const sesion = await registrarUsuario('Lista Vacía');
    const respuesta = await request(app)
      .get('/api/tareas')
      .set(conToken(sesion.token));

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual([]);
  });

  it('crea una tarea con valores por defecto', async () => {
    const sesion = await registrarUsuario('Creador');
    const respuesta = await request(app)
      .post('/api/tareas')
      .set(conToken(sesion.token))
      .send({ titulo: 'Comprar pan' });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body).toMatchObject({
      id: expect.any(Number),
      usuario_id: sesion.usuario.id,
      titulo: 'Comprar pan',
      descripcion: null,
      prioridad: 3,
      completada: false,
      fecha_vencimiento: null,
      categoria_id: null,
      etiquetas: [],
    });
  });

  it('crea y lista una tarea con todos los campos', async () => {
    const sesion = await registrarUsuario('Creador Completo');
    const crear = await request(app)
      .post('/api/tareas')
      .set(conToken(sesion.token))
      .send({
        titulo: 'Preparar informe',
        descripcion: 'Revisar métricas del mes',
        prioridad: 1,
        fecha_vencimiento: '2026-12-31',
        etiquetas: ['trabajo', 'analisis'],
      });

    expect(crear.status).toBe(201);
    expect(crear.body).toMatchObject({
      titulo: 'Preparar informe',
      prioridad: 1,
      fecha_vencimiento: '2026-12-31',
      etiquetas: ['trabajo', 'analisis'],
    });

    const lista = await request(app)
      .get('/api/tareas')
      .set(conToken(sesion.token));
    expect(lista.status).toBe(200);
    expect(lista.body).toHaveLength(1);
    expect(lista.body[0]).toMatchObject({
      titulo: 'Preparar informe',
      descripcion: 'Revisar métricas del mes',
    });
  });

  it('rechaza con 400 una tarea sin título', async () => {
    const sesion = await registrarUsuario('Título Inválido');
    const respuesta = await request(app)
      .post('/api/tareas')
      .set(conToken(sesion.token))
      .send({ titulo: '   ' });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body).toMatchObject({ error: expect.stringContaining('Validación') });
  });

  it('actualiza parcialmente una tarea', async () => {
    const sesion = await registrarUsuario('Actualizador');
    const creada = await request(app)
      .post('/api/tareas')
      .set(conToken(sesion.token))
      .send({ titulo: 'Tarea original', prioridad: 3 });
    const id = Number(creada.body.id);

    const respuesta = await request(app)
      .put(`/api/tareas/${id}`)
      .set(conToken(sesion.token))
      .send({ titulo: 'Tarea actualizada', prioridad: 1, etiquetas: ['urgente'] });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toMatchObject({
      id,
      titulo: 'Tarea actualizada',
      prioridad: 1,
      etiquetas: ['urgente'],
    });
  });

  it('rechaza con 400 una actualización sin campos', async () => {
    const sesion = await registrarUsuario('Actualización Vacía');
    const creada = await request(app)
      .post('/api/tareas')
      .set(conToken(sesion.token))
      .send({ titulo: 'Sin cambios' });

    const respuesta = await request(app)
      .put(`/api/tareas/${Number(creada.body.id)}`)
      .set(conToken(sesion.token))
      .send({});

    expect(respuesta.status).toBe(400);
  });

  it('marca una tarea como completada y la desmarca', async () => {
    const sesion = await registrarUsuario('Completador');
    const creada = await request(app)
      .post('/api/tareas')
      .set(conToken(sesion.token))
      .send({ titulo: 'Terminar pendiente' });
    const id = Number(creada.body.id);

    const completada = await request(app)
      .patch(`/api/tareas/${id}/completar`)
      .set(conToken(sesion.token))
      .send({ completada: true });
    expect(completada.status).toBe(200);
    expect(completada.body).toMatchObject({ id, completada: true });

    const pendiente = await request(app)
      .patch(`/api/tareas/${id}/completar`)
      .set(conToken(sesion.token))
      .send({ completada: false });
    expect(pendiente.status).toBe(200);
    expect(pendiente.body).toMatchObject({ id, completada: false });
  });

  it('elimina una tarea y deja de listarla', async () => {
    const sesion = await registrarUsuario('Eliminador');
    const creada = await request(app)
      .post('/api/tareas')
      .set(conToken(sesion.token))
      .send({ titulo: 'Van a eliminarme' });
    const id = Number(creada.body.id);

    const eliminar = await request(app)
      .delete(`/api/tareas/${id}`)
      .set(conToken(sesion.token));
    expect(eliminar.status).toBe(204);

    const lista = await request(app)
      .get('/api/tareas')
      .set(conToken(sesion.token));
    expect(lista.body).toEqual([]);
  });

  it('devuelve 404 al actualizar una tarea inexistente', async () => {
    const sesion = await registrarUsuario('Actualizar Inexistente');
    const respuesta = await request(app)
      .put('/api/tareas/999999')
      .set(conToken(sesion.token))
      .send({ titulo: 'No existe' });

    expect(respuesta.status).toBe(404);
    expect(respuesta.body).toMatchObject({ error: 'Tarea no encontrada' });
  });

  it('aísla los datos: otro usuario no puede ver ni modificar la tarea', async () => {
    const duena = await registrarUsuario('Dueña Aislada');
    const intruso = await registrarUsuario('Intruso Aislado');

    const creada = await request(app)
      .post('/api/tareas')
      .set(conToken(duena.token))
      .send({ titulo: 'Solo de la dueña' });
    const id = Number(creada.body.id);

    const lista = await request(app)
      .get('/api/tareas')
      .set(conToken(intruso.token));
    expect(lista.body).toHaveLength(0);

    const actualizar = await request(app)
      .put(`/api/tareas/${id}`)
      .set(conToken(intruso.token))
      .send({ titulo: 'Intento de secuestro' });
    expect(actualizar.status).toBe(404);

    const completar = await request(app)
      .patch(`/api/tareas/${id}/completar`)
      .set(conToken(intruso.token))
      .send({ completada: true });
    expect(completar.status).toBe(404);

    const eliminar = await request(app)
      .delete(`/api/tareas/${id}`)
      .set(conToken(intruso.token));
    expect(eliminar.status).toBe(404);
  });
});

describe('Endpoints de tareas (operaciones en lote)', () => {
  async function usuarioConTareas() {
    const sesion = await registrarUsuario('Lote');
    const tareas: number[] = [];
    for (const titulo of ['Lote uno', 'Lote dos', 'Lote tres']) {
      const creada = await request(app)
        .post('/api/tareas')
        .set(conToken(sesion.token))
        .send({ titulo });
      tareas.push(Number(creada.body.id));
    }
    return { sesion, tareas };
  }

  it('actualiza en lote el estado completada', async () => {
    const { sesion, tareas } = await usuarioConTareas();
    const respuesta = await request(app)
      .patch('/api/tareas/batch')
      .set(conToken(sesion.token))
      .send({ ids: [tareas[0] ?? 0, tareas[1] ?? 0], cambios: { completada: true } });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual({ afectadas: 2, omitidas: 0 });

    const lista = await request(app)
      .get('/api/tareas')
      .set(conToken(sesion.token));
    const completadas = lista.body.filter(
      (tarea: { completada: boolean }) => tarea.completada,
    );
    expect(completadas).toHaveLength(2);
  });

  it('reporta omitidas cuando algún id no pertenece al usuario', async () => {
    const { sesion, tareas } = await usuarioConTareas();
    const otro = await registrarUsuario('Lote Ajeno');

    const respuesta = await request(app)
      .patch('/api/tareas/batch')
      .set(conToken(sesion.token))
      .send({ ids: [tareas[0] ?? 0, 999999], cambios: { prioridad: 5 } });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual({ afectadas: 1, omitidas: 1 });
    expect(otro).toBeDefined();
  });

  it('devuelve 404 si ninguna tarea pertenece al usuario', async () => {
    const sesion = await registrarUsuario('Lote Sin Tareas');
    const respuesta = await request(app)
      .patch('/api/tareas/batch')
      .set(conToken(sesion.token))
      .send({ ids: [12345, 67890], cambios: { completada: true } });

    expect(respuesta.status).toBe(404);
    expect(respuesta.body).toMatchObject({ error: 'Ninguna tarea encontrada' });
  });

  it('elimina en lote y reporta omitidas', async () => {
    const { sesion, tareas } = await usuarioConTareas();
    const respuesta = await request(app)
      .post('/api/tareas/batch/eliminar')
      .set(conToken(sesion.token))
      .send({ ids: [tareas[0] ?? 0, tareas[1] ?? 0, 999999] });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual({ afectadas: 2, omitidas: 1 });

    const lista = await request(app)
      .get('/api/tareas')
      .set(conToken(sesion.token));
    expect(lista.body).toHaveLength(1);
  });

  it('rechaza con 400 un batch sin cambios', async () => {
    const sesion = await registrarUsuario('Lote Inválido');
    const respuesta = await request(app)
      .patch('/api/tareas/batch')
      .set(conToken(sesion.token))
      .send({ ids: [1], cambios: {} });

    expect(respuesta.status).toBe(400);
  });
});

describe('Sesiones reutilizables', () => {
  it('permite iniciar sesión con un usuario creado vía API', async () => {
    const email = `seed-${Date.now()}@test.local`;
    await request(app)
      .post('/api/auth/registro')
      .send({ nombre: 'Seed API', email, password: PASSWORD })
      .expect(201);

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email, password: PASSWORD });
    expect(login.status).toBe(200);
    expect(login.body.token).toEqual(expect.any(String));
    expect(login.body.usuario).toMatchObject({ email });
  });
});