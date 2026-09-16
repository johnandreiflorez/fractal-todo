import type { Locator, Page } from '@playwright/test';
import type { Traductor } from '../i18n/recursos.js';

export abstract class Pagina {
  protected readonly pagina: Page;
  protected readonly t: Traductor;

  constructor(pagina: Page, t: Traductor) {
    this.pagina = pagina;
    this.t = t;
  }

  protected controlConClave(clave: string): Locator {
    return this.pagina.getByLabel(this.t(clave));
  }
}