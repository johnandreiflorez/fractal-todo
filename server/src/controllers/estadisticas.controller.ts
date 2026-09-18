import type { Request, Response } from 'express';
import * as estadisticasService from '../services/estadisticas.service.js';
import { idUsuarioLogueado } from '../utils/requestUser.js';

export async function obtener(req: Request, res: Response): Promise<void> {
  const estadisticas = await estadisticasService.obtenerEstadisticas(idUsuarioLogueado(req));
  res.json(estadisticas);
}
