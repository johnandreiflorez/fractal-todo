import type { IncomingMessage, Server } from 'node:http';
import { WebSocket, WebSocketServer } from 'ws';
import { verificarAccessToken } from '../utils/jwt.js';

export type RecursoTiempoReal = 'tareas' | 'categorias' | 'etiquetas';

export interface MensajeCambio {
  tipo: 'cambio';
  recursos: RecursoTiempoReal[];
  emitido_en: string;
}

const RUTA = '/ws';
const LATIDO_MS = 30_000;
const CODIGO_NO_AUTORIZADO = 4001;

let servidorWs: WebSocketServer | null = null;
let intervaloLatido: NodeJS.Timeout | null = null;
const clientes = new Map<number, Set<WebSocket>>();
const vivos = new WeakMap<WebSocket, boolean>();

function usuarioDesdePeticion(peticion: IncomingMessage): number | null {
  const url = new URL(peticion.url ?? '', 'http://localhost');
  const token = url.searchParams.get('token');
  if (!token) return null;
  try {
    return verificarAccessToken(token).id;
  } catch {
    return null;
  }
}

function registrar(usuarioId: number, socket: WebSocket): void {
  const conexiones = clientes.get(usuarioId) ?? new Set<WebSocket>();
  conexiones.add(socket);
  clientes.set(usuarioId, conexiones);
  vivos.set(socket, true);
}

function eliminar(usuarioId: number, socket: WebSocket): void {
  const conexiones = clientes.get(usuarioId);
  if (!conexiones) return;
  conexiones.delete(socket);
  if (conexiones.size === 0) {
    clientes.delete(usuarioId);
  }
}

export function iniciarTiempoReal(servidor: Server): void {
  if (servidorWs) return;

  const wss = new WebSocketServer({ server: servidor, path: RUTA });
  servidorWs = wss;

  wss.on('connection', (socket, peticion) => {
    const usuarioId = usuarioDesdePeticion(peticion);
    if (usuarioId === null) {
      socket.close(CODIGO_NO_AUTORIZADO, 'No autorizado');
      return;
    }

    registrar(usuarioId, socket);
    socket.on('pong', () => vivos.set(socket, true));
    socket.on('close', () => eliminar(usuarioId, socket));
    socket.on('error', () => eliminar(usuarioId, socket));
  });

  intervaloLatido = setInterval(() => {
    for (const socket of wss.clients) {
      if (!vivos.get(socket)) {
        socket.terminate();
        continue;
      }
      vivos.set(socket, false);
      socket.ping();
    }
  }, LATIDO_MS);
  intervaloLatido.unref();
}

export function detenerTiempoReal(): Promise<void> {
  if (intervaloLatido) {
    clearInterval(intervaloLatido);
    intervaloLatido = null;
  }

  const wss = servidorWs;
  servidorWs = null;
  clientes.clear();

  if (!wss) return Promise.resolve();

  for (const socket of wss.clients) {
    socket.terminate();
  }

  return new Promise((resolver) => {
    wss.close(() => resolver());
  });
}

export function emitirCambio(
  usuarioId: number,
  recursos: readonly RecursoTiempoReal[],
): void {
  const conexiones = clientes.get(usuarioId);
  if (!conexiones || conexiones.size === 0) return;

  const mensaje: MensajeCambio = {
    tipo: 'cambio',
    recursos: [...recursos],
    emitido_en: new Date().toISOString(),
  };
  const carga = JSON.stringify(mensaje);

  for (const socket of conexiones) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(carga);
    }
  }
}
