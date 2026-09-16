import type { Request, Response } from 'express';
import * as etiquetasService from '../services/etiquetas.service.js';
import { idUsuarioLogueado } from '../utils/requestUser.js';

export async function listar(req: Request, res: Response): Promise<void> {
  const etiquetas = await etiquetasService.listarEtiquetas(idUsuarioLogueado(req));
  res.json(etiquetas);
}

export async function crear(
  req: Request<Record<string, never>, unknown, { nombre: string }>,
  res: Response,
): Promise<void> {
  const etiqueta = await etiquetasService.crearEtiqueta(
    idUsuarioLogueado(req),
    req.body.nombre,
  );
  res.status(201).json(etiqueta);
}