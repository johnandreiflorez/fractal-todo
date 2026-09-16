import { expect, type Locator, type Page } from '@playwright/test';
import type { Traductor } from '../i18n/recursos.js';
import { Pagina } from './Pagina.js';

export class Sidebar extends Pagina {
  constructor(pagina: Page, t: Traductor) {
    super(pagina, t);
  }

  private lateral(): Locator {
    return this.pagina.locator('aside');
  }

  botonNuevaCategoria(): Locator {
    return this.lateral().getByRole('button', {
      name: this.t('lateral.nuevaCategoria'),
    });
  }

  campoNombre(): Locator {
    return this.lateral().getByLabel(this.t('categoria.nombre'));
  }

  botonGuardar(): Locator {
    return this.lateral().getByRole('button', { name: this.t('categoria.guardar') });
  }

  item(nombre: string): Locator {
    return this.lateral().getByRole('listitem').filter({ hasText: nombre });
  }

  async crearCategoria(nombre: string): Promise<void> {
    await this.botonNuevaCategoria().click();
    await this.campoNombre().fill(nombre);
    await this.botonGuardar().click();
    await expect(this.item(nombre)).toBeVisible();
  }
}