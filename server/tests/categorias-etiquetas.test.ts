import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app.js';
import { conToken, registrarUsuario } from './helpers.js';

describe('Endpoints de categorías', () => {
  it('devuelve lista vacía para un usuario nuevo', async () => {
    const sesion = await registrarUsuario('Categorías Vacías');
    const respuesta = await request(app)
      .get('/api/categorias')
      .set(conToken(sesion.token));
    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual([]);
  });

  it('crea una categoría', async () => {
    const sesion = await registrarUsuario('Creadora de Categorías');
    const respuesta = await request(app)
      .post('/api/categorias')
      .set(conToken(sesion.token))
      .send({ nombre: 'Trabajo', color: '#e74c3c' });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body).toMatchObject({
      id: expect.any(Number),
      usuario_id: sesion.usuario.id,
      nombre: 'Trabajo',
      color: '#e74c3c',
    });
  });

  it('rechaza con 409 un nombre de categoría duplicado', async () => {
    const sesion = await registrarUsuario('Categoría Duplicada');
    await request(app)
      .post('/api/categorias')
      .set(conToken(sesion.token))
      .send({ nombre: 'Hogar' });

    const respuesta = await request(app)
      .post('/api/categorias')
      .set(conToken(sesion.token))
      .send({ nombre: 'Hogar' });

    expect(respuesta.status).toBe(409);
    expect(respuesta.body).toMatchObject({ error: expect.stringContaining('categoría') });
  });

  it('actualiza nombre y color de una categoría', async () => {
    const sesion = await registrarUsuario('Categoría Actualizada');
    const creada = await request(app)
      .post('/api/categorias')
      .set(conToken(sesion.token))
      .send({ nombre: 'Antigua' });

    const respuesta = await request(app)
      .put(`/api/categorias/${Number(creada.body.id)}`)
      .set(conToken(sesion.token))
      .send({ nombre: 'Nueva', color: '#2ecc71' });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toMatchObject({ id: creada.body.id, nombre: 'Nueva', color: '#2ecc71' });
  });

  it('elimina una categoría', async () => {
    const sesion = await registrarUsuario('Categoría Eliminada');
    const creada = await request(app)
      .post('/api/categorias')
      .set(conToken(sesion.token))
      .send({ nombre: 'Temporal' });

    const eliminar = await request(app)
      .delete(`/api/categorias/${Number(creada.body.id)}`)
      .set(conToken(sesion.token));
    expect(eliminar.status).toBe(204);

    const lista = await request(app)
      .get('/api/categorias')
      .set(conToken(sesion.token));
    expect(lista.body).toEqual([]);
  });

  it('aísla las categorías entre usuarios', async () => {
    const duena = await registrarUsuario('Dueña Categoría');
    const intruso = await registrarUsuario('Intruso Categoría');

    const creada = await request(app)
      .post('/api/categorias')
      .set(conToken(duena.token))
      .send({ nombre: 'Privada' });
    const id = Number(creada.body.id);

    const lista = await request(app)
      .get('/api/categorias')
      .set(conToken(intruso.token));
    expect(lista.body).toHaveLength(0);

    const actualizar = await request(app)
      .put(`/api/categorias/${id}`)
      .set(conToken(intruso.token))
      .send({ nombre: 'Robada' });
    expect(actualizar.status).toBe(404);

    const eliminar = await request(app)
      .delete(`/api/categorias/${id}`)
      .set(conToken(intruso.token));
    expect(eliminar.status).toBe(404);
  });

  it('protege los endpoints con autenticación', async () => {
    const respuesta = await request(app).get('/api/categorias');
    expect(respuesta.status).toBe(401);
  });
});

describe('Endpoints de etiquetas', () => {
  it('devuelve lista vacía para un usuario nuevo', async () => {
    const sesion = await registrarUsuario('Etiquetas Vacías');
    const respuesta = await request(app)
      .get('/api/etiquetas')
      .set(conToken(sesion.token));
    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual([]);
  });

  it('crea una etiqueta', async () => {
    const sesion = await registrarUsuario('Creadora de Etiquetas');
    const respuesta = await request(app)
      .post('/api/etiquetas')
      .set(conToken(sesion.token))
      .send({ nombre: 'urgente' });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body).toMatchObject({
      id: expect.any(Number),
      usuario_id: sesion.usuario.id,
      nombre: 'urgente',
    });
  });

  it('rechaza con 409 una etiqueta duplicada', async () => {
    const sesion = await registrarUsuario('Etiqueta Duplicada');
    await request(app)
      .post('/api/etiquetas')
      .set(conToken(sesion.token))
      .send({ nombre: 'trabajo' });

    const respuesta = await request(app)
      .post('/api/etiquetas')
      .set(conToken(sesion.token))
      .send({ nombre: 'trabajo' });

    expect(respuesta.status).toBe(409);
    expect(respuesta.body).toMatchObject({ error: expect.stringContaining('etiqueta') });
  });

  it('crea la etiqueta aunque otra se envíe a la vez', async () => {
    const sesion = await registrarUsuario('Etiquetas Varias');
    const primera = await request(app)
      .post('/api/etiquetas')
      .set(conToken(sesion.token))
      .send({ nombre: 'casa' });

    const segunda = await request(app)
      .post('/api/etiquetas')
      .set(conToken(sesion.token))
      .send({ nombre: 'trabajo' });

    expect(segunda.status).toBe(201);
    expect(primera.body.nombre).toBe('casa');
  });

  it('protege los endpoints con autenticación', async () => {
    const respuesta = await request(app).get('/api/etiquetas');
    expect(respuesta.status).toBe(401);
  });
});

describe('Relación tarea-categoría', () => {
  it('rechaza crear una tarea con una categoría de otro usuario', async () => {
    const duena = await registrarUsuario('Dueña de la Categoría');
    const otra = await registrarUsuario('Otra Usuaria');

    const categoria = await request(app)
      .post('/api/categorias')
      .set(conToken(duena.token))
      .send({ nombre: 'Exclusiva' });

    const respuesta = await request(app)
      .post('/api/tareas')
      .set(conToken(otra.token))
      .send({ titulo: 'Mal categorizada', categoria_id: Number(categoria.body.id) });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body).toMatchObject({
      error: expect.stringContaining('La categoría indicada no pertenece al usuario'),
    });
  });

  it('elimina la referencia de categoría al ponerla en null', async () => {
    const sesion = await registrarUsuario('Quitar Categoría');
    const categoria = await request(app)
      .post('/api/categorias')
      .set(conToken(sesion.token))
      .send({ nombre: 'Trabajo' });
    const tarea = await request(app)
      .post('/api/tareas')
      .set(conToken(sesion.token))
      .send({ titulo: 'Con categoría', categoria_id: Number(categoria.body.id) });
    const id = Number(tarea.body.id);

    const respuesta = await request(app)
      .put(`/api/tareas/${id}`)
      .set(conToken(sesion.token))
      .send({ categoria_id: null });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.categoria_id).toBeNull();
  });
});