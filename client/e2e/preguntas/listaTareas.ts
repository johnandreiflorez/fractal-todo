import { expect } from '@playwright/test';
import { pregunta } from '../actor/Tarea.js';
import { PaginaTareas } from '../pages/PaginaTareas.js';

export const veTarea = (titulo: string) =>
  pregunta(`ver la tarea "${titulo}"`, async (actor) => {
    const tareas = new PaginaTareas(actor.pagina(), actor.t);
    await expect(tareas.item(titulo)).toBeVisible();
  });

export const noVeTarea = (titulo: string) =>
  pregunta(`no ver la tarea "${titulo}"`, async (actor) => {
    const tareas = new PaginaTareas(actor.pagina(), actor.t);
    await expect(tareas.item(titulo)).toHaveCount(0);
  });

export const veMensajeDeVacio = () =>
  pregunta('ver el mensaje de lista vacía', async (actor) => {
    const tareas = new PaginaTareas(actor.pagina(), actor.t);
    await expect(tareas.mensajeVacio()).toBeVisible();
  });

export const veOrdenDeTareas = (titulos: string[]) =>
  pregunta(`ver las tareas en el orden: ${titulos.join(', ')}`, async (actor) => {
    const tareas = new PaginaTareas(actor.pagina(), actor.t);
    await expect(tareas.titulos()).toHaveText(titulos);
  });

export const veSeleccionadas = (count: number) =>
  pregunta(`ver "${count}" tareas seleccionadas`, async (actor) => {
    const tareas = new PaginaTareas(actor.pagina(), actor.t);
    await expect(tareas.resumenSeleccionadas(count)).toBeVisible();
  });