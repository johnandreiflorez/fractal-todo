import { expect } from '@playwright/test';
import { tarea } from '../actor/Tarea.js';
import { Sidebar } from '../pages/Sidebar.js';

export const crearCategoria = (nombre: string) =>
  tarea(`crear la categoría "${nombre}"`, async (actor) => {
    const lateral = new Sidebar(actor.pagina(), actor.t);
    await lateral.crearCategoria(nombre);
    await expect(lateral.item(nombre)).toBeVisible();
  });