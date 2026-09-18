import { clienteHttp } from '../api/cliente.js';
import { esEstadisticasTareas } from '../tipos/index.js';
import type { EstadisticasTareas } from '../tipos/index.js';

export async function obtenerEstadisticas(): Promise<EstadisticasTareas> {
  const { data } = await clienteHttp.get('/estadisticas');
  if (!esEstadisticasTareas(data)) {
    throw new Error('Estadísticas inválidas');
  }
  return data;
}
