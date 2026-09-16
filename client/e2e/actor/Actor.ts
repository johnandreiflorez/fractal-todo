import type { Page } from '@playwright/test';
import { Recursos } from '../i18n/recursos.js';
import type { Traductor } from '../i18n/recursos.js';
import { ConNavegador } from './Abilidad.js';
import type { Abilidad } from './Abilidad.js';
import type { Pregunta } from './Tarea.js';
import type { Tarea } from './Tarea.js';

export class Actor {
  readonly nombre: string;
  readonly t: Traductor;
  private readonly encapsulado: Recursos;
  private readonly habilidades: Map<string, Abilidad> = new Map();

  constructor(nombre: string, pagina: Page, encapsulado = new Recursos()) {
    this.nombre = nombre;
    this.encapsulado = encapsulado;
    this.t = encapsulado.t;
    this.habilidades.set('navegar', new ConNavegador(pagina));
  }

  pagina(): Page {
    const habilidad = this.habilidades.get('navegar');
    if (!habilidad || !(habilidad instanceof ConNavegador)) {
      throw new Error(`El actor "${this.nombre}" no sabe navegar.`);
    }
    return habilidad.pagina;
  }

  alternarIdioma(): void {
    this.encapsulado.alternarIdioma();
  }

  async intenta(...tareas: Tarea[]): Promise<void> {
    for (const tarea of tareas) {
      await tarea.performAs(this);
    }
  }

  async ve(...preguntas: Pregunta[]): Promise<void> {
    for (const pregunta of preguntas) {
      await pregunta.answeredBy(this);
    }
  }
}