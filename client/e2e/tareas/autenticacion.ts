import { expect } from '@playwright/test';
import { tarea } from '../actor/Tarea.js';
import type { DatosRegistro } from '../datos/modelos.js';
import { Encabezado } from '../pages/Encabezado.js';
import { LoginPage } from '../pages/LoginPage.js';
import { RegistroPage } from '../pages/RegistroPage.js';

const TRAS_INICIAR_SESION = /\/$/;

export const registrarse = (datos: DatosRegistro) =>
  tarea(`registrarse como "${datos.email}"`, async (actor) => {
    const registro = new RegistroPage(actor.pagina(), actor.t);
    await registro.abrir();
    await registro.registrar(datos);
    await expect(actor.pagina()).toHaveURL(TRAS_INICIAR_SESION);
  });

export const registrarseConConfirmacionDistinta = (datos: DatosRegistro) =>
  tarea('intentar registrarse sin coincidencia de contraseñas', async (actor) => {
    const registro = new RegistroPage(actor.pagina(), actor.t);
    await registro.abrir();
    await registro.registrar(datos);
    await expect(registro.mensajeContraseñasNoCoinciden()).toBeVisible();
    await expect(actor.pagina()).toHaveURL(/\/registro$/);
  });

export const iniciarSesion = (email: string, password: string) =>
  tarea(`iniciar sesión como "${email}"`, async (actor) => {
    const login = new LoginPage(actor.pagina(), actor.t);
    await login.abrir();
    await login.escribirCredenciales(email, password);
    await login.enviar();
    await expect(actor.pagina()).toHaveURL(TRAS_INICIAR_SESION);
  });

export const iniciarSesionConError = (email: string, password: string) =>
  tarea('intentar iniciar sesión con credenciales inválidas', async (actor) => {
    const login = new LoginPage(actor.pagina(), actor.t);
    await login.abrir();
    await login.escribirCredenciales(email, password);
    await login.enviar();
    await expect(login.mensajeCredencialesInvalidas()).toBeVisible();
    await expect(actor.pagina()).toHaveURL(/\/login$/);
  });

export const cerrarSesion = () =>
  tarea('cerrar la sesión', async (actor) => {
    await new Encabezado(actor.pagina(), actor.t).cerrarSesion();
    await expect(actor.pagina()).toHaveURL(/\/login$/);
  });