import {
  agruparPorCategoria,
  agruparPorPrioridad,
  obtenerResumen,
} from '../repositories/estadisticas.repo.js';
import type { EstadisticasTareas } from '../models/estadistica.js';

export async function obtenerEstadisticas(usuarioId: number): Promise<EstadisticasTareas> {
  const [resumen, porPrioridad, porCategoria] = await Promise.all([
    obtenerResumen(usuarioId),
    agruparPorPrioridad(usuarioId),
    agruparPorCategoria(usuarioId),
  ]);

  return {
    resumen,
    por_prioridad: porPrioridad,
    por_categoria: porCategoria,
  };
}
