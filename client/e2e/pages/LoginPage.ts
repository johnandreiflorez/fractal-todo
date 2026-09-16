import type { Locator, Page } from '@playwright/test';
import type { Traductor } from '../i18n/recursos.js';
import { Pagina } from './Pagina.js';

export class LoginPage extends Pagina {
  constructor(pagina: Page, t: Traductor) {
    super(pagina, t);
  }

  async abrir(): Promise<void> {
    await this.pagina.goto('/login');
  }

  campoEmail(): Locator {
    return this.controlConClave('auth.email');
  }

  campoPassword(): Locator {
    return this.controlConClave('auth.password');
  }

  botonEnviar(): Locator {
    return this.pagina.getByRole('button', { name: this.t('auth.iniciar') });
  }

  enlaceARegistro(): Locator {
    return this.pagina.getByRole('link', { name: this.t('auth.registrate') });
  }

  mensajeCredencialesInvalidas(): Locator {
    return this.pagina.getByText('Credenciales inválidas');
  }

  async escribirCredenciales(email: string, password: string): Promise<void> {
    await this.campoEmail().fill(email);
    await this.campoPassword().fill(password);
  }

  async enviar(): Promise<void> {
    await this.botonEnviar().click();
  }
}