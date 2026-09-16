import type { Request, Response } from 'express';
import * as categoriasService from '../services/categorias.service.js';
import { idUsuarioLogueado } from '../utils/requestUser.js';

export async function listar(req: Request, res: Response): Promise<void> {
  const categorias = await categoriasService.listarCategorias(idUsuarioLogueado(req));
  res.json(categorias);
}

export async function crear(
  req: Request<Record<string, never>, unknown, { nombre: string; color?: string | null }>,
  res: Response,
): Promise<void> {
  const categoria = await categoriasService.crearCategoria(idUsuarioLogueado(req), req.body);
  res.status(201).json(categoria);
}

export async function actualizar(
  req: Request<{ id: string }, unknown, { nombre?: string; color?: string | null }>,
  res: Response,
): Promise<void> {
  const categoria = await categoriasService.actualizarCategoria(
    idUsuarioLogueado(req),
    Number(req.params.id),
    req.body,
  );
  res.json(categoria);
}

export async function eliminar(req: Request<{ id: string }>, res: Response): Promise<void> {
  await categoriasService.eliminarCategoria(idUsuarioLogueado(req), Number(req.params.id));
  res.status(204).send();
}