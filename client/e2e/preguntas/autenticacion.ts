import { expect } from '@playwright/test';
import { pregunta } from '../actor/Tarea.js';
import { PaginaTareas } from '../pages/PaginaTareas.js';

export const enLaListaDeTareas = () =>
  pregunta('estar en la lista de tareas', async (actor) => {
    await expect(actor.pagina()).toHaveURL(/\/$/);
    const tareas = new PaginaTareas(actor.pagina(), actor.t);
    await expect(tareas.titulo()).toBeVisible();
  });

export const enLaPantallaDeLogin = () =>
  pregunta('estar en la pantalla de inicio de sesión', async (actor) => {
    await expect(actor.pagina()).toHaveURL(/\/login$/);
  });

export const veSesionDe = (nombre: string) =>
  pregunta(`ver la sesión de "${nombre}"`, async (actor) => {
    const banner = actor.pagina().getByRole('banner');
    await expect(banner.getByText(nombre)).toBeVisible();
  });