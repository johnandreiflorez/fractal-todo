import type { Locator, Page } from '@playwright/test';
import type { Traductor } from '../i18n/recursos.js';
import { Pagina } from './Pagina.js';

export class Encabezado extends Pagina {
  constructor(pagina: Page, t: Traductor) {
    super(pagina, t);
  }

  private banner(): Locator {
    return this.pagina.getByRole('banner');
  }

  botonTemaOscuro(): Locator {
    return this.banner().getByRole('button', {
      name: this.t('encabezado.cambiarATemaOscuro'),
    });
  }

  botonTemaClaro(): Locator {
    return this.banner().getByRole('button', {
      name: this.t('encabezado.cambiarATemaClaro'),
    });
  }

  botonEspanol(): Locator {
    return this.banner().getByTitle(this.t('encabezado.espanol'));
  }

  botonIngles(): Locator {
    return this.banner().getByTitle(this.t('encabezado.ingles'));
  }

  botonSalir(): Locator {
    return this.banner().getByRole('button', { name: this.t('encabezado.salir') });
  }

  estadoTiempoReal(
    estado: 'conectado' | 'conectando' | 'desconectado',
  ): Locator {
    return this.banner().getByTitle(this.t(`tiempoReal.${estado}`));
  }

  async cerrarSesion(): Promise<void> {
    await this.botonSalir().click();
  }
}