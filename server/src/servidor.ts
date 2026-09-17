import { createServer } from 'node:http';
import type { Server } from 'node:http';
import { app } from './app.js';
import { iniciarTiempoReal } from './ws/tiempoReal.js';

export function crearServidorHttp(): Server {
  const servidor = createServer(app);
  iniciarTiempoReal(servidor);
  return servidor;
}
