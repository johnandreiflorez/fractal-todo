import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app.js';
import { conToken, registrarUsuario } from './helpers.js';

interface TareaCreada {
  id: number;
  titulo: string;
  prioridad: number;
  completada: boolean;
  fecha_vencimiento: string | null;
  categoria_id: number | null;
  etiquetas: string[];
}

interface Contexto { 
  token: string;
  categoriaId: number;
  t1: TareaCreada;
  t2: TareaCreada;
  t3: TareaCreada;
}

function idsOrdenados(tareas: TareaCreada[]): number[] {
  return tareas.map((tarea) => tarea.id).sort((a, b) => a - b);
}

async function prepararContexto(): Promise<Contexto> {
  const sesion = await registrarUsuario('Filtradora');

  const categoria = await request(app)
    .post('/api/categorias')
    .set(conToken(sesion.token))
    .send({ nombre: 'Hogar', color: '#3498db' });
  const categoriaId = Number(categoria.body.id);

  const crear = (body: Record<string, unknown>) =>
    request(app)
      .post('/api/tareas')
      .set(conToken(sesion.token))
      .send(body)
      .then((respuesta) => respuesta.body as TareaCreada);

  const t1 = await crear({
    titulo: 'Comprar pan',
    descripcion: 'En la panadería de la esquina',
    prioridad: 1,
    categoria_id: categoriaId,
    fecha_vencimiento: '2026-01-20',
    etiquetas: ['urgente', 'casa'],
  });
  const t2 = await crear({
    titulo: 'Comprar leche',
    prioridad: 3,
    fecha_vencimiento: '2026-02-01',
    etiquetas: ['casa'],
  });
  const t3 = await crear({
    titulo: 'Revisar email',
    descripcion: 'Responder al cliente',
    prioridad: 5,
    fecha_vencimiento: '2026-03-15',
  });

  await request(app)
    .patch(`/api/tareas/${t2.id}/completar`)
    .set(conToken(sesion.token))
    .send({ completada: true })
    .expect(200);

  return { token: sesion.token, categoriaId, t1, t2, t3 };
}

describe('Filtros y orden de GET /api/tareas', () => {
  it('no aplica filtros y devuelve todas', async () => {
    const { token } = await prepararContexto();
    const respuesta = await request(app).get('/api/tareas').set(conToken(token));
    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toHaveLength(3);
  });

  it('filtra por estado completada', async () => {
    const { token, t1, t2, t3 } = await prepararContexto();
    const pendientes = await request(app)
      .get('/api/tareas?completada=false')
      .set(conToken(token));
    expect(idsOrdenados(pendientes.body)).toEqual(idsOrdenados([t1, t3]));

    const completadas = await request(app)
      .get('/api/tareas?completada=true')
      .set(conToken(token));
    expect(idsOrdenados(completadas.body)).toEqual(idsOrdenados([t2]));
  });

  it('filtra por prioridad', async () => {
    const { token, t1 } = await prepararContexto();
    const respuesta = await request(app)
      .get('/api/tareas?prioridad=1')
      .set(conToken(token));
    expect(respuesta.body).toHaveLength(1);
    expect(respuesta.body[0].id).toBe(t1.id);
  });

  it('filtra por búsqueda en título y descripción (insensible a mayúsculas)', async () => {
    const { token, t1, t2 } = await prepararContexto();

    const porTitulo = await request(app)
      .get('/api/tareas?busqueda=COMPRAR')
      .set(conToken(token));
    expect(idsOrdenados(porTitulo.body)).toEqual(idsOrdenados([t1, t2]));

    const porDescripcion = await request(app)
      .get('/api/tareas?busqueda=panader')
      .set(conToken(token));
    expect(porDescripcion.body).toHaveLength(1);
    expect(porDescripcion.body[0].id).toBe(t1.id);
  });

  it('filtra por categoría', async () => {
    const { token, categoriaId, t1 } = await prepararContexto();
    const respuesta = await request(app)
      .get(`/api/tareas?categoria=${categoriaId}`)
      .set(conToken(token));
    expect(respuesta.body.map((t: TareaCreada) => t.id)).toEqual([t1.id]);
  });

  it('filtra por etiqueta', async () => {
    const { token, t1, t2 } = await prepararContexto();
    const respuesta = await request(app)
      .get('/api/tareas?etiquetas=casa')
      .set(conToken(token));
    expect(idsOrdenados(respuesta.body)).toEqual(idsOrdenados([t1, t2]));
  });

  it('filtra por fecha de vencimiento en rango', async () => {
    const { token, t1 } = await prepararContexto();

    const dia = await request(app)
      .get('/api/tareas?fecha_vencimiento=2026-01-20')
      .set(conToken(token));
    expect(dia.body.map((t: TareaCreada) => t.id)).toEqual([t1.id]);

    const rango = await request(app)
      .get('/api/tareas?fecha_vencimiento=2026-01-01,2026-02-28')
      .set(conToken(token));
    expect(rango.body).toHaveLength(2);
  });

  it('rechaza fecha de vencimiento mal formada', async () => {
    const { token } = await prepararContexto();
    const respuesta = await request(app)
      .get('/api/tareas?fecha_vencimiento=20-01-2026')
      .set(conToken(token));
    expect(respuesta.status).toBe(400);
  });

  it('ordena por prioridad ascendente y descendente', async () => {
    const { token, t1, t2, t3 } = await prepararContexto();

    const asc = await request(app)
      .get('/api/tareas?ordenar=prioridad&direccion=asc')
      .set(conToken(token));
    expect(asc.body.map((t: TareaCreada) => t.id)).toEqual([t1.id, t2.id, t3.id]);

    const desc = await request(app)
      .get('/api/tareas?ordenar=prioridad&direccion=desc')
      .set(conToken(token));
    expect(desc.body[0].id).toBe(t3.id);
  });

  it('ordena alfabéticamente por título', async () => {
    const { token, t1, t2, t3 } = await prepararContexto();
    const respuesta = await request(app)
      .get('/api/tareas?ordenar=titulo&direccion=asc')
      .set(conToken(token));
    expect(respuesta.body.map((t: TareaCreada) => t.titulo)).toEqual([
      t2.titulo,
      t1.titulo,
      t3.titulo,
    ]);
  });
});

describe('Validación de filtros', () => {
  it('rechaza valores inválidos de prioridad', async () => {
    const sesion = await registrarUsuario('Filtro Inválido');
    const respuesta = await request(app)
      .get('/api/tareas?prioridad=99')
      .set(conToken(sesion.token));
    expect(respuesta.status).toBe(400);
    expect(respuesta.body).toMatchObject({ error: expect.stringContaining('Validación') });
  });
});