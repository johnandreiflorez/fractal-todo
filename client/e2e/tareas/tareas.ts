import { expect, type Page } from '@playwright/test';
import { tarea } from '../actor/Tarea.js';
import type { DatosTarea } from '../datos/modelos.js';
import { FormularioTarea } from '../pages/FormularioTarea.js';
import { PaginaTareas } from '../pages/PaginaTareas.js';
import type { CampoOrden } from '../pages/PaginaTareas.js';

export const crearTarea = (datos: DatosTarea) =>
  tarea(`crear la tarea "${datos.titulo}"`, async (actor) => {
    const tareas = new PaginaTareas(actor.pagina(), actor.t);
    const formulario = new FormularioTarea(actor.pagina(), actor.t);
    await tareas.abrirNuevaTarea();
    await formulario.crear(datos);
    await expect(tareas.item(datos.titulo)).toBeVisible();
  });

export const editarTarea = (titulo: string, cambios: DatosTarea) =>
  tarea(`editar la tarea "${titulo}"`, async (actor) => {
    const tareas = new PaginaTareas(actor.pagina(), actor.t);
    const formulario = new FormularioTarea(actor.pagina(), actor.t);
    await tareas.botonEditar(titulo).click();
    await formulario.rellenar(cambios);
    await formulario.guardarCambios();
    await expect(tareas.item(cambios.titulo ?? titulo)).toBeVisible();
  });

export const completarTarea = (titulo: string) =>
  tarea(`completar la tarea "${titulo}"`, async (actor) => {
    const tareas = new PaginaTareas(actor.pagina(), actor.t);
    await tareas.botonCompletar(titulo).click();
  });

export const reabrirTarea = (titulo: string) =>
  tarea(`reabrir la tarea "${titulo}"`, async (actor) => {
    const tareas = new PaginaTareas(actor.pagina(), actor.t);
    await tareas.botonReabrir(titulo).click();
  });

export const eliminarTarea = (titulo: string) =>
  tarea(`eliminar la tarea "${titulo}"`, async (actor) => {
    const pagina: Page = actor.pagina();
    pagina.once('dialog', (dialogo) => void dialogo.accept());
    const tareas = new PaginaTareas(pagina, actor.t);
    await tareas.botonEliminar(titulo).click();
    await expect(tareas.item(titulo)).toHaveCount(0);
  });

export const seleccionarTarea = (titulo: string) =>
  tarea(`seleccionar la tarea "${titulo}"`, async (actor) => {
    const tareas = new PaginaTareas(actor.pagina(), actor.t);
    await tareas.casillaTarea(titulo).check();
  });

export const seleccionarVisibles = () =>
  tarea('seleccionar todas las tareas visibles', async (actor) => {
    const tareas = new PaginaTareas(actor.pagina(), actor.t);
    await tareas.casillaSeleccionarVisibles().check();
  });

export const completarSeleccionadas = () =>
  tarea('completar las tareas seleccionadas', async (actor) => {
    const tareas = new PaginaTareas(actor.pagina(), actor.t);
    await tareas.botonLoteCompletar().click();
  });

export const eliminarSeleccionadas = () =>
  tarea('eliminar las tareas seleccionadas', async (actor) => {
    const pagina: Page = actor.pagina();
    pagina.once('dialog', (dialogo) => void dialogo.accept());
    const tareas = new PaginaTareas(pagina, actor.t);
    await tareas.botonLoteEliminar().click();
  });

export const filtrarPorEstado = (estado: 'pendientes' | 'completadas') =>
  tarea(`filtrar por estado "${estado}"`, async (actor) => {
    const tareas = new PaginaTareas(actor.pagina(), actor.t);
    if (estado === 'pendientes') {
      await tareas.seleccionarPendientes();
    } else {
      await tareas.seleccionarCompletadas();
    }
  });

export const filtrarPorPrioridad = (prioridad: number) =>
  tarea(`filtrar por prioridad "${prioridad}"`, async (actor) => {
    const tareas = new PaginaTareas(actor.pagina(), actor.t);
    await tareas.filtrarPrioridad(prioridad);
  });

export const filtrarPorCategoria = (nombre: string) =>
  tarea(`filtrar por categoría "${nombre}"`, async (actor) => {
    const tareas = new PaginaTareas(actor.pagina(), actor.t);
    await tareas.filtrarPorCategoria(nombre);
  });

export const buscarTareas = (texto: string) =>
  tarea(`buscar tareas con "${texto}"`, async (actor) => {
    const tareas = new PaginaTareas(actor.pagina(), actor.t);
    await tareas.buscar(texto);
  });

export const limpiarFiltros = () =>
  tarea('limpiar los filtros', async (actor) => {
    const tareas = new PaginaTareas(actor.pagina(), actor.t);
    await tareas.botonLimpiar().click();
  });

export const ordenarTareasPor = (
  campo: CampoOrden,
  direccion: 'asc' | 'desc' = 'desc',
) =>
  tarea(`ordenar por "${campo}" ${direccion}`, async (actor) => {
    const tareas = new PaginaTareas(actor.pagina(), actor.t);
    await tareas.ordenarPor(campo, direccion);
  });