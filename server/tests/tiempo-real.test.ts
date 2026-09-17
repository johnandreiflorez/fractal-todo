import type { Server } from 'node:http';
import request from 'supertest';
import { WebSocket } from 'ws';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '../src/app.js';
import { crearServidorHttp } from '../src/servidor.js';
import { detenerTiempoReal } from '../src/ws/tiempoReal.js';
import { conToken, registrarUsuario } from './helpers.js';

let servidor: Server;
let baseWs: string;

function puertoDe(unServidor: Server): number {
  const direccion = unServidor.address();
  if (direccion === null || typeof direccion === 'string') {
    throw new Error('El servidor no expone una dirección TCP');
  }
  return direccion.port;
}

function conectar(token: string | null): Promise<WebSocket> {
  const consulta = token ? `?token=${encodeURIComponent(token)}` : '';
  return new Promise((resolver, rechazar) => {
    const socket = new WebSocket(`${baseWs}/ws${consulta}`);
    socket.once('open', () => resolver(socket));
    socket.once('error', rechazar);
  });
}

function esperarMensaje(socket: WebSocket): Promise<unknown> {
  return new Promise((resolver) => {
    socket.once('message', (datos) => resolver(JSON.parse(datos.toString())));
  });
}

function esperarCierre(socket: WebSocket): Promise<number> {
  return new Promise((resolver) => {
    socket.once('close', (codigo) => resolver(codigo));
  });
}

beforeAll(async () => {
  servidor = crearServidorHttp();
  await new Promise<void>((resolver) => servidor.listen(0, resolver));
  baseWs = `ws://localhost:${puertoDe(servidor)}`;
});

afterAll(async () => {
  await detenerTiempoReal();
  await new Promise<void>((resolver) => servidor.close(() => resolver()));
});

describe('Canal de actualizaciones en tiempo real', () => {
  it('rechaza las conexiones sin token válido', async () => {
    const socket = await conectar(null);
    const codigo = await esperarCierre(socket);
    expect(codigo).toBe(4001);
  });

  it('notifica al mismo usuario cuando crea una tarea', async () => {
    const sesion = await registrarUsuario('Tiempo Real');
    const socket = await conectar(sesion.token);
    const mensaje = esperarMensaje(socket);

    const respuesta = await request(app)
      .post('/api/tareas')
      .set(conToken(sesion.token))
      .send({ titulo: 'Tarea en vivo' });

    expect(respuesta.status).toBe(201);
    expect(await mensaje).toMatchObject({
      tipo: 'cambio',
      recursos: expect.arrayContaining(['tareas', 'etiquetas']),
    });
    socket.close();
  });

  it('no filtra eventos a otros usuarios', async () => {
    const sesionA = await registrarUsuario('Emisor');
    const sesionB = await registrarUsuario('Receptor');
    const socketB = await conectar(sesionB.token);

    let recibio = false;
    socketB.on('message', () => {
      recibio = true;
    });

    await request(app)
      .post('/api/tareas')
      .set(conToken(sesionA.token))
      .send({ titulo: 'Privada' });

    await new Promise((resolver) => setTimeout(resolver, 300));
    expect(recibio).toBe(false);
    socketB.close();
  });
});
