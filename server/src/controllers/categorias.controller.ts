import type { Request, Response } from 'express';
import * as categoriasService from '../services/categorias.service.js';
import { idUsuarioLogueado } from '../utils/requestUser.js';
import { emitirCambio } from '../ws/tiempoReal.js';

export async function listar(req: Request, res: Response): Promise<void> {
  const categorias = await categoriasService.listarCategorias(idUsuarioLogueado(req));
  res.json(categorias);
}

export async function crear(
  req: Request<Record<string, never>, unknown, { nombre: string; color?: string | null }>,
  res: Response,
): Promise<void> {
  const usuarioId = idUsuarioLogueado(req);
  const categoria = await categoriasService.crearCategoria(usuarioId, req.body);
  emitirCambio(usuarioId, ['categorias', 'estadisticas']);
  res.status(201).json(categoria);
}

export async function actualizar(
  req: Request<{ id: string }, unknown, { nombre?: string; color?: string | null }>,
  res: Response,
): Promise<void> {
  const usuarioId = idUsuarioLogueado(req);
  const categoria = await categoriasService.actualizarCategoria(
    usuarioId,
    Number(req.params.id),
    req.body,
  );
  emitirCambio(usuarioId, ['categorias', 'tareas', 'estadisticas']);
  res.json(categoria);
}

export async function eliminar(req: Request<{ id: string }>, res: Response): Promise<void> {
  const usuarioId = idUsuarioLogueado(req);
  await categoriasService.eliminarCategoria(usuarioId, Number(req.params.id));
  emitirCambio(usuarioId, ['categorias', 'tareas', 'estadisticas']);
  res.status(204).send();
}