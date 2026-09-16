import { expect } from '@playwright/test';
import { pregunta } from '../actor/Tarea.js';
import type { Idioma } from '../i18n/recursos.js';
import { Encabezado } from '../pages/Encabezado.js';

export const veBotonDeSalir = () =>
  pregunta('ver el botón de salir sesión', async (actor) => {
    await expect(new Encabezado(actor.pagina(), actor.t).botonSalir()).toBeVisible();
  });

export const idiomaEs = (esperado: Idioma) =>
  pregunta(`el idioma debe ser "${esperado}"`, async (actor) => {
    await expect
      .poll(
        () => actor.pagina().evaluate(() => document.documentElement.lang),
        { message: `el idioma debe ser "${esperado}"` },
      )
      .toBe(esperado);
  });

export const temaEs = (esperado: 'oscuro' | 'claro') =>
  pregunta(`el tema debe ser "${esperado}"`, async (actor) => {
    await expect
      .poll(
        () =>
          actor.pagina().evaluate(
            () => document.documentElement.dataset.tema ?? null,
          ),
        { message: `el tema debe ser "${esperado}"` },
      )
      .toBe(esperado);
  });