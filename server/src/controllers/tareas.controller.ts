import type { Request, Response } from 'express';
import * as tareasService from '../services/tareas.service.js';
import type { FiltrosQueryTareas } from '../services/tareas.service.js';
import { esquemaQueryTareas } from '../validation/schemas.js';
import { idUsuarioLogueado } from '../utils/requestUser.js';
import { badRequest } from '../utils/httpError.js';
import type { ActualizarTarea, CambiosLote, NuevaTarea } from '../models/tarea.js';

export type QueryListarTareas = FiltrosQueryTareas;

export async function listar(req: Request, res: Response): Promise<void> {
  const resultado = esquemaQueryTareas.safeParse(req.query);
  if (!resultado.success) {
    throw badRequest(
      `Validación de query fallida: ${resultado.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ')}`,
    );
  }
  const tareas = await tareasService.listarTareas(idUsuarioLogueado(req), resultado.data);
  res.json(tareas);
}

export async function crear(
  req: Request<Record<string, never>, unknown, NuevaTarea>,
  res: Response,
): Promise<void> {
  const tarea = await tareasService.crearTarea(idUsuarioLogueado(req), req.body);
  res.status(201).json(tarea);
}

export async function actualizar(
  req: Request<{ id: string }, unknown, ActualizarTarea>,
  res: Response,
): Promise<void> {
  const tarea = await tareasService.actualizarTarea(
    idUsuarioLogueado(req),
    Number(req.params.id),
    req.body,
  );
  res.json(tarea);
}

export async function completar(
  req: Request<{ id: string }, unknown, { completada: boolean }>,
  res: Response,
): Promise<void> {
  const tarea = await tareasService.completarTarea(
    idUsuarioLogueado(req),
    Number(req.params.id),
    req.body.completada,
  );
  res.json(tarea);
}

export async function eliminar(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  await tareasService.eliminarTarea(idUsuarioLogueado(req), Number(req.params.id));
  res.status(204).send();
}

interface CuerpoBatchActualizar {
  ids: number[];
  cambios: CambiosLote;
}

export async function actualizarEnLote(
  req: Request<Record<string, never>, unknown, CuerpoBatchActualizar>,
  res: Response,
): Promise<void> {
  const resultado = await tareasService.actualizarTareasEnLote(
    idUsuarioLogueado(req),
    req.body.ids,
    req.body.cambios,
  );
  res.json(resultado);
}

interface CuerpoBatchEliminar {
  ids: number[];
}

export async function eliminarEnLote(
  req: Request<Record<string, never>, unknown, CuerpoBatchEliminar>,
  res: Response,
): Promise<void> {
  const resultado = await tareasService.eliminarTareasEnLote(
    idUsuarioLogueado(req),
    req.body.ids,
  );
  res.json(resultado);
}