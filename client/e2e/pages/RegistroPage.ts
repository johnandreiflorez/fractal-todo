import type { Locator, Page } from '@playwright/test';
import type { DatosRegistro } from '../datos/modelos.js';
import type { Traductor } from '../i18n/recursos.js';
import { Pagina } from './Pagina.js';

export class RegistroPage extends Pagina {
  constructor(pagina: Page, t: Traductor) {
    super(pagina, t);
  }

  async abrir(): Promise<void> {
    await this.pagina.goto('/registro');
  }

  campoNombre(): Locator {
    return this.controlConClave('auth.nombre');
  }

  campoEmail(): Locator {
    return this.controlConClave('auth.email');
  }

  campoPassword(): Locator {
    return this.controlConClave('auth.passwordLargo');
  }

  campoConfirmacion(): Locator {
    return this.controlConClave('auth.passwordConfirmar');
  }

  botonCrear(): Locator {
    return this.pagina.getByRole('button', { name: this.t('auth.crearCuenta') });
  }

  mensajeContraseñasNoCoinciden(): Locator {
    return this.pagina.getByText(this.t('errores.password_no_coinciden'));
  }

  async registrar(datos: DatosRegistro): Promise<void> {
    await this.campoNombre().fill(datos.nombre);
    await this.campoEmail().fill(datos.email);
    await this.campoPassword().fill(datos.password);
    await this.campoConfirmacion().fill(datos.confirmacion ?? datos.password);
    await this.botonCrear().click();
  }
}