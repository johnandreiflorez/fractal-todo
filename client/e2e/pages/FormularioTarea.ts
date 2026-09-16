import type { Locator, Page } from '@playwright/test';
import type { DatosTarea } from '../datos/modelos.js';
import type { Traductor } from '../i18n/recursos.js';
import { Pagina } from './Pagina.js';

export class FormularioTarea extends Pagina {
  constructor(pagina: Page, t: Traductor) {
    super(pagina, t);
  }

  campoTitulo(): Locator {
    return this.pagina.locator('#campo-titulo');
  }

  campoDescripcion(): Locator {
    return this.pagina.locator('#campo-descripcion');
  }

  seleccionPrioridad(): Locator {
    return this.pagina.locator('#campo-prioridad');
  }

  seleccionCategoria(): Locator {
    return this.pagina.locator('#campo-categoria');
  }

  campoFecha(): Locator {
    return this.pagina.locator('#campo-fecha');
  }

  campoEtiqueta(): Locator {
    return this.controlConClave('tarea.anadirEtiquetaAria');
  }

  botonCrear(): Locator {
    return this.pagina.getByRole('button', { name: this.t('tarea.crear') });
  }

  botonGuardarCambios(): Locator {
    return this.pagina.getByRole('button', { name: this.t('tarea.guardarCambios') });
  }

  botonCancelar(): Locator {
    return this.pagina.getByRole('button', { name: this.t('tarea.cancelar') });
  }

  async rellenar(datos: DatosTarea): Promise<void> {
    if (datos.titulo !== undefined) {
      await this.campoTitulo().fill(datos.titulo);
    }
    if (datos.descripcion !== undefined) {
      await this.campoDescripcion().fill(datos.descripcion);
    }
    if (datos.prioridad !== undefined) {
      await this.seleccionPrioridad().selectOption({
        label: this.t(`prioridades.${datos.prioridad}`),
      });
    }
    if (datos.categoria !== undefined) {
      await this.seleccionCategoria().selectOption({ label: datos.categoria });
    }
    if (datos.fecha !== undefined) {
      await this.campoFecha().fill(datos.fecha);
    }
    if (datos.etiquetas) {
      for (const etiqueta of datos.etiquetas) {
        await this.campoEtiqueta().fill(etiqueta);
        await this.campoEtiqueta().press('Enter');
      }
    }
  }

  async crear(datos: DatosTarea): Promise<void> {
    await this.rellenar(datos);
    await this.botonCrear().click();
  }

  async guardarCambios(): Promise<void> {
    await this.botonGuardarCambios().click();
  }
}