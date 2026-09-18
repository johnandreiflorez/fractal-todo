import { useQuery } from '@tanstack/react-query';
import { obtenerEstadisticas } from '../servicios/estadisticas.service.js';

export function useEstadisticas() {
  return useQuery({
    queryKey: ['estadisticas'],
    queryFn: obtenerEstadisticas,
  });
}
