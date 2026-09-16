import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as etiquetasService from '../servicios/etiquetas.service.js';

export function useEtiquetas() {
  return useQuery({
    queryKey: ['etiquetas'],
    queryFn: etiquetasService.listarEtiquetas,
  });
}

export function useCrearEtiqueta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nombre: string) => etiquetasService.crearEtiqueta(nombre),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['etiquetas'] });
    },
  });
}