import type { Actor } from './Actor.js';

export interface Tarea {
  readonly nombre: string;
  performAs(actor: Actor): Promise<void>;
}

export interface Pregunta {
  readonly titulo: string;
  answeredBy(actor: Actor): Promise<void>;
}

export function tarea(
  nombre: string,
  ejecutar: (actor: Actor) => Promise<void>,
): Tarea {
  return { nombre, performAs: ejecutar };
}

export function pregunta(
  titulo: string,
  responder: (actor: Actor) => Promise<void>,
): Pregunta {
  return { titulo, answeredBy: responder };
}