import { clienteHttp } from '../api/cliente.js';
import { esTarea } from '../tipos/index.js';
import type { CambiosLote, FiltrosTareas, NuevaTarea, Tarea } from '../tipos/index.js';

function validarTareas(data: unknown): Tarea[] {
  if (!Array.isArray(data) || !data.every(esTarea)) {
    throw new Error('Lista de tareas inválida');
  }
  return data;
}

export async function listarTareas(filtros: FiltrosTareas = {}): Promise<Tarea[]> {
  const { data } = await clienteHttp.get('/tareas', { params: filtros });
  return validarTareas(data);
}

export async function crearTarea(datos: NuevaTarea): Promise<Tarea> {
  const { data } = await clienteHttp.post('/tareas', datos);
  if (!esTarea(data)) throw new Error('Tarea creada inválida');
  return data;
}

export async function actualizarTarea(
  id: number,
  datos: NuevaTarea,
): Promise<Tarea> {
  const { data } = await clienteHttp.put(`/tareas/${id}`, datos);
  if (!esTarea(data)) throw new Error('Tarea actualizada inválida');
  return data;
}

export async function completarTarea(id: number, completada: boolean): Promise<Tarea> {
  const { data } = await clienteHttp.patch(`/tareas/${id}/completar`, { completada });
  if (!esTarea(data)) throw new Error('Tarea inválida');
  return data;
}

export async function eliminarTarea(id: number): Promise<void> {
  await clienteHttp.delete(`/tareas/${id}`);
}

export async function actualizarTareasEnLote(
  ids: number[],
  cambios: CambiosLote,
): Promise<{ afectadas: number; omitidas: number }> {
  const { data } = await clienteHttp.patch('/tareas/batch', { ids, cambios });
  return data as { afectadas: number; omitidas: number };
}

export async function eliminarTareasEnLote(
  ids: number[],
): Promise<{ afectadas: number; omitidas: number }> {
  const { data } = await clienteHttp.post('/tareas/batch/eliminar', { ids });
  return data as { afectadas: number; omitidas: number };
}