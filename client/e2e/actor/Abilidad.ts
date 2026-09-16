import type { Page } from '@playwright/test';

export interface Abilidad {
  readonly nombre: string;
}

export class ConNavegador implements Abilidad {
  readonly nombre = 'navegar';
  readonly pagina: Page;

  constructor(pagina: Page) {
    this.pagina = pagina;
  }
}